import { NextRequest, NextResponse } from "next/server";
import { addClip, getClips, deleteClip, clearAll, getDevices } from "@/lib/store";
import { Clip } from "@/lib/types";
import { MAX_FILE_SIZE, MAX_TEXT_LENGTH, sanitizeFilename, safeMimeType } from "@/lib/constants";

function generateId(): string {
  return "clip_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 50);
  const since = Number(searchParams.get("since")) || undefined;
  const clips = getClips(limit, since);
  const deviceCount = Object.keys(getDevices()).length;
  return NextResponse.json({ clips, deviceCount });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const deviceId = String(formData.get("deviceId") || "");
    const deviceName = String(formData.get("deviceName") || "Unknown");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = safeMimeType(file.type);
    const isImage = mimeType.startsWith("image/");

    const clip: Clip = {
      id: generateId(),
      type: isImage ? "image" : "file",
      content: base64,
      fileName: sanitizeFilename(file.name),
      fileSize: file.size,
      mimeType,
      deviceId,
      deviceName,
      timestamp: Date.now(),
    };

    addClip(clip);
    return NextResponse.json({ clip });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.content || typeof body.content !== "string") {
    return NextResponse.json({ error: "Missing or invalid content" }, { status: 400 });
  }

  if (body.content.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Text too large (max 1MB)" }, { status: 413 });
  }

  const clip: Clip = {
    id: generateId(),
    type: "text",
    content: body.content,
    deviceId: String(body.deviceId || ""),
    deviceName: String(body.deviceName || "Unknown"),
    timestamp: Date.now(),
  };

  addClip(clip);
  return NextResponse.json({ clip });
}

export function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (id) {
    const deleted = deleteClip(id);
    if (!deleted) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  clearAll();
  return NextResponse.json({ ok: true });
}
