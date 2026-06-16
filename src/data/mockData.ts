import { GuideArticle, ChecklistItem, Recipe, DeficitItem, TaskItem, TeamMember, Shift } from "../types";

export const initialArticles: GuideArticle[] = [
  {
    id: "g1",
    category: "prozesse",
    title: "Morgen-Öffnung des Standes",
    question: "Wie wird der Stand morgens geöffnet?",
    answer: "1. Vorhänge & Rollläden hochziehen und arretieren. 2. Hauptschlüssel befindet sich im Safe Code ****. 3. Sofort die Sandwichgrills einschalten (WICHTIG: Sie benötigen ca. 20 Minuten Aufheizzeit!). 4. Wasserzulauf in der Vorbereitungsküche prüfen. 5. Kasse mit Wechselgeld aus dem Tresor bestücken (Startbestand: 150,00 EUR in Münzen/kleinen Scheinen).",
    tags: ["Öffnung", "Morgen", "Grill", "Kasse", "Vormittag"]
  },
  {
    id: "g2",
    category: "hygiene",
    title: "Kühlungs- & Lagerungsstandards am Abend",
    question: "Wie lagere ich den Käse am Abend ein?",
    answer: "Alle offenen Käselaibe und -stücke müssen abends luftdicht in Spezialpapier verpackt werden. Gorgonzola und Roquefort unbedingt in separaten Boxen lagern, damit sich der Edelpilz nicht auf den Camembert, Brie oder Pecorino überträgt. Die Boxen kommen in Kühlschrank 3 & 4 (Zieltemperatur: 4-6°C). Mozzarella verbleibt in der Salzlake im gekühlten Gastro-Behälter.",
    tags: ["Käse", "Kühlung", "Hygiene", "Abend", "Aufräumen"]
  },
  {
    id: "g3",
    category: "geraete",
    title: "Sandwichgrills reinigen & pflegen",
    question: "Wie reinige ich den Panini-Grill nach Betriebsschluss?",
    answer: "1. Grill ausschalten und auf ca. 60°C abkühlen lassen (handwarm bis heiß, nicht brennend). 2. Grobe Reste mit der Messingbürste vorsichtig abkratzen. 3. Mit feuchtem Mikrofasertuch und einer Prise Kaffeemaschinenreiniger oder Seifenwasser auswischen. 4. Keine aggressiven Scheuermittel auf den gusseisernen Platten verwenden. Zum Schluss hauchdünn mit Speiseöl einreiben, um Rost vorzubeugen.",
    tags: ["Grill", "Reinigung", "Abend", "Geräte"]
  },
  {
    id: "g4",
    category: "allgemein",
    title: "Überblick Standbereiche Viktualienmarkt",
    question: "Wie ist der Stand aufgeteilt?",
    answer: "Unser Stand unterteilt sich in zwei Zonen. AUSSENBEREICH: 1. Käseverkauf ungekühlt (nur Hartkäse wie gereifter Pecorino oder Grana bis max 20°C Lufttemperatur, falls wärmer, alles in die Theke!). 2. Käseverkauf gekühlt mit zwei Theken (Weichkäse, feuchter Frischkäse). 3. Sandwichverkauf mit Theke und den zwei Grillstationen (Sichtbar für Kunden). 4. Insgesamt 6 Kühlschränke (Nummeriert von 1 bis 6). INNENBEREICH: Vorbereitungsküche zum Schneiden, Belegen und Spülen.",
    tags: ["Stand", "Bereiche", "Infrastruktur", "Kühlschränke"]
  },
  {
    id: "g5",
    category: "notfall",
    title: "Stromausfall oder Kühlketten-Warnung",
    question: "Was tue ich, wenn ein Kühlschrank ausfällt?",
    answer: "1. Ruhe bewahren und am Hauptverteiler (Innenraum hinter der Tür) prüfen, ob die Sicherung herausgesprungen ist. 2. Wenn der Fehler nicht behebbar ist, verschiebe den empfindlichen Käse (Mozzarella, Brie, Camembert) sofort in die anderen funktionierenden Kühlschränke. 3. Kontaktiere umgehend den Standleiter Luigino (Schnellwahl in der App) oder den Haustechniker des Viktualienmarktes.",
    tags: ["Notfall", "Strom", "Sicherung", "Kühlung"]
  }
];

