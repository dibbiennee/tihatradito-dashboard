"use client";

export default function TerminiPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-5 py-12 fade-up">
        <h1 className="text-4xl md:text-5xl mb-2">Termini e Condizioni</h1>
        <p className="text-muted text-sm mb-10">
          Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
        </p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed text-txt/90">
          {/* Art. 1 */}
          <section>
            <h2 className="text-2xl mb-3">Art. 1 — Premesse e Definizioni</h2>
            <p className="text-muted mb-3">
              I presenti Termini e Condizioni (di seguito &ldquo;Termini&rdquo;)
              regolano l&apos;acquisto e l&apos;utilizzo dei prodotti digitali
              offerti tramite il sito{" "}
              <span className="text-txt">tihatradito.site</span> (di seguito
              &ldquo;Sito&rdquo;), gestito da tihatradito.site (di seguito
              &ldquo;Titolare&rdquo;).
            </p>
            <p className="text-muted">
              L&apos;accesso al Sito e l&apos;acquisto dei prodotti digitali
              comportano l&apos;accettazione integrale dei presenti Termini.
              L&apos;utente dichiara di avere almeno 18 anni di et&agrave; o di
              agire con il consenso di un genitore o tutore legale.
            </p>
          </section>

          {/* Art. 2 */}
          <section>
            <h2 className="text-2xl mb-3">
              Art. 2 — Natura del Prodotto
            </h2>
            <p className="text-muted mb-3">
              I prodotti offerti sul Sito consistono in guide digitali in formato
              PDF contenenti informazioni generali, consigli e tecniche a scopo
              esclusivamente informativo ed educativo.
            </p>
            <p className="text-muted mb-3">
              Il prodotto <strong className="text-txt">non</strong> costituisce
              un servizio di investigazione, consulenza legale, consulenza
              psicologica o qualsiasi altra prestazione professionale.
              L&apos;utente acquista esclusivamente contenuto informativo
              digitale.
            </p>
            <p className="text-muted">
              I prezzi dei prodotti sono indicati sul Sito e possono variare. Le
              fasce di prezzo attualmente disponibili sono: &euro;0,99,
              &euro;2,99 e &euro;9,99. Tutti i prezzi sono comprensivi di IVA ove
              applicabile.
            </p>
          </section>

          {/* Art. 3 */}
          <section>
            <h2 className="text-2xl mb-3">
              Art. 3 — Consegna e Diritto di Recesso
            </h2>
            <p className="text-muted mb-3">
              Il prodotto digitale viene consegnato immediatamente dopo il
              completamento del pagamento, tramite accesso diretto al download
              del file PDF.
            </p>
            <p className="text-muted mb-3">
              Ai sensi dell&apos;art. 16, lettera m), della Direttiva
              2011/83/UE e dell&apos;art. 59, comma 1, lettera o), del Codice
              del Consumo (D.Lgs. 206/2005), il diritto di recesso{" "}
              <strong className="text-txt">non si applica</strong> ai contratti
              per la fornitura di contenuto digitale non fornito su supporto
              materiale, quando l&apos;esecuzione &egrave; iniziata con il
              previo consenso espresso del consumatore e con la sua accettazione
              della perdita del diritto di recesso.
            </p>
            <p className="text-muted mb-3">
              Procedendo all&apos;acquisto, l&apos;utente:
            </p>
            <ul className="list-disc list-inside text-muted flex flex-col gap-1.5 pl-2 mb-3">
              <li>
                Acconsente espressamente all&apos;esecuzione immediata del
                contratto e alla consegna del contenuto digitale;
              </li>
              <li>
                Riconosce e accetta di perdere il diritto di recesso una volta
                iniziato il download o l&apos;accesso al contenuto;
              </li>
              <li>
                Conferma di essere stato adeguatamente informato della perdita
                del diritto di recesso prima del completamento dell&apos;acquisto.
              </li>
            </ul>
            <p className="text-muted">
              Pertanto, una volta completato il pagamento e reso disponibile il
              download, <strong className="text-txt">non sono previsti rimborsi</strong>.
            </p>
          </section>

          {/* Art. 4 */}
          <section>
            <h2 className="text-2xl mb-3">
              Art. 4 — Esclusione di Responsabilit&agrave;
            </h2>
            <p className="text-muted mb-3">
              Il contenuto del prodotto digitale &egrave; fornito a scopo
              puramente informativo e non costituisce in alcun modo una garanzia
              di risultati specifici.
            </p>
            <ul className="list-disc list-inside text-muted flex flex-col gap-1.5 pl-2 mb-3">
              <li>
                Il Titolare non garantisce che le informazioni contenute nel
                prodotto producano risultati determinati o attesi
                dall&apos;utente;
              </li>
              <li>
                L&apos;utilizzo delle informazioni contenute nel prodotto
                avviene sotto l&apos;esclusiva responsabilit&agrave;
                dell&apos;utente;
              </li>
              <li>
                Il Titolare declina ogni responsabilit&agrave; per danni
                diretti, indiretti, incidentali o consequenziali derivanti
                dall&apos;uso o dall&apos;impossibilit&agrave; di uso delle
                informazioni fornite;
              </li>
              <li>
                Il Titolare non &egrave; responsabile per qualsiasi uso
                improprio, illegale o non autorizzato delle informazioni
                contenute nel prodotto da parte dell&apos;utente o di terzi.
              </li>
            </ul>
            <p className="text-muted">
              L&apos;utente si impegna a utilizzare le informazioni acquisite
              nel pieno rispetto delle leggi vigenti nel proprio Paese di
              residenza.
            </p>
          </section>

          {/* Art. 5 */}
          <section>
            <h2 className="text-2xl mb-3">
              Art. 5 — Propriet&agrave; Intellettuale
            </h2>
            <p className="text-muted mb-3">
              Tutti i contenuti del prodotto digitale, inclusi testi, grafiche,
              layout e struttura, sono protetti dalle leggi sul diritto
              d&apos;autore (Legge 633/1941 e successive modifiche) e dalle
              normative internazionali in materia di propriet&agrave;
              intellettuale.
            </p>
            <p className="text-muted mb-3">
              L&apos;acquisto del prodotto conferisce all&apos;utente una
              licenza personale, non esclusiva e non trasferibile per
              l&apos;utilizzo del contenuto a fini strettamente personali.
            </p>
            <p className="text-muted">
              &Egrave; espressamente vietato riprodurre, distribuire,
              condividere, rivendere, pubblicare o rendere disponibile a terzi,
              in qualsiasi forma e con qualsiasi mezzo, il contenuto del
              prodotto digitale, in tutto o in parte, senza il previo consenso
              scritto del Titolare.
            </p>
          </section>

          {/* Art. 6 */}
          <section>
            <h2 className="text-2xl mb-3">
              Art. 6 — Pagamenti e Trattamento dei Dati
            </h2>
            <p className="text-muted mb-3">
              I pagamenti sono processati tramite la piattaforma{" "}
              <span className="text-txt">Stripe</span>, soggetta ai propri
              Termini di servizio e alla propria Informativa sulla Privacy. Il
              Titolare non raccoglie, memorizza o ha accesso ai dati della carta
              di credito o di pagamento dell&apos;utente.
            </p>
            <p className="text-muted mb-3">
              I dati personali raccolti sono limitati a quelli strettamente
              necessari per il completamento della transazione (indirizzo email,
              dati di fatturazione ove richiesti). Tali dati sono trattati in
              conformit&agrave; al Regolamento (UE) 2016/679 (GDPR).
            </p>
            <p className="text-muted">
              I dati non vengono ceduti a terzi per finalit&agrave; di marketing
              e sono conservati per il tempo strettamente necessario
              all&apos;adempimento degli obblighi contrattuali e di legge.
            </p>
          </section>

          {/* Art. 7 */}
          <section>
            <h2 className="text-2xl mb-3">
              Art. 7 — Legge Applicabile e Foro Competente
            </h2>
            <p className="text-muted mb-3">
              I presenti Termini sono regolati dalla legge italiana. Per
              qualsiasi controversia derivante dall&apos;interpretazione o
              dall&apos;esecuzione dei presenti Termini, sar&agrave; competente
              il Foro del luogo di residenza o domicilio del consumatore, ai
              sensi dell&apos;art. 66-bis del Codice del Consumo.
            </p>
            <p className="text-muted">
              L&apos;utente consumatore residente nell&apos;Unione Europea
              pu&ograve; inoltre ricorrere alla piattaforma ODR (Online Dispute
              Resolution) della Commissione Europea, accessibile all&apos;indirizzo:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          {/* Art. 8 */}
          <section>
            <h2 className="text-2xl mb-3">
              Art. 8 — Modifiche ai Termini
            </h2>
            <p className="text-muted">
              Il Titolare si riserva il diritto di modificare i presenti Termini
              in qualsiasi momento. Le modifiche saranno efficaci dal momento
              della loro pubblicazione sul Sito. L&apos;uso continuato del Sito
              dopo la pubblicazione delle modifiche costituisce accettazione dei
              Termini aggiornati.
            </p>
          </section>

          {/* Art. 9 */}
          <section>
            <h2 className="text-2xl mb-3">Art. 9 — Contatti</h2>
            <p className="text-muted mb-3">
              Per qualsiasi domanda, richiesta di informazioni o comunicazione
              relativa ai presenti Termini, l&apos;utente pu&ograve; contattare
              il Titolare al seguente indirizzo email:
            </p>
            <p>
              <a
                href="mailto:info@tihatradito.site"
                className="text-red hover:underline"
              >
                info@tihatradito.site
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-8 text-center border-t border-border">
        <a
          href="/"
          className="text-xs text-muted hover:text-txt transition-colors"
        >
          &larr; Torna alla pagina principale
        </a>
      </footer>
    </main>
  );
}
