# Planungsprompt: Interaktive Produkt-Roadmap-Visualisierung

Erstelle einen detaillierten technischen Implementierungsplan fuer eine **webbasierte, interaktive Produkt-Roadmap-Visualisierungs-App**. Die App dient dazu, Produktteams eine visuell ansprechende Darstellung ihrer Roadmap zu bieten, die sowohl fuer die interne Planung als auch fuer Praesentationen gegenueber Stakeholdern und Kunden geeignet ist.

---

## Kernfunktionalitaet

### 1. Hierarchisches Knotensystem (Nodes)

Die Roadmap besteht aus einem hierarchischen Baum von Knoten mit mindestens drei Ebenen:

- **Ziele (Goals):** Oberste Ebene. Beschreiben das gewuenschte Ergebnis aus Nutzersicht (z.B. "Nutzer soll Daten exportieren koennen").
- **Features:** Mittlere Ebene, gehoeren zu einem Ziel. Beschreiben konkrete Produktfeatures (z.B. "Tabellenansicht mit Filteroptionen").
- **Tasks:** Unterste Ebene, gehoeren zu einem Feature. Beschreiben technische Arbeitspakete (z.B. "Backend-Endpunkt programmieren", "API anpassen", "Frontend implementieren").

Jeder Knoten hat folgende Eigenschaften:
- **Titel** (Pflicht)
- **Beschreibung** (optional, Freitext)
- **Status:** Einer von drei Zustaenden:
  - `abgeschlossen` (visuell: z.B. gruen, durchgestrichen oder abgehakt)
  - `in_bearbeitung` (visuell: z.B. blau/gelb, animiert/pulsierend)
  - `geplant` (visuell: z.B. grau/gestrichelt)
- **Prioritaet** (nur bei Status `geplant`): z.B. `hoch`, `mittel`, `niedrig` - visuell unterscheidbar (Farbe, Icon, Groesse)
- **Kinder-Knoten** (rekursiv, beliebige Tiefe moeglich)

### 2. Kanten (Edges) und Abhaengigkeiten

- Knoten koennen durch **gerichtete Kanten** verbunden werden, um Reihenfolge/Abhaengigkeiten darzustellen.
- Kanten existieren sowohl zwischen Geschwister-Knoten (z.B. Feature A muss vor Feature B fertig sein) als auch ebenenuebergreifend.
- Kanten sollen visuell klar erkennbar sein (Pfeile, ggf. unterschiedliche Stile fuer verschiedene Abhaengigkeitstypen).

### 3. Clustering und Ein-/Ausklappen

- **Thematisches Clustering:** Knoten koennen nach Themen gruppiert werden (z.B. alle Features rund um "Datenexport" unter einem Ziel-Knoten).
- **Collapse/Expand:** Uebergeordnete Knoten koennen eingeklappt werden, sodass nur der Parent-Knoten sichtbar ist. Der Parent-Knoten zeigt dann aggregierte Informationen an (z.B. "3/7 Tasks abgeschlossen").
- Im eingeklappten Zustand soll der Fortschritt visuell sichtbar sein (z.B. Fortschrittsbalken, Kreisdiagramm).

### 4. Interaktive Navigation ("Fliegen ueber die Roadmap")

- Die Roadmap wird auf einem grossen, frei navigierbaren **Canvas/2D-Raum** dargestellt.
- **Pan & Zoom:** Nutzer koennen frei navigieren (Drag, Scroll-Zoom, Pinch-Zoom auf Touch-Geraeten).
- **Smooth Animations:** Alle Uebergaenge (Zoom, Pan, Collapse/Expand) sollen fluesssig animiert sein.
- **Minimap:** Eine kleine Uebersichtskarte zeigt die aktuelle Position auf dem Gesamtgraphen.
- **Fokus-Navigation:** Klick auf einen Knoten zentriert und zoomt auf diesen Bereich.
- Optional: **Praesentationsmodus** - automatisches Durchfliegen der Roadmap entlang einer definierten Route (z.B. alle Ziele nacheinander).