export const initialFruehChecklist: ChecklistItem[] = [
  { id: "cf1", task: "Laden aufsperren", detail: "Hauptschloss am Rollladen links öffnen, Schlüssel im Safe hinterlegen.", requiredTime: "08:45 Uhr", completed: false },
  { id: "cf2", task: "Sandwichgrills einschalten", detail: "WICHTIG: Beide Grills auf Stufe 3 (220°C) einstellen. Brauchen 20 Min zum Heizen.", requiredTime: "08:50 Uhr", completed: false },
  { id: "cf3", task: "Kassenschublade vorbereiten", detail: "150€ Wechselgeld einzählen und Kassensoftware starten.", requiredTime: "08:55 Uhr", completed: false },
  { id: "cf4", task: "Frischwarenkontrolle Vitrine", detail: "Ausschuss prüfen, Vitrine feucht auswischen und neu bestücken.", requiredTime: "09:05 Uhr", completed: false },
  { id: "cf5", task: "Kaffee-Vollautomat starten", detail: "Spülung durchführen, Bohnen und Wasser auffüllen, Tassen bereitstellen.", requiredTime: "09:15 Uhr", completed: false },
  { id: "cf6", task: "Außenstehtische aufbauen", detail: "3 Stehtische raustragen, mit Menükarten bestücken, Kreidetafel beschriften.", requiredTime: "09:30 Uhr", completed: false }
];

export const initialSpaetChecklist: ChecklistItem[] = [
  { id: "cs1", task: "Frischware ausräumen", detail: "Alle Weichkäse und belegten Rest-Sandwiches luftdicht verpacken und in Kühlung einräumen.", requiredTime: "18:05 Uhr", completed: false },
  { id: "cs2", task: "Paninigrills reinigen", detail: "Mit Bürste schrubben, feucht nachwischen und hauchdünn einölen.", requiredTime: "18:15 Uhr", completed: false },
  { id: "cs3", task: "Kassenschluss durchführen", detail: "Tagesumsatz in Umschlag zählen, Kassenbeleg drucken & im Logbuch eintragen. 150€ Wechselgeld in Kasse belassen.", requiredTime: "18:25 Uhr", completed: false },
  { id: "cs4", task: "Spüldienst Küche abschließen", detail: "Alle Gastro-Norm-Behälter in die Spülmaschine, Arbeitsflächen desinfizieren.", requiredTime: "18:40 Uhr", completed: false },
  { id: "cs5", task: "Müllentsorgung", detail: "Bio- und Restmüll in die Container des Viktualienmarktes bringen (Schlüsselbund mitnehmen!).", requiredTime: "18:50 Uhr", completed: false },
  { id: "cs6", task: "Stand absperren und Alarmanlage", detail: "Alle Lichter aus, 6 Kühlschränke prüfen (Türen fest geschlossen?), Rollläden verriegeln, zusperren.", requiredTime: "19:00 Uhr", completed: false }
];

