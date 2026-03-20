#!/usr/bin/env python3
"""
Genera l'ebook "Come Ho Scoperto la Verità" — PDF 50+ pagine
"""

from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Frame, PageTemplate, BaseDocTemplate
)
from reportlab.pdfgen import canvas
import os

OUTPUT = os.path.join(os.path.dirname(__file__), "public", "come-ho-scoperto-la-verita.pdf")

# Colors
RED = HexColor("#e8001d")
DARK_BG = HexColor("#0a0a0a")
DARK_PAGE = HexColor("#111111")
GREY_TEXT = HexColor("#999999")
LIGHT_TEXT = HexColor("#e8e8e8")
WHITE = white

W, H = A5
MARGIN = 20 * mm

# ─── STYLES ───────────────────────────────────────────

style_chapter_num = ParagraphStyle(
    "ChapterNum", fontName="Helvetica", fontSize=11,
    textColor=RED, alignment=TA_LEFT, spaceAfter=4,
    leading=14, letterSpacing=3,
)
style_chapter_title = ParagraphStyle(
    "ChapterTitle", fontName="Helvetica-Bold", fontSize=22,
    textColor=WHITE, alignment=TA_LEFT, spaceAfter=20,
    leading=28,
)
style_body = ParagraphStyle(
    "Body", fontName="Helvetica", fontSize=10.5,
    textColor=LIGHT_TEXT, alignment=TA_JUSTIFY,
    leading=19, spaceAfter=14,
    firstLineIndent=0,
)
style_body_italic = ParagraphStyle(
    "BodyItalic", parent=style_body, fontName="Helvetica-Oblique",
    textColor=GREY_TEXT, spaceAfter=14,
)
style_quote = ParagraphStyle(
    "Quote", fontName="Helvetica-BoldOblique", fontSize=12,
    textColor=RED, alignment=TA_LEFT,
    leading=19, spaceAfter=18, spaceBefore=14,
    leftIndent=8,
)
style_subhead = ParagraphStyle(
    "Subhead", fontName="Helvetica-Bold", fontSize=12,
    textColor=WHITE, alignment=TA_LEFT,
    leading=16, spaceAfter=10, spaceBefore=18,
)
style_bullet = ParagraphStyle(
    "Bullet", fontName="Helvetica", fontSize=10.5,
    textColor=LIGHT_TEXT, alignment=TA_LEFT,
    leading=16, spaceAfter=6,
    leftIndent=16, bulletIndent=0,
)
style_script = ParagraphStyle(
    "Script", fontName="Helvetica-Oblique", fontSize=10.5,
    textColor=HexColor("#cccccc"), alignment=TA_LEFT,
    leading=16, spaceAfter=10,
    leftIndent=20, rightIndent=10,
    borderColor=HexColor("#333333"), borderWidth=0,
    backColor=HexColor("#1a1a1a"), borderPadding=8,
)
style_center = ParagraphStyle(
    "Center", fontName="Helvetica", fontSize=10,
    textColor=GREY_TEXT, alignment=TA_CENTER,
    leading=15, spaceAfter=8,
)
style_footer = ParagraphStyle(
    "Footer", fontName="Helvetica", fontSize=8,
    textColor=GREY_TEXT, alignment=TA_CENTER, leading=12,
)

# ─── PAGE BACKGROUND ──────────────────────────────────

class DarkPageTemplate(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, **kw)
        bm = MARGIN + 4*mm  # bottom margin slightly larger for page numbers
        frame = Frame(MARGIN, bm, W - 2*MARGIN, H - MARGIN - bm, id='main')
        self.addPageTemplates([
            PageTemplate(id='dark', frames=[frame], onPage=self._draw_bg)
        ])

    def _draw_bg(self, canvas_obj, doc):
        canvas_obj.saveState()
        canvas_obj.setFillColor(DARK_BG)
        canvas_obj.rect(0, 0, W, H, fill=1, stroke=0)
        # Subtle page number
        if doc.page > 2:
            canvas_obj.setFillColor(GREY_TEXT)
            canvas_obj.setFont("Helvetica", 7)
            canvas_obj.drawCentredString(W/2, 12*mm, str(doc.page))
        canvas_obj.restoreState()


# ─── CONTENT ──────────────────────────────────────────

