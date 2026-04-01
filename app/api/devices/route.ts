import { NextRequest, NextResponse } from "next/server";
import { getDevices, registerDevice, heartbeat } from "@/lib/store";
import { Platform } from "@/lib/types";

export function GET() {
  return NextResponse.json({ devices: getDevices() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  registerDevice({
    id: body.id as string,
    name: body.name as string,
    platform: body.platform as Platform,
    lastSeen: Date.now(),
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  heartbeat(body.id as string);
  return NextResponse.json({ ok: true });
}
