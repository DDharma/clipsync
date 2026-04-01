import { NextResponse } from "next/server";
import { getServerInfo } from "@/lib/network";

export function GET() {
  return NextResponse.json(getServerInfo());
}
