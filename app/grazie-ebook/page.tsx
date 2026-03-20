"use client";

import { useEffect, useRef } from "react";

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

/* ─── EBOOK PRODUCTS ─── */
const EBOOKS: Record<string, { title: string; file: string; price: number }> = {
  "Sp2Nq07": { title: "Come Ho Scoperto la Verità", file: "come-ho-scoperto-la-verita.pdf", price: 19.99 },
  "pX2Nq08": { title: "Dalla Sua Parte del Letto", file: "dalla-sua-parte-del-letto.pdf", price: 49.99 },
};

function detectEbook(): { title: string; file: string; price: number } {
  const ref = document.referrer || "";
  const url = window.location.href;
  for (const [key, ebook] of Object.entries(EBOOKS)) {
    if (ref.includes(key) || url.includes(key)) return ebook;
  }
  // Default to €19.99 ebook
  return EBOOKS["Sp2Nq07"];
}

export default function GrazieEbookPage() {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      const ebook = detectEbook();
      trackEvent("ebook_purchase", {
        product: ebook.title,
        price: ebook.price,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const ebook = typeof window !== "undefined" ? detectEbook() : EBOOKS["Sp2Nq07"];
  const downloadUrl = `/api/download?f=${encodeURIComponent(ebook.file)}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#f0f0f0",
        fontFamily: "'DM Sans', sans-serif",
        padding: "0 16px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: 500, width: "100%", paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 32,
            letterSpacing: 2,
            color: "#f0f0f0",
            marginBottom: 8,
          }}
        >
          Ebook Sbloccato
        </h1>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 8 }}>
          Il tuo ebook <strong style={{ color: "#f0f0f0" }}>&ldquo;{ebook.title}&rdquo;</strong> è pronto.
        </p>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 32 }}>
          Clicca qui sotto per scaricarlo. Il link funziona una sola volta — salvalo subito.
        </p>

        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "#e8001d",
            borderRadius: 10,
            padding: "16px 32px",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 16,
            transition: "background 0.2s",
            boxShadow: "0 4px 24px rgba(232,0,29,0.3)",
          }}
        >
          <span style={{ fontSize: 20 }}>📥</span>
          Scarica il tuo Ebook
        </a>

        <div
          style={{
            marginTop: 40,
            background: "#111",
            border: "1px solid #222",
            borderRadius: 12,
            padding: "20px 24px",
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, marginBottom: 12 }}>
            <strong style={{ color: "#f0f0f0" }}>💡 Consiglio:</strong> Salvalo subito sul telefono o sul computer.
            Puoi leggerlo quando vuoi, anche offline.
          </p>
          <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
            Se hai problemi con il download, scrivi a{" "}
            <a href="mailto:supporto@tihatradito.site" style={{ color: "#e8001d" }}>
              supporto@tihatradito.site
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 500, margin: "60px auto 0", textAlign: "center", color: "#333", fontSize: 11 }}>
        <p>© tihatradito.site · Tutti i diritti riservati</p>
        <p style={{ marginTop: 6 }}>
          <a href="/termini" style={{ color: "#555" }}>Termini e Condizioni</a>
          {" · "}
          <a href="/privacy" style={{ color: "#555" }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
