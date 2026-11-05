# Algoritmi & Strutture Dati — Visualizzatore Interattivo

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![KaTeX](https://img.shields.io/badge/KaTeX-007A78?style=for-the-badge&logo=latex&logoColor=white)
![UNICT](https://img.shields.io/badge/UNICT-DMI-0284c7?style=for-the-badge)

> 🔗 **Piattaforma Online:** [algoritmi-e-strutture-dati.vercel.app](https://algoritmi-e-strutture-dati-six.vercel.app/)

Piattaforma web interattiva e reattiva progettata per lo studio, l'analisi atomica passo-passo e la verifica formale degli algoritmi classici e delle strutture dati. 

Il progetto affianca l'esecuzione visiva dello pseudocodice al rigore teorico universitario, integrando dimostrazioni asintotiche, invarianti di ciclo e tipografia matematica renderizzata in-browser tramite KaTeX.

---

## Panoramica dei Moduli Didattici

L'applicazione organizza gli algoritmi secondo la progressione didattica accademica:

### Modulo 00: Ordinamento Classico & Fondamentale
- **Bubble Sort:** Tracciamento dei confronti adiacenti e propagazione controllata del massimo.
- **Selection Sort (Iterativo & Ricorsivo):** Selezione del minimo locale sul vettore non ordinato e swap sequenziale.
- **Insertion Sort (Iterativo & Ricorsivo):** Inserimento ordinato con shift degli elementi maggiori nel prefisso già stabilizzato.
- **Quick Sort:** Partizionamento in-place basato sullo schema di Lomuto, evidenziazione del pivot e ramificazione ricorsiva.

### Modulo 01: Divide et Impera & Selezione
- **Merge Sort:** Algoritmo divide et impera con ricorsione strutturata e procedura di fusione `Merge` a tempo lineare.
- **Randomized-Select:** Selezione in tempo lineare medio del $k$-esimo elemento più piccolo tramite pivot randomizzato.
- **Binary Search:** Ricerca dicotomica su collezioni ordinate con dimezzamento continuo dello spazio di ricerca.

### Modulo 02: Strutture ad Heap
- **Max-Heapify:** Ripristino della proprietà strutturale di heap massimo con discesa e scambi tra nodi e figli.
- **Build-Max-Heap:** Costruzione bottom-up a tempo lineare $\mathcal{O}(n)$ a partire dai nodi non foglia.
- **Heap-Sort:** Ordinamento in-place mediante estrazione sistematica del massimo dalla radice e compattazione finale.
- **Code con Priorità:** Tracciamento delle operazioni primarie di estrazione del massimo e incremento chiave (`Increase-Key`).

### Modulo 03: Ordinamento Lineare
- **Counting Sort (Standard):** Algoritmo stabile basato su array ausiliari di frequenze cumulative $C$ e output $B$ in $\Theta(n + k)$.
- **Counting Sort (In-Place):** Variante ad occupazione di memoria ausiliaria minima a scapito della stabilità.
- **Radix Sort (LSD):** Ordinamento lineare su chiavi composte cifra per cifra (Least Significant Digit).
- **Bucket Sort:** Ripartizione uniforme su bucket ausiliari e ordinamento parziale con densità bilanciata.

### Modulo 04: Tabelle Hash *(In arrivo)*
- Trattazione delle collisioni tramite liste concatenate e tecniche di indirizzamento aperto.

---

## Caratteristiche Tecniche & UI/UX

- **Interfaccia Sincrona a Due Pannelli:** Pannello visuale interattivo a sinistra e pannello di tracciamento atomico del codice/teoria a destra.
- **Tipografia Matematica KaTeX:** Rendering ad alte prestazioni di sommatorie, relazioni di ricorrenza, serie geometriche e dimostrazioni formali.
- **Layout Flessibile & Zoom-Safe:** Gestione reattiva con altezze dinamiche (`clamp`) e barre di scorrimento stilizzate a tema per evitare overflow o tagli di testo a qualsiasi livello di zoom.
- **Changelog & Patch Notes Integrati:** Modal informativo con storico delle release e collegamenti diretti all'albero dei commit di GitHub.

---

## Struttura del Progetto

```text
├── src/
│   ├── algoritmi/             # Componenti React visuali dei singoli algoritmi
│   ├── data/
│   │   ├── archivioAlgoritmi.js   # Database teorico (invarianti, complessità, formule KaTeX)
│   │   └── patchNotes.js          # Changelog versionato e riferimenti ai commit
│   ├── App.jsx                # Layout hub principale, navigazione moduli e modali
│   ├── main.jsx               # Entry point di React
│   └── index.css              # Reset e direttive CSS globali
├── index.html                 # Template base
├── package.json               # Configurazione pacchetti e dipendenze
└── vite.config.js             # Configurazione bundler Vite
```

---

## Installazione & Esecuzione in Locale

1. **Clona il repository:**
   ```bash
   git clone https://github.com/salvo-marino/algoritmi-e-strutture-dati.git
   cd algoritmi-e-strutture-dati
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **Avvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

4. **Compila per la produzione:**
   ```bash
   npm run build
   ```

---

## Contesto Didattico & Attribuzione

- **Autore:** Salvatore Pio Marino
- **Ambito:** Corso di *Algoritmi e Laboratorio* (Laurea Triennale in Informatica, DMI — Università degli Studi di Catania).
- **Sviluppo:** Sviluppato con l'ausilio di modelli di intelligenza artificiale per l'architettura dei componenti, la stesura teorica formale e il rendering matematico.
- **Licenza:** Progetto ad uso esclusivamente didattico e personale. Tutti i diritti riservati.