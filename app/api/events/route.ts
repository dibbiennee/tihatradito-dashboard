import { NextRequest, NextResponse } from "next/server";

// CORS headers for dashboard access from any origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// In-memory store (resets on cold start, good enough for tonight)
const events: Array<{
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  ip: string;
}> = [];

// Visitor tracking
const visitors = new Set<string>();
const hourlyVisitors: Record<string, Set<string>> = {};

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    // Handle both JSON and text content types (sendBeacon may send as text)
    let body;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = JSON.parse(text);
    }
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

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

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch {
    return NextResponse.json(
      { error: "bad request" },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function GET() {
  // Aggregate stats
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

export const dynamic = "force-dynamic";
