import { NextRequest, NextResponse } from "next/server";
import { getClipById } from "@/lib/store";
import { sanitizeFilename, safeMimeType } from "@/lib/constants";

export function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const clip = getClipById(id);

  if (!clip) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }

  if (clip.type === "text") {
    return new NextResponse(clip.content, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="clip.txt"`,
      },
    });
  }

  const buffer = Buffer.from(clip.content, "base64");
  const mimeType = safeMimeType(clip.mimeType);
  const fileName = sanitizeFilename(clip.fileName || "download");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
