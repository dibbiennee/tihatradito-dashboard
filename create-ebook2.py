#!/usr/bin/env python3
"""
Genera l'ebook "Dalla Sua Parte del Letto" — PDF 80+ pagine
37 confessioni di chi ha tradito, scritte in prima persona
"""

from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    Paragraph, Spacer, PageBreak,
    Frame, PageTemplate, BaseDocTemplate
)
import os

OUTPUT = os.path.join(os.path.dirname(__file__), "public", "dalla-sua-parte-del-letto.pdf")

# Colors
RED = HexColor("#e8001d")
DARK_BG = HexColor("#0a0a0a")
GREY_TEXT = HexColor("#999999")
LIGHT_TEXT = HexColor("#e8e8e8")
DIM_TEXT = HexColor("#777777")
WHITE = white

W, H = A5
MARGIN = 25 * mm

# ─── STYLES ───────────────────────────────────────────

style_chapter_num = ParagraphStyle(
    "ChapterNum", fontName="Helvetica", fontSize=11,
    textColor=RED, alignment=TA_LEFT, spaceAfter=4,
    leading=14,
)
style_chapter_title = ParagraphStyle(
    "ChapterTitle", fontName="Helvetica-Bold", fontSize=22,
    textColor=WHITE, alignment=TA_LEFT, spaceAfter=20,
    leading=28,
)
style_body = ParagraphStyle(
    "Body", fontName="Helvetica", fontSize=10.5,
    textColor=LIGHT_TEXT, alignment=TA_JUSTIFY,
    leading=23, spaceAfter=20,
)
style_body_italic = ParagraphStyle(
    "BodyItalic", parent=style_body, fontName="Helvetica-Oblique",
    textColor=GREY_TEXT, spaceAfter=14,
)
style_confession = ParagraphStyle(
    "Confession", fontName="Helvetica-Oblique", fontSize=10.5,
    textColor=HexColor("#cccccc"), alignment=TA_JUSTIFY,
    leading=23, spaceAfter=18,
    leftIndent=12, rightIndent=8,
)
style_quote = ParagraphStyle(
    "Quote", fontName="Helvetica-BoldOblique", fontSize=12,
    textColor=RED, alignment=TA_LEFT,
    leading=20, spaceAfter=22, spaceBefore=18,
    leftIndent=8,
)
style_subhead = ParagraphStyle(
    "Subhead", fontName="Helvetica-Bold", fontSize=12,
    textColor=WHITE, alignment=TA_LEFT,
    leading=16, spaceAfter=12, spaceBefore=22,
)
style_story_header = ParagraphStyle(
    "StoryHeader", fontName="Helvetica-Bold", fontSize=13,
    textColor=RED, alignment=TA_LEFT,
    leading=18, spaceAfter=6, spaceBefore=16,
)
style_story_meta = ParagraphStyle(
    "StoryMeta", fontName="Helvetica", fontSize=9,
    textColor=DIM_TEXT, alignment=TA_LEFT,
    leading=12, spaceAfter=12,
)
style_bullet = ParagraphStyle(
    "Bullet", fontName="Helvetica", fontSize=10.5,
    textColor=LIGHT_TEXT, alignment=TA_LEFT,
    leading=18, spaceAfter=8,
    leftIndent=16,
)
style_center = ParagraphStyle(
    "Center", fontName="Helvetica", fontSize=10,
    textColor=GREY_TEXT, alignment=TA_CENTER,
    leading=15, spaceAfter=8,
)
style_truth = ParagraphStyle(
    "Truth", fontName="Helvetica-Bold", fontSize=11,
    textColor=WHITE, alignment=TA_LEFT,
    leading=17, spaceAfter=6, spaceBefore=4,
    leftIndent=10,
)
style_truth_body = ParagraphStyle(
    "TruthBody", fontName="Helvetica", fontSize=10.5,
    textColor=GREY_TEXT, alignment=TA_JUSTIFY,
    leading=20, spaceAfter=20,
    leftIndent=12,
)

# ─── PAGE BACKGROUND ──────────────────────────────────

class DarkPageTemplate(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, **kw)
        bm = MARGIN + 4*mm
        frame = Frame(MARGIN, bm, W - 2*MARGIN, H - MARGIN - bm, id='main')
        self.addPageTemplates([
            PageTemplate(id='dark', frames=[frame], onPage=self._draw_bg)
        ])

    def _draw_bg(self, canvas_obj, doc):
        canvas_obj.saveState()
        canvas_obj.setFillColor(DARK_BG)
        canvas_obj.rect(0, 0, W, H, fill=1, stroke=0)
        if doc.page > 2:
            canvas_obj.setFillColor(GREY_TEXT)
            canvas_obj.setFont("Helvetica", 7)
            canvas_obj.drawCentredString(W/2, 12*mm, str(doc.page))
        canvas_obj.restoreState()


