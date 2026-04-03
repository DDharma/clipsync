"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Clip, Device, ServerInfo } from "@/lib/types";
import { MAX_FILE_SIZE, CLIP_POLL_MS, DEVICE_POLL_MS, HEARTBEAT_MS } from "@/lib/constants";
import QRSection from "@/components/QRSection";
import DeviceBar from "@/components/DeviceBar";
import ClipInput from "@/components/ClipInput";
import ClipFeed from "@/components/ClipFeed";
import Toast, { showToast } from "@/components/Toast";

function detectPlatform(): string {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "other";
}

function detectDeviceName(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("clipsync-device-id");
  if (!id) {
    id = "dev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("clipsync-device-id", id);
  }
  return id;
}

export default function Home() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [devices, setDevices] = useState<Record<string, Omit<Device, "id">>>({});
  const [clips, setClips] = useState<Clip[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [dragging, setDragging] = useState(false);
  const lastFetchRef = useRef(0);
  const dragCounterRef = useRef(0);

  const fetchClips = useCallback(async (since?: number) => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (since) params.set("since", String(since));
      const res = await fetch(`/api/clipboard?${params}`);
      const data = await res.json();
      if (since && data.clips.length > 0) {
        setClips((prev) => {
          const existingIds = new Set(prev.map((c: Clip) => c.id));
          const newClips = data.clips.filter((c: Clip) => !existingIds.has(c.id));
          return [...newClips, ...prev];
        });
      } else if (!since) {
        setClips(data.clips);
      }
      lastFetchRef.current = Date.now();
    } catch {
      // ignore
    }
  }, []);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      setDevices(data.devices);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const id = getDeviceId();
    const name = detectDeviceName();
    setDeviceId(id);
    setDeviceName(name);

    fetch("/api/server-info")
      .then((r) => r.json())
      .then((info: ServerInfo) => setServerInfo(info))
      .catch(() => {});

    fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, platform: detectPlatform() }),
    }).then(() => fetchDevices());

    fetchClips();

    const clipPoll = setInterval(() => {
      fetchClips(lastFetchRef.current || undefined);
    }, CLIP_POLL_MS);

    const heartbeatInterval = setInterval(() => {
      fetch("/api/devices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }, HEARTBEAT_MS);

    const devicePoll = setInterval(fetchDevices, DEVICE_POLL_MS);

    return () => {
      clearInterval(clipPoll);
      clearInterval(heartbeatInterval);
      clearInterval(devicePoll);
    };
  }, [fetchClips, fetchDevices]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/clipboard?id=${id}`, { method: "DELETE" });
      setClips((prev) => prev.filter((c) => c.id !== id));
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch("/api/clipboard", { method: "DELETE" });
      setClips([]);
      showToast("All clips cleared");
    } catch {
      showToast("Failed to clear", "error");
    }
  };

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      showToast("File too large (max 50MB)", "error");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("deviceId", deviceId);
      formData.append("deviceName", deviceName);
      await fetch("/api/clipboard", { method: "POST", body: formData });
      fetchClips();
      showToast("File synced!");
    } catch {
      showToast("Failed to upload", "error");
    }
  }, [deviceId, deviceName, fetchClips]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) uploadFile(files[0]);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) uploadFile(file);
          return;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [uploadFile]);

  const serverUrl = serverInfo ? `http://${serverInfo.ip}:${serverInfo.port}` : "";
  const deviceCount = Object.keys(devices).length;

  return (
    <div
      className="min-h-screen bg-bg text-text relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {dragging && (
        <div className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary rounded-xl m-4">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-xl font-medium text-primary">Drop file to sync</p>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            ClipSync
          </h1>
          <p className="text-muted text-sm mt-1">Copy on one device. Paste on another.</p>
        </header>

        {serverUrl && <QRSection serverUrl={serverUrl} deviceCount={deviceCount} />}

        <DeviceBar devices={devices} />

        {deviceId && (
          <ClipInput
            deviceId={deviceId}
            deviceName={deviceName}
            onClipAdded={() => fetchClips()}
          />
        )}

        <ClipFeed clips={clips} onDelete={handleDelete} onClearAll={handleClearAll} />

        <footer className="text-center text-xs text-muted/60 border-t border-border pt-4 space-y-1">
          <p>All data stays on your local network. Nothing leaves your Wi-Fi.</p>
          <p>
            Built by{" "}
            <a
              href="https://ddharmacharya.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Dharmvir Dharmacharya
            </a>
            {" "}&middot;{" "}
            <a
              href="https://github.com/DDharma/clipsync"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>

      <Toast />
    </div>
  );
}
