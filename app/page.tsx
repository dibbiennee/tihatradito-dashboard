"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ─── ANALYTICS TRACKER ─── */
function trackEvent(type: string, data: Record<string, unknown> = {}) {
  const payload = JSON.stringify({ type, data });
  try {
    // sendBeacon needs a Blob with explicit content-type for JSON
    const blob = new Blob([payload], { type: "application/json" });
    const sent = navigator.sendBeacon("/api/events", blob);
    if (!sent) throw new Error("beacon failed");
  } catch {
    // Fallback to fetch
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

/* ─── TYPES ─── */
interface QuizQuestion {
  question: string;
  answers: string[];
}

interface QuizResult {
  label: string;
  risk: number;
  text: string;
}

/* ─── DATA ─── */
const QUESTIONS: QuizQuestion[] = [
  {
    question: "Il suo comportamento è cambiato ultimamente?",
    answers: [
      "Sì, molto — è diventato/a distante",
      "Un po' — ogni tanto è strano/a",
      "Non so — forse sono io che esagero",
      "No, tutto normale",
    ],
  },
  {
    question: "Come si comporta con il telefono quando sei vicino/a?",
    answers: [
      "Lo nasconde o lo gira sempre",
      "Spesso è distratto/a dallo schermo",
      "Lo usa normalmente ma ci scherza su",
      "Nessun problema con il telefono",
    ],
  },
  {
    question: "Da quanto tempo hai questo dubbio?",
    answers: [
      "Più di un mese — non riesco a smettere",
      "Qualche settimana — ogni tanto ci penso",
      "Da pochi giorni — è successa una cosa",
      "Da sempre, sono gelosissimo/a",
    ],
  },
];

const SCORE_TO_POINTS = [3, 2, 1, 0];

function getResult(score: number): QuizResult {
  if (score >= 7)
    return {
      label: "Segnali molto preoccupanti",
      risk: 85,
      text: "I segnali che descrivi sono tra i più comuni nei casi confermati. Non ignorarli.",
    };
  if (score >= 4)
    return {
      label: "Segnali da non ignorare",
      risk: 68,
      text: "Il tuo istinto potrebbe avere ragione. Questi segnali meritano attenzione.",
    };
  return {
    label: "Il dubbio esiste per un motivo",
    risk: 55,
    text: "Anche con pochi segnali, il fatto che tu sia qui dice qualcosa. Fidati del tuo istinto.",
  };
}

/* ─── COUNTDOWN HOOK ─── */
function useCountdown(minutes: number) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    const STORAGE_KEY = "countdown_start";
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (stored) {
      const elapsed = Math.floor((now - parseInt(stored)) / 1000);
      const remaining = minutes * 60 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    } else {
      localStorage.setItem(STORAGE_KEY, now.toString());
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [minutes]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/* ─── SOCIAL PROOF POPUP ─── */
const PROOF_NAMES = [
  "Giulia", "Sara", "Martina", "Chiara", "Valentina", "Francesca",
  "Alessia", "Elena", "Federica", "Laura", "Jessica", "Elisa",
  "Roberta", "Silvia", "Giorgia", "Marco", "Luca", "Andrea",
  "Alessandro", "Davide", "Matteo", "Simone", "Lorenzo",
];
const PROOF_CITIES = [
  "Milano", "Roma", "Napoli", "Torino", "Bologna", "Firenze",
  "Palermo", "Genova", "Bari", "Catania", "Verona", "Padova",
  "Brescia", "Modena", "Cagliari", "Perugia", "Reggio Calabria",
];
const PROOF_TIERS = ["Base", "Completo", "Completo", "Completo", "Ultimate"];
const PROOF_TIMES = ["2 min fa", "5 min fa", "8 min fa", "12 min fa", "Ora", "3 min fa", "1 min fa"];

function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [data, setData] = useState({ name: "", city: "", tier: "", time: "" });

  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    const show = () => {
      setData({
        name: pick(PROOF_NAMES),
        city: pick(PROOF_CITIES),
        tier: pick(PROOF_TIERS),
        time: pick(PROOF_TIMES),
      });
      setExiting(false);
      setVisible(true);
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => setVisible(false), 300);
      }, 4000);
    };

    const initial = setTimeout(show, 8000 + Math.random() * 7000);
    const interval = setInterval(show, 18000 + Math.random() * 12000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 ${exiting ? "toast-out" : "toast-in"}`}>
      <div className="bg-bg2 border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
        <div className="w-9 h-9 rounded-full bg-red/10 flex items-center justify-center text-lg shrink-0">
          🔒
        </div>
        <div className="min-w-0">
          <p className="text-sm text-txt truncate">
            <span className="font-semibold">{data.name}</span> da {data.city}
          </p>
          <p className="text-xs text-muted">
            Ha scelto {data.tier} · {data.time}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function Home() {
  const [step, setStep] = useState(0); // 0-2 = quiz questions, 3 = result
  const [answers, setAnswers] = useState<number[]>([]);
  const [showPricing, setShowPricing] = useState(false);
  const countdown = useCountdown(14);

  // Track page view + scroll + time
  const hasTrackedView = useRef(false);
  const maxScroll = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!hasTrackedView.current) {
      trackEvent("page_view", { referrer: document.referrer || "direct" });
      hasTrackedView.current = true;
    }

    // Scroll depth tracking (debounced)
    let scrollTimer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const pct = Math.round(
          ((window.scrollY + window.innerHeight) /
            document.documentElement.scrollHeight) *
            100
        );
        if (pct > maxScroll.current) {
          maxScroll.current = pct;
        }
      }, 300);
    };
    window.addEventListener("scroll", handleScroll);

    // Send scroll depth + time on page when leaving
    const handleLeave = () => {
      const seconds = Math.round((Date.now() - startTime.current) / 1000);
      trackEvent("page_leave", {
        scroll_depth: maxScroll.current,
        time_on_page: seconds,
      });
    };
    window.addEventListener("beforeunload", handleLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleLeave();
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, []);

  const score = answers.reduce((sum, a) => sum + SCORE_TO_POINTS[a], 0);
  const result = getResult(score);

  const handleAnswer = useCallback(
    (answerIndex: number) => {
      const newAnswers = [...answers, answerIndex];
      setAnswers(newAnswers);

      trackEvent("quiz_answer", {
        question: step + 1,
        answer: answerIndex,
        points: SCORE_TO_POINTS[answerIndex],
      });

      if (step < 2) {
        setStep(step + 1);
      } else {
        setStep(3);
        const finalScore = newAnswers.reduce(
          (sum, a) => sum + SCORE_TO_POINTS[a],
          0
        );
        trackEvent("quiz_complete", {
          score: finalScore,
          risk: getResult(finalScore).risk,
        });
      }
    },
    [answers, step]
  );

  // Pricing tiers — €0.99 rimosso, 3 tier diretti
  const starterLink = "https://buy.stripe.com/7sY3cufHQe7u1Egay52Nq04";   // €2.99
  const proLink = "https://buy.stripe.com/8x228qgLU3sQ2IkbC92Nq05";       // €9.99
  const ultimateLink = "https://buy.stripe.com/3cIbJ0fHQ1kI0AcfSp2Nq06";   // €19.99

  const handleCTA = () => {
    trackEvent("cta_click", { score, risk: result.risk });
    setShowPricing(true);
    setTimeout(() => {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleTierClick = (tier: string, price: string, link: string) => {
    trackEvent("tier_click", { tier, price, score, risk: result.risk });
    window.location.href = link;
  };

  return (
    <main className="min-h-screen bg-bg">
      <SocialProofToast />
      {/* ─── HERO ─── */}
      <section className="px-5 pt-12 pb-8 max-w-lg mx-auto fade-up">
        <div className="inline-block bg-red/10 text-red text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
          ⚡ Metodo riservato
        </div>
        <h1 className="text-4xl md:text-5xl leading-tight mb-4">
          Hai il <span className="text-red">dubbio</span>?
        </h1>
        <p className="text-muted text-base leading-relaxed mb-6">
          Rispondi a 3 domande. Scopri se stai facendo la cosa giusta — e come
          ottenere la verità in meno di 10 minuti.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["👩", "👨", "👩‍🦱", "🧑"].map((emoji, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-bg3 border-2 border-bg flex items-center justify-center text-sm"
              >
                {emoji}
              </div>
            ))}
          </div>
          <span className="text-muted text-sm">
            +847 persone hanno già scoperto la verità
          </span>
        </div>
      </section>

      {/* ─── QUIZ ─── */}
      {step < 3 && (
        <section className="px-5 pb-8 max-w-lg mx-auto fade-up fade-up-1">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full overflow-hidden bg-bg3"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    i < step
                      ? "bg-red w-full"
                      : i === step
                      ? "bg-red/60 w-1/2 progress-pulse"
                      : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-muted mb-3 uppercase tracking-widest">
            Domanda {step + 1} di 3
          </p>
          <h2 className="text-2xl mb-5 leading-snug">
            {QUESTIONS[step].question}
          </h2>

          <div className="flex flex-col gap-3">
            {QUESTIONS[step].answers.map((answer, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full text-left bg-bg2 border border-border rounded-xl px-4 py-3.5 text-sm text-txt transition-all duration-200 hover:border-red/50 hover:bg-bg3 active:scale-[0.98]"
              >
                {answer}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── RESULT ─── */}
      {step === 3 && (
        <>
          <section className="px-5 pb-8 max-w-lg mx-auto fade-up">
            <div className="bg-bg2 border border-border rounded-2xl p-6">
              <div className="text-3xl mb-3">🔴</div>
              <h2 className="text-2xl mb-2">{result.label}</h2>
              <p className="text-muted text-sm leading-relaxed mb-5">
                {result.text}
              </p>

              {/* Risk bar */}
              <div className="relative">
                <div className="flex justify-between text-xs text-muted mb-2">
                  <span>Basso rischio</span>
                  <span className="text-red font-semibold">
                    {result.risk}% — Alto rischio
                  </span>
                </div>
                <div className="h-3 bg-bg3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full risk-bar-fill"
                    style={{
                      width: `${result.risk}%`,
                      background:
                        "linear-gradient(90deg, #e8001d 0%, #ff4444 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ─── FEATURES ─── */}
          <section className="px-5 pb-8 max-w-lg mx-auto fade-up fade-up-2">
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: "🕵️",
                  title: "Metodo silenzioso",
                  desc: "Non sa nulla. Tu ottieni tutte le risposte.",
                },
                {
                  icon: "⚡",
                  title: "Risultati in 10 minuti",
                  desc: "Funziona su WhatsApp, Instagram, Snapchat.",
                },
                {
                  icon: "🔒",
                  title: "100% privato",
                  desc: "Accesso immediato. Nessuna registrazione.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-bg2 border border-border rounded-xl p-4"
                >
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{f.title}</p>
                    <p className="text-muted text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── TESTIMONIALS ─── */}
          <section className="px-5 pb-8 max-w-lg mx-auto fade-up fade-up-3">
            <div className="flex flex-col gap-3">
              {[
                {
                  name: "Martina, 24",
                  city: "Milano",
                  text: "Avevo il dubbio da mesi. In 15 minuti ho scoperto tutto.",
                },
                {
                  name: "Sara, 27",
                  city: "Roma",
                  text: "Ho speso meno di un caffè e mi ha cambiato la vita.",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="bg-bg2 border border-border rounded-xl p-4"
                >
                  <p className="text-sm mb-2 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="text-xs text-muted">
                    — {t.name} ({t.city})
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── URGENCY + CTA ─── */}
          <section className="px-5 pb-8 max-w-lg mx-auto fade-up fade-up-4">
            <div className="text-center">
              <p className="text-sm text-muted mb-1">
                Offerta attiva ancora per
              </p>
              <p className="text-2xl font-bold text-red urgent-pulse mb-4">
                {countdown}
              </p>

              <button
                onClick={handleCTA}
                className="w-full bg-red hover:bg-red-dark text-white font-bold text-lg py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.97] mb-3"
              >
                Scopri la verità adesso →
              </button>
              <p className="text-xs text-muted">
                Accesso immediato · Pagamento sicuro Stripe
              </p>
            </div>
          </section>

          {/* ─── PRICING TIERS ─── */}
          {showPricing && (
            <section id="pricing" className="px-4 pb-12 max-w-lg mx-auto fade-up">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Scegli il tuo pacchetto</h3>
                <p className="text-muted text-sm">Più scopri, più hai il controllo</p>
              </div>

              <div className="flex flex-col gap-4">

                {/* ─── TIER 1: €2.99 STARTER ─── */}
                <div className="relative bg-bg2 border border-border rounded-2xl p-5 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-widest mb-1">Base</p>
                      <p className="text-2xl font-bold">€2,99</p>
                    </div>
                    <span className="text-muted line-through text-sm mt-1">€14,99</span>
                  </div>
                  <div className="bg-bg3/50 rounded-lg px-3 py-1.5 mb-4 inline-block">
                    <p className="text-[11px] text-muted">⏳ Accesso per <span className="text-txt font-semibold">24 ore</span></p>
                  </div>
                  <div className="flex flex-col gap-2 mb-5">
                    {[
                      "Guida base: i 5 segnali",
                      "1 metodo per controllare WhatsApp",
                      "Istruzioni passo-passo",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-muted">✓</span>
                        <span className="text-muted">{item}</span>
                      </div>
                    ))}
                    {[
                      "Metodi avanzati Instagram/Snapchat",
                      "Posizione in tempo reale",
                      "Accesso galleria foto",
                      "Aggiornamenti futuri",
                      "Accesso permanente",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-muted/30">✗</span>
                        <span className="text-muted/40 line-through">{item}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleTierClick("starter", "2.99", starterLink)}
                    className="w-full bg-bg3 hover:bg-border text-txt font-semibold text-sm py-3 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  >
                    Scegli Base — €2,99
                  </button>
                </div>

                {/* ─── TIER 2: €9.99 PRO — HIGHLIGHTED ─── */}
                <div className="relative bg-bg2 border-2 border-red rounded-2xl p-5 transition-all duration-200 shadow-[0_0_30px_rgba(232,0,29,0.15)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red text-white text-xs font-bold px-4 py-1 rounded-full">
                    🔥 PIÙ SCELTO
                  </div>
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <div>
                      <p className="text-xs text-red uppercase tracking-widest font-semibold mb-1">Completo</p>
                      <p className="text-3xl font-bold">€9,99</p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted line-through text-sm">€49,99</span>
                      <div className="bg-red/10 text-red text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">-80%</div>
                    </div>
                  </div>
                  <div className="bg-red/5 border border-red/20 rounded-lg px-3 py-1.5 mb-4 inline-block">
                    <p className="text-[11px] text-red">🔓 Accesso per <span className="font-bold">1 anno</span> — scarica e tieni per sempre</p>
                  </div>
                  <div className="flex flex-col gap-2 mb-5">
                    {[
                      "Tutto del pacchetto Base",
                      "Come recuperare messaggi cancellati",
                      "Metodo chat archiviate e segrete",
                      "Funziona su WhatsApp, Instagram, Snapchat",
                      "Spiare la posizione in tempo reale",
                      "Accesso alla galleria foto del telefono",
                      "Vedere chi segue di nascosto",
                      "Aggiornamenti gratuiti per 1 anno",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-red">✓</span>
                        <span className="text-txt">{item}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleTierClick("pro", "9.99", proLink)}
                    className="w-full bg-red hover:bg-red-dark text-white font-bold text-base py-4 rounded-xl transition-all duration-200 active:scale-[0.97] mb-2"
                  >
                    Scopri tutto — €9,99 →
                  </button>
                  <p className="text-center text-[11px] text-muted">Il 78% delle persone sceglie questo</p>
                </div>

                {/* ─── TIER 3: €19.99 ULTIMATE ─── */}
                <div className="relative bg-bg2 border border-amber-500/30 rounded-2xl p-5 transition-all duration-200">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    👑 GARANZIA TOTALE
                  </div>
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <div>
                      <p className="text-xs text-amber-400 uppercase tracking-widest font-semibold mb-1">Ultimate</p>
                      <p className="text-2xl font-bold">€19,99</p>
                    </div>
                    <span className="text-muted line-through text-sm mt-1">€89,99</span>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-1.5 mb-4 inline-block">
                    <p className="text-[11px] text-amber-400">♾️ Accesso <span className="font-bold">PER SEMPRE</span> + aggiornamenti a vita</p>
                  </div>
                  <div className="flex flex-col gap-2 mb-5">
                    {[
                      "Tutto del pacchetto Completo",
                      "Accesso permanente — per sempre tuo",
                      "Guida anti-scoperta: non saprà mai nulla",
                      "Metodo per controllare 2+ dispositivi",
                      "Supporto prioritario via email",
                      "Bonus: segnali di manipolazione emotiva",
                      "Aggiornamenti gratuiti per sempre",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-amber-400">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleTierClick("ultimate", "19.99", ultimateLink)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  >
                    Vai sul sicuro — €19,99 →
                  </button>
                </div>

              </div>

              <p className="text-[10px] text-muted/40 mt-4 text-center">
                Cliccando accetti i{" "}
                <a href="/termini" className="underline hover:text-muted/70">
                  Termini e Condizioni
                </a>{" "}
                e rinunci al diritto di recesso per contenuti digitali (Dir. 2011/83/UE)
              </p>
            </section>
          )}

        </>
      )}

      {/* Upsell bottom sheets removed — replaced with inline pricing tiers */}

      {/* ─── FOOTER ─── */}
      <footer className="px-5 py-8 text-center">
        <p className="text-xs text-muted/50">
          © {new Date().getFullYear()} — Tutti i diritti riservati
        </p>
        <div className="flex justify-center gap-3 mt-1">
          <a href="/termini" className="text-xs text-muted/40 hover:text-muted/70 transition-colors">
            Termini e Condizioni
          </a>
          <span className="text-xs text-muted/20">·</span>
          <a href="/privacy" className="text-xs text-muted/40 hover:text-muted/70 transition-colors">
            Privacy Policy
          </a>
        </div>
      </footer>
    </main>
  );
}
