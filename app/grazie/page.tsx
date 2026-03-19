"use client";

import { useEffect, useRef } from "react";

function trackEvent(type: string, data: Record<string, unknown> = {}) {
  const payload = JSON.stringify({ type, data });
  try {
    const blob = new Blob([payload], { type: "application/json" });
    const sent = navigator.sendBeacon("/api/events", blob);
    if (!sent) throw new Error("beacon failed");
  } catch {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

// Map Stripe Payment Link IDs to prices
const STRIPE_PRICES: Record<string, number> = {
  "3hg9IQ0p": 0.99,   // Profilo A — base
  "dVU9IQ0q": 2.99,   // Profilo B — upsell
  "7xw9IQ0r": 9.99,   // Profilo C — premium
};

function detectPrice(): number {
  // Try to detect price from Stripe referrer URL or from URL search params
  const ref = document.referrer || "";
  const url = window.location.href;
  const search = new URLSearchParams(window.location.search);

  // Check if Stripe sends any identifying info
  for (const [key, price] of Object.entries(STRIPE_PRICES)) {
    if (ref.includes(key) || url.includes(key)) return price;
  }

  // Check for price param (can be added to Stripe success URL)
  const priceParam = search.get("p");
  if (priceParam) return parseFloat(priceParam) || 0.99;

  // Default to base price
  return 0.99;
}

export default function GraziePage() {
  const pdfUrl = process.env.NEXT_PUBLIC_PDF_URL || "/scopri-la-verita.pdf";
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      const price = detectPrice();
      trackEvent("purchase", {
        price,
        referrer: document.referrer || "direct",
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center fade-up">
        <div className="text-5xl mb-6">✅</div>
        <h1 className="text-3xl mb-3">Pagamento confermato!</h1>
        <p className="text-muted text-base mb-8 leading-relaxed">
          Il tuo metodo è pronto. Clicca il bottone qui sotto per scaricarlo
          subito.
        </p>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full bg-red hover:bg-red-dark text-white font-bold text-lg py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.97] mb-4"
        >
          Scarica il PDF →
        </a>

        <p className="text-xs text-muted">
          Se il download non parte, controlla la cartella spam o contattaci.
        </p>
      </div>
    </main>
  );
}
