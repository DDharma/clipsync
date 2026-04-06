import { Clip, Device } from "./types";
import { MAX_CLIPS, DEVICE_TIMEOUT_MS } from "./constants";

interface StoreData {
  clips: Clip[];
  devices: Record<string, Omit<Device, "id">>;
}

const globalForStore = globalThis as unknown as { __clipsyncStore?: StoreData };

if (!globalForStore.__clipsyncStore) {
  globalForStore.__clipsyncStore = { clips: [], devices: {} };
}

const store = globalForStore.__clipsyncStore;

export function addClip(clip: Clip): void {
  store.clips.unshift(clip);
  if (store.clips.length > MAX_CLIPS) {
    store.clips = store.clips.slice(0, MAX_CLIPS);
  }
}

export function getClips(limit?: number, since?: number): Clip[] {
  let result = store.clips;
  if (since) {
    result = result.filter((c) => c.timestamp > since);
  }
  if (limit) {
    result = result.slice(0, limit);
  }
  return result;
}

export function getClipById(id: string): Clip | undefined {
  return store.clips.find((c) => c.id === id);
}

export function deleteClip(id: string): boolean {
  const idx = store.clips.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  store.clips.splice(idx, 1);
  return true;
}

export function clearAll(): void {
  store.clips = [];
}

export function registerDevice(device: Device): void {
  const { id, ...rest } = device;
  store.devices[id] = { ...rest, lastSeen: Date.now() };
}

export function heartbeat(id: string): boolean {
  if (!store.devices[id]) return false;
  store.devices[id].lastSeen = Date.now();
  return true;
}

export function getDevices(): Record<string, Omit<Device, "id">> {
  const now = Date.now();
  const active: Record<string, Omit<Device, "id">> = {};
  for (const [id, device] of Object.entries(store.devices)) {
    if (now - device.lastSeen < DEVICE_TIMEOUT_MS) {
      active[id] = device;
    }
  }
  return active;
}
