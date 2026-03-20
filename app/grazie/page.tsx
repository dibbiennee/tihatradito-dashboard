"use client";

import { useState, useEffect, useRef } from "react";

/* ─── ANALYTICS TRACKER ─── */
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

/* ─── STRIPE PRICE DETECTION ─── */
const STRIPE_PRICES: Record<string, number> = {
  "bC92Nq03": 0.99,
  "y52Nq04": 2.99,
  "bC92Nq05": 9.99,
  "Sp2Nq06": 19.99,
  "3hg9IQ0p": 0.99,
  "dVU9IQ0q": 2.99,
  "7xw9IQ0r": 9.99,
};

function detectPrice(): number {
  const ref = document.referrer || "";
  const url = window.location.href;
  const search = new URLSearchParams(window.location.search);
  for (const [key, price] of Object.entries(STRIPE_PRICES)) {
    if (ref.includes(key) || url.includes(key)) return price;
  }
  const priceParam = search.get("p");
  if (priceParam) return parseFloat(priceParam) || 2.99;
  return 2.99;
}

/* ─── STRIPE EBOOK LINK ─── */
const STRIPE_EBOOK1 = "https://buy.stripe.com/dRm6oG53cbZmciUfSp2Nq07"; // €19,99

/* ─── COUNTDOWN ─── */
const COUNTDOWN_SECONDS = 5 * 60; // 5 minuti — più breve = più urgenza

function useCountdown(seconds: number) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const STORAGE_KEY = "upsell_countdown_start";
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (stored) {
      const elapsed = Math.floor((now - parseInt(stored)) / 1000);
      const remaining = seconds - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    } else {
      localStorage.setItem(STORAGE_KEY, now.toString());
    }
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timeLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  return { m, s, expired: timeLeft <= 0 };
}

/* ═══════════════════════════════════════
   GRAZIE PAGE — UPSELL BEFORE DOWNLOAD
   ═══════════════════════════════════════ */