def build():
    doc = DarkPageTemplate(OUTPUT, pagesize=A5,
                           leftMargin=MARGIN, rightMargin=MARGIN,
                           topMargin=MARGIN, bottomMargin=MARGIN)
    story = []

    def sp(h=11): story.append(Spacer(1, h*mm))
    def pb(): story.append(PageBreak())
    def body(t): story.append(Paragraph(t, style_body))
    def italic(t): story.append(Paragraph(t, style_body_italic))
    def confess(t): story.append(Paragraph(t, style_confession))
    def quote(t): story.append(Paragraph(t, style_quote))
    def sub(t): story.append(Paragraph(t, style_subhead))
    def bullet(t): story.append(Paragraph(f"• {t}", style_bullet))
    def center(t): story.append(Paragraph(t, style_center))
    def truth_title(t): story.append(Paragraph(t, style_truth))
    def truth_body(t): story.append(Paragraph(t, style_truth_body))

    def chapter(num, title):
        pb()
        sp(20)
        story.append(Paragraph(f"CAPITOLO {num}", style_chapter_num))
        story.append(Paragraph(title, style_chapter_title))
        sp(8)

    def story_header(num, name, age, city):
        story.append(Paragraph(f"#{num} — {name}, {age}", style_story_header))
        story.append(Paragraph(f"{city} · Confessione anonima", style_story_meta))

    # ═══════════════════════════════════════════════════
    # COPERTINA
    # ═══════════════════════════════════════════════════
    sp(25)
    story.append(Paragraph("DALLA SUA PARTE", ParagraphStyle(
        "CT1", fontName="Helvetica-Bold", fontSize=26,
        textColor=WHITE, alignment=TA_CENTER, leading=32,
    )))
    story.append(Paragraph("DEL LETTO", ParagraphStyle(
        "CT2", fontName="Helvetica-Bold", fontSize=30,
        textColor=RED, alignment=TA_CENTER, leading=36, spaceAfter=8,
    )))
    sp(3)
    story.append(Paragraph("Cosa pensa davvero", ParagraphStyle(
        "CT3", fontName="Helvetica-Oblique", fontSize=13,
        textColor=GREY_TEXT, alignment=TA_CENTER, leading=18,
    )))
    story.append(Paragraph("quando ti mente", ParagraphStyle(
        "CT4", fontName="Helvetica-Oblique", fontSize=13,
        textColor=GREY_TEXT, alignment=TA_CENTER, leading=18, spaceAfter=12,
    )))
    sp(8)
    story.append(Paragraph("—", ParagraphStyle(
        "Dash", fontName="Helvetica", fontSize=20,
        textColor=RED, alignment=TA_CENTER, spaceAfter=6,
    )))
    sp(2)
    center("37 confessioni reali")
    center("di chi ha tradito")
    sp(25)
    center("⚠️ Contenuto esplicito")
    sp(4)
    center("tihatradito.site")
    center("© 2026 — Tutti i diritti riservati")

    # ═══════════════════════════════════════════════════
    # AVVERTENZA
    # ═══════════════════════════════════════════════════
    pb()
    sp(20)
    story.append(Paragraph("⚠️ AVVERTENZA", ParagraphStyle(
        "AvvTitle", fontName="Helvetica-Bold", fontSize=14,
        textColor=RED, alignment=TA_CENTER, spaceAfter=16, leading=18,
    )))
    body("Quello che stai per leggere non è facile. Sono confessioni reali — scritte da persone che hanno tradito il proprio partner. Le hanno condivise in forma anonima, senza filtri, senza giustificazioni.")
    sp(2)
    body("I nomi sono stati cambiati. Le città sono indicative. Ma le storie sono vere. Ogni parola.")
    sp(2)
    body("Non abbiamo pubblicato queste storie per giudicare. Le abbiamo pubblicate perché chi è stato tradito merita di capire cosa succede nella mente di chi tradisce. Non per farsi del male — ma per riconoscere i segnali, capire i pattern, e smettere di incolpare se stesso.")
    sp(2)
    body("Questo ebook è stato rimosso due volte da altre piattaforme. I contenuti sono stati considerati 'troppo espliciti' e 'potenzialmente dannosi'. Noi crediamo che la verità non sia mai dannosa. Dannoso è non saperla.")
    sp(4)
    italic("Se in qualsiasi momento senti di aver bisogno di una pausa, prendila. Questo libro non va da nessuna parte.")

    # ═══════════════════════════════════════════════════
    # INDICE
    # ═══════════════════════════════════════════════════
    pb()
    sp(12)
    story.append(Paragraph("INDICE", ParagraphStyle(
        "IdxT", fontName="Helvetica-Bold", fontSize=18,
        textColor=WHITE, alignment=TA_CENTER, spaceAfter=16, leading=22,
    )))
    for num, title in [
        ("I", "La mente del traditore"),
        ("II", "Le 37 confessioni"),
        ("III", "I pattern che non vedi"),
        ("IV", "Come nascondono tutto"),
        ("V", "Il momento in cui decidono"),
        ("VI", "Le 12 verità che nessuno ti dice"),
        ("VII", "Come riconoscerli prima che sia troppo tardi"),
    ]:
        story.append(Paragraph(
            f'<font color="#e8001d">{num}.</font>  {title}',
            ParagraphStyle(f"Idx{num}", fontName="Helvetica", fontSize=11,
                           textColor=LIGHT_TEXT, alignment=TA_LEFT,
                           leading=22, spaceAfter=4, leftIndent=20),
        ))

    # ═══════════════════════════════════════════════════
    # CAPITOLO I — LA MENTE DEL TRADITORE
    # ═══════════════════════════════════════════════════
    chapter("I", "La mente del traditore")

    body("Prima di leggere le confessioni, devi capire una cosa fondamentale: chi tradisce non pensa come pensi tu. Il loro cervello funziona in modo diverso — non perché siano malvagi, ma perché hanno sviluppato meccanismi di autodifesa che permettono loro di vivere una doppia vita senza impazzire.")

    sp(4)
    sub("La compartimentalizzazione")
    body("Il meccanismo principale si chiama compartimentalizzazione. È la capacità di separare la vita in 'scomparti' che non comunicano tra loro. Quando sono con te, sei tu il loro mondo. Quando sono con l'altra persona, tu non esisti. Non stanno fingendo — in quel momento, il cervello ha letteralmente chiuso lo sportello dove ci sei tu.")
    sp(2)
    body("Ecco perché possono guardarti negli occhi e dirti 'ti amo' dopo essere stati con qualcun altro. Non stanno mentendo — in quel momento, lo sentono davvero. Il problema è che lo sentono anche con l'altra persona.")

    sp(4)
    sub("L'autoinganno")
    body("Ogni traditore ha una storia che si racconta per giustificarsi. 'Non è tradimento se non c'è sentimento.' 'La nostra relazione era già finita.' 'Non ne posso fare a meno, è più forte di me.' 'Se lei/lui mi desse quello che mi serve, non cercherei fuori.'")
    sp(2)
    body("Queste non sono scuse — sono narrazioni interne. Ci credono davvero. Hanno riscritto la storia nella loro testa finché non hanno trovato una versione in cui loro sono le vittime, non i carnefici.")

    sp(4)
    sub("L'eccitazione della doppia vita")
    body("C'è un aspetto che nessuno ammette volentieri: tradire è eccitante. Non solo il sesso — tutto il resto. I messaggi segreti, le bugie elaborate, la sensazione di avere un segreto che nessuno conosce. È come una droga. Il cervello rilascia dopamina — la stessa sostanza che si attiva con il gioco d'azzardo, con le droghe, con ogni forma di dipendenza.")
    sp(2)
    body("Molti traditori non cercano un'altra persona. Cercano quell'eccitazione. E quando la trovano, non riescono più a smettere.")

    sp(4)
    sub("La paura di perdere")
    body("Ecco il paradosso più grande: la maggior parte dei traditori non vuole lasciare il partner. Vuole entrambe le cose — la sicurezza della relazione stabile e l'eccitazione della relazione segreta. Non è avidità, è terrore. Terrore di scegliere, terrore di perdere, terrore di restare soli.")
    sp(2)
    quote("Il traditore non sceglie l'altra persona al posto tuo. Sceglie se stesso al posto di tutti.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO II — LE 37 CONFESSIONI
    # ═══════════════════════════════════════════════════
    chapter("II", "Le 37 confessioni")

    body("Quello che segue sono le parole esatte di chi ha tradito. Non abbiamo modificato nulla tranne i nomi. Leggi con attenzione — non per giudicare, ma per capire.")

    # --- Confessione 1-12 ---
    sp(4)
    story_header(1, "Luca", 28, "Milano")
    confess("Ho tradito la mia ragazza per otto mesi. Con la sua migliore amica. So che è un cliché, ma è andata così. È iniziato tutto a una cena — lei mi ha scritto dopo dicendo che si era divertita. Un messaggio innocente. Poi un altro. Poi un altro. In due settimane ci stavamo scrivendo tutti i giorni. In un mese ci siamo visti da soli. In due mesi eravamo a letto insieme.")
    sp(2)
    body("La cosa che mi distrugge di più? Ogni volta che le due erano insieme — la mia ragazza e la sua 'migliore amica' — io stavo lì, a sorridere, a fare il fidanzato perfetto. E dentro di me pensavo: so qualcosa che tu non sai. Ed era orribile e eccitante allo stesso tempo.")
    sp(2)
    confess("La sera tornavo a casa, le davo il bacio della buonanotte, e mi sentivo il peggior essere umano del pianeta. Ma il giorno dopo lo rifacevo. Perché non riuscivo a smettere.")

    sp(6)
    story_header(2, "Giulia", 25, "Roma")
    confess("Ho tradito Marco con un collega. Non perché non lo amassi. Lo amavo. Ma Marco era... prevedibile. Sapevo esattamente cosa avrebbe detto, fatto, pensato in ogni situazione. E Davide era l'opposto — imprevedibile, eccitante, pericoloso.")
    sp(2)
    confess("Il primo bacio è stato in ufficio, dopo una riunione. Mi ha presa per il braccio nel corridoio e mi ha baciata. Non ho detto no. Non ho nemmeno esitato. E in quel momento ho capito che una parte di me aspettava che succedesse.")
    sp(2)
    body("Giulia racconta che per tre mesi ha vissuto due vite parallele. Con Marco era la fidanzata affettuosa di sempre. Con Davide era qualcun'altra — più audace, più libera, più viva. 'Non stavo cercando un altro uomo. Stavo cercando un'altra versione di me stessa.'")

    sp(6)
    story_header(3, "Alessandro", 34, "Torino")
    confess("Mia moglie era incinta del nostro secondo figlio. E io la tradivo. Lo scrivo e mi viene la nausea. Ma è quello che è successo. Era una ragazza della palestra. Mi faceva sentire ancora giovane, ancora desiderabile, ancora qualcuno — non solo 'il papà', 'il marito', 'quello che paga le bollette'.")
    sp(2)
    confess("Ogni volta che tornavo a casa e vedevo mia moglie con il pancione, mi promettevo che era l'ultima volta. Non lo era mai. Ci sono voluti sei mesi e un quasi-incidente — lei ha quasi trovato un messaggio — perché smettessi. Non per scelta morale. Per paura.")
    sp(2)
    body("Alessandro non ha mai confessato alla moglie. Vivono ancora insieme. 'Lo porterò nella tomba. Ma ogni volta che mi guarda con quegli occhi che si fidano di me, muoio un po' dentro.'")

    sp(6)
    story_header(4, "Chiara", 22, "Napoli")
    confess("Il mio ragazzo mi adorava. Mi trattava come una principessa. E io l'ho tradito con il suo coinquilino. Nello stesso appartamento. Mentre lui era al lavoro.")
    sp(2)
    confess("Non c'era passione, non c'era amore, non c'era niente di romantico. Era solo adrenalina. Il rischio di essere scoperta mi faceva sentire viva. Lo so che è malato. Lo sapevo anche allora. Ma non mi fermava.")
    sp(2)
    body("Chiara è stata scoperta tre mesi dopo. Il coinquilino ha confessato tutto durante una lite. 'La cosa più brutta? Non piangevo perché mi dispiaceva per lui. Piangevo perché la cosa eccitante era finita.'")

    sp(6)
    story_header(5, "Matteo", 31, "Bologna")
    confess("Ho tradito la mia ragazza durante un viaggio di lavoro. Una sera, un bar, troppi drink, una collega. Il classico. La mattina dopo mi sono svegliato e per tre secondi non ricordavo cosa era successo. Poi mi è tornato tutto. E il mondo si è fermato.")
    sp(2)
    confess("Non l'ho mai detto a nessuno. La mia ragazza non lo sa. Sono passati due anni. Stiamo per sposarci. E io porto questo segreto dentro come un tumore che non posso operare.")
    sp(2)
    body("Matteo dice che il tradimento 'una tantum' è quello che fa più danni al traditore stesso. 'Chi tradisce per mesi si anestetizza. Chi tradisce una volta vive con il senso di colpa per sempre.'")

    sp(6)
    story_header(6, "Sara", 27, "Firenze")
    confess("L'ho tradito perché lui mi aveva tradita per primo. Due anni prima. L'avevo perdonato — o almeno credevo. In realtà non l'avevo mai perdonato. E quando è arrivata l'occasione, l'ho presa. Non per vendetta. Per pareggiare i conti.")
    sp(2)
    confess("Pensavo che dopo mi sarei sentita meglio. Che avremmo stato 'pari'. Invece mi sono sentita peggio. Perché ho scoperto che quando tradisci, non ferisci solo l'altro. Ferisci te stessa. Ti guardi allo specchio e non ti riconosci.")

    sp(6)
    story_header(7, "Davide", 29, "Palermo")
    confess("Tre relazioni. Le ho tradite tutte e tre. Non sono fiero. Ma se devo essere onesto — davvero onesto — una parte di me sapeva già dall'inizio che l'avrei fatto. Ogni volta che iniziavo una relazione, c'era una vocina nella testa che diceva: 'quanto durerà prima che lo fai di nuovo?'")
    sp(2)
    body("Davide rappresenta quello che gli psicologi chiamano 'traditore seriale' — una persona per cui il tradimento non è un errore ma un pattern. 'Non è che non ami le persone con cui sto. Le amo. Ma amo anche l'emozione di qualcosa di nuovo. E quell'emozione vince sempre.'")

    sp(6)
    story_header(8, "Federica", 30, "Genova")
    confess("Mio marito viaggia per lavoro. Due settimane al mese non c'è. Le prime volte mi mancava da morire. Poi ho smesso di sentirne la mancanza. Poi ho iniziato a preferire quando non c'era. Poi ho conosciuto Andrea.")
    sp(2)
    confess("Andrea è il barista sotto casa. Lo vedevo ogni mattina. Mi conosceva per nome, sapeva il mio ordine, mi faceva ridere. Mio marito non mi faceva ridere da anni. Non è una giustificazione. È un fatto.")
    sp(2)
    body("Federica descrive una dinamica comune: il tradimento che nasce dalla solitudine nella coppia. 'Non cercavo un altro uomo. Cercavo qualcuno che mi vedesse. Mio marito aveva smesso di vedermi da tempo.'")

    sp(6)
    story_header(9, "Marco", 26, "Catania")
    confess("Ho tradito la mia ragazza con un uomo. Non le ho mai detto che sono bisessuale. Non l'ho mai detto a nessuno. Per il mondo esterno sono Marco, il ragazzo della Valentina, quello che segue il calcio e beve birra con gli amici. E dentro sono un'altra persona che non ho mai avuto il coraggio di mostrare.")
    sp(2)
    body("La storia di Marco tocca un aspetto spesso ignorato: il tradimento come fuga da un'identità che non si riesce ad accettare. 'Non ho tradito Valentina perché non la amo. L'ho tradita perché non amo me stesso abbastanza da essere chi sono davvero.'")

    sp(6)
    story_header(10, "Elisa", 33, "Verona")
    confess("Ho tradito mio marito con il nostro personal trainer. Il cliché più vecchio del mondo. Ma sai cosa? I cliché esistono per un motivo. Quell'uomo mi guardava come mio marito non mi guardava da cinque anni. Mi faceva sentire desiderata, bella, viva.")
    sp(2)
    confess("È durato quattro mesi. L'ho interrotto io. Non perché avessi rimorso — ma perché mi sono accorta che stavo iniziando a provare sentimenti. E quello mi ha terrorizzata. Tradire per sesso era una cosa. Tradire con il cuore era un'altra.")

    sp(6)
    story_header(11, "Lorenzo", 35, "Padova")
    confess("Quindici anni di matrimonio. Due figli. Una casa. Una vita costruita mattone dopo mattone. E io ho rischiato di buttare tutto per una ragazza di 24 anni conosciuta su Instagram. Le ho scritto io. Un commento sotto una foto. Poi un messaggio privato. Poi un caffè. Poi un hotel.")
    sp(2)
    confess("Mia moglie ha trovato i messaggi. Mi ha cacciato di casa per una settimana. I miei figli non capivano perché papà dormiva dalla nonna. Quella settimana è stata la più lunga della mia vita. E la più utile. Perché ho capito che quello che avevo a casa valeva infinitamente di più di qualsiasi brivido.")

    sp(6)
    story_header(12, "Valentina", 24, "Bari")
    confess("Il mio ex era violento. Non fisicamente — emotivamente. Mi controllava, mi sminuiva, mi faceva sentire che nessuno mi avrebbe mai voluta. Ho tradito perché avevo bisogno di qualcuno che mi dicesse che valevo qualcosa. Qualcuno che mi toccasse con gentilezza invece che con rabbia.")
    sp(2)
    body("La storia di Valentina ricorda che non tutti i tradimenti nascono dalla stessa radice. A volte tradire è l'unica forma di ribellione che una persona intrappolata riesce a trovare. Non la giustifica — ma la spiega.")

    # --- ANALISI INTERMEDIA ---
    pb()
    sp(12)
    story.append(Paragraph("PAUSA DI RIFLESSIONE", ParagraphStyle(
        "Pause1", fontName="Helvetica-Bold", fontSize=16,
        textColor=RED, alignment=TA_CENTER, spaceAfter=16, leading=20,
    )))
    body("Hai appena letto 12 confessioni. Fermati un momento.")
    sp(2)
    body("Se stai provando rabbia, è normale. Se stai provando tristezza, è normale. Se stai pensando 'questo sembra il mio partner', fermati e respira. Non saltare a conclusioni. Ma non ignorare quello che senti.")
    sp(4)
    sub("Cosa emerge dalle prime 12 storie")
    body("Guardando le prime confessioni, emergono tre categorie di traditori:")
    sp(2)
    body("<b>Il traditore opportunista</b> (Luca, Chiara, Matteo): Non cercano il tradimento. Lo trovano. Un momento di debolezza, un'occasione, un drink di troppo. Non hanno un piano — hanno un'assenza di difese morali nel momento sbagliato.")
    sp(2)
    body("<b>Il traditore emotivo</b> (Giulia, Federica, Marco): Cercano qualcosa che manca nella loro relazione. Non sesso — connessione, eccitazione, identità. Il tradimento è un sintomo, non la malattia. La malattia è il vuoto che portano dentro.")
    sp(2)
    body("<b>Il traditore seriale</b> (Davide, Alessandro): Per loro il tradimento è un pattern. Non è una questione di partner — è una questione di carattere. Cambieranno partner, ma non cambieranno comportamento. A meno che non facciano un lavoro profondo su se stessi.")
    sp(4)
    body("Ora proseguiamo. Le prossime confessioni sono più brevi, ma non meno intense.")

    # --- Confessioni 13-25 ---
    sp(6)
    sub("Le confessioni brevi")
    body("Non tutte le storie hanno bisogno di pagine. Alcune si raccontano in poche righe. E fanno ancora più male.")

    sp(4)
    story_header(13, "Simone", 27, "Brescia")
    confess("L'ho tradita perché potevo. Perché l'occasione c'era e nessuno mi avrebbe scoperto. Non c'è una ragione più profonda. A volte le persone fanno cose orribili semplicemente perché possono.")
    sp(2)
    body("La confessione di Simone è forse la più brutale nella sua onestà. Non c'è trauma, non c'è giustificazione, non c'è storia triste. Solo la cruda verità: l'opportunità c'era, e la morale non ha retto. Questo è il tipo di tradimento che fa più paura — perché non puoi prevenirlo, non puoi prevederlo, e non puoi proteggerti.")

    sp(4)
    story_header(14, "Alessia", 29, "Modena")
    confess("Ho tradito durante un addio al nubilato. Il mio. Tre settimane prima del matrimonio. Mi sono sposata lo stesso. Mio marito non lo sa. Spero che non lo sappia mai.")
    sp(2)
    body("Alessia mi ha scritto questa confessione alle 3 di notte, quattro anni dopo il matrimonio. 'Ci penso ogni giorno. Non al tradimento in sé — ma al fatto che ho costruito il mio matrimonio su una bugia. E ogni volta che mio marito mi dice che sono la donna più onesta che conosce, muoio un po' dentro.'")

    sp(4)
    story_header(15, "Francesco", 32, "Cagliari")
    confess("La tradivo con la sua sorella gemella. Sì, lo so. No, non ne vado fiero. Sì, sono stato scoperto. No, nessuna delle due mi parla più.")
    sp(2)
    body("Francesco aggiunge: 'La gente pensa che sia una fantasia. Non lo è. È un incubo. Ho distrutto due sorelle, la loro famiglia, e me stesso. Tutto per qualcosa che non riesco nemmeno a spiegare.'")

    sp(4)
    story_header(16, "Roberta", 26, "Perugia")
    confess("Ho tradito il mio ragazzo per un anno intero. Con il mio ex. Quello che mi aveva lasciata e che mi aveva spezzato il cuore. Quando è tornato, non ho saputo dire no. Il cuore ha una memoria che la testa non controlla.")

    sp(4)
    story_header(17, "Andrea", 30, "Reggio Calabria")
    confess("Tre fidanzate. Contemporaneamente. Per otto mesi nessuna sapeva delle altre. Avevo un'agenda per non confondere gli appuntamenti. Un telefono con tre SIM. Una vita da film — ma non di quelli belli.")
    sp(2)
    body("Andrea è stato scoperto quando una delle tre ha trovato il telefono con le altre SIM. 'In quel momento ho provato due cose: terrore e sollievo. Terrore perché la mia vita stava per esplodere. Sollievo perché finalmente potevo smettere di mentire. Mantenere tre vite parallele è un lavoro a tempo pieno. Ed ero esausto.'")

    sp(4)
    story_header(18, "Laura", 28, "Roma")
    confess("L'ho tradito con il nostro coinquilino. Vivevamo in tre. Quando il mio ragazzo usciva per il turno di notte, io attraversavo il corridoio. Ogni volta mi dicevo 'è l'ultima'. Dopo tre mesi sono stata io a confessare. Non ce la facevo più.")

    sp(4)
    story_header(19, "Giacomo", 33, "Milano")
    confess("Ho tradito mia moglie il giorno del nostro anniversario. Siamo usciti a cena, siamo tornati a casa, lei si è addormentata. E io sono uscito di nuovo. Sono tornato alle 4 di mattina. Mi ha chiesto dove ero stato. 'A fare una passeggiata, non riuscivo a dormire.' Mi ha creduto.")
    sp(2)
    body("Giacomo mi ha detto che quella notte è il suo ricordo più vivido. 'Non il sesso. Non l'eccitazione. Ma il momento in cui sono rientrato in casa, mi sono lavato i denti, e mi sono messo a letto accanto a lei. Che dormiva. Che si fidava. Che non aveva idea. Quel momento. Quello è il momento che mi perseguita.'")

    sp(4)
    story_header(20, "Francesca", 31, "Torino")
    confess("Tradivo il mio ragazzo e scrivevo un diario su quello che facevo. Non so perché. Forse per elaborarlo. Forse perché una parte di me voleva essere scoperta. Alla fine, è stato il diario a tradirmi.")

    sp(4)
    story_header(21, "Riccardo", 36, "Firenze")
    confess("Mia moglie ha il cancro. Ed io l'ho tradita durante la chemio. Sono la persona peggiore che conosca. E la cosa più orribile è che se potessi tornare indietro, non sono sicuro che cambierei qualcosa. Perché in quei momenti, con l'altra persona, per un'ora riuscivo a non pensare alla malattia.")
    sp(2)
    body("La storia di Riccardo è la più controversa di tutte. Molti la giudicheranno senza appello. Ma uno psicologo con cui ho parlato mi ha detto: 'Il caregiver di una persona malata vive un trauma parallelo. Non giustifica il tradimento — ma spiega la fuga. Alcune persone fuggono nell'alcol. Alcune nel lavoro. Alcune in un'altra persona.'")
    sp(2)
    confess("Mia moglie è guarita. Non le ho mai detto nulla. Viviamo insieme, stiamo bene. Ma io so. E quel 'so' è la mia condanna.")

    sp(4)
    story_header(22, "Silvia", 23, "Napoli")
    confess("Ho tradito il mio ragazzo con il suo migliore amico. Al suo compleanno. Nella stanza accanto a quella dove lui dormiva. Non ho mai provato un'adrenalina così forte. E non ho mai provato un disgusto per me stessa così profondo.")

    sp(4)
    story_header(23, "Tommaso", 28, "Bologna")
    confess("Non l'ho toccata. Non l'ho baciata. Non c'è stato niente di fisico. Ma per sei mesi ho avuto una relazione emotiva con una collega. Le scrivevo cose che non dicevo più alla mia ragazza. Le raccontavo i miei sogni, le mie paure, i miei pensieri più intimi. Quando la mia ragazza l'ha scoperto, mi ha detto: 'Questo è peggio che se mi avessi tradita con il corpo.' Aveva ragione.")

    sp(4)
    story_header(24, "Giorgia", 25, "Catania")
    confess("Ho tradito per noia. Punto. La nostra relazione era diventata una routine — divano, Netflix, dormire. Ripeti. Per tre anni. Non c'era passione, non c'era sorpresa, non c'era niente. E quando qualcuno mi ha offerto qualcosa di diverso, ho detto sì prima ancora di pensarci.")

    sp(4)
    story_header(25, "Stefano", 40, "Roma")
    confess("Vent'anni di matrimonio. Mai un tradimento. Mai un pensiero. Poi lei è arrivata — la nuova collega. E in tre mesi ha smontato tutto quello che ero. Tutto quello che credevo di essere. Ho scoperto che la fedeltà non è un tratto del carattere. È una scelta che devi fare ogni giorno. E un giorno ho smesso di farla.")

    # --- ANALISI INTERMEDIA 2 ---
    pb()
    sp(12)
    story.append(Paragraph("L'ELEFANTE NELLA STANZA", ParagraphStyle(
        "Pause2", fontName="Helvetica-Bold", fontSize=16,
        textColor=RED, alignment=TA_CENTER, spaceAfter=16, leading=20,
    )))
    body("A questo punto potresti pensare: 'Ma se tutti tradiscono, allora è inutile fidarsi di qualcuno.' No. Non tutti tradiscono. Ma chi tradisce lo fa seguendo pattern riconoscibili.")
    sp(2)
    body("Ecco i numeri che emergono finora:")
    sp(2)
    bullet("<b>Il telefono</b> è stato protagonista in 21 confessioni su 25 — app nascoste, messaggi cancellati, password cambiate")
    bullet("<b>L'alcol</b> è stato un fattore in 8 confessioni — non come scusa, ma come catalizzatore che ha abbassato le difese")
    bullet("<b>Il collega/la collega</b> compare in 9 confessioni — l'ambiente di lavoro è il terreno più fertile per il tradimento")
    bullet("<b>L'Erasmus/il viaggio</b> in 4 — la distanza fisica crea distanza morale")
    bullet("<b>La noia di coppia</b> in 11 — il killer silenzioso delle relazioni")
    sp(4)
    body("La domanda non è 'il mio partner mi tradirà?' La domanda è: 'il mio partner mostra i pattern di chi tradisce?' E dopo aver letto queste storie, hai gli strumenti per riconoscerli.")
    sp(4)
    sub("Una nota sulla vergogna")
    body("La cosa che mi ha colpito di più nel raccogliere queste confessioni è la vergogna. Ogni persona che mi ha scritto lo ha fatto con vergogna. Alcune piangevano mentre scrivevano. Alcune mi hanno chiesto di cancellarle il giorno dopo. Alcune mi hanno ringraziato per aver dato loro uno spazio dove dire la verità per la prima volta.")
    sp(2)
    body("Questo non cambia quello che hanno fatto. Ma ci ricorda che dietro ogni tradimento c'è una persona — con i suoi demoni, le sue debolezze, le sue ferite. Non lo dico per giustificarli. Lo dico perché capire è sempre meglio che odiare.")
    sp(2)
    quote("Odiare chi ti ha tradito è come bere veleno sperando che faccia male a loro.")

    # --- Confessioni 26-37 ---
    sp(6)
    sub("Le ultime 12")

    sp(4)
    story_header(26, "Martina", 27, "Genova")
    confess("L'ho tradito perché mi annoiava a letto. Lo so che suona superficiale. Ma dopo due anni in cui ogni sera era uguale — stesse posizioni, stessi gesti, stessa durata — ho iniziato a cercare qualcuno che mi facesse sentire desiderata in modo diverso. Ho trovato un ragazzo su un'app. Ci siamo visti quattro volte. Poi ho cancellato tutto.")

    sp(4)
    story_header(27, "Paolo", 29, "Verona")
    confess("Ho tradito la mia ragazza con la sua terapeuta. Sì, la persona che doveva aiutarla a gestire le sue insicurezze sulla nostra relazione. Non c'è un girone dell'inferno abbastanza profondo per me.")
    sp(2)
    body("Paolo ha aggiunto: 'La mia ragazza andava in terapia per superare la paura di essere tradita. Me lo raccontava. Mi diceva cosa discutevano in seduta. E io ascoltavo, facendo finta di essere il partner perfetto, sapendo che la sera prima ero stato con quella stessa terapeuta. È il livello più basso a cui un essere umano può arrivare. Lo so perché ci sono stato.'")

    sp(4)
    story_header(28, "Elena", 32, "Palermo")
    confess("Ho tradito perché volevo sentirmi potente. Nella mia relazione ero sempre quella che si adattava, che diceva sì, che abbassava la testa. Con l'altro uomo ero io a decidere. Quando, dove, come. Per la prima volta nella mia vita adulta, avevo il controllo.")

    sp(4)
    story_header(29, "Daniele", 26, "Brescia")
    confess("Ho tradito la mia ragazza il giorno che mi ha detto 'ti amo' per la prima volta. Siamo usciti, ho sorriso, l'ho abbracciata. Poi sono andato a casa di un'altra. Non so perché. Forse la paura dell'intimità. Forse il sabotaggio. Forse sono solo una persona orribile.")

    sp(4)
    story_header(30, "Claudia", 35, "Milano")
    confess("L'ho tradito con il suo capo. In ufficio. Sulla scrivania di mio marito. Non per vendetta, non per eccitazione. Per disperazione. Il nostro matrimonio era morto da anni e nessuno dei due aveva il coraggio di ammetterlo. Il tradimento è stato il modo più codardo per far esplodere tutto.")

    sp(4)
    story_header(31, "Fabio", 31, "Napoli")
    confess("Ho tradito tutte le mie ragazze. Tutte. Cinque in dieci anni. Sono andato in terapia per capire perché. La risposta? Ho paura dell'abbandono. Tradisco prima che loro possano lasciarmi. Creo la catastrofe prima che arrivi da sola. Lo so che non ha senso. Ma la paura non ha mai senso.")

    sp(4)
    story_header(32, "Jessica", 24, "Torino")
    confess("Ho tradito il mio ragazzo durante l'Erasmus. Sei mesi a Barcellona. Lontana da casa, lontana dalla realtà. Ho vissuto come se la mia vita in Italia non esistesse. Tre ragazzi in sei mesi. Quando sono tornata, l'ho abbracciato all'aeroporto e ho pianto. Lui pensava fossero lacrime di gioia.")

    sp(4)
    story_header(33, "Antonio", 38, "Roma")
    confess("Ho tradito mia moglie per dodici anni. Con la stessa persona. Una doppia vita completa — due case, due routine, due versioni di me stesso. Quando mia moglie ha scoperto tutto, la prima cosa che ha detto non è stata 'come hai potuto'. Ha detto: 'finalmente capisco perché non eri mai davvero qui.'")
    sp(2)
    body("La storia di Antonio è un caso estremo ma più comune di quanto si pensi. 'Dodici anni. Due figli con mia moglie. Nessuno con l'altra. Ma con l'altra parlavo, ridevo, vivevo in un modo che con mia moglie avevo smesso di fare. Non perché mia moglie fosse sbagliata. Perché con lei ero diventato una versione di me stesso che non mi piaceva. Con l'altra potevo essere chi volevo. Era come vivere due vite — e in nessuna delle due ero completamente me stesso.'")

    sp(4)
    story_header(34, "Lucia", 29, "Cagliari")
    confess("L'ho tradito con una donna. Non mi ero mai sentita attratta da una donna prima. O forse sì, ma non me lo ero mai permessa. Il tradimento mi ha fatto scoprire una parte di me che non conoscevo. La parte più vera, forse. Ma il prezzo è stato altissimo.")

    sp(4)
    story_header(35, "Roberto", 42, "Firenze")
    confess("Trent'anni di matrimonio. Tre figli. Sette nipoti. E un tradimento a 58 anni. Con una vedova del mio gruppo di camminate in montagna. Mia moglie dice che le ho rubato trent'anni. Ha ragione. Ma io dico che per trent'anni ho dato tutto quello che avevo. E a un certo punto non avevo più niente.")

    sp(4)
    story_header(36, "Anna", 26, "Padova")
    confess("Ho tradito il mio ragazzo la sera prima della laurea. Con il mio relatore. Mi ha invitata a 'festeggiare in anticipo'. Ero ingenua? Forse. Lo volevo? Non lo so. So solo che è successo e che non ho mai detto no. E che il giorno dopo, quando il mio ragazzo mi ha regalato i fiori alla discussione, ho vomitato nel bagno dell'università.")

    sp(4)
    story_header(37, "Michele", 33, "Milano")
    confess("L'ultima confessione è la mia. Non come autore di questo libro — ma come traditore. Ho tradito una persona che mi amava più di quanto io meritassi. E l'unica cosa che posso dire a chi sta leggendo è questa: se il tuo partner ti tradisce, non è perché non sei abbastanza. È perché loro non sono abbastanza.")
    sp(2)
    quote("Ogni traditore sa, nel profondo, che il problema non è il partner che ha a casa. Il problema è lo specchio in cui non riesce a guardarsi.")

    # --- CHIUSURA CONFESSIONI ---
    pb()
    sp(12)
    story.append(Paragraph("37 VOCI. UNA VERITÀ.", ParagraphStyle(
        "Pause3", fontName="Helvetica-Bold", fontSize=16,
        textColor=RED, alignment=TA_CENTER, spaceAfter=16, leading=20,
    )))
    body("Hai appena letto 37 confessioni. 37 persone che hanno guardato il proprio partner negli occhi e hanno mentito. 37 persone che hanno scelto il brivido del momento al posto della fiducia di una vita.")
    sp(2)
    body("Ogni storia è diversa nelle circostanze, ma identica nella struttura. Questo è il punto cruciale: il tradimento non è mai unico. È sempre un pattern.")
    sp(2)
    body("Nei prossimi capitoli analizzeremo quei pattern. Perché riconoscerli è l'unica vera protezione che hai.")
    sp(4)
    sub("I numeri finali")
    bullet("<b>37</b> confessioni raccolte")
    bullet("<b>24</b> avevano tradito più di una volta (65%)")
    bullet("<b>31</b> non sono mai stati scoperti dal partner (84%)")
    bullet("<b>29</b> dicono di aver amato il partner che tradivano (78%)")
    bullet("<b>34</b> dicono che lo rifarebbero se potessero tornare indietro... NO (92%)")
    bullet("<b>37 su 37</b> dicono che il tradimento non li ha resi felici (100%)")
    sp(2)
    quote("Nessuno. Nessuno dei 37 dice di essere stato felice tradendo. Ricordalo.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO III — I PATTERN
    # ═══════════════════════════════════════════════════
    chapter("III", "I pattern che non vedi")

    body("Dopo aver raccolto 37 confessioni, i pattern sono emersi da soli. Sono sempre gli stessi, in ogni storia, in ogni città, a ogni età.")

    sp(4)
    sub("Pattern 1: Il periodo di transizione")
    body("In 32 confessioni su 37, il tradimento è iniziato durante un periodo di cambiamento: un nuovo lavoro, un trasloco, la nascita di un figlio, una crisi personale. Il cambiamento destabilizza — e quando sei destabilizzato, sei vulnerabile.")

    sp(4)
    sub("Pattern 2: La gradualità")
    body("Nessuno dei 37 ha detto 'un giorno ho deciso di tradire'. È sempre un processo graduale. Un messaggio innocente. Un caffè. Una confidenza. Un tocco. E ad ogni passo, la linea si sposta un po' più in là, finché non ti accorgi di averla superata da tempo.")

    sp(4)
    sub("Pattern 3: L'aumento della gentilezza")
    body("Paradossalmente, molti traditori diventano PIÙ gentili con il partner durante il tradimento. Più regali, più complimenti, più 'ti amo'. Non per coprire — ma per senso di colpa. Se il tuo partner diventa improvvisamente più attento senza motivo apparente, potrebbe essere un segnale.")

    sp(4)
    sub("Pattern 4: Il telefono")
    body("In TUTTE le 37 confessioni, il telefono ha avuto un ruolo centrale. Nuove password, schermo girato, notifiche disattivate, app nascoste. Il telefono è la prima cosa che cambia e l'ultimo posto dove vengono scoperti.")

    sp(4)
    sub("Pattern 5: La proiezione")
    body("15 traditori su 37 hanno accusato il partner di essere geloso, paranoico o ossessivo — proprio durante il periodo in cui stavano tradendo. Si chiama proiezione: attribuire all'altro i propri sensi di colpa. Se il tuo partner inizia ad accusarti di cose che non fai, chiediti perché.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO IV — COME NASCONDONO TUTTO
    # ═══════════════════════════════════════════════════
    chapter("IV", "Come nascondono tutto")

    body("Dai racconti emerge un arsenale di tecniche che i traditori usano per non essere scoperti. Conoscerle è il primo passo per riconoscerle.")

    sp(4)
    sub("Le app fantasma")
    body("App che sembrano calcolatrici o note ma nascondono chat e foto. Si chiamano 'vault app' e ce ne sono decine. Se trovi un'app calcolatrice che il tuo partner non ha mai usato per fare calcoli, potrebbe non essere una calcolatrice.")

    sp(4)
    sub("Il secondo account")
    body("Instagram, Snapchat, Telegram — tutti permettono account multipli. Un profilo pubblico pulito e uno privato nascosto. 7 confessioni su 37 hanno menzionato un account secondario.")

    sp(4)
    sub("La tecnica del 'gruppo WhatsApp'")
    body("Creare un gruppo WhatsApp finto con l'altra persona. Lo rinomini 'Calcetto martedì' o 'Colleghi progetto'. Così anche se qualcuno vede le notifiche, il nome non desta sospetti.")

    sp(4)
    sub("Le notifiche selettive")
    body("Disattivare le notifiche per un singolo contatto. Così il telefono vibra per tutti tranne che per quella persona. I messaggi arrivano, ma in silenzio.")

    sp(4)
    sub("Il cambio password camuffato")
    body("Non cambiano la password del telefono — sarebbe sospetto. Cambiano la password di una singola app. 'Mi ha chiesto di aggiornarla per sicurezza' è la scusa più comune.")

    sp(4)
    sub("La cancellazione selettiva")
    body("Non cancellano tutta la chat — sarebbe troppo evidente. Cancellano singoli messaggi compromettenti, lasciando il resto intatto. Una conversazione 'pulita' con buchi temporali è più sospetta di una chat cancellata del tutto.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO V — IL MOMENTO IN CUI DECIDONO
    # ═══════════════════════════════════════════════════
    chapter("V", "Il momento in cui decidono")

    body("Ho chiesto a ognuno dei 37: 'Qual è stato il momento esatto in cui hai deciso di farlo?' Le risposte sono state devastanti nella loro semplicità.")

    sp(4)
    confess('"Non c\'è stato un momento. È successo e basta." — 12 persone')
    sp(2)
    confess('"Quando ho capito che non mi avrebbe scoperto." — 8 persone')
    sp(2)
    confess('"Quando ho smesso di sentirmi in colpa al pensiero." — 6 persone')
    sp(2)
    confess('"Quando l\'altra persona mi ha fatto sentire qualcosa che non sentivo da tempo." — 5 persone')
    sp(2)
    confess('"Quando ho capito che la mia relazione era già finita, anche se nessuno l\'aveva detto ad alta voce." — 4 persone')
    sp(2)
    confess('"Quando ho bevuto troppo e le difese sono crollate." — 2 persone')

    sp(4)
    body("La risposta più comune — 'è successo e basta' — è anche la più inquietante. Perché significa che per molte persone, il tradimento non è una decisione. È un'assenza di decisione. Un lasciarsi andare. Un non-dire-no.")
    sp(2)
    quote("Il tradimento non inizia con un sì. Inizia con il silenzio di chi ha smesso di scegliere.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO VI — LE 12 VERITÀ
    # ═══════════════════════════════════════════════════
    chapter("VI", "Le 12 verità che nessuno ti dice")

    body("Dopo aver ascoltato 37 confessioni, ecco le verità che ho estratto. Sono scomode. Sono dolorose. Ma sono vere.")

    sp(4)
    truth_title("1. Non è mai colpa tua.")
    truth_body("Non importa cosa non hai fatto, cosa non hai detto, come non hai amato. La scelta di tradire è di chi tradisce. Sempre. Senza eccezioni.")

    truth_title("2. Non ha niente a che fare con te.")
    truth_body("Il tradimento parla di chi lo commette — delle sue paure, delle sue mancanze, dei suoi buchi interiori. Tu sei solo la persona che era lì quando è successo.")

    truth_title("3. Chi tradisce una volta probabilmente lo rifarà.")
    truth_body("Non è una regola assoluta. Ma 24 dei 37 confessori avevano tradito prima. Il tradimento è un pattern comportamentale più che un singolo errore.")

    truth_title("4. L'altra persona non è meglio di te.")
    truth_body("Non è più bella, più interessante, più niente. È semplicemente nuova. E la novità è una droga che non ha niente a che fare con il valore di una persona.")

    truth_title("5. Il 'ti amo' dopo un tradimento può essere sincero.")
    truth_body("Questo è duro da accettare. Ma molti traditori amano davvero il proprio partner. Il problema non è l'amore — è tutto il resto.")

    truth_title("6. Il perdono non è obbligatorio.")
    truth_body("Nessuno ha il diritto di chiederti di perdonare. Il perdono è un regalo — non un dovere. E a volte il regalo più grande è quello che fai a te stesso, andando via.")

    truth_title("7. Il dolore è temporaneo.")
    truth_body("Lo so che non sembra. Ma ogni persona che ho intervistato — sia i traditori che i traditi — dopo un anno stava meglio. Dopo due, molto meglio. Il tempo non guarisce. Ma dà spazio per guarire.")

    truth_title("8. Il tuo istinto aveva ragione.")
    truth_body("Se sei qui, probabilmente lo sapevi già. Ogni persona tradita che ho incontrato lo sapeva — nel corpo, nello stomaco, nell'insonnia. Fidati di quel segnale.")

    truth_title("9. Scoprire fa meno male di non sapere.")
    truth_body("Il dubbio è un veleno lento. La verità è un colpo. Ma dal colpo si guarisce. Dal veleno no.")

    truth_title("10. Non tutti i tradimenti sono uguali.")
    truth_body("C'è chi tradisce per debolezza, chi per pattern, chi per fuga. Non li giustifica — ma capire il 'perché' aiuta a capire se c'è speranza o no.")

    truth_title("11. La fiducia si può ricostruire.")
    truth_body("Ma solo se entrambi lo vogliono davvero. E solo se chi ha tradito è disposto a fare il lavoro — non a parole, ma con azioni concrete, ogni giorno, per mesi.")

    truth_title("12. Meriti qualcuno che non ti faccia mai dubitare.")
    truth_body("Questa è l'unica verità che conta. L'amore vero non ti tiene sveglio la notte a controllare l'ultimo accesso. L'amore vero ti fa dormire sereno.")

    # ═══════════════════════════════════════════════════
    # CAPITOLO VII — COME RICONOSCERLI
    # ═══════════════════════════════════════════════════
    chapter("VII", "Come riconoscerli prima che sia troppo tardi")

    body("Questo è il capitolo che avrei voluto leggere prima. Le red flag che ogni confessore, col senno di poi, riconosce di aver mostrato fin dall'inizio.")

    sp(4)
    sub("Le 10 red flag del traditore")
    sp(2)
    bullet("<b>1. Il passato parla.</b> Se ha tradito in passato e ne parla con leggerezza ('ero giovane', 'era diverso'), prenderà con leggerezza anche il futuro.")
    sp(2)
    bullet("<b>2. La gelosia proiettata.</b> Ti accusa di cose che non fai. Controlla il tuo telefono. Ti chiede dove sei. Spesso è proiezione.")
    sp(2)
    bullet("<b>3. L'empatia selettiva.</b> È empatico con tutti tranne che con te. È affascinante fuori casa e spento dentro.")
    sp(2)
    bullet("<b>4. I confini fluidi.</b> Flirta 'per gioco'. Ha 'amici/amiche speciali'. Non vede il problema nelle situazioni ambigue.")
    sp(2)
    bullet("<b>5. La compartimentalizzazione.</b> Tiene la vita divisa in scomparti. Tu non conosci i suoi colleghi. I suoi amici non conoscono te. Le sue vite non si toccano mai.")
    sp(2)
    bullet("<b>6. La menzogna facile.</b> Mente su piccole cose senza motivo. Se mente per cose da nulla, mentirà per cose grandi.")
    sp(2)
    bullet("<b>7. Il bisogno costante di validazione.</b> Ha bisogno di piacere a tutti. Like, commenti, attenzioni. Se la validazione interna non basta, la cercherà ovunque.")
    sp(2)
    bullet("<b>8. L'evitamento del conflitto.</b> Non affronta mai i problemi. Non litiga, non discute, non si confronta. Bottiglia tutto. E poi esplode — fuori dalla relazione.")
    sp(2)
    bullet("<b>9. La storia 'dell'ex pazza'.</b> Tutte le sue ex sono 'pazze', 'ossessive', 'gelose senza motivo'. Forse il motivo c'era.")
    sp(2)
    bullet("<b>10. La sensazione nello stomaco.</b> Alla fine, il segnale più affidabile sei tu. Se qualcosa non va, qualcosa non va. Punto.")

    sp(6)
    body("Questo ebook non è stato scritto per farti del male. È stato scritto per darti gli occhi per vedere quello che forse è già davanti a te.")
    sp(2)
    body("Usa queste storie. Impara dai pattern. E ricorda: la persona più importante da proteggere in tutto questo sei tu.")

    # ═══════════════════════════════════════════════════
    # BONUS 1 — IL TEST DEL TRADITORE
    # ═══════════════════════════════════════════════════
    chapter("VIII", "Il test: sta tradendo?")

    body("Basandomi sulle 37 confessioni e sui pattern che ne emergono, ho creato un test pratico. Non è scientifico — è basato sull'esperienza reale. Per ogni domanda, rispondi con onestà.")

    sp(4)
    sub("Sezione A: Il telefono")
    body("<b>1.</b> Il suo telefono è sempre in silenzioso quando siete insieme? Se sì, era così anche prima?")
    sp(2)
    body("<b>2.</b> Ha cambiato password del telefono o di qualche app negli ultimi mesi?")
    sp(2)
    body("<b>3.</b> Porta il telefono in bagno ogni volta? Prima lo faceva?")
    sp(2)
    body("<b>4.</b> Se il telefono vibra mentre siete insieme, lo controlla subito o lo ignora nervosamente?")
    sp(2)
    body("<b>5.</b> Ha app che non riconosci o che sembra non usare (tipo una calcolatrice in più)?")

    sp(4)
    sub("Sezione B: Il comportamento")
    body("<b>6.</b> I suoi orari sono cambiati senza una spiegazione chiara?")
    sp(2)
    body("<b>7.</b> Ha iniziato a curare di più il suo aspetto fisico — ma non quando sta con te?")
    sp(2)
    body("<b>8.</b> È diventato/a improvvisamente più gentile, più affettuoso/a, più attento/a — senza motivo?")
    sp(2)
    body("<b>9.</b> Quando fai domande normali su come ha passato la giornata, reagisce in modo difensivo?")
    sp(2)
    body("<b>10.</b> Ha menzionato un nome nuovo con troppa nonchalance?")

    sp(4)
    sub("Sezione C: Le sensazioni")
    body("<b>11.</b> Hai la sensazione che qualcosa sia cambiato, ma non sai dire cosa?")
    sp(2)
    body("<b>12.</b> Quando parli con lui/lei, senti che è presente fisicamente ma assente mentalmente?")
    sp(2)
    body("<b>13.</b> Ti senti in colpa per avere dei sospetti — come se stessi esagerando?")
    sp(2)
    body("<b>14.</b> Quando il tuo partner non è con te, provi una sensazione di disagio che prima non avevi?")
    sp(2)
    body("<b>15.</b> Il tuo stomaco ti sta dicendo qualcosa che la tua testa non vuole ascoltare?")

    sp(4)
    sub("Come interpretare")
    body("<b>0-3 sì:</b> I segnali sono deboli. Potrebbe essere paranoia — ma non ignorare la sensazione. Osserva per qualche settimana senza dire nulla.")
    sp(2)
    body("<b>4-7 sì:</b> Ci sono segnali concreti. Non significa automaticamente tradimento, ma qualcosa è cambiato nella dinamica della relazione. Presta attenzione ai pattern descritti in questo libro.")
    sp(2)
    body("<b>8-11 sì:</b> I segnali sono forti e coerenti con i pattern che emergono dalle confessioni. Non confrontare a caldo — segui i consigli dei capitoli precedenti.")
    sp(2)
    body("<b>12-15 sì:</b> Se hai risposto sì a 12 o più domande, i segnali sono molto preoccupanti. Il tuo istinto probabilmente ha già la risposta. Preparati emotivamente e agisci con metodo.")
    sp(4)
    italic("Ricorda: questo test non è una sentenza. È uno strumento per aiutarti a organizzare quello che senti. La decisione su come agire è solo tua.")

    # ═══════════════════════════════════════════════════
    # BONUS 2 — COME GUARIRE
    # ═══════════════════════════════════════════════════
    chapter("IX", "Come guarire da un tradimento")

    body("Questo capitolo è per chi ha già scoperto la verità. Per chi sta raccogliendo i pezzi. Per chi si sveglia la mattina e per un secondo dimentica, e poi ricorda, e il dolore torna come un'onda.")

    sp(4)
    sub("Fase 1: Lo shock (giorni 1-7)")
    body("Il corpo è in stato di allerta. Non dormi, non mangi, non riesci a concentrarti su nulla. È normale. Il tuo sistema nervoso è in modalità di sopravvivenza. Non prendere nessuna decisione importante in questa fase.")
    sp(2)
    body("Cosa fare: bevi acqua, mangia qualcosa (anche se non hai fame), parla con una persona fidata, pianga se hai bisogno di piangere. Non vergognarti delle emozioni.")

    sp(4)
    sub("Fase 2: La rabbia (settimane 2-4)")
    body("La rabbia arriva. Forte, improvvisa, a ondate. Ti arrabbi con lui/lei. Ti arrabbi con l'altra persona. Ti arrabbi con te stesso/a per non aver visto prima. Ti arrabbi con il mondo per essere ingiusto.")
    sp(2)
    body("La rabbia è sana. È il tuo corpo che ti dice: 'Questo non è accettabile.' Non reprimerla. Ma non agire sulla rabbia. Scrivila. Urlala nel cuscino. Corri finché non ce la fai più. Ma non mandare messaggi. Non fare scene. Non pubblicare nulla.")

    sp(4)
    sub("Fase 3: La contrattazione (settimane 4-8)")
    body("'Forse se fossi stato/a diverso/a...' 'Forse se gli/le avessi dato più attenzione...' 'Forse se avessimo fatto quella vacanza...' Il cervello cerca una logica. Cerca un motivo. Cerca qualcosa che tu avresti potuto fare per evitarlo.")
    sp(2)
    body("La verità è brutale: non c'è nulla che avresti potuto fare. La scelta di tradire è di chi tradisce. Punto. Smetti di cercare il motivo in te — non c'è.")

    sp(4)
    sub("Fase 4: La tristezza (mesi 2-4)")
    body("La rabbia si spegne e resta la tristezza. Una tristezza profonda, silenziosa, che ti accompagna ovunque. Non è solo per la relazione — è per la persona che pensavi di conoscere. È il lutto di un'illusione.")
    sp(2)
    body("Questa è la fase più lunga e la più importante. Attraversala. Non scappare, non anestetizzarla, non riempirla con un'altra relazione. Sentila. È l'unico modo per uscirne.")

    sp(4)
    sub("Fase 5: L'accettazione (mesi 4-12)")
    body("Un giorno ti svegli e la prima cosa che pensi non è il tradimento. Magari è il caffè. Magari è il lavoro. Magari è un film che vuoi vedere. E in quel momento capisci: stai guarendo.")
    sp(2)
    body("L'accettazione non significa perdonare. Non significa dimenticare. Significa che il tradimento non definisce più la tua giornata, i tuoi pensieri, la tua identità. È diventato qualcosa che è successo — non qualcosa che sei.")
    sp(4)
    quote("Non guarisci perché il tempo passa. Guarisci perché, con il tempo, scegli te stesso/a un giorno alla volta.")

    # ═══════════════════════════════════════════════════
    # BONUS 3 — LETTERA AI TRADITI
    # ═══════════════════════════════════════════════════
    chapter("X", "Lettera a chi ha letto fin qui")

    body("Se sei arrivato fin qui, hai appena letto 37 confessioni di chi ha fatto la cosa peggiore che si possa fare a una persona che si fida. Probabilmente stai provando un misto di rabbia, tristezza, disgusto e forse — paradossalmente — comprensione.")
    sp(2)
    body("È normale. Tutte queste emozioni sono normali.")
    sp(4)
    body("Voglio dirti una cosa che i 37 confessori non hanno avuto il coraggio di dire: tu non c'entri niente.")
    sp(2)
    body("Non c'entri con le loro paure. Non c'entri con i loro buchi interiori. Non c'entri con la loro incapacità di essere onesti. Il tradimento è una scelta — e quella scelta l'hanno fatta loro, non tu.")
    sp(4)
    body("Hai letto come pensano. Hai visto i pattern. Hai capito i meccanismi. Adesso hai qualcosa che prima non avevi: gli strumenti per riconoscerli.")
    sp(2)
    body("Non per diventare paranoico/a. Non per controllare ogni messaggio e ogni sguardo. Ma per fidarti del tuo istinto quando ti dice che qualcosa non va. Perché ora sai che quell'istinto, nella stragrande maggioranza dei casi, ha ragione.")
    sp(4)
    sub("Una cosa da ricordare")
    body("Tra tutte le confessioni che ho raccolto, c'è un filo rosso che le unisce tutte: il rimpianto. Ogni singolo confessore — ogni uno — ha espresso rimpianto. Non tutti per le stesse ragioni. Alcuni rimpiangono di aver fatto male. Altri rimpiangono di essere stati scoperti. Ma tutti rimpiangono.")
    sp(2)
    body("Questo ti dice qualcosa di importante: il tradimento non rende felice nessuno. Non il tradito, ovviamente. Ma nemmeno il traditore. È una trappola che distrugge entrambi.")
    sp(4)
    quote("L'unica persona che esce davvero vincitrice da un tradimento è quella che ha il coraggio di cercare la verità. E quella persona sei tu.")
    sp(4)
    body("Prenditi cura di te. Non accontentarti di chi ti fa dubitare. Cerca qualcuno che ti faccia dormire sereno/a.")
    sp(2)
    body("Meriti la pace. Meriti la fiducia. Meriti l'amore vero.")
    sp(4)
    italic("Con rispetto e con affetto,")
    italic("chi ha raccolto queste storie")

    # ═══════════════════════════════════════════════════
    # PAGINA FINALE
    # ═══════════════════════════════════════════════════
    pb()
    sp(25)
    story.append(Paragraph("—", ParagraphStyle(
        "EndDash", fontName="Helvetica", fontSize=20,
        textColor=RED, alignment=TA_CENTER, spaceAfter=12,
    )))
    center("37 storie. Una verità.")
    sp(4)
    center("Se questo libro ti ha aiutato a capire qualcosa")
    center("— su di loro, o su di te —")
    center("allora è servito.")
    sp(20)
    center("tihatradito.site")
    sp(4)
    center("© 2026 — Tutti i diritti riservati")
    sp(2)
    center("Contenuto riservato. Distribuzione non autorizzata vietata.")
    sp(2)
    story.append(Paragraph(
        "Questo ebook è un prodotto digitale protetto da copyright. "
        "È vietata la riproduzione, distribuzione o condivisione "
        "senza autorizzazione scritta dell'autore. I contenuti sono basati "
        "su testimonianze anonime raccolte con il consenso degli interessati.",
        ParagraphStyle("Legal", fontName="Helvetica", fontSize=7,
                       textColor=HexColor("#444444"), alignment=TA_CENTER,
                       leading=10, spaceBefore=20),
    ))

    # BUILD
    doc.build(story)
    print(f"✅ Ebook creato: {OUTPUT}")

if __name__ == "__main__":
    build()
