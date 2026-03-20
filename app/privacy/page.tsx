"use client";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-5 py-12 fade-up">
        <h1 className="text-4xl md:text-5xl mb-2">Informativa sulla Privacy</h1>
        <p className="text-muted text-sm mb-10">
          Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
        </p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed text-txt/90">
          {/* Art. 1 */}
          <section>
            <h2 className="text-2xl mb-3">1. Titolare del Trattamento</h2>
            <p className="text-muted mb-3">
              Il titolare del trattamento dei dati personali &egrave;
              tihatradito.site (di seguito &ldquo;Titolare&rdquo;), raggiungibile
              all&apos;indirizzo email:{" "}
              <a href="mailto:info@tihatradito.site" className="text-red hover:underline">
                info@tihatradito.site
              </a>
            </p>
            <p className="text-muted">
              La presente Informativa descrive le modalit&agrave; di raccolta,
              utilizzo, conservazione e protezione dei dati personali degli utenti
              che visitano il sito{" "}
              <span className="text-txt">tihatradito.site</span> e/o acquistano
              i prodotti digitali offerti, in conformit&agrave; al Regolamento (UE)
              2016/679 (GDPR) e alla normativa italiana vigente.
            </p>
          </section>

          {/* Art. 2 */}
          <section>
            <h2 className="text-2xl mb-3">2. Dati Raccolti</h2>
            <p className="text-muted mb-3">
              Il Titolare raccoglie le seguenti categorie di dati:
            </p>
            <ul className="list-disc list-inside text-muted flex flex-col gap-1.5 pl-2 mb-3">
              <li>
                <strong className="text-txt">Dati di navigazione:</strong> indirizzo
                IP, tipo di browser, sistema operativo, pagine visitate, durata della
                visita, profondit&agrave; di scorrimento. Questi dati sono raccolti
                automaticamente tramite i sistemi informatici del Sito.
              </li>
              <li>
                <strong className="text-txt">Dati di acquisto:</strong> indirizzo
                email, dati di fatturazione e informazioni relative alla transazione.
                Questi dati sono trattati da Stripe, Inc. in qualit&agrave; di
                responsabile del trattamento dei pagamenti.
              </li>
              <li>
                <strong className="text-txt">Dati di download:</strong> indirizzo IP,
                data e ora del download, tipo di dispositivo. Questi dati sono
                raccolti a fini di sicurezza e per comprovare l&apos;avvenuta
                consegna del prodotto digitale.
              </li>
            </ul>
            <p className="text-muted">
              Il Titolare <strong className="text-txt">non raccoglie</strong> dati
              di carte di credito o debito. Tutti i pagamenti sono gestiti
              interamente da Stripe, Inc. secondo i propri standard di sicurezza
              PCI-DSS.
            </p>
          </section>

          {/* Art. 3 */}
          <section>
            <h2 className="text-2xl mb-3">3. Finalit&agrave; del Trattamento</h2>
            <p className="text-muted mb-3">I dati personali sono trattati per le seguenti finalit&agrave;:</p>
            <ul className="list-disc list-inside text-muted flex flex-col gap-1.5 pl-2">
              <li>
                <strong className="text-txt">Esecuzione del contratto:</strong>{" "}
                completamento dell&apos;acquisto e consegna del prodotto digitale.
              </li>
              <li>
                <strong className="text-txt">Obblighi di legge:</strong>{" "}
                adempimento di obblighi fiscali, contabili e normativi.
              </li>
              <li>
                <strong className="text-txt">Sicurezza e prevenzione frodi:</strong>{" "}
                registrazione degli accessi e dei download per prevenire abusi,
                contestazioni fraudolente e utilizzi non autorizzati.
              </li>
              <li>
                <strong className="text-txt">Analisi statistiche:</strong>{" "}
                analisi anonima del traffico e del comportamento di navigazione
                per migliorare il Sito e i prodotti offerti.
              </li>
            </ul>
          </section>

          {/* Art. 4 */}
          <section>
            <h2 className="text-2xl mb-3">4. Base Giuridica del Trattamento</h2>
            <p className="text-muted mb-3">
              Il trattamento dei dati personali si fonda sulle seguenti basi giuridiche
              ai sensi dell&apos;art. 6 del GDPR:
            </p>
            <ul className="list-disc list-inside text-muted flex flex-col gap-1.5 pl-2">
              <li>
                <strong className="text-txt">Art. 6(1)(b):</strong> esecuzione di
                un contratto di cui l&apos;interessato &egrave; parte (acquisto del
                prodotto digitale).
              </li>
              <li>
                <strong className="text-txt">Art. 6(1)(c):</strong> adempimento di
                obblighi legali (conservazione dati fiscali).
              </li>
              <li>
                <strong className="text-txt">Art. 6(1)(f):</strong> legittimo
                interesse del Titolare alla prevenzione delle frodi e alla sicurezza
                del Sito.
              </li>
            </ul>
          </section>

          {/* Art. 5 */}
          <section>
            <h2 className="text-2xl mb-3">5. Destinatari dei Dati</h2>
            <p className="text-muted mb-3">I dati personali possono essere comunicati a:</p>
            <ul className="list-disc list-inside text-muted flex flex-col gap-1.5 pl-2">
              <li>
                <strong className="text-txt">Stripe, Inc.</strong> — per
                l&apos;elaborazione dei pagamenti (sede: USA, conforme al Data
                Privacy Framework UE-USA).
              </li>
              <li>
                <strong className="text-txt">Vercel, Inc.</strong> — per
                l&apos;hosting del Sito (sede: USA, conforme al Data Privacy
                Framework UE-USA).
              </li>
            </ul>
            <p className="text-muted mt-3">
              I dati <strong className="text-txt">non vengono venduti</strong>,
              ceduti o comunicati a terzi per finalit&agrave; di marketing,
              profilazione commerciale o pubblicit&agrave;.
            </p>
          </section>

          {/* Art. 6 */}
          <section>
            <h2 className="text-2xl mb-3">6. Conservazione dei Dati</h2>
            <p className="text-muted mb-3">I dati personali sono conservati per il tempo strettamente necessario:</p>
            <ul className="list-disc list-inside text-muted flex flex-col gap-1.5 pl-2">
              <li>
                <strong className="text-txt">Dati di navigazione:</strong>{" "}
                conservati in forma aggregata e anonimizzata, eliminati entro 90
                giorni.
              </li>
              <li>
                <strong className="text-txt">Dati di acquisto:</strong>{" "}
                conservati per 10 anni ai sensi degli obblighi fiscali italiani
                (art. 2220 c.c.).
              </li>
              <li>
                <strong className="text-txt">Dati di download:</strong>{" "}
                conservati per 12 mesi ai fini della gestione di eventuali
                contestazioni.
              </li>
            </ul>
          </section>

          {/* Art. 7 */}
          <section>
            <h2 className="text-2xl mb-3">7. Diritti dell&apos;Interessato</h2>
            <p className="text-muted mb-3">
              Ai sensi degli artt. 15-22 del GDPR, l&apos;utente ha il diritto di:
            </p>
            <ul className="list-disc list-inside text-muted flex flex-col gap-1.5 pl-2">
              <li>Accedere ai propri dati personali</li>
              <li>Ottenerne la rettifica o la cancellazione</li>
              <li>Limitare il trattamento</li>
              <li>Opporsi al trattamento</li>
              <li>Richiedere la portabilit&agrave; dei dati</li>
              <li>
                Proporre reclamo all&apos;Autorit&agrave; Garante per la Protezione
                dei Dati Personali (
                <a
                  href="https://www.garanteprivacy.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red hover:underline"
                >
                  www.garanteprivacy.it
                </a>
                )
              </li>
            </ul>
            <p className="text-muted mt-3">
              Per esercitare i propri diritti, l&apos;utente pu&ograve; inviare una
              richiesta a:{" "}
              <a href="mailto:info@tihatradito.site" className="text-red hover:underline">
                info@tihatradito.site
              </a>
            </p>
          </section>

          {/* Art. 8 */}
          <section>
            <h2 className="text-2xl mb-3">8. Cookie e Tecnologie di Tracciamento</h2>
            <p className="text-muted mb-3">
              Il Sito utilizza esclusivamente cookie tecnici necessari al
              funzionamento del servizio (ad esempio, per mantenere lo stato della
              sessione). Non vengono utilizzati cookie di profilazione o di terze
              parti a fini pubblicitari.
            </p>
            <p className="text-muted">
              Il Sito utilizza Vercel Analytics per raccogliere dati anonimi e
              aggregati sulle visite, senza l&apos;uso di cookie e nel rispetto
              della privacy dell&apos;utente.
            </p>
          </section>

          {/* Art. 9 */}
          <section>
            <h2 className="text-2xl mb-3">9. Sicurezza dei Dati</h2>
            <p className="text-muted">
              Il Titolare adotta misure tecniche e organizzative adeguate per
              proteggere i dati personali da accessi non autorizzati, perdita,
              distruzione o alterazione. Tutti i dati sono trasmessi tramite
              connessione crittografata HTTPS/TLS. I pagamenti sono protetti dagli
              standard di sicurezza PCI-DSS di Stripe.
            </p>
          </section>

          {/* Art. 10 */}
          <section>
            <h2 className="text-2xl mb-3">10. Modifiche alla presente Informativa</h2>
            <p className="text-muted">
              Il Titolare si riserva il diritto di aggiornare la presente
              Informativa in qualsiasi momento. Le modifiche saranno pubblicate su
              questa pagina con indicazione della data di ultimo aggiornamento.
              L&apos;uso continuato del Sito dopo la pubblicazione delle modifiche
              costituisce accettazione dell&apos;Informativa aggiornata.
            </p>
          </section>

          {/* Art. 11 */}
          <section>
            <h2 className="text-2xl mb-3">11. Contatti</h2>
            <p className="text-muted mb-3">
              Per qualsiasi domanda relativa al trattamento dei dati personali:
            </p>
            <p>
              <a href="mailto:info@tihatradito.site" className="text-red hover:underline">
                info@tihatradito.site
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-8 text-center border-t border-border">
        <div className="flex justify-center gap-4">
          <a href="/termini" className="text-xs text-muted hover:text-txt transition-colors">
            Termini e Condizioni
          </a>
          <span className="text-xs text-muted/30">·</span>
          <a href="/" className="text-xs text-muted hover:text-txt transition-colors">
            &larr; Torna alla pagina principale
          </a>
        </div>
      </footer>
    </main>
  );
}
