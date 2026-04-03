# ClipSync

**Copy on one device. Paste on another.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js 22+](https://img.shields.io/badge/Node.js-22%2B-339933.svg)](https://nodejs.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

ClipSync is a lightweight, self-hosted clipboard sharing tool that lets you seamlessly transfer text, images, and files between devices on the same Wi-Fi network. No cloud, no accounts, no data leaving your network.

<!-- Add a screenshot here: ![ClipSync Screenshot](docs/screenshot.png) -->

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Text Sharing** -- Type or paste text and sync it instantly across all connected devices
- **Image Sharing** -- Paste images directly from your clipboard or upload image files
- **File Sharing** -- Upload files up to 50 MB via file picker or drag-and-drop
- **QR Code Connection** -- Scan a QR code to connect any device on the same network
- **Automatic Device Detection** -- Devices are discovered automatically with platform detection (Mac, Windows, Linux, Android, iOS)
- **Real-Time Sync** -- Polling-based updates keep all devices in sync within 1.5 seconds
- **Dark Themed UI** -- Modern dark interface with green and cyan accents
- **Cross-Platform** -- Works on any device with a web browser
- **Privacy-First** -- All data stays on your local network; nothing is sent to the cloud
- **Zero Configuration** -- No database, no accounts, no environment variables required

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or higher
- [pnpm](https://pnpm.io/) package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/DDharma/clipsync.git
cd clipsync

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5999`. Open this URL on your host device, then scan the QR code from another device on the same Wi-Fi network.

### Production Build

```bash
pnpm build
pnpm start
```

---

## Usage

### Connecting Devices

1. Open ClipSync in a browser on your first device
2. A QR code is displayed with the server URL
3. Scan the QR code from any other device on the same Wi-Fi network (or enter the URL manually)
4. Connected devices appear in the device bar at the top

### Sharing Text

- Type or paste text into the input area
- Press **Cmd+Enter** (Mac) or **Ctrl+Enter** (Windows/Linux) to sync
- The text appears on all connected devices instantly
- Click the copy button on any clip to copy it to that device's clipboard

### Sharing Images

- **Paste directly**: Copy an image to your clipboard and paste it into ClipSync (Ctrl/Cmd+V)
- **Upload**: Click the upload button and select an image file
- Images appear as thumbnails and can be copied or downloaded on other devices

### Sharing Files

- **Drag and drop**: Drag a file anywhere onto the page
- **Upload button**: Click upload and select a file (max 50 MB)
- Files can be downloaded on any connected device

---

## API Reference

All endpoints are served from the Next.js server at `http://<server-ip>:5999`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/clipboard?limit=N&since=T` | Fetch clips (optional pagination and delta sync) |
| `POST` | `/api/clipboard` | Add a text clip (JSON) or file/image (multipart form data) |
| `DELETE` | `/api/clipboard?id=X` | Delete a specific clip, or all clips if no `id` provided |
| `GET` | `/api/clipboard/download?id=X` | Download a clip's content as a file |
| `GET` | `/api/devices` | List all active devices (seen within 60 seconds) |
| `POST` | `/api/devices` | Register a new device |
| `PUT` | `/api/devices` | Send a heartbeat to keep a device active |
| `GET` | `/api/server-info` | Get server IP, port, and hostname |

For full API documentation with request/response formats, see [docs/PROJECT.md](docs/PROJECT.md).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js](https://nextjs.org/) 14.2 (App Router) |
| UI | [React](https://react.dev/) 18 |
| Language | [TypeScript](https://www.typescriptlang.org/) 5 (strict mode) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) 3.4 |
| QR Code | [qrcode](https://www.npmjs.com/package/qrcode) |
| Runtime | [Node.js](https://nodejs.org/) 22 |
| Package Manager | [pnpm](https://pnpm.io/) |

---

## Project Structure

```
clipsync/
├── app/
│   ├── api/
│   │   ├── clipboard/
│   │   │   ├── download/route.ts   # File download endpoint
│   │   │   └── route.ts            # Clipboard CRUD operations
│   │   ├── devices/route.ts        # Device registration and heartbeat
│   │   └── server-info/route.ts    # Server network info
│   ├── globals.css                 # Global styles and animations
│   ├── layout.tsx                  # Root layout with metadata
│   └── page.tsx                    # Main app component and state
├── components/
│   ├── ClipCard.tsx                # Individual clip display
│   ├── ClipFeed.tsx                # Clip list container
│   ├── ClipInput.tsx               # Text/file input interface
│   ├── DeviceBar.tsx               # Connected devices display
│   ├── Icons.tsx                   # SVG icon components
│   ├── QRSection.tsx               # QR code generator
│   └── Toast.tsx                   # Notification system
├── lib/
│   ├── network.ts                  # Server IP detection
│   ├── store.ts                    # In-memory data store
│   └── types.ts                    # TypeScript type definitions
├── docs/
│   └── PROJECT.md                  # Detailed project documentation
├── CONTRIBUTING.md                 # Contribution guidelines
├── LICENSE                         # MIT License
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Security Considerations

ClipSync is designed for **trusted local networks only** (home, office). Keep the following in mind:

- **No authentication** -- Anyone on the same network can access the app
- **No encryption** -- Data is transmitted over plain HTTP
- **In-memory storage** -- All data is lost when the server restarts; nothing is written to disk
- **Local network only** -- The server binds to your local network; do not expose it to the public internet
- **File size limit** -- Uploads are capped at 50 MB to prevent memory exhaustion

If you need to use ClipSync in less trusted environments, consider running it behind a reverse proxy with authentication and TLS.

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on how to get started, code style, and the pull request process.

---

## Author

**Dharmvir Dharmacharya**

- Portfolio: [ddharmacharya.in](https://ddharmacharya.in/)
- GitHub: [@DDharma](https://github.com/DDharma)

---

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Dharmvir Dharmacharya
