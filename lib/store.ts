import { Clip, Device } from "./types";

const MAX_CLIPS = 50;

let clips: Clip[] = [];
const devices: Record<string, Omit<Device, "id">> = {};

export function addClip(clip: Clip): void {
  clips.unshift(clip);
  if (clips.length > MAX_CLIPS) {
    clips = clips.slice(0, MAX_CLIPS);
  }
}

export function getClips(limit?: number, since?: number): Clip[] {
  let result = clips;
  if (since) {
    result = result.filter((c) => c.timestamp > since);
  }
  if (limit) {
    result = result.slice(0, limit);
  }
  return result;
}

export function getClipById(id: string): Clip | undefined {
  return clips.find((c) => c.id === id);
}

export function deleteClip(id: string): boolean {
  const idx = clips.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  clips.splice(idx, 1);
  return true;
}

export function clearAll(): void {
  clips = [];
}

export function registerDevice(device: Device): void {
  const { id, ...rest } = device;
  devices[id] = { ...rest, lastSeen: Date.now() };
}

export function heartbeat(id: string): boolean {
  if (!devices[id]) return false;
  devices[id].lastSeen = Date.now();
  return true;
}

export function getDevices(): Record<string, Omit<Device, "id">> {
  const now = Date.now();
  const active: Record<string, Omit<Device, "id">> = {};
  for (const [id, device] of Object.entries(devices)) {
    if (now - device.lastSeen < 60000) {
      active[id] = device;
    }
  }
  return active;
}