export default function GraziePage() {
  const pdfFile = process.env.NEXT_PUBLIC_PDF_URL?.replace("/", "") || "scopri-la-verita.pdf";
  const pdfUrl = `/api/download?f=${encodeURIComponent(pdfFile)}`;
  const { m, s, expired } = useCountdown(COUNTDOWN_SECONDS);
  const [showDownload, setShowDownload] = useState(false);
  const tracked = useRef(false);
  const trackedImpression = useRef(false);

  // Track purchase
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

  // Track upsell impression
  useEffect(() => {
    if (!trackedImpression.current) {
      trackedImpression.current = true;
      trackEvent("upsell_impression", { product: "ebook_pratico", position: "before_download" });
    }
  }, []);

  const handleBuy = () => {
    if (expired) return;
    trackEvent("upsell_click", { product: "ebook_pratico", price: 19.99 });
    window.open(STRIPE_EBOOK1, "_blank");
    // Mostra comunque il download dopo il click
    setShowDownload(true);
  };

  const handleSkip = () => {
    trackEvent("upsell_dismiss", { position: "before_download" });
    setShowDownload(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#f0f0f0",
        fontFamily: "'DM Sans', sans-serif",
        padding: "0 16px 80px",
      }}
    >
      <style>{`
        .upsell-card {
          background: #111;
          border: 2px solid rgba(232,0,29,0.3);
          border-radius: 16px;
          padding: 32px 24px;
          max-width: 440px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(232,0,29,0.08);
          transition: border-color 0.3s;
        }
        .upsell-card:hover {
          border-color: rgba(232,0,29,0.5);
        }
        .feature-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: #aaa;
          line-height: 1.5;
        }
        .feature-row span:first-child { flex-shrink: 0; }
        .btn-upsell {
          width: 100%;
          padding: 18px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 1.5px;
          background: #e8001d;
          color: #fff;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(232,0,29,0.4);
        }
        .btn-upsell:not(:disabled):hover {
          background: #c0001a;
          box-shadow: 0 4px 28px rgba(232,0,29,0.6);
          transform: scale(1.01);
        }
        .btn-upsell:disabled { opacity: 0.4; cursor: not-allowed; }
        .download-section {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(232,0,29,0.3); }
          50% { border-color: rgba(232,0,29,0.6); }
        }
        .upsell-card { animation: pulse-border 3s infinite; }
      `}</style>

      {/* ── HEADER CONFERMA (sempre visibile) ── */}
      <div style={{ maxWidth: 500, margin: "0 auto", paddingTop: 48, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 32,
            letterSpacing: 2,
            color: "#f0f0f0",
            marginBottom: 6,
          }}
        >
          Pagamento Confermato
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 0 }}>
          Il tuo PDF è pronto.
        </p>
      </div>

      {/* ═══ FASE 1: UPSELL PRIMA DEL DOWNLOAD ═══ */}
      {!showDownload && (
        <div style={{ maxWidth: 500, margin: "0 auto", paddingTop: 24 }}>

          {/* Gancio emotivo */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <p style={{ color: "#e8001d", fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>
              ⚡ PRIMA DI SCARICARE
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(24px, 5vw, 34px)",
                letterSpacing: 1.5,
                color: "#f0f0f0",
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              Scoprire non basta.
              <br />
              <span style={{ color: "#e8001d" }}>Devi sapere cosa fare dopo.</span>
            </h2>
            <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>
              Il 90% delle persone scopre la verità e poi fa gli errori peggiori.
              <br />Questo ebook ti dice esattamente cosa fare — e cosa NON fare.
            </p>
          </div>

          {/* Card unica — €19,99 */}
          <div className="upsell-card">
            {/* Glow */}
            <div
              style={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 180,
                height: 180,
                background: "radial-gradient(circle, rgba(232,0,29,0.1), transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#e8001d", fontWeight: 600 }}>
                📖 Ebook — 50 Pagine
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#ff4444",
                  background: "rgba(232,0,29,0.12)",
                  border: "1px solid rgba(232,0,29,0.3)",
                  borderRadius: 4,
                  padding: "2px 8px",
                  letterSpacing: 1,
                }}
              >
                {expired ? "⚠️ SCADUTA" : `⏱ ${m}:${s}`}
              </span>
            </div>

            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 26,
                letterSpacing: 1,
                color: "#f0f0f0",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              &ldquo;Come Ho Scoperto la Verità&rdquo;
            </h3>

            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, marginBottom: 16 }}>
              Una storia vera di chi ci è passato. Script pronti per il confronto,
              checklist delle prime 24 ore, errori da evitare, strategie di protezione.
              <strong style={{ color: "#ccc" }}> Non teoria — esperienza vissuta.</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                ["📖", "50 pagine — storia vera, non consigli generici"],
                ["💬", "Script pronti parola per parola per il confronto"],
                ["✅", "Checklist: cosa fare nelle prime 24 ore"],
                ["🚫", "I 6 errori che il 90% delle persone fa"],
                ["🛡️", "Come proteggerti prima, durante e dopo"],
              ].map(([icon, text], i) => (
                <div className="feature-row" key={i}>
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Prezzo */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: "#f0f0f0", letterSpacing: 1 }}>
                €19,99
              </span>
              <span style={{ fontSize: 13, color: "#555", textDecoration: "line-through" }}>€49,99</span>
              <span style={{ fontSize: 11, color: "#e8001d", fontWeight: 600, marginLeft: 4 }}>-60%</span>
            </div>

            {/* CTA */}
            <button className="btn-upsell" disabled={expired} onClick={handleBuy}>
              Aggiungi e Scarica Tutto — €19,99 →
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 8 }}>
              Download immediato · Pagamento sicuro Stripe
            </p>
          </div>

          {/* Skip — piccolo, sotto */}
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              onClick={handleSkip}
              style={{
                background: "none",
                border: "none",
                color: "#333",
                fontSize: 11,
                cursor: "pointer",
                padding: "8px 16px",
              }}
            >
              No grazie, scarica solo il PDF base →
            </button>
          </div>
        </div>
      )}

      {/* ═══ FASE 2: DOWNLOAD (dopo dismiss o dopo click upsell) ═══ */}
      {showDownload && (
        <div className="download-section" style={{ maxWidth: 500, margin: "0 auto", paddingTop: 32, textAlign: "center" }}>
          <p style={{ color: "#888", fontSize: 15, marginBottom: 24 }}>
            Ecco il tuo PDF. Scaricalo subito.
          </p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 10,
              padding: "16px 32px",
              color: "#f0f0f0",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 16,
              transition: "border-color 0.2s",
            }}
          >
            <span style={{ fontSize: 20 }}>📥</span>
            Scarica il tuo PDF
          </a>

          <div
            style={{
              marginTop: 32,
              background: "#111",
              border: "1px solid #1a1a1a",
              borderRadius: 10,
              padding: "16px 20px",
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
              💡 Salvalo subito sul telefono. Puoi leggerlo quando vuoi, anche offline.
              Se hai problemi, scrivi a{" "}
              <a href="mailto:supporto@tihatradito.site" style={{ color: "#e8001d" }}>
                supporto@tihatradito.site
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ maxWidth: 500, margin: "60px auto 0", textAlign: "center", color: "#333", fontSize: 11 }}>
        <p>© tihatradito.site · Tutti i diritti riservati</p>
        <p style={{ marginTop: 6 }}>
          <a href="/termini" style={{ color: "#444" }}>Termini e Condizioni</a>
          {" · "}
          <a href="/privacy" style={{ color: "#444" }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