### 5. Bearbeitungsfunktionen (CRUD)

- **Knoten erstellen:** Per Klick/Button neue Knoten hinzufuegen (auf jeder Ebene).
- **Knoten bearbeiten:** Titel, Beschreibung, Status und Prioritaet inline oder per Modal editieren.
- **Knoten loeschen:** Mit Bestaetigung, inkl. Handling der Kinder-Knoten.
- **Kanten erstellen/loeschen:** Drag-and-Drop zwischen Knoten oder per Kontextmenue.
- **Knoten verschieben:** Drag-and-Drop zum Umordnen und Reparenting.

### 6. JSON-Export und -Import

- Die gesamte Projektkonfiguration (Knoten, Kanten, Positionen, Zoom-Level, Cluster-Zustaende) kann als **JSON-Datei heruntergeladen** werden.
- Eine JSON-Datei kann **importiert** werden, um ein Projekt wiederherzustellen oder zu teilen.
- Das JSON-Schema soll dokumentiert und stabil sein.
- Validierung beim Import mit hilfreichen Fehlermeldungen.

---

## Visuelle Anforderungen (Praesentationsqualitaet)

- **Modernes, cleanes Design** - geeignet fuer Praesentationen vor Kunden und Stakeholdern.
- **Farbkodierung** fuer Status und Prioritaet, konsistent und zugaenglich (Farbenblindheit beruecksichtigen).
- **Typografie:** Klare Hierarchie durch Schriftgroessen und -gewichte.
- **Animationen:** Subtile, professionelle Uebergaenge (kein "Spielzeug"-Gefuehl).
- **Dark/Light Mode** (mindestens einer, idealerweise umschaltbar).
- **Responsive:** Funktioniert auf Desktop (primaer) und Tablet.

---

## Technische Rahmenbedingungen

- **Reine Frontend-App** (kein Backend noetig, alles im Browser, Persistenz ueber JSON-Export/Import und optional LocalStorage).
- **Single Page Application (SPA).**
- Waehle einen geeigneten Tech-Stack und begruende die Entscheidung. Moegliche Optionen:
  - **Framework:** React, Vue, Svelte oder Vanilla
  - **Canvas/Graph-Rendering:** React Flow, D3.js, Cytoscape.js, Pixi.js, HTML5 Canvas, SVG oder eine Kombination
  - **State Management:** Zustand, Redux, Pinia oder framework-nativ
  - **Styling:** Tailwind CSS, CSS Modules, Styled Components oder aehnlich
  - **Build-Tool:** Vite
- Die App soll **performant** sein, auch bei groesseren Roadmaps (50-200 Knoten).
- **Keine externen Dienste oder Accounts** noetig - alles laeuft lokal im Browser.

---

## Deliverables des Plans

Der Plan soll folgende Abschnitte enthalten:

1. **Tech-Stack-Entscheidung** mit Begruendung fuer jede Komponente
2. **Datenmodell** (TypeScript-Interfaces fuer Nodes, Edges, Project)
3. **Komponentenarchitektur** (Uebersicht der UI-Komponenten und deren Zusammenspiel)
4. **Implementierungsreihenfolge** (Phasen/Meilensteine, was wird zuerst gebaut)
5. **Layout-Algorithmus-Strategie** (wie werden die Knoten automatisch angeordnet, wie funktioniert manuelles Positionieren)
6. **Interaktionskonzept** (wie funktioniert Navigation, Editing, Drag-and-Drop)
7. **JSON-Schema-Entwurf** fuer Export/Import
8. **Offene Fragen und Designentscheidungen** die noch getroffen werden muessen

---

## Wichtige Hinweise

- Der Plan soll so detailliert sein, dass ein Entwickler direkt mit der Implementierung beginnen kann.
- Bevorzuge pragmatische Loesungen gegenueber Over-Engineering.
- Die App muss ohne Backend funktionieren - alles Client-side.
- Praesentationsqualitaet der Visualisierung hat hohe Prioritaet.
- Performance bei mittleren Datenmengen (bis 200 Knoten) muss gewaehrleistet sein.
