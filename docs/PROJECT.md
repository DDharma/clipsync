# ClipSync -- Project Documentation

Detailed technical documentation for the ClipSync project. For a quick overview, see the [README](../README.md).

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Design Decisions](#design-decisions)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Client Architecture](#client-architecture)
- [Components](#components)
- [Data Flow](#data-flow)
- [Styling and Theming](#styling-and-theming)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Architecture Overview

ClipSync is a single Next.js 14 application that serves both the frontend and backend.

```
┌──────────────────────────────────────────────────┐
│                  Browser (Client)                 │
│                                                   │
│  page.tsx (state, polling)                        │
│    ├── QRSection                                  │
│    ├── DeviceBar                                  │
│    ├── ClipInput                                  │
│    ├── ClipFeed -> ClipCard[]                     │
│    └── Toast                                      │
│                                                   │
│  Polls every 1.5s (clips) / 10s (devices)        │
└────────────────────┬─────────────────────────────┘
                     │ HTTP (fetch)
                     ▼
┌──────────────────────────────────────────────────┐
│              Next.js Server (API Routes)          │
│                                                   │
│  /api/clipboard         GET, POST, DELETE         │
│  /api/clipboard/download   GET                    │
│  /api/devices           GET, POST, PUT            │
│  /api/server-info       GET                       │
│                                                   │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│            In-Memory Store (lib/store.ts)         │
│                                                   │
│  clips: Clip[]           (max 50, FIFO)           │
│  devices: Record<id, Device>  (60s timeout)       │
└──────────────────────────────────────────────────┘
```

**Key characteristics:**

- **No database** -- All data lives in JavaScript arrays and objects in server memory
- **No WebSockets** -- Real-time updates are achieved via HTTP polling
- **No authentication** -- Designed for trusted local networks
- **No external services** -- Fully self-contained; no cloud APIs or third-party dependencies

---

## Design Decisions

### Why in-memory storage?

Simplicity and privacy. ClipSync is meant to be a zero-config tool. There is nothing to install beyond Node.js, no database to set up, and no data persists beyond the current session. This also means nothing is ever written to disk, which is a privacy advantage.

**Trade-off:** All clips and device registrations are lost on server restart.

### Why HTTP polling instead of WebSockets?

Polling is simpler to implement and debug, works reliably across all browsers and network configurations, and is more than adequate for LAN latency. The 1.5-second poll interval provides near-instant sync for most use cases.

**Trade-off:** Slightly higher network overhead compared to WebSockets, and updates are not truly instant.

### Why base64 for file storage?

Storing files as base64 strings keeps the data model uniform and avoids writing temporary files to disk. The entire clip (text, image, or file) is a single JSON-serializable object.

**Trade-off:** Base64 encoding adds ~33% memory overhead. Large files consume significant server RAM.

### Why no authentication?

ClipSync assumes it runs on a trusted network where all devices belong to the same user or household. Adding authentication would complicate the zero-config setup experience.

---

## Data Models

All types are defined in `lib/types.ts`.

### Clip

```typescript
interface Clip {
  id: string;          // Format: "clip_" + base36(timestamp) + random
  type: ClipType;      // "text" | "image" | "file"
  content: string;     // Plain text for text clips; base64-encoded for images/files
  fileName?: string;   // Original filename (files and images only)
  fileSize?: number;   // Size in bytes (files and images only)
  mimeType?: string;   // MIME type (files and images only)
  deviceId: string;    // ID of the source device
  deviceName: string;  // Name of the source device
  timestamp: number;   // Unix timestamp in milliseconds
}
```

### Device

```typescript
interface Device {
  id: string;          // Format: "dev_" + base36(timestamp) + random
  name: string;        // Auto-detected from User-Agent
  platform: Platform;  // "mac" | "windows" | "linux" | "android" | "ios" | "other"
  lastSeen: number;    // Unix timestamp in milliseconds
}
```

### ServerInfo

```typescript
interface ServerInfo {
  ip: string;          // Local IPv4 address (e.g., "192.168.1.42")
  port: number;        // Server port (default: 5999)
  hostname: string;    // Machine hostname
}
```

---

## API Reference

### GET /api/clipboard

Fetch clips with optional pagination and delta sync.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Maximum number of clips to return (max 50) |
| `since` | number | -- | Unix timestamp (ms); only return clips newer than this |

**Response (200):**

```json
{
  "clips": [
    {
      "id": "clip_m2x5abc123",
      "type": "text",
      "content": "Hello from my phone",
      "deviceId": "dev_m2x5xyz789",
      "deviceName": "iPhone",
      "timestamp": 1711987200000
    }
  ],
  "deviceCount": 2
}
```

---

### POST /api/clipboard

Add a new clip. Accepts two content types.

**Text clip (JSON):**

```
Content-Type: application/json

{
  "content": "Text to share",
  "deviceId": "dev_m2x5xyz789",
  "deviceName": "iPhone"
}
```

**File or image (multipart):**

```
Content-Type: multipart/form-data

Fields:
  file: <binary file data>
  deviceId: "dev_m2x5xyz789"
  deviceName: "iPhone"
```

- Maximum file size: 50 MB (returns 413 if exceeded)
- Images (MIME type starting with `image/`) are stored as type `"image"`
- All other files are stored as type `"file"`
- File content is base64-encoded for storage

**Response (200):**

```json
{
  "clip": {
    "id": "clip_m2x5abc123",
    "type": "file",
    "content": "<base64>",
    "fileName": "document.pdf",
    "fileSize": 245760,
    "mimeType": "application/pdf",
    "deviceId": "dev_m2x5xyz789",
    "deviceName": "iPhone",
    "timestamp": 1711987200000
  }
}
```

---

### DELETE /api/clipboard

Delete one or all clips.

**Delete a specific clip:**

```
DELETE /api/clipboard?id=clip_m2x5abc123
```

Returns 404 if the clip is not found.

**Delete all clips:**

```
DELETE /api/clipboard
```

**Response (200):**

```json
{ "ok": true }
```

---

### GET /api/clipboard/download

Download a clip's content as a file.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Clip ID |

**Responses:**

- **200**: File content with appropriate `Content-Type` and `Content-Disposition` headers
- **400**: Missing `id` parameter
- **404**: Clip not found

For text clips, returns `text/plain`. For files and images, decodes the base64 content and returns the original MIME type.

---

### GET /api/devices

List all active devices (seen within the last 60 seconds).

**Response (200):**

```json
{
  "devices": {
    "dev_m2x5xyz789": {
      "name": "iPhone",
      "platform": "ios",
      "lastSeen": 1711987200000
    },
    "dev_m2x5abc123": {
      "name": "MacBook Pro",
      "platform": "mac",
      "lastSeen": 1711987195000
    }
  }
}
```

---

### POST /api/devices

Register a new device.

**Request Body:**

```json
{
  "id": "dev_m2x5xyz789",
  "name": "iPhone",
  "platform": "ios"
}
```

**Response (200):**

```json
{ "ok": true }
```

---

### PUT /api/devices

Send a heartbeat to keep a device marked as active.

**Request Body:**

```json
{
  "id": "dev_m2x5xyz789"
}
```

**Response (200):**

```json
{ "ok": true }
```

---

### GET /api/server-info

Get the server's local network address.

**Response (200):**

```json
{
  "ip": "192.168.1.42",
  "port": 5999,
  "hostname": "MacBook-Pro.local"
}
```

The server detects its IP by checking preferred network interfaces (`en0`, `wlan0`, `eth0`, `Wi-Fi`, `Ethernet`) and falls back to the first non-internal IPv4 address, then `localhost`.

---

## Client Architecture

### Main Page (`app/page.tsx`)

The main page is a `"use client"` component that orchestrates all application state and side effects.

**State managed:**

| State | Type | Description |
|-------|------|-------------|
| `serverInfo` | `ServerInfo \| null` | Server IP, port, hostname |
| `devices` | `Record<string, Device>` | Connected devices |
| `clips` | `Clip[]` | All synced clips |
| `deviceId` | `string` | Current device's ID (persisted in localStorage) |
| `deviceName` | `string` | Current device's name (auto-detected) |
| `dragging` | `boolean` | Whether a file is being dragged over the page |

**Polling intervals:**

| Interval | Frequency | Purpose |
|----------|-----------|---------|
| Clip polling | 1.5 seconds | Fetch new clips using `since` parameter for delta sync |
| Device heartbeat | 10 seconds | Send PUT to `/api/devices` to stay active |
| Device list refresh | 10 seconds | Fetch updated list of connected devices |

**Initialization sequence (on mount):**

1. Generate or retrieve device ID from `localStorage` (`clipsync-device-id`)
2. Detect device name and platform from User-Agent
3. Register device via `POST /api/devices`
4. Fetch server info, initial clips, and device list
5. Start polling intervals

### Component Tree

```
Home (page.tsx)
├── QRSection         -- QR code display with collapsible panel
├── DeviceBar         -- Connected device badges with status
├── ClipInput         -- Text area + file upload controls
├── ClipFeed          -- Scrollable clip list
│   └── ClipCard[]    -- Individual clip cards (text/image/file)
└── Toast             -- Notification overlay
```

---

## Components

### QRSection

Generates and displays a QR code linking to the server URL. Uses the `qrcode` library to render onto a canvas element. Auto-collapses when two or more devices are connected. Includes a click-to-copy URL button.

**Props:** `serverUrl: string`, `deviceCount: number`

### DeviceBar

Displays connected devices as pill-shaped badges. Each badge shows a platform icon (desktop for Mac/Windows/Linux, mobile for iOS/Android), the device name, and a pulsing green indicator for active status. Devices fade in with animation.

**Props:** `devices: Record<string, Device>`

### ClipInput

Text input area with file upload capabilities. Handles keyboard shortcuts (Cmd/Ctrl+Enter to sync), image paste interception, and drag-and-drop. Validates file size client-side (50 MB limit). Sends clips to the server via `POST /api/clipboard`.

**Props:** `deviceId: string`, `deviceName: string`, `onClipAdded: () => void`

### ClipFeed

Container for the clip list. Shows total clip count and a "clear all" button. Renders an empty state when no clips exist. Maps clips to `ClipCard` components.

**Props:** `clips: Clip[]`, `onDelete: (id: string) => void`, `onClearAll: () => void`

### ClipCard

Renders a single clip based on its type:

- **Text**: Monospace font, line-clamped to 5 lines, with copy button
- **Image**: Inline thumbnail preview (max 160px height), with copy and download buttons
- **File**: Filename and formatted size (B/KB/MB), with download button

Includes a delete button and shows relative timestamps ("just now", "5m ago").

Copy uses the Clipboard API with a fallback to `document.execCommand('copy')` for older browsers. Image copy uses the `ClipboardItem` API.

**Props:** `clip: Clip`, `onDelete: (id: string) => void`

### Toast

Global notification system using an imperative API. The exported `showToast(message, type)` function can be called from any component without prop drilling. Toasts auto-dismiss after 3 seconds.

**Types:** `success` (green border), `error` (red border), `info` (cyan border)

### Icons

Centralized SVG icon components: `SyncIcon`, `TextIcon`, `ImageIcon`, `FileIcon`, `UploadIcon`, `CopyIcon`, `DownloadIcon`, `DeleteIcon`, `ClipboardIcon`, `LaptopIcon`, `PhoneIcon`.

All icons accept standard SVG props and default to `currentColor`.

---

## Data Flow

### Sending a Text Clip

```
User types text -> Presses Cmd+Enter
  -> ClipInput POSTs JSON to /api/clipboard
    -> Server creates Clip object, unshifts into clips array
    -> Returns created clip
  -> ClipInput calls onClipAdded()
  -> Home triggers fetchClips()
  -> All devices pick up new clip on next poll (within 1.5s)
```

### Sending a File or Image

```
User drops file / pastes image / clicks upload
  -> Client validates size (< 50 MB)
  -> ClipInput POSTs multipart form data to /api/clipboard
    -> Server reads file, converts to base64
    -> Determines type: image (if MIME starts with image/) or file
    -> Creates Clip, stores in memory
  -> Other devices see clip on next poll
  -> Users can download via GET /api/clipboard/download?id=X
```

### Device Lifecycle

```
Page loads
  -> Generate or retrieve device ID from localStorage
  -> Detect name and platform from User-Agent
  -> POST /api/devices to register
  -> Every 10s: PUT /api/devices (heartbeat)
  -> Server marks device inactive after 60s without heartbeat
  -> GET /api/devices only returns devices seen within 60s
```

---

## Styling and Theming

### Color Palette

Defined in `tailwind.config.ts`:

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#050f0a` | Page background |
| `card` | `#0a1f14` | Card backgrounds |
| `border` | `#1a3d28` | Borders and dividers |
| `primary` | `#4ade80` | Primary accent (green) |
| `secondary` | `#22d3ee` | Secondary accent (cyan) |
| `text` | `#e8f5ec` | Body text |
| `muted` | `#7fba96` | Muted/secondary text |

### Typography

| Font | Family | Usage |
|------|--------|-------|
| DM Sans | `font-sans` | UI text |
| JetBrains Mono | `font-mono` | Code, inputs, clip content |

Both loaded via Google Fonts in `app/layout.tsx`.

### Animations

Defined in `tailwind.config.ts`:

| Name | Effect |
|------|--------|
| `slide-up` | Translates element 10px upward with fade |
| `fade-in` | Opacity 0 to 1 |
| `glow-pulse` | Pulsing green glow effect |

### Custom CSS (`app/globals.css`)

- Noise texture overlay on the body (SVG filter)
- QR code glow effect (`.qr-glow` class)
- Custom scrollbar styling (WebKit)
- Green selection highlight (`::selection`)

---

## Known Limitations

- **No persistence** -- All data is lost on server restart
- **No authentication** -- Any device on the network can access the app
- **No encryption** -- Traffic is plain HTTP
- **Memory overhead** -- Base64 encoding adds ~33% overhead for file storage
- **Single server** -- No clustering or horizontal scaling
- **Polling only** -- No WebSocket support; updates arrive within 1.5 seconds
- **No test suite** -- No automated tests exist yet
- **No Docker** -- No containerization support yet
- **Clip limit** -- Maximum 50 clips in memory (older clips evicted via FIFO)
- **RAM usage** -- Large files are held entirely in memory

---

## Roadmap

Ideas for future development (contributions welcome):

- **WebSocket support** -- Replace polling with WebSockets for instant updates
- **Optional authentication** -- PIN or password protection for untrusted networks
- **Docker support** -- Dockerfile and docker-compose for easy deployment
- **Test suite** -- Unit and integration tests
- **HTTPS/TLS** -- Encrypted connections via self-signed certificates
- **File streaming** -- Stream files instead of base64 in-memory to reduce RAM usage
- **Clipboard history search** -- Search and filter past clips
- **Device customization** -- Allow users to rename their devices
- **Persistent storage** -- Optional SQLite or file-based persistence
- **End-to-end encryption** -- Encrypt clip content between devices
