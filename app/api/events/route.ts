import { NextRequest, NextResponse } from "next/server";

// Edge runtime with SINGLE region = all requests hit the same instance
// This is critical: without preferredRegion, requests scatter across regions
// and each region has its own globalThis, so data appears empty
export const runtime = "edge";
export const preferredRegion = "fra1"; // Frankfurt — closest to Italy
export const dynamic = "force-dynamic";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ─── PERSISTENT STORE via globalThis ───
// On edge runtime with a single preferred region, globalThis persists
// between invocations as long as the instance stays warm.
// With dashboard polling every 15s, the instance stays warm indefinitely.

interface EventEntry {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  ip: string;
}

const STORE_KEY = "__tihatradito_events_v2";
const VISITORS_KEY = "__tihatradito_visitors_v2";
const HOURLY_KEY = "__tihatradito_hourly_v2";
const INIT_KEY = "__tihatradito_init_v2";

function getEvents(): EventEntry[] {
  if (!(globalThis as Record<string, unknown>)[STORE_KEY]) {
    (globalThis as Record<string, unknown>)[STORE_KEY] = [];
  }
  return (globalThis as Record<string, unknown>)[STORE_KEY] as EventEntry[];
}

function getVisitors(): Set<string> {
  if (!(globalThis as Record<string, unknown>)[VISITORS_KEY]) {
    (globalThis as Record<string, unknown>)[VISITORS_KEY] = new Set<string>();
  }
  return (globalThis as Record<string, unknown>)[VISITORS_KEY] as Set<string>;
}

function getHourlyVisitors(): Record<string, Set<string>> {
  if (!(globalThis as Record<string, unknown>)[HOURLY_KEY]) {
    (globalThis as Record<string, unknown>)[HOURLY_KEY] = {} as Record<string, Set<string>>;
  }
  return (globalThis as Record<string, unknown>)[HOURLY_KEY] as Record<string, Set<string>>;
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response("{}", { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    let body;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = JSON.parse(text);
    }

    // Reset command — clears all data
    if (body.type === "__reset") {
      (globalThis as Record<string, unknown>)[STORE_KEY] = [];
      (globalThis as Record<string, unknown>)[VISITORS_KEY] = new Set<string>();
      (globalThis as Record<string, unknown>)[HOURLY_KEY] = {};
      return NextResponse.json({ ok: true, reset: true }, { headers: corsHeaders });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const events = getEvents();
    const visitors = getVisitors();
    const hourlyVisitors = getHourlyVisitors();

    // Track unique visitor
    visitors.add(ip);

    // Track hourly
    const hour = new Date().toISOString().slice(0, 13);
    if (!hourlyVisitors[hour]) hourlyVisitors[hour] = new Set();
    hourlyVisitors[hour].add(ip);

    events.push({
      type: body.type || "unknown",
      data: body.data || {},
      timestamp: new Date().toISOString(),
      ip,
    });

    // Keep last 10000 events max
    if (events.length > 10000) events.splice(0, events.length - 10000);

    return NextResponse.json(
      { ok: true, stored: events.length },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: "bad request" },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function GET() {
  const events = getEvents();
  const visitors = getVisitors();
  const hourlyVisitors = getHourlyVisitors();

  const now = new Date();
  const counts: Record<string, number> = {};
  const last100 = events.slice(-100);

  for (const e of events) {
    counts[e.type] = (counts[e.type] || 0) + 1;
  }

  // Unique visitors per hour (last 24h)
  const hourlyData: Array<{ hour: string; visitors: number }> = [];
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000)
      .toISOString()
      .slice(0, 13);
    hourlyData.push({
      hour: h.slice(11, 13) + ":00",
      visitors: hourlyVisitors[h]?.size || 0,
    });
  }

  // Funnel
  const funnel = {
    page_view: counts["page_view"] || 0,
    quiz_start: counts["quiz_answer"]
      ? Math.ceil((counts["quiz_answer"] || 0) / 3)
      : 0,
    quiz_complete: counts["quiz_complete"] || 0,
    cta_click: counts["cta_click"] || 0,
    upsell_yes: counts["upsell_yes"] || 0,
    upsell_no: counts["upsell_no"] || 0,
    purchase: counts["purchase"] || 0,
  };

  return NextResponse.json(
    {
      total_events: events.length,
      unique_visitors: visitors.size,
      counts,
      funnel,
      hourly: hourlyData,
      recent: last100.reverse(),
    },
    { headers: corsHeaders }
  );
}
