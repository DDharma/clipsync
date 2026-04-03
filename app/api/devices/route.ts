import { NextRequest, NextResponse } from "next/server";
import { getDevices, registerDevice, heartbeat } from "@/lib/store";
import { Platform } from "@/lib/types";
import { VALID_PLATFORMS } from "@/lib/constants";

function isValidPlatform(value: unknown): value is Platform {
  return typeof value === "string" && (VALID_PLATFORMS as readonly string[]).includes(value);
}

export function GET() {
  return NextResponse.json({ devices: getDevices() });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing or invalid device id" }, { status: 400 });
  }

  const platform = isValidPlatform(body.platform) ? body.platform : "other";

  registerDevice({
    id: body.id,
    name: typeof body.name === "string" ? body.name.slice(0, 100) : "Unknown",
    platform,
    lastSeen: Date.now(),
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing or invalid device id" }, { status: 400 });
  }

  heartbeat(body.id);
  return NextResponse.json({ ok: true });
}
