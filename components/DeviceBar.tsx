"use client";

import { Device } from "@/lib/types";

interface DeviceBarProps {
  devices: Record<string, Omit<Device, "id">>;
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case "mac":
    case "windows":
    case "linux":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
}

export default function DeviceBar({ devices }: DeviceBarProps) {
  const entries = Object.entries(devices);
  const count = entries.length;

  if (count === 0) {
    return (
      <div className="text-sm text-muted text-center py-2">
        No devices connected
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-muted">
        {count} device{count !== 1 ? "s" : ""} connected
      </span>
      <div className="flex flex-wrap justify-center gap-2">
        {entries.map(([id, device]) => (
          <div
            key={id}
            className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 text-sm animate-fade-in"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            {getPlatformIcon(device.platform)}
            <span className="text-text">{device.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
