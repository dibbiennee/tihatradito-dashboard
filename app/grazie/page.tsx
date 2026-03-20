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

/* ─── STRIPE PAYMENT LINKS (sostituisci PLACEHOLDER con i tuoi) ─── */
const STRIPE_EBOOK1 = "https://buy.stripe.com/dRm6oG53cbZmciUfSp2Nq07"; // €19,99
const STRIPE_EBOOK2 = "https://buy.stripe.com/7sYdR8eDM1kIfv68pX2Nq08"; // €49,99

/* ─── COUNTDOWN ─── */
const COUNTDOWN_SECONDS = 7 * 60;

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

function CountdownBadge({ m, s, expired }: { m: string; s: string; expired: boolean }) {
  if (expired)
    return (
      <span style={{ color: "#e8001d", fontFamily: "monospace", fontSize: 13 }}>
        ⚠️ OFFERTA SCADUTA
      </span>
    );
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 14,
        color: "#ff4444",
        background: "rgba(232,0,29,0.12)",
        border: "1px solid rgba(232,0,29,0.3)",
        borderRadius: 4,
        padding: "2px 8px",
        letterSpacing: 1,
      }}
    >
      ⏱ {m}:{s}
    </span>
  );
}

/* ═══════════════════════════════════════
   GRAZIE PAGE
   ═══════════════════════════════════════ */