export const initialRecipes: Recipe[] = [
  {
    id: "r1",
    name: "Panino Luigino II Classico",
    type: "sandwich",
    ingredients: [
      "Frische Ciabatta (rustikal rustico)",
      "Prosciutto di Parma G.U. (24 Monate gereift)",
      "Büffelmozzarella Campana G.G.A.",
      "Frische Eiertomaten",
      "Hausgemachtes Pesto Genovese (Basilikum, Pinienkerne, Olivenöl)",
      "Etwas wilder Rucola"
    ],
    steps: [
      "Das Ciabatta-Brötchen waagerecht halbieren (Messer flach führen).",
      "Unterseite großzügig mit ca. 1,5 Teelöffeln hausgemachtem grünen Pesto bestreichen.",
      "Zwei dünne Scheiben Tomaten auf dem Pesto betten (verhindert das Durchweichen der Kruste).",
      "Den Büffelmozzarella in dünne Scheiben schneiden und gleichmäßig verteilen (ca. 70g).",
      "Mit ca. 30g Parma-Schinken locker gefaltet bedecken (nicht flachpressen!).",
      "Eine kleine Handvoll frischen Rucola darauflegen und mit der oberen Brötchenhälfte schließen.",
      "Im heißen Panini-Grill exakt 3-4 Minuten rösten, bis der Käse schmilzt und das Brot knusprige Grillrillen zeigt.",
      "Diagonal halbieren und auf Luiginos Pergamentpapier servieren."
    ],
    allergens: ["A (Weizen)", "G (Milch/Laktose)", "H (Pinienkerne)"],
    visualTips: "Der Schinken darf nicht heraushängen und verbrennen. Das Sandwich muss goldbraun, kross, aber innen saftig schmelzend sein.",
    storageRule: "Ciabatta wird täglich frisch um 08:30 Uhr geliefert. Mozzarella immer in Kiste 2 (unten) lagern. Belegte Sandwiches dürfen maximal 4 Stunden ungegrillt in der Theke liegen, ansonsten aussortieren.",
    imagePlaceholderColor: "bg-emerald-950"
  },
  {
    id: "r2",
    name: "Panino Trufola e Pecorino",
    type: "sandwich",
    ingredients: [
      "Oliven-Ciabatta",
      "Trüffel-Salami (Salamino al Tartufo)",
      "Pecorino Toscano G.U. (mittelalt, fein gehobelt)",
      "Getrocknete Tomaten in Kräuteröl",
      "Frischer Thymian und Crema di Balsamico"
    ],
    steps: [
      "Oliven-Ciabatta aufschneiden und beide Seiten hauchdünn mit Olivenöl der getrockneten Tomaten bepinseln.",
      "4 feine Scheiben Trüffelsalami fächerförmig auflegen.",
      "3 Scheiben getrocknete Tomaten (gut abgetropft) verteilen.",
      "Den Pecorino Toscano mit dem Sparschäler in feine Späne direkt auf die Tomaten hobeln.",
      "Mit 2-3 Tropfen hochwertiger, dicker Crema di Balsamico beträufeln und ein paar Blättchen frischen Thymian darüber zupfen.",
      "Zusammenklappen und 2 Minuten auf mittlerer Stufe toasten. Der Pecorino soll nur leicht anschmelzen und cremig werden, nicht komplett davonfließen."
    ],
    allergens: ["A (Weizen)", "G (Milch/Laktose)"],
    visualTips: "Präsentiere dieses Sandwich aufgeschnitten in der Vitrine, sodass die weiße Pecorino-Schicht im Kontrast zur dunklen Trüffelsalami gut zu sehen ist.",
    storageRule: "Der Pecorino wird im Kühlschrank 2 aufbewahrt. Salami trocken im Hängeregal lagern.",
    imagePlaceholderColor: "bg-amber-900"
  },
  {
    id: "r3",
    name: "Panino Dolce Gorgonzola",
    type: "sandwich",
    ingredients: [
      "Walnuss-Ciabatta",
      "Gorgonzola Dolce G.U. (cremiger Blauschimmel)",
      "Frische Birnenspalten (hauchdünn)",
      "Waldhonig (flüssig)",
      "Frischer Babyspinat"
    ],
    steps: [
      "Walnuss-Ciabatta halbieren.",
      "Auf die Unterseite ca. 50g Gorgonzola Dolce gleichmäßig verstreichen.",
      "Die Birnenspalten leicht überlappend darauflegen.",
      "Hauchdünn mit etwas flüssigem Waldhonig fadenartig beträufeln.",
      "Mit einer Handvoll gewaschenem Babyspinat garnieren.",
      "Schließen und sehr vorsichtig grillen (nur 90 Sekunden auf niedriger Hitze!), da der Gorgonzola extrem schnell schmilzt."
    ],
    allergens: ["A (Weizen/Walnuss)", "G (Milch)", "H (Schalenfrüchte)"],
    visualTips: "Die Birne sorgt für die fruchtige Süße. In der Vitrine mit einem kleinen Zettel 'Empfehlung des Hauses' kennzeichnen.",
    storageRule: "Gorgonzola Dolce muss im Kühlschrank 4 gelagert werden und darf unter keinen Umständen mit Camembert/Brie in Berührung kommen (Gefahr der Kreuzkontamination von Kulturen).",
    imagePlaceholderColor: "bg-teal-900"
  },
  {
    id: "r4",
    name: "Viktualienmarkt Delikatess-Platte (Käseauswahl)",
    type: "kaeseplatte",
    ingredients: [
      "Gorgonzola Dolce (cremig, mild)",
      "Pecorino Romano (würzig, hart)",
      "Camembert di Bufala (cremig, mild)",
      "Münchner Kräuterbrie",
      "Eine Handvoll grüne Riesenoliven (Bella di Cerignola)",
      "Frische Weintrauben & Walnusskerne",
      "Hausgemachte Feigensenf-Sauce"
    ],
    steps: [
      "Eine schwere Schieferplatte mit Ölpapier auslegen.",
      "Pecorino Romano in mundgerechte Ecken brechen (nicht schneiden, brechen betont das Aroma!).",
      "Gorgonzola, Kräuterbrie und Büffelcamembert jeweils in 2 formschöne Dreiecke/Spalten schneiden und sternförmig anordnen.",
      "In die Mitte eine kleine Porzellan-Schale mit Feigensenf platzieren.",
      "Die Lücken liebevoll mit Oliven, Weintrauben und Walnüssen dekorieren.",
      "Mit zwei Holz-Piksern und einer Handvoll Grissini servieren."
    ],
    allergens: ["G (Milch)", "H (Nüsse/Walnüsse)", "M (Senf/Feigensenf)"],
    visualTips: "Die Schieferplatte muss makellos sauber sein. Die Käseecken müssen frisch angeschnitten wirken, kein Schweißfilm auf der Oberfläche.",
    storageRule: "Platten werden immer frisch auf Bestellung zubereitet. Niemals im Voraus anrichten. Alle Käsesorten müssen vor dem Anrichten 15 Minuten Zimmertemperatur annehmen, damit sich das Aroma entfaltet.",
    imagePlaceholderColor: "bg-stone-800"
  }
];

