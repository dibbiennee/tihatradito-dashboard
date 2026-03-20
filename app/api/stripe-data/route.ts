import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response("{}", { headers: corsHeaders });
}

async function fetchCharges(sk: string, label: string) {
  try {
    const res = await fetch("https://api.stripe.com/v1/charges?limit=100", {
      headers: { Authorization: "Basic " + btoa(sk + ":") },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || [])
      .filter(
        (ch: { status: string; refunded: boolean }) =>
          ch.status === "succeeded" && !ch.refunded
      )
      .map((ch: { amount: number; created: number; currency: string }) => ({
        amount: ch.amount / 100,
        created: ch.created,
        currency: ch.currency || "eur",
        account: label,
      }));
  } catch {
    return [];
  }
}

export async function GET() {
  const skNew = process.env.STRIPE_SECRET_KEY_NEW || "";
  const skOld = process.env.STRIPE_SECRET_KEY_OLD || "";

  if (!skNew && !skOld) {
    return NextResponse.json(
      { error: "No Stripe keys configured" },
      { status: 500, headers: corsHeaders }
    );
  }

  const [chargesNew, chargesOld] = await Promise.all([
    skNew ? fetchCharges(skNew, "🆕") : Promise.resolve([]),
    skOld ? fetchCharges(skOld, "📦") : Promise.resolve([]),
  ]);

  // Merge and sort descending
  const all = [...chargesNew, ...chargesOld].sort(
    (a: { created: number }, b: { created: number }) => b.created - a.created
  );

  // Campaign filter: today from 02:00 UTC
  const now = new Date();
  const campaignStart = new Date(now);
  campaignStart.setUTCHours(2, 0, 0, 0);
  if (now < campaignStart)
    campaignStart.setUTCDate(campaignStart.getUTCDate() - 1);
  const csEpoch = Math.floor(campaignStart.getTime() / 1000);

  let campaignRevenue = 0,
    campaignOrders = 0;
  const campaignPayments: {
    amount: number;
    created: number;
    account: string;
  }[] = [];

  for (const ch of all) {
    if (ch.created >= csEpoch) {
      campaignRevenue += ch.amount;
      campaignOrders++;
      campaignPayments.push(ch);
    }
  }

  const hours = Math.max(
    1,
    (now.getTime() - campaignStart.getTime()) / 3600000
  );

  return NextResponse.json(
    {
      campaignRevenue: Math.round(campaignRevenue * 100) / 100,
      campaignOrders,
      ratePerHour: Math.round((campaignRevenue / hours) * 100) / 100,
      projected24h: Math.round((campaignRevenue / hours) * 24),
      payments: campaignPayments.slice(0, 50),
      timestamp: now.toISOString(),
    },
    { headers: corsHeaders }
  );
}
