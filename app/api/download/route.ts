import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

// ─── DOWNLOAD LOG via globalThis ───
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

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const file = req.nextUrl.searchParams.get("f") || "scopri-la-verita.pdf";

  // Log the download
  const log = getLog();
  log.push({
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    file,
  });

  // Keep last 5000 entries
  if (log.length > 5000) log.splice(0, log.length - 5000);

  // Redirect to actual PDF
  return NextResponse.redirect(new URL(`/${file}`, req.url), 302);
}
