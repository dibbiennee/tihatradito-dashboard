"use client";

export default function GraziePage() {
  const pdfUrl = process.env.NEXT_PUBLIC_PDF_URL || "#";

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
