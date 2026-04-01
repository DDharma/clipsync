export type ClipType = "text" | "image" | "file";
export type Platform = "mac" | "windows" | "linux" | "android" | "ios" | "other";

export interface Clip {
  id: string;
  type: ClipType;
  content: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  deviceId: string;
  deviceName: string;
  timestamp: number;
}

export interface Device {
  id: string;
  name: string;
  platform: Platform;
  lastSeen: number;
}

export interface ServerInfo {
  ip: string;
  port: number;
  hostname: string;
}

export interface ClipboardResponse {
  clips: Clip[];
  deviceCount: number;
}

export interface DevicesResponse {
  devices: Record<string, Omit<Device, "id">>;
}
