export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_CLIPS = 50;
export const MAX_TEXT_LENGTH = 1_000_000; // 1 MB of text
export const DEVICE_TIMEOUT_MS = 60_000; // 60 seconds
export const CLIP_POLL_MS = 1_500;
export const DEVICE_POLL_MS = 10_000;
export const HEARTBEAT_MS = 10_000;
import type { Platform } from "./types";

export const VALID_PLATFORMS: readonly Platform[] = ["mac", "windows", "linux", "android", "ios", "other"];
export const VALID_MIME_PATTERN = /^[\w\-]+\/[\w\-+.]+$/;

export function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\-() ]/g, "_").slice(0, 255) || "download";
}

export function safeMimeType(raw: string | undefined, fallback = "application/octet-stream"): string {
  return raw && VALID_MIME_PATTERN.test(raw) ? raw : fallback;
}
