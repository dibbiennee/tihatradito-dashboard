import { NextResponse } from "next/server";

export const runtime = "edge";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

const LOG_KEY = "__tihatradito_downloads_v1";

interface DownloadEntry {
  ip: string;
  userAgent: string;
  timestamp: string;
  file: string;
}

function getLog(): DownloadEntry[] {
  if (!(globalThis as Record<string, unknown>)[LOG_KEY]) {
    (globalThis as Record<string, unknown>)[LOG_KEY] = [];
  }
  return (globalThis as Record<string, unknown>)[LOG_KEY] as DownloadEntry[];
}

export async function GET() {
  const log = getLog();

  return NextResponse.json({
    total_downloads: log.length,
    recent: log.slice(-50).reverse(),
  });
}
