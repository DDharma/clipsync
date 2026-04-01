import os from "os";
import { ServerInfo } from "./types";

const PORT = 3000;

export function getServerInfo(): ServerInfo {
  const interfaces = os.networkInterfaces();
  const preferred = ["en0", "wlan0", "eth0", "Wi-Fi", "Ethernet"];

  for (const name of preferred) {
    const iface = interfaces[name];
    if (!iface) continue;
    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) {
        return { ip: addr.address, port: PORT, hostname: os.hostname() };
      }
    }
  }

  for (const [, iface] of Object.entries(interfaces)) {
    if (!iface) continue;
    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) {
        return { ip: addr.address, port: PORT, hostname: os.hostname() };
      }
    }
  }

  return { ip: "localhost", port: PORT, hostname: os.hostname() };
}
