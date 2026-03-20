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

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function Home() {
  const [step, setStep] = useState(0); // 0-2 = quiz questions, 3 = result
  const [answers, setAnswers] = useState<number[]>([]);
  const [upsellStep, setUpsellStep] = useState(0); // 0=none, 1=upsell €2.99, 2=upsell €9.99
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

  const baseLink = "https://buy.stripe.com/28E8wO8fo2oM82EbC92Nq03";
  const upsellLink = "https://buy.stripe.com/7sY3cufHQe7u1Egay52Nq04";
  const premiumLink = "https://buy.stripe.com/8x228qgLU3sQ2IkbC92Nq05";

  const handleCTA = () => {
    trackEvent("cta_click", { score, risk: result.risk });
    setUpsellStep(1);
  };

  return (
    <main className="min-h-screen bg-bg">
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
          <section className="px-5 pb-12 max-w-lg mx-auto fade-up fade-up-4">
            <div className="text-center">
              <p className="text-sm text-muted mb-1">
                Offerta attiva ancora per
              </p>
              <p className="text-2xl font-bold text-red urgent-pulse mb-4">
                {countdown}
              </p>

              <div className="mb-4">
                <span className="text-muted line-through text-lg mr-2">
                  €19,99
                </span>
                <span className="text-3xl font-bold text-txt">€0,99</span>
              </div>

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

        </>
      )}

      {/* ─── UPSELL STEP 1: €2.99 ─── */}
      {upsellStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full max-w-lg bg-bg2 border-t border-border rounded-t-3xl p-6 pb-10 slide-up no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="text-center mb-4">
              <div className="inline-block bg-red/10 text-red text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                🔥 Solo per te — offerta unica
              </div>
              <h3 className="text-2xl mb-2">Vuoi anche i metodi avanzati?</h3>
              <p className="text-muted text-sm">
                A soli €2,99 invece di €14,99 — solo adesso
              </p>
            </div>
            <div className="flex flex-col gap-2.5 mb-6">
              {[
                "Come recuperare i messaggi cancellati",
                "Metodo per leggere le chat archiviate",
                "Trucco per vedere i messaggi che elimina",
                "Funziona anche su Instagram e Snapchat",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <span className="text-red">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                trackEvent("upsell_yes", { from: "0.99", to: "2.99" });
                setUpsellStep(2);
              }}
              className="block w-full bg-red hover:bg-red-dark text-white font-bold text-base py-4 rounded-xl text-center transition-all duration-200 active:scale-[0.97] mb-3"
            >
              Sì, voglio i metodi avanzati — €2,99 →
            </button>
            <button
              onClick={() => {
                trackEvent("upsell_no", { step: 1, target: "base" });
                window.location.href = baseLink;
              }}
              className="block w-full text-center text-muted text-sm py-2 hover:text-txt transition-colors"
            >
              No grazie, voglio solo quello base →
            </button>
          </div>
        </div>
      )}

      {/* ─── UPSELL STEP 2: €9.99 ─── */}
      {upsellStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full max-w-lg bg-bg2 border-t border-border rounded-t-3xl p-6 pb-10 slide-up no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="text-center mb-4">
              <div className="inline-block bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                👑 Ultima offerta — il pacchetto completo
              </div>
              <h3 className="text-2xl mb-2">Vuoi il controllo totale?</h3>
              <p className="text-muted text-sm">
                A soli €9,99 invece di €49,99 — non lo vedrai più
              </p>
            </div>
            <div className="flex flex-col gap-2.5 mb-6">
              {[
                "Tutto quello dei pacchetti precedenti",
                "Come spiare la posizione in tempo reale",
                "Metodo per accedere alla galleria foto",
                "Vedere chi segue e chi lo segue di nascosto",
                "Aggiornamenti gratuiti per sempre",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <span className="text-amber-400">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <a
              href={premiumLink}
              onClick={() => trackEvent("upsell_yes", { from: "2.99", to: "9.99" })}
              className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-base py-4 rounded-xl text-center transition-all duration-200 active:scale-[0.97] mb-3"
            >
              Sì, voglio il controllo totale — €9,99 →
            </a>
            <button
              onClick={() => {
                trackEvent("upsell_no", { step: 2, target: "upsell" });
                window.location.href = upsellLink;
              }}
              className="block w-full text-center text-muted text-sm py-2 hover:text-txt transition-colors"
            >
              No grazie, procedo con €2,99 →
            </button>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="px-5 py-8 text-center">
        <p className="text-xs text-muted/50">
          © {new Date().getFullYear()} — Tutti i diritti riservati
        </p>
      </footer>
    </main>
  );
}