export default function GraziePage() {
  const pdfFile = process.env.NEXT_PUBLIC_PDF_URL?.replace("/", "") || "scopri-la-verita.pdf";
  const pdfUrl = `/api/download?f=${encodeURIComponent(pdfFile)}`;
  const { m, s, expired } = useCountdown(COUNTDOWN_SECONDS);
  const [dismissed, setDismissed] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const tracked = useRef(false);

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
  const trackedImpression = useRef(false);
  useEffect(() => {
    if (!trackedImpression.current) {
      trackedImpression.current = true;
      trackEvent("upsell_impression", { products: ["ebook_pratico", "ebook_segreto"] });
    }
  }, []);

  // Pulsazione badge censura
  useEffect(() => {
    const interval = setInterval(() => setGlowing((v) => !v), 1800);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = (url: string, product: string, price: number) => {
    if (expired) return;
    trackEvent("upsell_click", { product, price });
    window.open(url, "_blank");
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
        .card {
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          min-width: 280px;
          max-width: 420px;
          transition: transform 0.2s, border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .card:hover { transform: translateY(-3px); }
        .card-1 { border-color: #333; }
        .card-1:hover { border-color: rgba(232,0,29,0.4); }
        .card-2 {
          border-color: rgba(232,0,29,0.35);
          box-shadow: 0 0 32px rgba(232,0,29,0.08);
        }
        .card-2:hover {
          border-color: rgba(232,0,29,0.7);
          box-shadow: 0 0 48px rgba(232,0,29,0.18);
        }
        .btn {
          width: 100%;
          padding: 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 1.5px;
          transition: all 0.2s;
        }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-1 {
          background: #e8001d;
          color: #fff;
        }
        .btn-1:not(:disabled):hover { background: #c0001a; }
        .btn-2 {
          background: linear-gradient(135deg, #e8001d, #7a0010);
          color: #fff;
          box-shadow: 0 4px 24px rgba(232,0,29,0.4);
        }
        .btn-2:not(:disabled):hover {
          box-shadow: 0 4px 32px rgba(232,0,29,0.6);
          transform: scale(1.01);
        }
        .censura-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e8001d;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
          transition: box-shadow 0.4s;
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
        .price-tag {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1px;
        }
        .separator {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 40px 0 32px;
        }
        .separator-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #333, transparent);
        }
        .separator-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: #555;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .cards-wrapper { flex-direction: column !important; align-items: center !important; }
          .card { max-width: 100% !important; }
        }
      `}</style>

      {/* ── HEADER CONFERMA ── */}
      <div style={{ maxWidth: 600, margin: "0 auto", paddingTop: 56, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36,
            letterSpacing: 2,
            color: "#f0f0f0",
            marginBottom: 8,
          }}
        >
          Pagamento Confermato
        </h1>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 28 }}>
          Il tuo PDF è pronto. Scaricalo subito qui sotto.
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
            padding: "14px 28px",
            color: "#f0f0f0",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            transition: "border-color 0.2s",
          }}
        >
          <span style={{ fontSize: 20 }}>📥</span>
          Scarica il tuo PDF
        </a>
      </div>

      {/* ── UPSELL SECTION ── */}
      {!dismissed && (
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          {/* Separatore */}
          <div className="separator">
            <div className="separator-line" />
            <span className="separator-text">Offerta Esclusiva · Solo Per Te</span>
            <div className="separator-line" />
          </div>

          {/* Countdown */}
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
              Questa offerta scompare tra:
            </p>
            <CountdownBadge m={m} s={s} expired={expired} />
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(26px, 5vw, 38px)",
              letterSpacing: 2,
              color: "#f0f0f0",
              textAlign: "center",
              marginTop: 16,
              marginBottom: 6,
            }}
          >
            Hai Fatto il Primo Passo.
          </h2>
          <p style={{ color: "#777", fontSize: 14, textAlign: "center", marginBottom: 36 }}>
            Ma chi ha vissuto questa situazione sa che il primo passo non basta mai.
          </p>

          {/* Cards */}
          <div className="cards-wrapper" style={{ display: "flex", gap: 20, justifyContent: "center" }}>
            {/* ── CARD 1: €19,99 ── */}
            <div className="card card-1">
              <div>
                <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#e8001d", fontWeight: 600 }}>
                  Ebook Pratico
                </span>
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, color: "#f0f0f0", lineHeight: 1.2 }}>
                Come Ho Scoperto la Verità
              </h3>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                Una storia vera. Una guida concreta. Scritta da chi ci è passata
                e vuole tenerti per mano nel momento più difficile.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["📖", "50 pagine di storia vera — non teoria, non consigli vuoti"],
                  ["💬", "Script pronti parola per parola per il confronto"],
                  ["✅", "Checklist emotiva e legale: cosa fare nelle prime 24 ore"],
                  ["🚫", "Errori che il 90% delle persone fa — e come evitarli"],
                  ["🛡️", "Strategie di protezione personale prima, durante e dopo"],
                ].map(([icon, text], i) => (
                  <div className="feature-row" key={i}>
                    <span>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="price-tag" style={{ fontSize: 36, color: "#f0f0f0" }}>€19,99</span>
                  <span style={{ fontSize: 12, color: "#555", textDecoration: "line-through" }}>€49,99</span>
                </div>
                <p style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Download PDF immediato</p>
              </div>
              <button className="btn btn-1" disabled={expired} onClick={() => handleBuy(STRIPE_EBOOK1, "ebook_pratico", 19.99)}>
                Voglio Questo Ebook →
              </button>
            </div>

            {/* ── CARD 2: €49,99 ── */}
            <div className="card card-2">
              {/* glow bg */}
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 200,
                  height: 200,
                  background: "radial-gradient(circle, rgba(232,0,29,0.12), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#e8001d", fontWeight: 600 }}>
                  ⚡ Più Venduto
                </span>
                <span
                  className="censura-badge"
                  style={{ boxShadow: glowing ? "0 0 12px rgba(232,0,29,0.8)" : "0 0 4px rgba(232,0,29,0.3)" }}
                >
                  ⛔ CONTENUTO RIMOSSO 2×
                </span>
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, color: "#f0f0f0", lineHeight: 1.2 }}>
                Dalla Sua Parte del Letto
                <br />
                <span style={{ color: "#e8001d" }}>— Cosa Pensa Davvero Quando Ti Mente</span>
              </h3>
              {/* Avviso censura */}
              <div
                style={{
                  background: "rgba(232,0,29,0.07)",
                  border: "1px solid rgba(232,0,29,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#cc3333",
                  lineHeight: 1.6,
                }}
              >
                ⚠️ <strong>Nota:</strong> Questo ebook è stato rimosso 2 volte da
                altre piattaforme per i contenuti considerati troppo espliciti. Non
                possiamo garantire che sarà ancora disponibile tra 24 ore.
              </div>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                37 confessioni reali di chi ha tradito. Scopri cosa pensavano
                mentre ti guardavano negli occhi e mentivano. Cosa dicevano
                all&apos;altra persona. Come nascondevano tutto.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["📕", "80+ pagine — 37 confessioni scritte da chi ha tradito"],
                  ["🧠", "Cosa pensano davvero quando ti guardano e mentono"],
                  ["💀", "Il momento esatto in cui decidono di farlo"],
                  ["👁️", "Come nascondono tutto — i metodi che non conosci"],
                  ["🔍", "I pattern dei traditori seriali — riconoscili subito"],
                ].map(([icon, text], i) => (
                  <div className="feature-row" key={i}>
                    <span>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="price-tag" style={{ fontSize: 36, color: "#e8001d" }}>€49,99</span>
                  <span style={{ fontSize: 12, color: "#555", textDecoration: "line-through" }}>€99,99</span>
                </div>
                <p style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Download PDF immediato · Accesso limitato</p>
              </div>
              <button className="btn btn-2" disabled={expired} onClick={() => handleBuy(STRIPE_EBOOK2, "ebook_segreto", 49.99)}>
                Voglio il Libro Segreto →
              </button>
            </div>
          </div>

          {/* Dismiss */}
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button
              onClick={() => {
                trackEvent("upsell_dismiss");
                setDismissed(true);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#444",
                fontSize: 12,
                cursor: "pointer",
                textDecoration: "underline",
                padding: "8px 16px",
              }}
            >
              No grazie, mi basta quello che ho
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ maxWidth: 600, margin: "60px auto 0", textAlign: "center", color: "#333", fontSize: 11 }}>
        <p>© tihatradito.site · Tutti i diritti riservati · I PDF sono prodotti digitali, il download è immediato dopo il pagamento.</p>
        <p style={{ marginTop: 6 }}>
          Acquistando accetti i nostri{" "}
          <a href="/termini" style={{ color: "#555" }}>Termini e Condizioni</a>.
          Nessun rimborso per prodotti digitali scaricati (Dir. UE 2011/83/UE art. 16m).
        </p>
      </div>
    </div>
  );
}