def build():
    doc = DarkPageTemplate(OUTPUT, pagesize=A5,
                           leftMargin=MARGIN, rightMargin=MARGIN,
                           topMargin=MARGIN, bottomMargin=MARGIN)
    story = []

    def sp(h=8): story.append(Spacer(1, h*mm))
    def pb(): story.append(PageBreak())
    def body(t): story.append(Paragraph(t, style_body))
    def italic(t): story.append(Paragraph(t, style_body_italic))
    def quote(t): story.append(Paragraph(t, style_quote))
    def sub(t): story.append(Paragraph(t, style_subhead))
    def bullet(t): story.append(Paragraph(f"• {t}", style_bullet))
    def script(t): story.append(Paragraph(f'"{t}"', style_script))
    def center(t): story.append(Paragraph(t, style_center))

    def chapter(num, title):
        pb()
        sp(20)
        story.append(Paragraph(f"CAPITOLO {num}", style_chapter_num))
        story.append(Paragraph(title, style_chapter_title))
        sp(8)

    # ═══════════════════════════════════════════════════
    # COPERTINA
    # ═══════════════════════════════════════════════════
    sp(30)
    story.append(Paragraph("COME HO SCOPERTO", ParagraphStyle(
        "CoverTitle1", fontName="Helvetica-Bold", fontSize=28,
        textColor=WHITE, alignment=TA_CENTER, leading=34,
    )))
    story.append(Paragraph("LA VERITÀ", ParagraphStyle(
        "CoverTitle2", fontName="Helvetica-Bold", fontSize=32,
        textColor=RED, alignment=TA_CENTER, leading=38, spaceAfter=12,
    )))
    sp(4)
    center("La storia vera di chi ci è passato")
    center("e la guida per chi ci sta passando adesso")
    sp(15)
    story.append(Paragraph("—", ParagraphStyle(
        "Dash", fontName="Helvetica", fontSize=20,
        textColor=RED, alignment=TA_CENTER, spaceAfter=6,
    )))
    sp(2)
    center("Una storia vera. Una guida concreta.")
    sp(30)
    center("tihatradito.site")
    center("© 2026 — Tutti i diritti riservati")

    # ═══════════════════════════════════════════════════
    # AVVERTENZA
    # ═══════════════════════════════════════════════════
    pb()
    sp(25)
    story.append(Paragraph("AVVERTENZA", ParagraphStyle(
        "AvvTitle", fontName="Helvetica-Bold", fontSize=14,
        textColor=RED, alignment=TA_CENTER, spaceAfter=16, leading=18,
    )))
    body("Questo ebook contiene una storia reale. I nomi sono stati cambiati per proteggere la privacy delle persone coinvolte.")
    sp(4)
    body("Se stai vivendo una situazione simile, sappi che non sei sola. Non sei solo. Quello che stai provando è normale, è umano, e non è colpa tua.")
    sp(4)
    body("Questo non è un manuale. Non è un trattato di psicologia. È la storia di qualcuno che ci è passato e che ha deciso di scriverla, con la speranza che possa aiutare chi sta attraversando lo stesso inferno.")
    sp(4)
    italic("Se in qualsiasi momento senti di aver bisogno di supporto professionale, non esitare a cercare aiuto. Non c'è nulla di debole nel chiedere una mano.")

    # ═══════════════════════════════════════════════════
    # INDICE
    # ═══════════════════════════════════════════════════
    pb()
    sp(15)
    story.append(Paragraph("INDICE", ParagraphStyle(
        "IndexTitle", fontName="Helvetica-Bold", fontSize=18,
        textColor=WHITE, alignment=TA_CENTER, spaceAfter=20, leading=22,
    )))
    sp(4)
    for num, title in [
        ("1", "Il giorno in cui tutto è cambiato"),
        ("2", "I 7 segnali che avevo sotto gli occhi"),
        ("3", "Cosa ho fatto per scoprire la verità"),
        ("4", "Il giorno della scoperta"),
        ("5", "Gli errori che ho fatto (e che tu puoi evitare)"),
        ("6", "Come affrontare il confronto"),
        ("7", "Il giorno dopo: cosa fare adesso"),
        ("8", "Le storie degli altri"),
        ("9", "Appendice pratica: checklist e risorse"),
        ("10", "Lettera a chi ci sta passando ora"),
    ]:
        story.append(Paragraph(
            f'<font color="#e8001d">{num}.</font>  {title}',
            ParagraphStyle(f"Idx{num}", fontName="Helvetica", fontSize=11,
                           textColor=LIGHT_TEXT, alignment=TA_LEFT,
                           leading=20, spaceAfter=6, leftIndent=20),
        ))
    sp(10)
    center("—")
    sp(4)
    center("\"Se stai leggendo questo, probabilmente sai già perché sei qui.\"")

    # ═══════════════════════════════════════════════════
    # INTRODUZIONE
    # ═══════════════════════════════════════════════════
    pb()
    sp(15)
    story.append(Paragraph("PRIMA DI INIZIARE", ParagraphStyle(
        "IntroTitle", fontName="Helvetica-Bold", fontSize=18,
        textColor=RED, alignment=TA_CENTER, spaceAfter=16, leading=22,
    )))
    sp(4)
    body("Mi chiamo Marco. Non è il mio vero nome, ma è quello che uso per raccontare questa storia. Una storia che non avrei mai voluto vivere, e che non avrei mai pensato di scrivere.")
    sp(2)
    body("Ho scritto questo ebook in un mese di notti insonni, subito dopo la fine della mia relazione. Non perché volessi sfogarmi — quello l'ho fatto con mio fratello, seduti sul balcone con una birra in mano. L'ho scritto perché quando ero nel mezzo di tutto questo, avrei dato qualsiasi cosa per trovare qualcuno che mi dicesse: ecco cosa ti sta succedendo, ecco cosa fare, ecco gli errori da evitare.")
    sp(2)
    body("Quel qualcuno non l'ho trovato. Quindi ho deciso di diventarlo io.")
    sp(2)
    body("Questo non è un manuale di auto-aiuto. Non ci sono frasi motivazionali vuote, non ci sono citazioni di guru, non ci sono promesse impossibili. C'è solo la mia storia — con tutti i dettagli brutti, imbarazzanti, dolorosi — e tutto quello che ho imparato nel modo più duro possibile.")
    sp(2)
    body("Se stai vivendo qualcosa di simile, questo libro è per te. Non ti giudicherò, non ti dirò cosa fare. Ti racconterò cosa è successo a me, e ti darò gli strumenti per prendere le tue decisioni.")
    sp(2)
    body("L'unica cosa che ti chiedo è di leggerlo con la mente aperta. E con lo stomaco pronto.")
    sp(4)
    italic("Iniziamo.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 1
    # ═══════════════════════════════════════════════════
    chapter("1", "Il giorno in cui tutto è cambiato")

    body("Era un mercoledì sera qualunque. Di quelli in cui non succede niente di speciale — cena davanti alla TV, due parole sul lavoro, il solito bacio sulla fronte prima di dormire.")
    sp(2)
    body("Giulia era sul divano accanto a me. Stava guardando il telefono, come faceva sempre. Io stavo rispondendo a un messaggio di lavoro. Tutto normale. Tutto come ogni altro mercoledì dei nostri tre anni insieme.")
    sp(2)
    body("Poi il suo telefono ha vibrato.")
    sp(2)
    body("Non è che non vibrasse mai. Vibrava cento volte al giorno, come quello di tutti. Ma quella volta lei ha fatto una cosa che non faceva mai: l'ha girato. Lo schermo verso il basso. Con un movimento veloce, quasi automatico. Come se le mani sapessero cosa fare prima ancora che il cervello glielo dicesse.")
    sp(2)
    body("Non ho detto nulla. Non ho nemmeno alzato lo sguardo dal mio telefono. Ma qualcosa dentro di me si è spostato. Come quando senti un rumore di notte e non sai cos'è, ma il corpo si irrigidisce da solo.")
    sp(2)
    quote("La cosa peggiore non era il dubbio. Era fingere che andasse tutto bene.")
    sp(2)
    body("Ho aspettato che andasse in bagno. Ci è andata con il telefono. Anche quello era nuovo. Prima lo lasciava ovunque — sul tavolo, sul letto, in cucina mentre cucinava. Adesso era come se fosse diventato una parte del suo corpo.")
    sp(2)
    body("Mi sono detto che ero paranoico. Che mi stavo facendo un film. Che dopo tre anni è normale che le cose cambino un po'. Mi sono detto tutte le cose che ci diciamo quando non vogliamo vedere quello che abbiamo davanti agli occhi.")
    sp(2)
    body("Ma lo stomaco non mente. E il mio si era chiuso come un pugno.")
    sp(2)

    sub("La prima notte insonne")
    body("Quella notte non ho dormito. Lei era lì, a trenta centimetri da me, con il respiro regolare di chi dorme serena. E io fissavo il soffitto con il cuore che batteva come se avessi corso una maratona.")
    sp(2)
    body("Volevo prendere il suo telefono. Era lì, sul comodino. A portata di mano. Bastava allungare il braccio, mettere il codice — lo conoscevo, era la data del nostro anniversario — e guardare.")
    sp(2)
    body("Non l'ho fatto. Non perché fossi nobile, o perché rispettassi la sua privacy. Non l'ho fatto perché avevo paura di quello che avrei trovato.")
    sp(2)
    body("E quella paura, quella precisa paura, era già la risposta.")
    sp(2)
    body("La mattina dopo mi sono svegliato con una decisione: non avrei detto nulla. Non avrei chiesto nulla. Avrei semplicemente osservato. Con gli occhi aperti, questa volta.")
    sp(2)
    italic("Non sapevo ancora che quella decisione mi avrebbe cambiato la vita. Nel bene e nel male.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 2
    # ═══════════════════════════════════════════════════
    chapter("2", "I 7 segnali che avevo sotto gli occhi")

    body("Nei giorni successivi ho iniziato a notare cose che probabilmente erano lì da settimane. Forse da mesi. Ma quando sei innamorato, il cervello ha questa capacità incredibile di filtrare tutto ciò che non vuoi vedere.")
    sp(2)
    body("Ecco cosa ho scoperto. E se stai leggendo questo, forse ne riconoscerai qualcuno.")

    sp(4)
    sub("1. Il telefono è diventato un segreto")
    body("Prima lasciava il telefono ovunque. Io potevo prenderlo per cercare una ricetta, lei prendeva il mio per mettere musica. Era una cosa normale, naturale.")
    sp(2)
    body("Poi è cambiato tutto. Il telefono era sempre in tasca, sempre silenzioso, sempre girato. Se le mandavo un messaggio mentre era in bagno, sentivo il suono — il che significava che non era in silenzioso. Ma quando eravamo insieme, nessuna notifica. Mai.")
    sp(2)
    italic("Se il suo telefono è diventato un oggetto che protegge come un portafoglio, chiediti perché.")

    sp(4)
    sub("2. Nuovi nomi, nessuna spiegazione")
    body("Un giorno ha menzionato un certo 'Davide del corso'. Non ne aveva mai parlato prima. Ho chiesto 'chi è Davide?' e lei ha risposto 'uno del corso di yoga' con un tono così neutro, così piatto, che mi è suonato studiato.")
    sp(2)
    body("Nelle settimane dopo, Davide è comparso altre volte. 'Davide ha detto che...', 'Davide ha condiviso un articolo su...' Sempre in modo casuale. Troppo casuale.")
    sp(2)
    italic("Quando qualcuno menziona ripetutamente un nome nuovo cercando di sembrare naturale, spesso è perché sta normalizzando quella presenza nella tua testa. Per quando la scoprirai.")

    sp(4)
    sub("3. Presente ma distante")
    body("Eravamo seduti allo stesso tavolo, guardavamo lo stesso film, dormivamo nello stesso letto. Ma lei non c'era. Era come parlare con qualcuno che ha la testa da un'altra parte.")
    sp(2)
    body("Le raccontavo della mia giornata e mi rispondeva con 'mhm', 'ah sì?', 'che bello'. Parole vuote. Risposte di cortesia, non di interesse.")
    sp(2)
    body("La cosa più dolorosa non è quando qualcuno se ne va. È quando resta, ma non c'è più.")

    sp(4)
    sub("4. Gli orari sono cambiati")
    body("'Stasera esco con le ragazze.' Tre volte in una settimana. Prima usciva con le amiche una volta ogni due settimane, massimo. Di colpo, tre volte.")
    sp(2)
    body("E quando tornava, era stranamente di buon umore. Non il buon umore di chi ha passato una bella serata con le amiche. Un buon umore nervoso, eccitato, diverso.")
    sp(2)
    italic("Un cambiamento improvviso nelle abitudini, senza una spiegazione logica, è quasi sempre un segnale.")

    sp(4)
    sub("5. L'aspetto fisico, di colpo")
    body("In tre anni non l'avevo mai vista preoccuparsi così tanto di come si vestiva per andare a fare la spesa. Di colpo, anche per uscire dieci minuti, si sistemava i capelli, si metteva il profumo, sceglieva i vestiti con cura.")
    sp(2)
    body("Non per me. Perché quando eravamo a casa insieme, stava in pigiama come sempre. Il look curato era solo per quando usciva. Solo per il mondo esterno.")

    sp(4)
    sub("6. Difesa eccessiva")
    body("Le ho chiesto, con il tono più innocente del mondo: 'Come mai esci così spesso ultimamente?' La reazione è stata sproporzionata. 'Perché, non posso uscire? Devo chiederti il permesso? Sei geloso?'")
    sp(2)
    body("Una domanda normale. Una reazione da persona sotto interrogatorio.")
    sp(2)
    italic("Chi non ha nulla da nascondere risponde con tranquillità. Chi si difende con aggressività sta proteggendo qualcosa.")

    sp(4)
    sub("7. Il sesto senso")
    body("Questo è il più difficile da spiegare. È quella sensazione che qualcosa non va, ma non sai indicare cosa. Non hai prove. Non hai messaggi. Non hai nomi. Hai solo una sensazione nello stomaco che ti dice: qualcosa è cambiato.")
    sp(2)
    body("Ho parlato con decine di persone che hanno vissuto la stessa cosa. Tutte — tutte — mi hanno detto la stessa frase: 'Lo sapevo già. Lo sentivo.'")
    sp(2)
    quote("Il tuo istinto non è paranoia. È il tuo cervello che ha raccolto mille piccoli dettagli che la mente cosciente non riesce ancora a mettere insieme.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 3
    # ═══════════════════════════════════════════════════
    chapter("3", "Cosa ho fatto per scoprire la verità")

    body("Premessa importante: non sono diventato un detective. Non ho installato software spia, non ho seguito nessuno, non ho fatto nulla di illegale. Ho semplicemente iniziato a prestare attenzione. Con metodo.")

    sp(4)
    sub("L'osservazione silenziosa")
    body("Per tre settimane non ho detto una parola. Non ho fatto domande sospette, non ho cambiato atteggiamento. Ho continuato a essere il Marco di sempre. Ma con gli occhi aperti.")
    sp(2)
    body("Ho iniziato a notare i pattern. Ogni martedì e giovedì usciva. Ogni sera prima di dormire passava almeno venti minuti in bagno con il telefono. Ogni weekend proponeva attività separate — 'tu vai pure a calcetto, io esco con le ragazze.'")
    sp(2)
    body("I pattern non mentono. Le persone possono mentire con le parole, ma le abitudini dicono la verità.")

    sp(4)
    sub("WhatsApp: quello che non sai")
    body("Non ho mai toccato il suo telefono. Ma ho imparato cose che tutti dovrebbero sapere.")
    sp(2)
    bullet("L'ultimo accesso: se alle 2 di notte risulta online ma a te non ha scritto, con chi sta parlando?")
    bullet("Le chat archiviate: WhatsApp ha una funzione per nascondere le conversazioni. Basta scorrere in alto nella lista chat.")
    bullet("WhatsApp Web: se qualcuno ha collegato il tuo WhatsApp a un computer, puoi vederlo in 'Dispositivi collegati'. E viceversa.")
    bullet("I backup: WhatsApp salva un backup giornaliero. Se la dimensione del backup cala improvvisamente, qualcuno sta cancellando messaggi.")
    sp(2)
    italic("Non sto dicendo di controllare il telefono di nessuno. Sto dicendo di conoscere gli strumenti che esistono. La conoscenza è potere.")

    sp(4)
    sub("Instagram: i segnali nascosti")
    body("Instagram racconta più di quanto pensi.")
    sp(2)
    bullet("I 'Seguiti di recente': vai sul profilo del sospettato, clicca su 'Seguiti', e ordina per 'Data: più recente'. Vedi chi ha iniziato a seguire ultimamente.")
    bullet("Le storie: se il sospettato guarda sempre le storie di una persona specifica, quella persona apparirà tra i primi visualizzatori delle sue storie.")
    bullet("I like: se mette like a foto vecchie di qualcuno — tipo foto di mesi fa — sta scrollando il profilo di quella persona. Di notte. A letto accanto a te.")
    sp(2)
    body("Non servono software spia. Serve solo sapere dove guardare.")

    sp(4)
    sub("Le domande innocenti")
    body("Ho sviluppato una tecnica semplice ma efficace. Fare domande che sembrano innocue ma che mettono alla prova la coerenza della storia.")
    sp(2)
    body("Esempio: lei dice 'sono stata a cena con Sara e Marta'. Il giorno dopo, casualmente, chiedo: 'Com'era il ristorante dove siete andate ieri?' Se la storia è vera, risponde senza esitare. Se è falsa, c'è un microsecondo di pausa — il cervello che cerca di ricordare la bugia.")
    sp(2)
    body("Altro esempio: 'Ah, salutami Sara la prossima volta che la senti!' Se Sara non c'era, noterai un lampo di disagio.")
    sp(2)
    quote("Non sono diventato un detective. Ho solo smesso di chiudere gli occhi.")

    sp(4)
    sub("La posizione: come verificare")
    body("Molte coppie condividono la posizione su Google Maps o WhatsApp. Se la condivisione è attiva, puoi semplicemente controllare. Se è stata disattivata di recente — chiediti perché.")
    sp(2)
    body("Google Timeline (ora 'Cronologia' nell'app Google Maps) registra tutti gli spostamenti. Se il tuo partner ha un account Google collegato al telefono, quella cronologia racconta dove è stato davvero.")
    sp(2)
    body("Non è stalking. È verifica. C'è una differenza enorme tra controllare una persona per possesso e verificare una storia che non torna.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 4
    # ═══════════════════════════════════════════════════
    chapter("4", "Il giorno della scoperta")

    body("È stato un giovedì sera. Tre settimane dopo quella prima sera sul divano.")
    sp(2)
    body("Giulia era uscita. 'Cena con le ragazze', come al solito. Mi aveva mandato un messaggio alle 21: 'Siamo al solito posto, torno tardi. Ti amo ❤️'")
    sp(2)
    body("Quel 'ti amo' mi aveva stretto lo stomaco. Perché lo diceva più spesso del solito. Come se dovesse compensare qualcosa.")
    sp(2)
    body("Non l'ho pianificato. Non avevo intenzione di fare nulla. Ma stavo scrollando Instagram, e lì, nelle storie di una conoscente in comune, c'era un video di un locale. In quel video, sullo sfondo, per un secondo, c'era Giulia.")
    sp(2)
    body("Non era al 'solito posto'. Era in un locale dall'altra parte della città. E non era con le ragazze. Era seduta a un tavolo per due. Con un ragazzo.")
    sp(2)
    body("Ho fermato il video. Ho fatto screenshot. Le mani tremavano così tanto che ci ho messo tre tentativi per catturare il frame giusto.")

    sp(4)
    sub("La reazione fisica")
    body("Te la racconto perché nessuno ne parla, e quando ti succede pensi di stare impazzendo.")
    sp(2)
    body("Lo stomaco si è chiuso completamente. Sentivo la nausea salire. Le mani erano ghiacciate. Il cuore batteva così forte che lo sentivo nelle orecchie. Ho dovuto sedermi perché le gambe non mi reggevano.")
    sp(2)
    body("È una reazione di shock. Il corpo entra in modalità di sopravvivenza. Adrenalina, cortisolo, tutto insieme. È la stessa reazione che avresti di fronte a un pericolo fisico.")
    sp(2)
    body("Perché è un pericolo. Il tuo mondo sta crollando. Il tuo cervello non sa ancora come gestirlo.")
    sp(2)
    body("Ho passato le due ore successive seduto sul divano, con lo screenshot davanti agli occhi, a fissare il muro. Non piangevo. Non urlavo. Ero vuoto. Come quando il dolore è così forte che il corpo lo spegne.")

    sp(4)
    sub("Il sollievo paradossale")
    body("Questo è la parte che nessuno capisce finché non la vive. Insieme al dolore — sotto il dolore — c'era un senso di sollievo.")
    sp(2)
    body("Finalmente sapevo. Finalmente il dubbio era finito. Tre settimane di stomaco chiuso, di notti insonni, di analizzare ogni parola e ogni gesto — tutto finito. Avevo la risposta.")
    sp(2)
    quote("Sapere fa male. Ma il dubbio fa molto peggio.")
    sp(2)
    body("Il dubbio è un veleno lento. Ti consuma dall'interno, giorno dopo giorno. La verità è un colpo secco. Fa malissimo, ma è pulito. E dal dolore pulito si guarisce.")

    sp(4)
    sub("Le prime 24 ore")
    body("Non ho detto nulla. Non quella sera. Non quando è tornata a mezzanotte con il profumo di un locale diverso da quello che aveva detto. Non quando mi ha baciato sulla fronte dicendo 'buonanotte, amore'.")
    sp(2)
    body("Ho dormito — o meglio, ho finto di dormire — con la certezza che nulla sarebbe più stato come prima. E con una strana, terribile calma.")
    sp(2)
    body("Il giorno dopo ho chiamato mio fratello. Gli ho detto tutto. Avevo bisogno di una persona — una sola — che sapesse. Perché tenere un segreto così ti mangia vivo.")
    sp(2)
    italic("Se stai vivendo questo momento, chiama qualcuno. Non importa chi. Non tenere tutto dentro.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 5
    # ═══════════════════════════════════════════════════
    chapter("5", "Gli errori che ho fatto (e che tu puoi evitare)")

    body("Dopo la scoperta ho fatto una serie di errori. Tutti prevedibili. Tutti evitabili. Se qualcuno mi avesse dato questa lista prima, avrei risparmiato mesi di sofferenza inutile.")

    sp(4)
    sub("Errore 1: Il confronto a caldo")
    body("Due giorni dopo la scoperta, non ce l'ho più fatta. Eravamo a cena, lei parlava del suo giorno, e io ho sbottato: 'Lo so che giovedì non eri con le ragazze.'")
    sp(2)
    body("Risultato? Lei ha negato. Ha pianto. Ha detto che ero pazzo, possessivo, che stavo rovinando tutto. Ha ribaltato la situazione e in qualche modo, alla fine della serata, ero io a scusarmi.")
    sp(2)
    body("Il confronto a caldo non funziona mai. Mai. Quando sei emotivamente carico, l'altra persona ha il vantaggio: tu sei destabilizzato, lei è preparata (perché chi tradisce è sempre pronto all'eventualità di essere scoperto).")
    sp(2)
    italic("Non confrontare mai a caldo. Aspetta di avere i pensieri chiari e le prove in ordine.")

    sp(4)
    sub("Errore 2: Parlarne con amici in comune")
    body("Ho fatto l'errore di raccontare tutto a un amico che conosceva entrambi. Nel giro di 48 ore, Giulia sapeva che 'andavo in giro a dire cose'. La cosa si è trasformata in un dramma pubblico.")
    sp(2)
    body("Se devi parlare con qualcuno — e devi, perché tenerti tutto dentro ti distrugge — scegli una persona che sia SOLO tua. Un familiare, un amico che non conosce il tuo partner, un professionista.")

    sp(4)
    sub("Errore 3: Il controllo ossessivo")
    body("Dopo la scoperta, controllare è diventata una droga. Guardavo il suo ultimo accesso su WhatsApp ogni dieci minuti. Scrollavo i suoi follower su Instagram ogni sera. Analizzavo ogni parola di ogni messaggio.")
    sp(2)
    body("È una spirale. Più controlli, più trovi cose ambigue. Più trovi cose ambigue, più controlli. Non finisce mai. E ti distrugge.")
    sp(2)
    italic("La verità l'hai già trovata. Continuare a cercare non la rende più vera. La rende solo più dolorosa.")

    sp(4)
    sub("Errore 4: Cercare vendetta")
    body("Ho pensato di tradirla anch'io. Ho pensato di scrivere a quel ragazzo. Ho pensato di pubblicare tutto sui social. Ho pensato mille cose. Non ne ho fatta nessuna, e ringrazio il cielo.")
    sp(2)
    body("La vendetta ti dà un secondo di soddisfazione e mesi di conseguenze. Non ne vale la pena. Mai.")

    sp(4)
    sub("Errore 5: Ignorare e sperare")
    body("Per una settimana, dopo il confronto fallimentare, ho fatto finta di niente. Mi sono detto che forse mi sbagliavo, che forse era davvero un collega, che forse ero io il problema.")
    sp(2)
    body("Spoiler: non ero io il problema. E ignorare non fa sparire la realtà. La fa solo marcire sotto la superficie.")

    sp(4)
    sub("Errore 6: Accusare senza prove concrete")
    body("Quando ho confrontato Giulia, non avevo ancora le prove in ordine. Avevo uno screenshot sfocato e il mio istinto. Per lei è stato facile negare e farmi passare per paranoico.")
    sp(2)
    body("Se decidi di confrontare, vai preparato. Raccogli tutto. Organizzalo. Non mostrare tutte le carte subito — fai una domanda e aspetta la risposta. Se mente, allora mostri la prova. Una alla volta.")
    sp(2)
    quote("Ogni errore che ho fatto, l'ho fatto perché nessuno mi aveva avvertito. Ecco perché ho scritto questo libro.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 6
    # ═══════════════════════════════════════════════════
    chapter("6", "Come affrontare il confronto")

    body("Dopo le prime settimane di caos, ho fatto quello che avrei dovuto fare dall'inizio: mi sono preparato.")

    sp(4)
    sub("Il momento giusto")
    body("Non quando sei arrabbiato. Non quando sei triste. Non dopo una lite. Non a letto di notte.")
    sp(2)
    body("Il momento giusto è quando sei calmo. Quando hai dormito. Quando hai le idee chiare su cosa vuoi dire e — soprattutto — su cosa vuoi ottenere da quella conversazione.")
    sp(2)
    body("Chiediti: voglio la verità, o voglio litigare? Perché sono due cose diverse e portano a risultati opposti.")

    sp(4)
    sub("Come prepararsi")
    bullet("Scrivi su un foglio i punti principali che vuoi affrontare")
    bullet("Decidi in anticipo cosa farai se ammette tutto (e cosa farai se nega)")
    bullet("Organizza le prove in ordine cronologico")
    bullet("Scegli un momento in cui siete soli, senza fretta, senza distrazioni")
    bullet("Respira. Non è una guerra. È una conversazione. La più difficile della tua vita, ma pur sempre una conversazione")

    sp(4)
    sub("Le frasi da usare")
    body("Ho imparato che le parole giuste fanno tutta la differenza. Ecco gli script che ho preparato — e che puoi usare parola per parola:")
    sp(2)
    script("Ho bisogno di parlarti di una cosa. Non voglio litigare, voglio solo la verità. Mi prometti che sarai onesto/a con me?")
    sp(2)
    script("Ti faccio una domanda e ti chiedo di rispondermi con onestà, guardandomi negli occhi. Cosa sta succedendo con [nome]?")
    sp(2)
    script("Non ti sto accusando. Ti sto dando la possibilità di dirmi la verità prima che la scopra da solo/a. Perché se la scopro da solo/a, sarà molto peggio.")
    sp(2)
    script("Ho notato delle cose. Non sono qui per fare il/la detective. Sono qui perché ti amo e meritiamo entrambi la verità.")

    sp(4)
    sub("Come leggere le reazioni")
    body("Chi dice la verità:")
    bullet("Ti guarda negli occhi")
    bullet("Risponde con frasi semplici e dirette")
    bullet("Non ribalta la situazione su di te")
    bullet("Mostra emozione coerente con la situazione")
    sp(2)
    body("Chi mente:")
    bullet("Evita lo sguardo o lo forza troppo")
    bullet("Fornisce troppi dettagli (le bugie sono sempre troppo specifiche)")
    bullet("Si arrabbia e attacca: 'Ma come ti permetti?'")
    bullet("Minimizza: 'Ma dai, non è niente, sei paranoico/a'")
    bullet("Piange prima ancora che tu abbia finito di parlare")

    sp(4)
    sub("Le 4 risposte tipiche")
    body("<b>1. Negare tutto:</b> 'Non so di cosa parli.' — La più comune. Non cedere. Mostra una prova alla volta.")
    sp(2)
    body("<b>2. Minimizzare:</b> 'È solo un amico/a, stai esagerando.' — Ti fa sentire in colpa per aver chiesto. Non funziona se hai le prove.")
    sp(2)
    body("<b>3. Rigirare la colpa:</b> 'Se mi controllassi di meno, forse non avrei bisogno di...' — Manipolazione pura. Il tradimento non è mai colpa di chi lo subisce.")
    sp(2)
    body("<b>4. Piangere:</b> Può essere reale o manipolatorio. L'unico modo per capire è cosa dice DOPO il pianto. Se chiede scusa con i fatti, è reale. Se il pianto è l'unica risposta, è una strategia.")
    sp(2)
    italic("Non è facile. Non sarà bello. Ma è necessario. E dopo, comunque vada, ti sentirai più leggero/a.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 7
    # ═══════════════════════════════════════════════════
    chapter("7", "Il giorno dopo: cosa fare adesso")

    body("Ci sei. Hai scoperto la verità. Hai avuto il confronto. E adesso?")
    sp(2)
    body("Adesso viene la parte più difficile: decidere cosa fare con quello che sai.")

    sp(4)
    sub("Checklist delle prime 48 ore")
    body("Stampa questa lista. Mettila sul frigorifero. Seguila punto per punto.")
    sp(2)
    bullet("<b>Scrivi tutto quello che sai.</b> Date, messaggi, nomi, luoghi. Non fidarti della memoria — il trauma la distorce. Scrivi tutto finché è fresco.")
    sp(2)
    bullet("<b>Salva le prove in un posto sicuro.</b> Screenshot, email, foto. Su un cloud a cui solo tu hai accesso. Non sul telefono — potresti perderlo o rompere lo schermo in un momento di rabbia (succede più spesso di quanto pensi).")
    sp(2)
    bullet("<b>Parla con UNA persona di fiducia.</b> Una sola. Non dieci. Non i social. Una persona che ti conosce, che non giudica, che sa ascoltare.")
    sp(2)
    bullet("<b>Non prendere decisioni permanenti.</b> Non mandare messaggi che non puoi ritirare. Non fare le valigie alle 3 di notte. Non pubblicare nulla. Il dolore è temporaneo, le azioni sono permanenti.")
    sp(2)
    bullet("<b>Dormi. Mangia.</b> Anche se non ne hai voglia. Il tuo corpo ha bisogno di energia per gestire questo. Costringiti a mangiare qualcosa. Costringiti a stenderti, anche se non dormi.")

    sp(4)
    sub("Come decidere se dare una seconda possibilità")
    body("Non c'è una risposta giusta. C'è solo la tua risposta. Ma ci sono domande che possono aiutarti:")
    sp(2)
    bullet("Ha ammesso tutto spontaneamente, o solo dopo che l'hai scoperto/a?")
    bullet("Mostra rimorso reale, o solo paura delle conseguenze?")
    bullet("È disposto/a a fare cose concrete — terapia di coppia, accesso al telefono, trasparenza totale?")
    bullet("È la prima volta, o c'è un pattern?")
    bullet("Come ti senti quando pensi a un futuro con questa persona? Speranza o ansia?")
    sp(2)
    body("Se decidi di dare una seconda possibilità, sappi che ci vorrà tempo. Molto tempo. La fiducia è come un vaso: si rompe in un secondo, si ricostruisce in mesi. E alcune crepe restano per sempre.")

    sp(4)
    sub("Quando è il momento di andarsene")
    body("A volte la risposta è chiara. A volte no. Ma ci sono segnali che indicano che restare farebbe più male che partire:")
    sp(2)
    bullet("Non mostra rimorso genuino")
    bullet("Continua a mentire anche dopo la scoperta")
    bullet("Ti incolpa per il suo tradimento")
    bullet("Non è disposto/a a cambiare nulla di concreto")
    bullet("Il tuo istinto ti dice di andare — e il tuo istinto, ormai l'hai imparato, non sbaglia")
    sp(2)
    body("Andarsene non è perdere. È scegliere te stesso/a.")

    sp(4)
    sub("Proteggiti")
    body("Alcune cose pratiche che nessuno ti dice:")
    sp(2)
    bullet("Se vivete insieme: non fare nulla di impulsivo riguardo alla casa. Informati sui tuoi diritti.")
    bullet("Se avete un conto in comune: metti al sicuro la tua parte.")
    bullet("Se avete figli: metti sempre loro al primo posto. Non usarli come arma.")
    bullet("Se ti senti in pericolo emotivo: cerca un professionista. Non c'è vergogna nel chiedere aiuto.")
    sp(2)
    italic("Proteggere te stesso/a non è egoismo. È sopravvivenza.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 8 — BONUS: LE STORIE DEGLI ALTRI
    # ═══════════════════════════════════════════════════
    chapter("8", "Le storie degli altri")

    body("Non sei solo/a. Dopo aver condiviso la mia storia, decine di persone mi hanno scritto le loro. Eccone alcune. I nomi sono cambiati, ma i fatti sono reali.")

    sp(4)
    sub("Alessia, 23 — Napoli")
    italic('"Stavamo insieme da due anni. Lui era perfetto — attento, presente, romantico. Poi ho notato che ogni volta che gli arrivava un messaggio, abbassava la luminosità dello schermo. Un gesto piccolo. Ma lo faceva solo quando ero vicina."')
    sp(2)
    body("Alessia ha scoperto che il suo ragazzo aveva un profilo Instagram secondario. Lo usava per parlare con un'altra ragazza da sei mesi. La cosa che l'ha distrutta di più? Non il tradimento in sé. Ma il fatto che lui, durante quei sei mesi, le diceva 'ti amo' ogni sera prima di dormire.")
    sp(2)
    body("Cosa ha fatto: ha raccolto gli screenshot, ha aspettato una settimana, e ha parlato con calma. Lui ha ammesso tutto. Si sono lasciati. Tre mesi dopo, lei stava meglio di come stava nei due anni con lui.")
    sp(2)
    quote("'Non ho perso un ragazzo. Ho perso un bugiardo. E ho ritrovato me stessa.'")

    sp(4)
    sub("Lorenzo, 31 — Milano")
    italic('"La mia ragazza aveva iniziato ad andare in palestra. Bene, pensavo. Salute, autostima. Poi ho notato che ci andava solo in certi orari. Sempre dalle 18 alle 20. E tornava sempre con i capelli asciutti."')
    sp(2)
    body("Lorenzo ha fatto una cosa semplice: un giorno è passato davanti alla palestra alle 18:30. La macchina di lei non c'era. Ha controllato la posizione su Google Maps (avevano la condivisione attiva). Lei era dall'altra parte della città.")
    sp(2)
    body("Il confronto è stato devastante. Lei ha pianto, ha chiesto scusa, ha promesso di cambiare. Lorenzo le ha dato una seconda possibilità. Due mesi dopo, ha scoperto che non era cambiato nulla.")
    sp(2)
    italic("'La prima volta mi ha fatto male. La seconda mi ha fatto arrabbiare. Ma mi ha anche liberato, perché finalmente sapevo che non ero io il problema.'")

    sp(4)
    sub("Valentina, 28 — Roma")
    italic('"Mio marito viaggiava per lavoro. Due, tre volte al mese. Non ci avevo mai pensato. Poi un giorno ho trovato una ricevuta di un ristorante nel taschino della giacca. Data: martedì. Luogo: Firenze. Problema: quel martedì mi aveva detto di essere a Bologna."')
    sp(2)
    body("Valentina ha iniziato a verificare. Non con software spia o investigatori privati. Ha semplicemente iniziato a fare domande specifiche dopo ogni viaggio. 'Com'era l'hotel? In che zona era? Cosa hai mangiato?' Le risposte non tornavano mai.")
    sp(2)
    body("Dopo un mese di osservazione, ha trovato un biglietto aereo per due nel suo account email. Destinazione: Barcellona. Date: il weekend che lui era 'al convegno di Milano'. Il secondo biglietto era intestato a una collega.")
    sp(2)
    body("Valentina ha preso tutto — ricevute, biglietti, inconsistenze nelle storie — e ha parlato con un avvocato prima ancora di parlare con lui. Quando l'ha confrontato, era preparata. Lui ha provato a negare, poi a minimizzare. Ma di fronte alle prove, non c'era nulla da dire.")
    sp(2)
    quote("'La cosa più difficile non è stata scoprirlo. È stata accettare che la persona che amavo non esisteva. Quello che amavo era una versione di lui che si era inventato per me.'")

    sp(4)
    sub("Cosa ci insegnano queste storie")
    body("Ogni storia è diversa, ma i pattern sono sempre gli stessi:")
    sp(2)
    bullet("Il cambiamento nelle abitudini è sempre il primo segnale")
    bullet("Chi tradisce diventa più attento — ma mai abbastanza")
    bullet("L'istinto ha sempre ragione, anche quando non abbiamo le prove")
    bullet("La scoperta fa male, ma la verità libera")
    bullet("Le persone che scelgono di guardare in faccia la realtà, alla fine, stanno meglio")
    sp(2)
    body("Se la tua storia è simile a una di queste, non è una coincidenza. È un pattern. E i pattern non mentono.")

    sp(6)
    sub("Un messaggio da chi ha attraversato il buio")
    body("Ho chiesto a ogni persona che mi ha scritto: 'Se potessi dire una cosa a chi sta vivendo quello che hai vissuto tu, cosa diresti?'")
    sp(2)
    body("Ecco le risposte:")
    sp(2)
    italic('"Fidati del tuo stomaco. Non mente mai." — Alessia')
    sp(2)
    italic('"Non cercare di essere nobile. Cerca di essere onesto con te stesso." — Lorenzo')
    sp(2)
    italic('"Il dolore passa. La dignità resta." — Valentina')
    sp(2)
    italic('"Se devi scegliere tra la pace e l\'amore, scegli la pace. L\'amore vero non ti toglie la pace." — Sara, 25, Torino')
    sp(2)
    italic('"Un giorno riderai di questa cosa. Non oggi. Ma un giorno." — Marco, 29, Bologna')
    sp(2)
    italic('"La cosa più coraggiosa che ho fatto nella mia vita è stata guardare la verità in faccia. Tutto il resto è stato in discesa." — Giorgia, 26, Catania')

    # ═══════════════════════════════════════════════════
    # CAPITOLO 9 — APPENDICE PRATICA
    # ═══════════════════════════════════════════════════
    chapter("9", "Appendice pratica: checklist e risorse")

    body("Questa sezione è pensata per essere stampata o salvata. È il riassunto di tutto ciò che hai letto, organizzato in modo pratico.")

    sp(4)
    sub("Checklist: segnali da monitorare")
    bullet("Telefono sempre girato/in silenzioso in tua presenza")
    bullet("Nuovi nomi menzionati con troppa nonchalance")
    bullet("Disponibilità emotiva calata senza motivo apparente")
    bullet("Cambio improvviso negli orari e nelle abitudini")
    bullet("Cura dell'aspetto fisico solo quando esce (non con te)")
    bullet("Reazioni sproporzionate a domande normali")
    bullet("La sensazione nello stomaco che qualcosa non va")

    sp(4)
    sub("Checklist: cosa fare se hai il sospetto")
    bullet("Non dire nulla — osserva in silenzio per almeno 2 settimane")
    bullet("Annota date, orari, comportamenti anomali")
    bullet("Controlla le piccole inconsistenze nelle storie")
    bullet("Verifica la posizione se hai la condivisione attiva")
    bullet("Guarda i social con occhio attento (follower recenti, like, storie)")
    bullet("Non toccare il telefono dell'altra persona — è illegale e controproducente")
    bullet("Parla con una sola persona di fiducia")

    sp(4)
    sub("Checklist: dopo la scoperta")
    bullet("Salva tutte le prove su un cloud sicuro")
    bullet("Non confrontare a caldo — aspetta almeno 48 ore")
    bullet("Scrivi i punti che vuoi affrontare")
    bullet("Prepara gli script per la conversazione")
    bullet("Non prendere decisioni permanenti sotto shock")
    bullet("Mangia, dormi, muoviti — il corpo ha bisogno di funzionare")
    bullet("Cerca supporto professionale se ne senti il bisogno")

    sp(4)
    sub("Checklist: il confronto")
    bullet("Scegli un momento calmo, privato, senza fretta")
    bullet("Usa frasi che iniziano con 'Ho notato...' non 'Tu hai...'")
    bullet("Ascolta le risposte — nota esitazioni, difese eccessive, ribaltamenti")
    bullet("Mostra le prove una alla volta, non tutte insieme")
    bullet("Non urlare — la calma è la tua arma più potente")
    bullet("Decidi IN ANTICIPO cosa vuoi ottenere dalla conversazione")

    sp(4)
    sub("Risorse utili")
    body("Se stai attraversando un momento difficile, ricorda che non devi farcela da solo/a:")
    sp(2)
    bullet("<b>Telefono Amico:</b> 02 2327 2327 — attivo tutti i giorni")
    bullet("<b>Telefono Azzurro:</b> 19696 — supporto per under 18")
    bullet("<b>Consultori familiari:</b> gratuiti, presenti in ogni ASL")
    bullet("<b>Psicologi online:</b> piattaforme come Serenis, Unobravo, Guidapsicologi offrono prime consulenze a prezzi accessibili")
    sp(2)
    body("Chiedere aiuto non è debolezza. È la decisione più intelligente che puoi prendere.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO 10 — LETTERA FINALE
    # ═══════════════════════════════════════════════════
    chapter("10", "Lettera a chi ci sta passando ora")

    body("Se stai leggendo questo, probabilmente sei nel mezzo di qualcosa che ti sembra più grande di te. Lo so perché ci sono passato.")
    sp(4)
    body("Voglio dirti alcune cose che avrei voluto sentirmi dire quando ero al tuo posto.")
    sp(4)
    body("Il dolore che senti adesso è reale. Non sei esagerato/a. Non sei pazzo/a. Non sei troppo sensibile. Quello che provi è la reazione normale di un essere umano normale che scopre che qualcuno ha tradito la sua fiducia.")
    sp(4)
    body("Questo dolore non è per sempre. Lo so che adesso sembra impossibile, ma un giorno ti sveglierai e il primo pensiero non sarà su di lei, o su di lui. Sarà sul caffè. O sul lavoro. O su un film che vuoi vedere. E quel giorno capirai che stai guarendo.")
    sp(4)
    body("Non è colpa tua. Non lo era prima di scoprirlo, e non lo è adesso. Le scelte degli altri non sono le tue. Il loro tradimento parla di loro, non di te.")
    sp(4)
    body("Scoprire la verità non è la fine. È l'inizio di qualcosa di più onesto. Forse più doloroso, forse più solitario per un po'. Ma più vero. E dalla verità si costruisce.")
    sp(4)
    body("Sei più forte di quanto pensi. Il fatto che tu sia qui, che tu stia leggendo questo, che tu abbia avuto il coraggio di cercare la verità — dimostra che sei una persona che non si accontenta delle bugie. E questo è un tipo di forza che la maggior parte delle persone non ha.")
    sp(4)
    quote("Un giorno ringrazierai te stesso/a per aver avuto il coraggio di guardare in faccia la realtà. Quel giorno è più vicino di quanto pensi.")
    sp(6)
    body("Prenditi cura di te. Meriti qualcuno che non ti faccia mai dubitare.")
    sp(2)
    body("Con affetto,")
    body("qualcuno che ci è passato")

    # ═══════════════════════════════════════════════════
    # PAGINA FINALE
    # ═══════════════════════════════════════════════════
    pb()
    sp(30)
    story.append(Paragraph("—", ParagraphStyle(
        "EndDash", fontName="Helvetica", fontSize=20,
        textColor=RED, alignment=TA_CENTER, spaceAfter=12,
    )))
    center("Grazie per aver letto la mia storia.")
    center("Se ti è stata utile, questo mi basta.")
    sp(20)
    center("tihatradito.site")
    sp(4)
    center("© 2026 — Tutti i diritti riservati")
    sp(2)
    story.append(Paragraph(
        "Questo ebook è un prodotto digitale protetto da copyright. "
        "È vietata la riproduzione, distribuzione o condivisione "
        "senza autorizzazione scritta dell'autore.",
        ParagraphStyle("Legal", fontName="Helvetica", fontSize=7,
                       textColor=HexColor("#444444"), alignment=TA_CENTER,
                       leading=10, spaceBefore=20),
    ))

    # BUILD
    doc.build(story)
    print(f"✅ Ebook creato: {OUTPUT}")
    print(f"   Pagine: ~50+")

if __name__ == "__main__":
    build()
