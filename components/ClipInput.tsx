"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { showToast } from "./Toast";
import { UploadIcon } from "./Icons";
import { MAX_FILE_SIZE } from "@/lib/constants";

interface ClipInputProps {
  deviceId: string;
  deviceName: string;
  onClipAdded: () => void;
}

export default function ClipInput({ deviceId, deviceName, onClipAdded }: ClipInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendText = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await fetch("/api/clipboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, deviceId, deviceName }),
      });
      setText("");
      onClipAdded();
      showToast("Text synced!");
    } catch {
      showToast("Failed to sync", "error");
    } finally {
      setSending(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      showToast("File too large (max 50MB)", "error");
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("deviceId", deviceId);
      formData.append("deviceName", deviceName);
      await fetch("/api/clipboard", { method: "POST", body: formData });
      onClipAdded();
      showToast("File synced!");
    } catch {
      showToast("Failed to upload", "error");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      sendText();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) uploadFile(file);
        return;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => uploadFile(file));
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Paste or type text here…"
        className="w-full h-24 bg-card border border-border rounded-xl px-4 py-3 text-sm font-mono text-text placeholder:text-muted/50 resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors"
          >
            <UploadIcon className="w-3.5 h-3.5" />
            Upload file
          </button>
          <span className="text-xs text-muted/40">or drag &amp; drop · paste image</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted hidden sm:inline">
            {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Enter
          </span>
          <button
            onClick={sendText}
            disabled={!text.trim() || sending}
            className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? "Syncing..." : "Sync"}
          </button>
        </div>
      </div>
    </div>
  );
}