export const initialDeficits: DeficitItem[] = [
  { id: "d1", item: "Panino Classico", type: "sandwich", priority: "hoch", status: "fehlt", timestamp: "11:30" },
  { id: "d2", item: "Panino Trufola", type: "sandwich", priority: "mittel", status: "produktion", timestamp: "11:42" },
  { id: "d3", item: "Pecorino Toscano (Laib)", type: "kaese", priority: "niedrig", status: "fehlt", timestamp: "11:50" },
  { id: "d4", item: "Panino Dolce Gorgonzola", type: "sandwich", priority: "hoch", status: "bereit", timestamp: "11:15" }
];

export const initialTasks: TaskItem[] = [
  { id: "t1", title: "Müllbehälter entleeren", shift: "spaet", priority: "mittel", completed: false },
  { id: "t2", task: "Vitrinen-Glastür innen wischen", shift: "allgemein", priority: "niedrig", completed: true } as any, // fallback
  { id: "t3", title: "Milch für Kaffee auffüllen", shift: "frueh", priority: "hoch", completed: false },
  { id: "t4", title: "Sandwichbrot-Lieferung kontrollieren", shift: "frueh", priority: "hoch", completed: true },
  { id: "t5", title: "Pesto Genovese nachproduzieren", shift: "allgemein", priority: "mittel", completed: false },
  { id: "t6", title: "Temperatur-Logbuch ausfüllen", shift: "spaet", priority: "hoch", completed: false }
];

export const initialTeam: TeamMember[] = [
  { id: "m1", name: "Luigino", role: "Standinhaber / Chef", phone: "+49 171 1234567", color: "bg-emerald-600" },
  { id: "m2", name: "Marco", role: "Küchenchef / Produktion", phone: "+49 172 9876543", color: "bg-blue-600" },
  { id: "m3", name: "Francesca", role: "Theken-Leitung / Service", phone: "+49 176 5554433", color: "bg-rose-600" },
  { id: "m4", name: "Matteo", role: "Aushilfe (Morgenschicht)", phone: "+49 151 2223344", color: "bg-amber-600" },
  { id: "m5", name: "Sofia", role: "Aushilfe (Abendschicht)", phone: "+49 160 8887766", color: "bg-purple-600" }
];

export const initialShifts: Shift[] = [
  { day: "Montag", frueh: "Matteo", spaet: "Francesca", produktion: "Marco" },
  { day: "Dienstag", frueh: "Matteo", spaet: "Francesca", produktion: "Luigino" },
  { day: "Mittwoch", frueh: "Francesca", spaet: "Sofia", produktion: "Marco" },
  { day: "Donnerstag", frueh: "Matteo", spaet: "Sofia", produktion: "Marco" },
  { day: "Freitag", frueh: "Francesca", spaet: "Sofia", produktion: "Marco + Luigino" },
  { day: "Samstag", frueh: "Matteo + Francesca", spaet: "Sofia + Luigino", produktion: "Marco" }
];
