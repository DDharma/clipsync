"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRSectionProps {
  serverUrl: string;
  deviceCount: number;
}

export default function QRSection({ serverUrl, deviceCount }: QRSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (deviceCount >= 2) setExpanded(false);
  }, [deviceCount]);

  useEffect(() => {
    if (!canvasRef.current || !serverUrl || !expanded) return;
    QRCode.toCanvas(canvasRef.current, serverUrl, {
      width: 200,
      margin: 2,
      color: { dark: "#ffffff", light: "#00000000" },
    }).catch(() => {});
  }, [serverUrl, expanded]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(serverUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = serverUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="qr-section">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {expanded ? "Hide QR Code" : "Show QR Code"}
        {deviceCount < 2 && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            Scan to connect
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col items-center gap-3 animate-fade-in">
          <div className="qr-glow p-4 rounded-xl">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-sm text-muted">Scan from any device on the same Wi-Fi</p>
          <button
            onClick={copyUrl}
            className="font-mono text-sm text-secondary hover:text-primary transition-colors bg-card px-3 py-1.5 rounded-lg border border-border"
          >
            {copied ? "Copied!" : serverUrl}
          </button>
        </div>
      )}
    </div>
  );
}
