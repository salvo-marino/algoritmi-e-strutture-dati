export const ARCHIVIO_ALGORITMI = {
  // ==========================================
  // MODULO 00: ORDINAMENTO CLASSICO ED ELEMENTARE
  // ==========================================
  'bubble-sort': {
    titolo: 'BUBBLE-SORT(A)',
    complessita: 'Θ(n²) pessimo/medio | Θ(n) ottimo con flag',
    spazio: 'Θ(1) ausiliario (in-place)',
    tipo: 'Stabile, In-place, A confronti',
    righe: [
      { id: 'BSORT-H', num: 'H1', text: '--- BUBBLE-SORT(A) ---' },
      { id: 'BSORT-1', num: 1, text: 'for i = 1 to A.length - 1' },
      { id: 'BSORT-2', num: 2, text: '    swapped = false' },
      { id: 'BSORT-3', num: 3, text: '    for j = A.length downto i + 1' },
      { id: 'BSORT-4', num: 4, text: '        if A[j] < A[j - 1]' },
      { id: 'BSORT-5', num: 5, text: '            scambia A[j] con A[j - 1]' },
      { id: 'BSORT-6', num: 6, text: '            swapped = true' },
      { id: 'BSORT-7', num: 7, text: '    if not swapped then break  // Early exit' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nL'input è una sequenza di $n$ elementi comparabili $A[1..n]$ residenti in memoria ad accesso casuale. Nessun vincolo preliminare sull'ordine delle chiavi.\n\n**Strategia Algoritmica:**\nBubble Sort ordina una sequenza mediante scansioni progressive e confronti sistematici tra coppie di elementi adiacenti. L'algoritmo si struttura su due cicli innestati:\n1. [cyan]Ciclo Esterno ($i$)[/cyan]: scandisce l'indice di destinazione da $1$ a $n - 1$. A ogni iterazione, l'obiettivo è collocare definitivamente in $A[i]$ l'elemento minimo della porzione disordinata residua $A[i..n]$.\n2. [cyan]Ciclo Interno ($j$)[/cyan]: scorre il vettore a ritroso partendo dall'ultimo elemento $A[n]$ fino a $A[i+1]$. A ogni passo confronta $A[j]$ con il suo predecessore immediato $A[j-1]$: se $A[j] < A[j-1]$, la coppia viene invertita. Tale operazione fa risalire verso l'indice $i$ il valore minimo come una bolla d'aria che affiora.\n\n**Ottimizzazione Early-Exit (Flag `swapped`):**\nSe durante un'intera esecuzione del ciclo interno non si verifica alcun scambio (`swapped = false`), l'algoritmo deduce che per ogni coppia adiacente vale $A[j-1] \\le A[j]$: la sequenza è già ordinata e il ciclo si arresta immediatamente evitando le successive iterazioni ridondanti.",
      invariante: "La correttezza si dimostra formalmente analizzando due invarianti distinti:\n\n**1. Invariante del Ciclo Interno (righe 3-6):**\nAll'inizio di ogni iterazione dell'indice $j$, l'elemento $A[j]$ è il minimo della porzione $A[j..n]$, ossia:\n$$A[j] = \\min\\{A[j], A[j+1], \\dots, A[n]\\}$$\n• [emerald]Inizializzazione[/emerald]: prima della prima iterazione, $j = n$. Il sotto-array $A[n..n]$ contiene un solo elemento, che coincide banalmente con il proprio minimo.\n• [emerald]Conservazione[/emerald]: se $A[j] < A[j-1]$, lo scambio colloca il valore minore in $A[j-1]$. Pertanto, decrementando $j$, il nuovo elemento $A[j-1]$ è garantito essere minore o uguale a tutti gli elementi nel suffisso $A[j..n]$.\n• [emerald]Conclusione[/emerald]: al termine del ciclo interno $j = i$. L'invariante certifica che $A[i]$ è il minimo assoluto del suffisso $A[i..n]$.\n\n**2. Invariante del Ciclo Esterno (riga 1):**\nAll'inizio di ogni iterazione dell'indice $i$:\n1. Il sotto-array $A[1..i-1]$ contiene gli $i-1$ elementi più piccoli dell'intero array, disposti in ordine non decrescente definitivo.\n2. Ciascun elemento di $A[1..i-1]$ è minore o uguale a ciascun elemento del suffisso $A[i..n]$.\n• [emerald]Inizializzazione[/emerald]: per $i = 1$, il sotto-array $A[1..0]$ è vuoto; la proposizione è vacuamente verificata.\n• [emerald]Conservazione[/emerald]: l'invariante del ciclo interno garantisce che l'esecuzione di $j$ estragga il minimo di $A[i..n]$ posizionandolo in $A[i]$. Poiché tale valore è $\\ge$ di tutti gli elementi in $A[1..i-1]$, il prefisso $A[1..i]$ risulterà ordinato e composto dai primi $i$ minimi assoluti.\n• [emerald]Conclusione[/emerald]: al termine $i = n$. Il prefisso $A[1..n-1]$ contiene gli $n-1$ elementi minimi ordinati. L'elemento rimasto in $A[n]$ è necessariamente il massimo assoluto: l'intero vettore $A[1..n]$ è ordinato.",
      dimostrazione: "**Analisi del Caso Peggiore (Array inversamente ordinato):** $[\\Theta(n^2)]$\nSe l'input è ordinato in senso decrescente, ogni confronto attiva uno scambio. Il numero complessivo di confronti ed esecuzioni del corpo interno è dato dalla sommatoria aritmetica:\n$$C(n) = \\sum_{i=1}^{n-1} (n - i) = \\sum_{k=1}^{n-1} k = \\frac{n(n - 1)}{2} = \\frac{n^2 - n}{2} = \\Theta(n^2)$$\nPoiché a ogni confronto segue uno scambio di costo $O(1)$, anche il numero di scambi è massimale e coincide con il numero totale di inversioni:\n$$S(n) = \\frac{n(n - 1)}{2} = \\Theta(n^2)$$\n\n**Analisi del Caso Medio:** $[\\Theta(n^2)]$\nAssumendo che l'input sia una permutazione casuale uniforme scelta tra le $n!$ permutazioni possibili, la probabilità che una generica coppia $(A[i], A[j])$ con $i < j$ formi un'inversione è esattamente pari a $1/2$. Il numero atteso di inversioni è:\n$$E[\\text{Inversioni}] = \\frac{1}{2} \\binom{n}{2} = \\frac{n(n - 1)}{4} = \\Theta(n^2)$$\nIl tempo medio rimane quindi quadratico sia per confronti che per scambi.\n\n**Analisi del Caso Migliore:** $[\\Theta(n)]$\nSe l'array di partenza è già ordinato in modo non decrescente, alla prima passata ($i=1$) il ciclo interno compie esattamente $n - 1$ confronti. Poiché la condizione $A[j] < A[j-1]$ risulta sempre falsa, il flag `swapped` permane a `false`. La verifica a riga 7 innesca il `break`, determinando un tempo di esecuzione strettamente lineare:\n$$T(n) = (n - 1) \\cdot \\Theta(1) = \\Theta(n)$$"
    }
  },
  'selection-sort': {
    titolo: 'SELECTION-SORT(A)',
    complessita: 'Θ(n²) in ogni caso (ottimo, medio, pessimo)',
    spazio: 'Θ(1) ausiliario (in-place)',
    tipo: 'Non stabile (nella versione standard), In-place',
    righe: [
      { id: 'SEL-H', num: 'H1', text: '--- SELECTION-SORT(A) ---' },
      { id: 'SEL-1', num: 1, text: 'n = A.length' },
      { id: 'SEL-2', num: 2, text: 'for i = 1 to n - 1' },
      { id: 'SEL-3', num: 3, text: '    min_idx = i' },
      { id: 'SEL-4', num: 4, text: '    for j = i + 1 to n' },
      { id: 'SEL-5', num: 5, text: '        if A[j] < A[min_idx]' },
      { id: 'SEL-6', num: 6, text: '            min_idx = j' },
      { id: 'SEL-7', num: 7, text: '    if min_idx ≠ i' },
      { id: 'SEL-8', num: 8, text: '        scambia A[i] con A[min_idx]' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nVettore di $n$ elementi $A[1..n]$ confrontabili mediante relazione d'ordine totale $\\le$.\n\n**Strategia Algoritmica:**\nSelection Sort suddivide concettualmente l'array in due porzioni distinte: un prefisso ordinato $A[1..i-1]$ e un suffisso ancora disordinato $A[i..n]$. L'algoritmo procede per passi sequenziali:\n1. [cyan]Selezione del Minimo[/cyan]: assume provvisoriamente che il minimo locale si trovi all'indice $i$ (`min_idx = i`). Con il ciclo interno scandisce tutti gli elementi $A[j]$ per $j \\in [i+1, n]$. Se trova un elemento strettamente minore di $A[\\text{min\\_idx}]$, aggiorna l'indice del minimo.\n2. [cyan]Scambio Selettivo[/cyan]: conclusa l'ispezione dell'intero suffisso, se $\\text{min\\_idx} \\ne i$, effettua un singolo scambio tra $A[i]$ e $A[\\text{min\\_idx}]$. L'elemento minimo viene così incastonato nella sua posizione finale definitiva $A[i]$.\n\n**Proprietà delle Scritture:**\nA differenza di Bubble Sort o Insertion Sort, Selection Sort compie **al più un singolo scambio per ogni iterazione esterna**, limitando il numero complessivo di scritture a $n - 1$.",
      invariante: "Invariante di ciclo for (riga 2):\nAll'inizio di ogni iterazione dell'indice $i$:\n1. Il sotto-vettore $A[1..i-1]$ contiene gli $i-1$ elementi più piccoli dell'intero array, disposti in ordine non decrescente definitivo.\n2. Ciascun elemento appartenente al suffisso $A[i..n]$ è maggiore o uguale a qualsiasi elemento contenuto nel prefisso consolidato $A[1..i-1]$:\n$$\\forall x \\in A[1..i-1], \\forall y \\in A[i..n] \\implies x \\le y$$\n\n• [emerald]Inizializzazione[/emerald]: prima della prima iterazione ($i=1$), il prefisso $A[1..0]$ è vuoto. La proposizione è banalmente soddisfatta per vacuità.\n• [emerald]Conservazione[/emerald]: assumiamo che l'invariante valga all'inizio dell'iterazione $i$. Il ciclo interno (righe 4-6) individua l'indice del minimo valore nell'insieme $\\{A[i], A[i+1], \\dots, A[n]\\}$. Dopo l'eventuale scambio a riga 8, la cella $A[i]$ contiene il minimo assoluto del suffisso, che per ipotesi è $\\ge$ di ogni valore in $A[1..i-1]$. Di conseguenza, all'inizio dell'iterazione $i+1$, il segmento $A[1..i]$ rispetta entrambe le proprietà dell'invariante.\n• [emerald]Conclusione[/emerald]: il ciclo termina quando $i = n$. Applicando l'invariante per $i = n$, il prefisso $A[1..n-1]$ contiene gli $n-1$ elementi minimi ordinati. L'elemento rimasto in $A[n]$ è necessariamente il massimo, certificando che l'intero vettore $A[1..n]$ è ordinato.",
      dimostrazione: "**Analisi del Numero di Confronti:**\nIl ciclo for interno viene eseguito invariabilmente da $j = i + 1$ fino a $n$, indipendentemente dalla configurazione iniziale o dal grado di ordinamento delle chiavi. Il numero complessivo di confronti è determinato dalla progressione aritmetica:\n$$C(n) = \\sum_{i=1}^{n-1} (n - i) = (n - 1) + (n - 2) + \\dots + 1 = \\frac{n(n - 1)}{2} = \\frac{n^2 - n}{2}$$\nNe consegue che la complessità temporale legata ai confronti è asintoticamente invariante:\n$$T_{\\text{confronti}}(n) = \\Theta(n^2) \\quad \\text{nel caso migliore, medio e peggiore}$$\n\n**Analisi del Numero di Scambi:**\nLo scambio viene invocato al più una volta per ciascuna iterazione del ciclo esterno:\n$$S(n) \\le n - 1 = O(n)$$\nNel caso migliore (array già ordinato) non viene eseguito alcuno scambio ($S(n) = 0$); nel caso peggiore vengono compiuti esattamente $n - 1$ scambi.\n\n**Motivazione della Non-Stabilità:**\nLo scambio a lungo raggio può scavalcare elementi di pari valore alterandone l'ordine relativo. Ad esempio, per la sequenza di chiavi $A = [2_a, 2_b, 1]$, al primo passo il minimo $1$ viene scambiato con $2_a$, generando $[1, 2_b, 2_a]$: la chiave $2_b$ precede ora $2_a$, violando la stabilità.",
      precondizione: "Vettore $A[1..n]$ di elementi appartenenti a un insieme con ordinamento totale $\\le$."
    }
  },
  'insertion-sort': {
    titolo: 'INSERTION-SORT(A)',
    complessita: 'Θ(n²) pessimo/medio | Θ(n) ottimo',
    spazio: 'Θ(1) ausiliario (in-place)',
    tipo: 'Stabile, In-place, Incrementale',
    righe: [
      { id: 'INS-H', num: 'H1', text: '--- INSERTION-SORT(A) ---' },
      { id: 'INS-1', num: 1, text: 'for j = 2 to A.length' },
      { id: 'INS-2', num: 2, text: '    key = A[j]' },
      { id: 'INS-3', num: 3, text: '    i = j - 1' },
      { id: 'INS-4', num: 4, text: '    while i > 0 and A[i] > key' },
      { id: 'INS-5', num: 5, text: '        A[i + 1] = A[i]' },
      { id: 'INS-6', num: 6, text: '        i = i - 1' },
      { id: 'INS-7', num: 7, text: '    A[i + 1] = key' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nSequenza di $n$ chiavi confrontabili $A[1..n]$.\n\n**Strategia Incrementale:**\nInsertion Sort costruisce la soluzione incrementando progressivamente la taglia del prefisso ordinato. A ogni iterazione del ciclo for (indice $j$), l'elemento $A[j]$ viene estratto e memorizzato nella variabile scalare `key`. L'algoritmo fa scorrere verso destra di una posizione tutti gli elementi del prefisso ordinato $A[1..j-1]$ che risultano strettamente maggiori di `key`, arrestandosi non appena incontra un elemento $\\le \\text{key}$ o il confine sinistro del vettore. Nella posizione liberata $A[i+1]$ viene inserita la chiave estratta.\n\n**Adattività all'Input:**\nL'algoritmo è fortemente sensibile all'ordine iniziale: se il vettore è parzialmente ordinato (ha un numero limitato di inversioni), il ciclo while compie pochissimi passi, rendendolo estremamente rapido.",
      invariante: "Invariante di ciclo for (riga 1):\nAll'inizio di ogni iterazione dell'indice $j$, il sotto-array $A[1..j-1]$ è formato dagli elementi originariamente presenti in tali posizioni, disposti in ordine non decrescente definitivo.\n\n• [emerald]Inizializzazione[/emerald]: prima della prima iterazione ($j = 2$), il sotto-array $A[1..j-1] = A[1..1]$ consiste di un singolo elemento. Un array unitario è per definizione ordinato.\n• [emerald]Conservazione[/emerald]: assumiamo che all'inizio dell'iterazione $j$ il segmento $A[1..j-1]$ sia ordinato. Il corpo del ciclo salva `key` $= A[j]$ e il ciclo while confronta `key` procedendo all'indietro da $i = j - 1$. Tutti gli elementi strettamente maggiori di `key` scalano di una posizione verso destra ($A[i+1] = A[i]$). All'uscita dal ciclo while, $A[i] \\le \\text{key}$ (oppure $i=0$); inserendo la chiave in $A[i+1]$, tutti gli elementi alla sua sinistra sono $\\le \\text{key}$ e tutti quelli alla sua destra sono $\\ge \\text{key}$. Il nuovo sotto-array $A[1..j]$ risulta quindi ordinato.\n• [emerald]Conclusione[/emerald]: il ciclo termina quando $j = n + 1$. Sostituendo $n + 1$ nell'invariante, otteniamo che il sotto-array $A[1..n]$ è composto dagli elementi originari disposti in ordine non decrescente.",
      dimostrazione: "**Analisi Formale per Riga di Codice:**\nSia $c_k$ il costo dell'istruzione $k$ e sia $t_j$ il numero di verifiche eseguite dalla guardia del ciclo while per l'iterazione $j$. Il tempo complessivo è espresso da:\n$$T(n) = c_1 n + c_2(n-1) + c_3(n-1) + c_4 \\sum_{j=2}^n t_j + c_5 \\sum_{j=2}^n (t_j - 1) + c_6 \\sum_{j=2}^n (t_j - 1) + c_7(n-1)$$\n\n**Caso Migliore (Array già ordinato):** $[\\Theta(n)]$\nSe $A[j-1] \\le A[j]$ per ogni $j$, la guardia del while fallisce al primo controllo: $t_j = 1$ per ogni $j$. Le sommatorie $\\sum (t_j - 1)$ si annullano, riducendo $T(n)$ a una funzione lineare:\n$$T(n) = (c_1 + c_2 + c_3 + c_4 + c_7)n - (c_2 + c_3 + c_4 + c_7) = \\Theta(n)$$\n\n**Caso Peggiore (Array inversamente ordinato):** $[\\Theta(n^2)]$\nOgni chiave $A[j]$ è minore di tutti gli elementi in $A[1..j-1]$, costringendo il while a scorrere l'intero prefisso: $t_j = j$. Le sommatorie valgono:\n$$\\sum_{j=2}^n j = \\frac{n(n + 1)}{2} - 1 = \\Theta(n^2) \\quad \\text{e} \\quad \\sum_{j=2}^n (j - 1) = \\frac{n(n - 1)}{2} = \\Theta(n^2)$$\nSostituendo nell'equazione di $T(n)$, i termini quadratici dominano: $T(n) = a n^2 + b n + c = \\Theta(n^2)$.\n\n**Caso Medio:** $[\\Theta(n^2)]$\nIn media, ciascun elemento $A[j]$ è minore di circa la metà degli elementi del prefisso ordinato, determinando $t_j = j/2$. Le sommatorie mantengono ordine di grandezza quadratico, confermando $E[T(n)] = \\Theta(n^2)$."
    }
  },
  'selection-sort-rec': {
    titolo: 'SELECTION-SORT-REC(A, i, n)',
    complessita: 'Θ(n²) tempo | Θ(n) stack ricorsivo',
    spazio: 'O(n) per record di attivazione',
    tipo: 'Non stabile, Ricorsivo induttivo',
    righe: [
      { id: 'SSR-H1', num: 'H1', text: '--- FIND-MIN-INDEX(A, i, n) ---' },
      { id: 'FMI-1',  num: 1, text: 'min = i' },
      { id: 'FMI-2',  num: 2, text: 'for j = i + 1 to n' },
      { id: 'FMI-3',  num: 3, text: '    if A[j] < A[min] then min = j' },
      { id: 'FMI-4',  num: 4, text: 'return min' },
      { id: 'SSR-H2', num: 'H2', text: '--- SELECTION-SORT-REC(A, i, n) ---' },
      { id: 'SSR-1',  num: 1, text: 'if i >= n then return' },
      { id: 'SSR-2',  num: 2, text: 'min_idx = FIND-MIN-INDEX(A, i, n)' },
      { id: 'SSR-3',  num: 3, text: 'if min_idx ≠ i then scambia A[i] con A[min_idx]' },
      { id: 'SSR-4',  num: 4, text: 'SELECTION-SORT-REC(A, i + 1, n)' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nVettore $A[1..n]$, indice iniziale $i \\in [1, n]$.\n\n**Architettura delle Procedure:**\nLa versione ricorsiva decompone la logica in due routine complementari:\n1. [cyan]FIND-MIN-INDEX(A, i, n)[/cyan]: procedura iterativa ausiliaria che accetta l'intervallo attivo $[i, n]$ e individua l'indice del minimo assoluto compiendo $n - i$ confronti lineari.\n2. [cyan]SELECTION-SORT-REC(A, i, n)[/cyan]: driver ricorsivo che incarna il passo induttivo. Se $i \\ge n$ la ricorsione si arresta; altrimenti invoca `FIND-MIN-INDEX` per individuare il minimo del suffisso, lo scambia con l'elemento $A[i]$ e richiama ricorsivamente se stesso con parametro $i + 1$ sul suffisso rimanente.",
      invariante: "Dimostrazione di correttezza per induzione forte sulla taglia del suffisso residuo $k = n - i + 1$:\n\n• [emerald]Base Induttiva ($k \\le 1$, ossia $i \\ge n$)[/emerald]:\nSe $i = n$, il suffisso $A[n..n]$ consta di un singolo elemento. Un array di cardinalità unitaria è banalmente ordinato: la procedura esegue il `return` a riga 1 senza compiere modifiche, risultando corretta.\n\n• [emerald]Passo Induttivo[/emerald]:\nAssumiamo per ipotesi induttiva che la chiamata `SELECTION-SORT-REC(A, i + 1, n)` ordini correttamente qualsiasi sotto-vettore di taglia $k - 1 = n - i$.\nAll'invocazione corrente con parametro $i$, la funzione `FIND-MIN-INDEX(A, i, n)` restituisce l'indice $\\text{min\\_idx}$ tale che:\n$$A[\\text{min\\_idx}] = \\min\\{A[i], A[i+1], \\dots, A[n]\\}$$\nDopo l'eventuale scambio a riga 3, l'elemento $A[i]$ è $\\le A[m]$ per ogni $m \\in [i+1, n]$.\nSuccessivamente viene invocata `SELECTION-SORT-REC(A, i + 1, n)`: per ipotesi induttiva, tale chiamata ordina gli elementi in $A[i+1..n]$. Poiché l'elemento in $A[i]$ è minore o uguale a ciascun elemento del suffisso, esso non verrà mai scavalcato né alterato, garantendo che l'intero segmento $A[i..n]$ risulti correttamente ordinato.",
      dimostrazione: "**Derivazione dell'Equazione di Ricorrenza:**\nLa chiamata a `FIND-MIN-INDEX(A, i, n)` esegue una scansione lineare su $n - i$ elementi richiedendo tempo $c \\cdot (n - i)$. Lo scambio e i controlli di guardia costano tempo costante $\\Theta(1)$.\nEsprimendo il costo in funzione della cardinalità residua $k = n - i + 1$:\n$$T(k) = T(k - 1) + c \\cdot k$$\ncon caso base $T(1) = \\Theta(1)$.\n\n**Risoluzione per Srotolamento (Metodo di Iterazione):**\n$$T(n) = T(n - 1) + c \\cdot n$$\n$$T(n) = [T(n - 2) + c(n - 1)] + c \\cdot n = T(n - 2) + c(n - 1) + c \\cdot n$$\n$$T(n) = T(1) + c \\sum_{j=2}^n j = \\Theta(1) + c \\left(\\frac{n(n + 1)}{2} - 1\\right) = \\Theta(n^2)$$\n\n**Occupazione di Spazio Ausiliario:**\nL'algoritmo non alloca strutture dati dinamiche ausiliarie nel heap, ma genera una catena di chiamate ricorsive annidate di profondità esattamente pari a $n$. Ciascun frame sullo stack di sistema memorizza i registri locali e i parametri ($A, i, n$), occupando spazio ausiliario $O(n)$."
    }
  },
  'insertion-sort-rec': {
    titolo: 'INSERTION-SORT-REC(A, n)',
    complessita: 'Θ(n²) pessimo/medio | Θ(n) ottimo',
    spazio: 'O(n) per record di attivazione',
    tipo: 'Stabile, Ricorsivo induttivo',
    righe: [
      { id: 'ISR-H1',     num: 'H1', text: '--- INSERT(A, p) ---' },
      { id: 'ISR-INS-1',  num: 1, text: 'key = A[p + 1]; i = p' },
      { id: 'ISR-INS-2',  num: 2, text: 'while i > 0 and A[i] > key' },
      { id: 'ISR-INS-3',  num: 3, text: '    A[i + 1] = A[i]; i = i - 1' },
      { id: 'ISR-INS-4',  num: 4, text: 'A[i + 1] = key' },
      { id: 'ISR-H2',     num: 'H2', text: '--- INSERTION-SORT-REC(A, n) ---' },
      { id: 'ISR-1',      num: 1, text: 'if n <= 1 then return' },
      { id: 'ISR-2',      num: 2, text: 'INSERTION-SORT-REC(A, n - 1)' },
      { id: 'ISR-3',      num: 3, text: 'INSERT(A, n - 1)' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nVettore $A[1..n]$ con $n \\ge 1$.\n\n**Meccanica di Risalita Induttiva:**\nA differenza della versione iterativa, la formulazione ricorsiva adotta una discesa in profondità fino al caso base, risolvendo il problema durante la fase di risalita:\n1. [cyan]Fase Discendente[/cyan]: `INSERTION-SORT-REC` richiama se stessa decrementando la taglia del problema ($n-1, n-2, \\dots$) finché non raggiunge la condizione base $n \\le 1$.\n2. [cyan]Fase di Risalita e Inserimento[/cyan]: al ritorno dalla chiamata su $n-1$, si assume induttivamente che il prefisso $A[1..n-1]$ sia ordinato. Viene quindi invocata la procedura ausiliaria `INSERT(A, n-1)`, che preleva la chiave $A[n]$ e la inserisce nella collocazione appropriata facendo scorrere verso destra gli elementi maggiori presenti in $A[1..n-1]$.",
      invariante: "Dimostrazione di correttezza per induzione matematica su $n$:\n\n• [emerald]Base Induttiva ($n = 1$)[/emerald]:\nSe $n = 1$, il sotto-array $A[1..1]$ contiene un singolo elemento, già ordinato. La funzione termina immediatamente a riga 1 senza modifiche.\n\n• [emerald]Passo Induttivo[/emerald]:\nAssumiamo per ipotesi induttiva che la chiamata `INSERTION-SORT-REC(A, n - 1)` ordini con successo il prefisso $A[1..n-1]$ in modo non decrescente.\nLa procedura `INSERT(A, n - 1)` opera con invariante analogo a quello dell'Insertion Sort iterativo: estrae `key` $= A[n]$ e fa scorrere verso destra tutti e soli gli elementi del prefisso ordinato che risultano strettamente maggiori di `key`. Al termine del ciclo while, la chiave viene posizionata nell'indice $i + 1$, garantendo che tutti gli elementi alla sua sinistra siano $\\le \\text{key}$ e tutti quelli alla sua destra siano $\\ge \\text{key}$. L'intero array $A[1..n]$ risulta così ordinato in modo non decrescente.",
      dimostrazione: "**Relazione di Ricorrenza e Costi:**\nIl tempo totale $T(n)$ soddisfa la ricorrenza:\n$$T(n) = T(n - 1) + T_{\\text{INSERT}}(n)$$\ncon caso base $T(1) = \\Theta(1)$.\n\n**Caso Peggiore:** $[\\Theta(n^2)]$\nSe l'array iniziale è ordinato in senso decrescente, ogni invocazione di `INSERT` deve far scorrere tutti gli $n - 1$ elementi del prefisso. Pertanto $T_{\\text{INSERT}}(n) = c \\cdot n$. Srotolando la ricorrenza:\n$$T(n) = T(n - 1) + c \\cdot n = T(1) + c \\sum_{j=2}^n j = \\Theta(1) + c \\left(\\frac{n(n + 1)}{2} - 1\\right) = \\Theta(n^2)$$\n\n**Caso Migliore:** $[\\Theta(n)]$\nSe l'array è già ordinato, per ogni passo di risalita la guardia del while in `INSERT` fallisce immediatamente al primo confronto, richiedendo tempo costante $T_{\\text{INSERT}}(n) = \\Theta(1)$:\n$$T(n) = T(n - 1) + \\Theta(1) = \\sum_{k=1}^n \\Theta(1) = \\Theta(n)$$\n\n**Stack Frame:**\nLa profondità massima dell'albero di ricorsione è esattamente pari a $n$, comportando un'occupazione di memoria ausiliaria sullo stack di sistema pari a $O(n)$."
    }
  },
  'quick-sort': {
    titolo: 'QUICK-SORT(A, p, r)',
    complessita: 'Θ(n log n) atteso/ottimo | Θ(n²) pessimo',
    spazio: 'O(log n) stack medio | O(n) pessimo',
    tipo: 'In-place, Non stabile, Divide et Impera',
    righe: [
      { id: 'QS-H1',   num: 'H1', text: '--- PARTITION(A, p, r) ---' },
      { id: 'PART-1',  num: 1, text: 'x = A[r]; i = p - 1' },
      { id: 'PART-2',  num: 2, text: 'for j = p to r - 1' },
      { id: 'PART-3',  num: 3, text: '    if A[j] <= x' },
      { id: 'PART-4',  num: 4, text: '        i = i + 1; scambia A[i] con A[j]' },
      { id: 'PART-5',  num: 5, text: 'scambia A[i + 1] con A[r]; return i + 1' },
      { id: 'QS-H2',   num: 'H2', text: '--- QUICK-SORT(A, p, r) ---' },
      { id: 'QS-1',    num: 1, text: 'if p < r' },
      { id: 'QS-2',    num: 2, text: '    q = PARTITION(A, p, r)' },
      { id: 'QS-3',    num: 3, text: '    QUICK-SORT(A, p, q - 1)' },
      { id: 'QS-4',    num: 4, text: '    QUICK-SORT(A, q + 1, r)' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nVettore $A[1..n]$, indici di delimitazione $p, r$ con $1 \\le p \\le r \\le n$.\n\n**Architettura Divide et Impera sul posto:**\n1. [cyan]Divide (PARTITION)[/cyan]: seleziona l'ultimo elemento $x = A[r]$ come perno (pivot). Ripartisce il sotto-vettore $A[p..r]$ riorganizzando gli elementi sul posto in modo che tutti i valori in $A[p..q-1]$ siano $\\le x$ e tutti i valori in $A[q+1..r]$ siano $\\ge x$. Restituisce l'indice definitivo $q$ in cui viene posizionato il perno.\n2. [cyan]Impera (QUICK-SORT)[/cyan]: ordina ricorsivamente i due sotto-array indipendenti generati dalla partizione: $A[p..q-1]$ e $A[q+1..r]$.\n3. [cyan]Combina[/cyan]: nessun costo aggiuntivo ($O(1)$) poiché l'ordinamento è avvenuto direttamente sul posto (in-place).",
      invariante: "Invariante di ciclo per PARTITION (schema di Lomuto, riga 2):\nAll'inizio di ogni iterazione del ciclo for per un generico indice $j$:\n1. Se $p \\le k \\le i$, allora $A[k] \\le x$.\n2. Se $i + 1 \\le k \\le j - 1$, allora $A[k] > x$.\n3. Se $k = r$, allora $A[k] = x$ (il perno rimane isolato all'estremo destro).\n\n• [emerald]Inizializzazione[/emerald]: prima della prima iterazione, $j = p$ e $i = p - 1$. Gli insiemi di indici $p \\le k \\le p-1$ e $p \\le k \\le p-1$ sono entrambi vuoti; le prime due condizioni sono vacuamente vere. L'elemento in $A[r]$ è per definizione il perno $x$.\n• [emerald]Conservazione[/emerald]: durante l'iterazione si esamina $A[j]$.\n  - Caso 1 ($A[j] > x$): $j$ avanza di $1$; la condizione 2 continua a valere per il nuovo elemento.\n  - Caso 2 ($A[j] \\le x$): si incrementa $i$ e si scambia $A[i]$ con $A[j]$. Poiché $A[i]$ conteneva precedentemente un valore $> x$, lo scambio inserisce in $A[i]$ il valore $\\le x$ e sposta in $A[j]$ il valore $> x$, ripristinando entrambe le condizioni per $j + 1$.\n• [emerald]Conclusione[/emerald]: al termine del ciclo $j = r$. Tutto il sotto-array $A[p..r-1]$ è partizionato nelle due regioni $A[p..i] \\le x$ e $A[i+1..r-1] > x$. A riga 5 si scambia $A[i+1]$ con $A[r]$: il perno risiede ora all'indice $q = i + 1$, certificando la corretta separazione.",
      dimostrazione: "**Analisi del Caso Peggiore:** $[\\Theta(n^2)]$\nSi manifesta quando il perno produce costantemente partizioni sbilanciate di taglia $0$ e $n - 1$ a ogni livello (es. array già ordinato o inversamente ordinato con perno scelto all'estremo):\n$$T(n) = T(n - 1) + T(0) + \\Theta(n) = T(n - 1) + \\Theta(n) = \\sum_{k=1}^n \\Theta(k) = \\Theta(n^2)$$\n\n**Analisi del Caso Migliore:** $[\\Theta(n \\log n)]$\nNel caso migliore la partizione divide il segmento esattamente a metà a ogni passo:\n$$T(n) = 2T\\left(\\left\\lfloor \\frac{n}{2} \\right\\rfloor\\right) + \\Theta(n)$$\nApplicando il Caso 2 del Teorema Master ($a=2, b=2, f(n)=\\Theta(n)$), si ottiene immediatamente $T(n) = \\Theta(n \\log n)$.\n\n**Analisi del Caso Medio Atteso:** $[\\Theta(n \\log n)]$\nAnche ammettendo uno sbilanciamento fisso sfavorevole (es. proporzione $99$ a $1$), l'albero di ricorsione mantiene profondità limitata da:\n$$\\text{Profondità massima } h = \\log_{100/99} n = \\Theta(\\log n)$$\nPoiché a ogni livello dell'albero la somma dei carichi di partizionamento è limitata da $c \\cdot n$, il tempo complessivo rimane invariabilmente limitato da $\\Theta(n \\log n)$."
    }
  },

  // ==========================================
  // MODULO 01: DIVIDE ET IMPERA & SELEZIONE
  // ==========================================
  'merge-sort': {
    titolo: 'MERGE-SORT & MERGE',
    complessita: 'Θ(n log n)',
    spazio: 'Θ(n) ausiliario',
    tipo: 'Stabile, Non in-place',
    righe: [
      { id: 'MS-H', num: 'H1', text: '--- MERGE-SORT(A, p, r) ---' },
      { id: 'MS-1', num: 1, text: 'if p < r' },
      { id: 'MS-2', num: 2, text: '    q = ⌊(p + r) / 2⌋' },
      { id: 'MS-3', num: 3, text: '    MERGE-SORT(A, p, q)' },
      { id: 'MS-4', num: 4, text: '    MERGE-SORT(A, q + 1, r)' },
      { id: 'MS-5', num: 5, text: '    MERGE(A, p, q, r)' },
      { id: 'M-H',  num: 'H2', text: '--- MERGE(A, p, q, r) ---' },
      { id: 'M-1',  num: 1, text: 'n₁ = q - p + 1; n₂ = r - q' },
      { id: 'M-2',  num: 2, text: 'crea vettori ausiliari L[1..n₁ + 1] e R[1..n₂ + 1]' },
      { id: 'M-3',  num: 3, text: 'for i = 1 to n₁: L[i] = A[p + i - 1]' },
      { id: 'M-4',  num: 4, text: 'for j = 1 to n₂: R[j] = A[q + j]' },
      { id: 'M-5',  num: 5, text: 'L[n₁ + 1] = +∞; R[n₂ + 1] = +∞  // Sentinelle di guardia' },
      { id: 'M-6',  num: 6, text: 'i = 1; j = 1' },
      { id: 'M-7',  num: 7, text: 'for k = p to r' },
      { id: 'M-8',  num: 8, text: '    if L[i] ≤ R[j]' },
      { id: 'M-9',  num: 9, text: '        A[k] = L[i]; i = i + 1' },
      { id: 'M-10', num: 10, text: '    else A[k] = R[j]; j = j + 1' }
    ],
    teoria: {
      funzionamento: "**Precondizione di MERGE-SORT:**\nVettore $A[1..n]$, indici $p, r$ con $1 \\le p \\le r \\le n$.\n\n**Precondizione di MERGE:**\nI due sotto-array contigui $A[p..q]$ e $A[q+1..r]$ sono internamente ordinati in modo non decrescente.\n\n**Decomposizione delle Fasi:**\n1. [cyan]Divide (MERGE-SORT)[/cyan]: calcola la mediana $q = \\lfloor (p + r) / 2 \\rfloor$ spezzando il problema a metà in tempo costante $\\Theta(1)$.\n2. [cyan]Impera (MERGE-SORT)[/cyan]: richiama ricorsivamente se stesso sulle due metà fino al caso base ($p \\ge r$).\n3. [cyan]Combina (MERGE)[/cyan]: alloca due buffer ausiliari $L$ ed $R$, popola gli elementi aggiungendo la sentinella $+\\infty$ in coda, e fonde le sequenze riversandole ordinate in $A[p..r]$ tramite scansione lineare a due puntatori.",
      invariante: "Invariante di ciclo per MERGE (righe 7-10):\nAll'inizio di ogni iterazione del ciclo for (indice $k$):\n1. Il sotto-array $A[p..k-1]$ contiene gli elementi minimi già fusi da $L$ ed $R$ in ordine non decrescente.\n2. Gli elementi non ancora copiati $L[i]$ e $R[j]$ sono i minimi assoluti dei rispettivi buffer.\n\n• [emerald]Inizializzazione[/emerald]: prima della prima iterazione ($k = p$), il sotto-array $A[p..p-1]$ è vuoto. La proprietà vale banalmente.\n• [emerald]Conservazione[/emerald]: se $L[i] \\le R[j]$, allora $L[i]$ è il minimo tra tutti gli elementi non ancora copiati. Assegnando $A[k] = L[i]$ e incrementando $i$ e $k$, il sotto-array $A[p..k]$ conterrà i $k - p + 1$ elementi minimi ordinati. Ragionamento simmetrico se $R[j] < L[i]$.\n• [emerald]Conclusione[/emerald]: al termine $k = r + 1$. Il vettore $A[p..r]$ contiene tutti gli $r - p + 1$ elementi ordinati.",
      dimostrazione: "**Relazione di Ricorrenza:**\n$$T(n) = 2T\\left(\\frac{n}{2}\\right) + \\Theta(n)$$\ncon $T(1) = \\Theta(1)$.\n\n**Risoluzione con Master Theorem:**\n• Parametri: $a = 2$, $b = 2$, $f(n) = \\Theta(n)$.\n• Funzione critica: $n^{\\log_2 2} = n^1 = n$.\n• Poiché $f(n) = \\Theta(n^1)$, ricadiamo nel [amber]Caso 2 del Master Theorem[/amber] con $k = 0$:\n$$T(n) = \\Theta(n^1 \\cdot \\log n) = \\Theta(n \\log n)$$\n\n**Verifica con Albero di Ricorsione:**\nL'albero ha altezza $h = \\log_2 n$. Al livello $j$ risiedono $2^j$ sottoproblemi di taglia $n / 2^j$. Il costo per livello è:\n$$\\text{Costo livello } j = 2^j \\cdot c\\left(\\frac{n}{2^j}\\right) = c \\cdot n$$\nSommando su tutti gli $h + 1$ livelli:\n$$T(n) = \\sum_{j=0}^{\\log_2 n} c \\cdot n = c \\cdot n (\\log_2 n + 1) = \\Theta(n \\log n)$$"
    }
  },
  'randomized-select': {
    titolo: 'RANDOMIZED-SELECT(A, p, r, i)',
    complessita: 'Θ(n) medio | Θ(n²) pessimo',
    spazio: 'O(1) ausiliario (O(log n) call stack)',
    tipo: 'In-place, Non stabile',
    righe: [
      { id: 'RS-H', num: 'H1', text: '--- RANDOMIZED-SELECT(A, p, r, i) ---' },
      { id: 'RS-1', num: 1, text: 'if p == r' },
      { id: 'RS-2', num: 2, text: '    return A[p]' },
      { id: 'RS-3', num: 3, text: 'q = RANDOMIZED-PARTITION(A, p, r)' },
      { id: 'RS-4', num: 4, text: 'k = q - p + 1  // Rango relativo del pivot' },
      { id: 'RS-5', num: 5, text: 'if i == k' },
      { id: 'RS-6', num: 6, text: '    return A[q]  // Match riscontrato' },
      { id: 'RS-7', num: 7, text: 'else if i < k' },
      { id: 'RS-8', num: 8, text: '    return RANDOMIZED-SELECT(A, p, q - 1, i)' },
      { id: 'RS-9', num: 9, text: 'else return RANDOMIZED-SELECT(A, q + 1, r, i - k)' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nVettore $A[p..r]$ e intero $i \\in [1, r - p + 1]$ indicante il rango della statistica d'ordine cercata.\n\n**Strategia ad Eliminazione:**\nA differenza di Quick Sort che risolve entrambi i rami, Randomized-Select compie una **singola chiamata ricorsiva**. Scelto un perno equiprobabile, l'array viene partizionato attorno a $A[q]$. Calcolato il rango relativo $k = q - p + 1$:\n- Se $i = k$, il perno è la soluzione.\n- Se $i < k$, la statistica risiede nel ramo sinistro $A[p..q-1]$.\n- Se $i > k$, scarta la metà sinistra e cerca la statistica $(i - k)$-esima nel ramo destro $A[q+1..r]$.",
      invariante: "Invariante di selezione:\nL'elemento cercato di rango $i$ rispetto ad $A[p..r]$ è identico all'elemento cercato nell'intervallo ridotto della chiamata ricorsiva.",
      dimostrazione: "**Caso Peggiore:** $[\\Theta(n^2)]$\nSi manifesta con partizioni sbilanciate $0$ e $n-1$ a ogni passo: $T(n) = T(n - 1) + \\Theta(n) = \\Theta(n^2)$.\n\n**Caso Medio Lineare:** $[\\Theta(n)]$\nAssumendo che tutte le $n$ posizioni del pivot siano equiprobabili con probabilità uniforme $1/n$:\n$$E[T(n)] \\le \\frac{1}{n} \\sum_{k=1}^n E[T(\\max(k - 1, n - k))] + O(n)$$\nPoiché $\\max(k - 1, n - k) \\le 3n/4$ con probabilità $\\ge 1/2$, la sommatoria converge tramite serie geometrica:\n$$E[T(n)] \\le c \\cdot n \\sum_{j=0}^{\\infty} \\left(\\frac{3}{4}\\right)^j = 4c \\cdot n = \\Theta(n)$$"
    }
  },
  'binary-search': {
    titolo: 'BINARY-SEARCH(A, p, r, x)',
    complessita: 'Θ(log n) caso pessimo | Θ(1) caso ottimo',
    spazio: 'Θ(1) iterativo / Θ(log n) call stack',
    tipo: 'Accesso casuale su sequenza ordinata',
    righe: [
      { id: 'BS-H', num: 'H1', text: '--- BINARY-SEARCH(A, p, r, x) ---' },
      { id: 'BS-1', num: 1, text: 'if p > r' },
      { id: 'BS-2', num: 2, text: '    return NIL  // Spazio di ricerca esaurito' },
      { id: 'BS-3', num: 3, text: 'q = ⌊p + (r - p) / 2⌋' },
      { id: 'BS-4', num: 4, text: 'if A[q] == x' },
      { id: 'BS-5', num: 5, text: '    return q    // Match riscontrato' },
      { id: 'BS-6', num: 6, text: 'else if A[q] > x' },
      { id: 'BS-7', num: 7, text: '    return BINARY-SEARCH(A, p, q - 1, x)' },
      { id: 'BS-8', num: 8, text: 'else return BINARY-SEARCH(A, q + 1, r, x)' }
    ],
    teoria: {
      funzionamento: "**Precondizione Indispensabile:**\nVettore $A[p..r]$ rigorosamente ordinato in modo non decrescente: $A[k] \\le A[k+1]$ per ogni $k$.\n\n**Strategia di Dimezzamento:**\nA ogni iterazione confronta la chiave target $x$ con l'elemento mediano $A[q]$. Se $A[q] = x$, la ricerca termina. Se $A[q] > x$, esclude la metà destra ricorsando su $A[p..q-1]$; se $A[q] < x$, esclude la metà sinistra ricorsando su $A[q+1..r]$.",
      invariante: "Invariante di localizzazione:\nSe la chiave $x$ appartiene all'array originale, allora $x \\in A[p..r]$. Se $p > r$, l'intervallo è vuoto, certificando che $x \\notin A$.",
      dimostrazione: "**Relazione di Ricorrenza:**\n$$T(n) = T\\left(\\left\\lfloor \\frac{n}{2} \\right\\rfloor\\right) + \\Theta(1)$$\nApplicando il Caso 2 del Teorema Master ($a = 1, b = 2, f(n) = \\Theta(1)$):\n$$n^{\\log_2 1} = n^0 = 1 \\implies T(n) = \\Theta(n^0 \\cdot \\log n) = \\Theta(\\log n)$$\nDopo $k$ iterazioni la taglia è $n / 2^k$. Imponendo $n / 2^k \\le 1$ si ottiene $k \\ge \\log_2 n$. L'altezza massima dell'albero di decisione è $\\lceil \\log_2 n \\rceil + 1$ verifiche."
    }
  },

  // ==========================================
  // MODULO 02: STRUTTURE AD HEAP
  // ==========================================
  'max-heapify': {
    titolo: 'MAX-HEAPIFY(A, i)',
    complessita: 'O(log n) = O(h)',
    spazio: 'O(1) in-place (O(h) call stack)',
    tipo: 'In-place, Procedura di discesa locale',
    righe: [
      { id: 'MH-H',  num: 'H1', text: '--- MAX-HEAPIFY(A, i) ---' },
      { id: 'MH-1',  num: 1, text: 'l = LEFT(i)   // 2 · i' },
      { id: 'MH-2',  num: 2, text: 'r = RIGHT(i)  // 2 · i + 1' },
      { id: 'MH-3',  num: 3, text: 'if l ≤ A.heap-size and A[l] > A[i]' },
      { id: 'MH-4',  num: 4, text: '    largest = l' },
      { id: 'MH-5',  num: 5, text: 'else largest = i' },
      { id: 'MH-6',  num: 6, text: 'if r ≤ A.heap-size and A[r] > A[largest]' },
      { id: 'MH-7',  num: 7, text: '    largest = r' },
      { id: 'MH-8',  num: 8, text: 'if largest ≠ i' },
      { id: 'MH-9',  num: 9, text: '    scambia A[i] con A[largest]' },
      { id: 'MH-10', num: 10, text: '    MAX-HEAPIFY(A, largest)' }
    ],
    teoria: {
      funzionamento: "**Precondizione Obbligatoria:**\nI sotto-alberi radicati nei figli $\\text{LEFT}(i)$ e $\\text{RIGHT}(i)$ sono già Max-Heap validi. Solo la radice $A[i]$ può violare la proprietà.\n\n**Meccanica di Ripristino:**\nIndividua il massimo tra padre e discendenti diretti. Se il massimo risiede in un figlio, scambia $A[i]$ con $A[\\text{largest}]$ e propaga ricorsivamente la discesa lungo quel sotto-albero.",
      invariante: "Invariante di correttezza locale:\nAll'invocazione di MAX-HEAPIFY su $i$, i sotto-alberi con radice in $\\text{LEFT}(i)$ e $\\text{RIGHT}(i)$ sono Max-Heap conformi. A valle dello scambio con il massimo locale, il nodo $i$ domina entrambi i sotto-alberi; l'unica eventuale violazione strutturale rimane confinata esclusivamente nel sotto-albero con radice in $\\text{largest}$.",
      dimostrazione: "**Analisi della Dimensione del Sottoproblema:**\nNel caso peggiore, l'ultimo livello dell'albero binario quasi completo è riempito esattamente a metà. La dimensione massima del sotto-albero è limitata da:\n$$\\text{Dimensione massima} \\le \\frac{2n}{3}$$\nLa ricorrenza del caso peggiore è:\n$$T(n) \\le T\\left(\\frac{2n}{3}\\right) + \\Theta(1)$$\nApplicando il Master Theorem (Caso 2 con $a = 1, b = 3/2, f(n) = \\Theta(1)$):\n$$n^{\\log_{3/2} 1} = n^0 = 1 \\implies T(n) = O(\\log n)$$\nPoiché ogni livello richiede tempo costante $O(1)$, il costo totale è limitato dall'altezza del nodo: $O(h) = O(\\log n)$."
    }
  },
  'build-max-heap': {
    titolo: 'BUILD-MAX-HEAP(A)',
    complessita: 'Θ(n) lineare [Analisi asintotica fine]',
    spazio: 'Θ(1) ausiliario in-place',
    tipo: 'Costruzione bottom-up',
    righe: [
      { id: 'BMH-H', num: 'H1', text: '--- BUILD-MAX-HEAP(A) ---' },
      { id: 'BMH-1', num: 1, text: 'A.heap-size = A.length' },
      { id: 'BMH-2', num: 2, text: 'for i = ⌊A.length / 2⌋ downto 1' },
      { id: 'BMH-3', num: 3, text: '    MAX-HEAPIFY(A, i)' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nVettore disordinato arbitrario $A[1..n]$.\n\n**Costruzione Bottom-Up:**\nI nodi da $\\lfloor n/2 \\rfloor + 1$ a $n$ sono foglie (altezza $h = 0$, per definizione già Max-Heap validi). L'algoritmo itera all'indietro partendo dall'ultimo nodo interno $\\lfloor n/2 \\rfloor$ fino alla radice principale $1$, invocando `MAX-HEAPIFY` su ciascun nodo.",
      invariante: "Invariante di ciclo for (downto 1):\nAll'inizio di ogni iterazione del ciclo per un indice $i$, ciascun nodo appartenente all'insieme $\\{i + 1, i + 2, \\dots, n\\}$ è la radice di un Max-Heap valido.",
      dimostrazione: "**Analisi Fine della Complessità Lineare:**\nIn un heap binario quasi completo di $n$ elementi, il numero massimo di nodi ad altezza $h$ è limitato da $\\lceil n / 2^{h+1} \\rceil$. Poiché `MAX-HEAPIFY` su un nodo ad altezza $h$ richiede costo $O(h)$:\n$$T(n) = \\sum_{h=0}^{\\lfloor \\log_2 n \\rfloor} \\left\\lceil \\frac{n}{2^{h+1}} \\right\\rceil O(h) = O\\left(n \\sum_{h=0}^{\\infty} \\frac{h}{2^h}\\right)$$\nConsiderando la serie geometrica fondamentale per $|x| < 1$ e la sua derivata:\n$$\\sum_{h=0}^{\\infty} x^h = \\frac{1}{1 - x} \\implies \\sum_{h=0}^{\\infty} h \\cdot x^h = \\frac{x}{(1 - x)^2}$$\nSostituendo $x = 1/2$:\n$$\\sum_{h=0}^{\\infty} \\frac{h}{2^h} = \\frac{1/2}{(1 - 1/2)^2} = \\frac{1/2}{1/4} = 2$$\nSostituendo il valore di convergenza:\n$$T(n) = O(n \\cdot 2) = \\Theta(n)$$\nLa costruzione dell'heap avviene in tempo strettamente lineare $\\Theta(n)$."
    }
  },
  'heap-sort': {
    titolo: 'HEAPSORT(A)',
    complessita: 'Θ(n log n) ottimo, medio e peggiore',
    spazio: 'Θ(1) rigorosamente in-place',
    tipo: 'Non stabile, basato su Heap',
    righe: [
      { id: 'HS-H', num: 'H1', text: '--- HEAPSORT(A) ---' },
      { id: 'HS-1', num: 1, text: 'BUILD-MAX-HEAP(A)' },
      { id: 'HS-2', num: 2, text: 'for i = A.length downto 2' },
      { id: 'HS-3', num: 3, text: '    scambia A[1] con A[i]' },
      { id: 'HS-4', num: 4, text: '    A.heap-size = A.heap-size - 1' },
      { id: 'HS-5', num: 5, text: '    MAX-HEAPIFY(A, 1)' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nVettore disordinato $A[1..n]$.\n\n**Meccanica di Estrazione:**\n1. Converte $A$ in un Max-Heap tramite `BUILD-MAX-HEAP` in tempo $\\Theta(n)$.\n2. Il massimo risiede sempre nella radice $A[1]$: a ogni iterazione scambia $A[1]$ con l'ultimo elemento attivo $A[i]$, decrementa la dimensione dell'heap isolando il massimo nella parte finale già ordinata, e richiama `MAX-HEAPIFY(A, 1)` per far discendere la nuova radice.",
      invariante: "Invariante di ciclo for (downto 2):\n1. Il sotto-vettore $A[1..i]$ costituisce un Max-Heap contenente gli $i$ elementi minori del vettore originale.\n2. Il sotto-vettore $A[i+1..n]$ contiene gli $n - i$ elementi maggiori dell'array, disposti nel loro ordine definitivo non decrescente.",
      dimostrazione: "**Analisi Asintotica Completa:**\n• La fase iniziale `BUILD-MAX-HEAP` richiede tempo $\\Theta(n)$.\n• Il ciclo for itera esattamente $n - 1$ volte.\n• A ogni iterazione, l'operazione di scambio richiede $\\Theta(1)$ e l'invocazione di `MAX-HEAPIFY` su un heap di dimensione decrescente $i$ richiede tempo $O(\\log i)$:\n$$T(n) = \\Theta(n) + \\sum_{i=2}^n O(\\log i)$$\nSfruttando l'approssimazione di Stirling per la sommatoria dei logaritmi:\n$$\\sum_{i=2}^n \\log i = \\log(n!) = \\Theta(n \\log n)$$\nNe consegue che:\n$$T(n) = \\Theta(n) + \\Theta(n \\log n) = \\Theta(n \\log n)$$\nPoiché qualsiasi algoritmo di ordinamento a confronti richiede un limite inferiore $\\Omega(n \\log n)$, Heapsort risulta asintoticamente ottimo in ogni scenario."
    }
  },
  'priority-queue': {
    titolo: 'CODE CON PRIORITÀ',
    complessita: 'Maximum: Θ(1) | Extract-Max, Increase, Insert: Θ(log n)',
    spazio: 'Θ(1) in-place',
    tipo: 'Struttura dinamica indicizzata',
    righe: [
      { id: 'PQ-H1', num: 'H1', text: '--- HEAP-MAXIMUM(A) ---' },
      { id: 'PQ-M1', num: 1, text: 'return A[1]' },
      { id: 'PQ-H2', num: 'H2', text: '--- HEAP-EXTRACT-MAX(A) ---' },
      { id: 'PQ-E1', num: 1, text: 'if A.heap-size < 1 then error "heap underflow"' },
      { id: 'PQ-E2', num: 2, text: 'max = A[1]; A[1] = A[A.heap-size]' },
      { id: 'PQ-E3', num: 3, text: 'A.heap-size = A.heap-size - 1' },
      { id: 'PQ-E4', num: 4, text: 'MAX-HEAPIFY(A, 1); return max' },
      { id: 'PQ-H3', num: 'H3', text: '--- HEAP-INCREASE-KEY(A, i, key) ---' },
      { id: 'PQ-I1', num: 1, text: 'if key < A[i] then error "nuova chiave minore"' },
      { id: 'PQ-I2', num: 2, text: 'A[i] = key' },
      { id: 'PQ-I3', num: 3, text: 'while i > 1 and A[PARENT(i)] < A[i]' },
      { id: 'PQ-I4', num: 4, text: '    scambia A[i] con A[PARENT(i)]; i = PARENT(i)' },
      { id: 'PQ-H4', num: 'H4', text: '--- MAX-HEAP-INSERT(A, key) ---' },
      { id: 'PQ-N1', num: 1, text: 'A.heap-size = A.heap-size + 1; A[A.heap-size] = -∞' },
      { id: 'PQ-N2', num: 2, text: 'HEAP-INCREASE-KEY(A, A.heap-size, key)' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nStruttura dati Max-Heap valida rappresentata tramite vettore $A$.\n\n**Operazioni della Coda con Priorità:**\n• [cyan]HEAP-MAXIMUM[/cyan]: accede direttamente alla radice $A[1]$ in tempo $\\Theta(1)$.\n• [cyan]HEAP-EXTRACT-MAX[/cyan]: estrae il massimo, lo rimpiazza con l'ultima foglia dell'heap, riduce la dimensione di $1$ e invoca `MAX-HEAPIFY(A, 1)` per far scendere la chiave in tempo $\\Theta(\\log n)$.\n• [cyan]HEAP-INCREASE-KEY[/cyan]: aggiorna la chiave del nodo $i$ a un valore maggiore e propaga la risalita (**Bubble-Up**) scambiando il nodo con il padre fintanto che $A[\\text{PARENT}(i)] < A[i]$.\n• [cyan]MAX-HEAP-INSERT[/cyan]: incrementa la dimensione, alloca una foglia provvisoria con sentinella $-\\infty$ e invoca `HEAP-INCREASE-KEY` con la nuova chiave.",
      invariante: "Invariante di Increase-Key:\nAll'inizio di ogni iterazione del ciclo while, il sotto-albero con radice in $i$ rispetta pienamente la proprietà di Max-Heap. L'unica violazione ammessa è locale tra $A[i]$ e il padre $A[\\text{PARENT}(i)]$.",
      dimostrazione: "**Analisi dei Costi:**\n• **HEAP-MAXIMUM**: accesso diretto all'indice $1$, tempo $\\Theta(1)$.\n• **HEAP-EXTRACT-MAX**: scambi $O(1)$ seguiti da una singola esecuzione di `MAX-HEAPIFY` su un albero di altezza $h = \\lfloor \\log_2 n \\rfloor$, tempo $O(\\log n)$.\n• **HEAP-INCREASE-KEY**: nel caso peggiore risale l'intero cammino semplice dalla foglia fino alla radice. La lunghezza massima del cammino è limitata dall'altezza:\n$$h = \\lfloor \\log_2 n \\rfloor \\implies T(n) = O(\\log n)$$\n• **MAX-HEAP-INSERT**: incremento $O(1)$ seguito da una chiamata a `HEAP-INCREASE-KEY`, tempo $O(\\log n)$."
    }
  },

  // ==========================================
  // MODULO 03: ORDINAMENTO LINEARE
  // ==========================================
  'counting-sort': {
    titolo: 'COUNTING-SORT(A, B, k)',
    complessita: 'Θ(n + k)',
    spazio: 'Θ(n + k) per array ausiliari B e C',
    tipo: 'Stabile, Non in-place (per interi in [0..k])',
    righe: [
      { id: 'CS-H', num: 'H1', text: '--- COUNTING-SORT(A, B, k) ---' },
      { id: 'CS-1', num: 1, text: 'for i = 0 to k: C[i] = 0' },
      { id: 'CS-2', num: 2, text: 'for j = 1 to A.length: C[A[j]] = C[A[j]] + 1' },
      { id: 'CS-3', num: 3, text: 'for i = 1 to k: C[i] = C[i] + C[i - 1]' },
      { id: 'CS-4', num: 4, text: 'for j = A.length downto 1' },
      { id: 'CS-5', num: 5, text: '    B[C[A[j]]] = A[j]' },
      { id: 'CS-6', num: 6, text: '    C[A[j]] = C[A[j]] - 1' }
    ],
    teoria: {
      funzionamento: "**Precondizione Fondamentale:**\nTutti gli $n$ elementi di input $A[1..n]$ sono **numeri interi** compresi in un intervallo noto $[0..k]$ con estremo superiore $k$ finito.\n\n**Quattro Fasi Computazionali:**\n1. [cyan]Fase 1 (Azzeramento)[/cyan]: azzera il vettore ausiliario dei conteggi $C[0..k]$ in tempo $\\Theta(k)$.\n2. [cyan]Fase 2 (Istogramma)[/cyan]: calcola la frequenza assoluta di ciascun intero presente in $A$ incrementando $C[A[j]]$ in tempo $\\Theta(n)$.\n3. [cyan]Fase 3 (Somme Prefisse)[/cyan]: trasforma le frequenze assolute in somme cumulative: $C[i] = C[i] + C[i-1]$. Al termine, $C[i]$ rappresenta il numero esatto di elementi $\\le i$, indicando la posizione finale dell'ultima occorrenza di $i$.\n4. [cyan]Fase 4 (Scrittura Stabile)[/cyan]: itera $A$ **a ritroso** da $n$ a $1$. Colloca $A[j]$ nell'indice $B[C[A[j]]]$ e decrementa immediatamente il contatore $C[A[j]]$ per consentire all'occorrenza precedente dello stesso valore di posizionarsi nella cella precedente.",
      invariante: "Conservazione Rigorosa della Stabilità:\nLa scansione dell'array di input $A$ a ritroso da $n$ a $1$ garantisce che, qualora due record presentino la medesima chiave ($A[r] = A[s]$ con $r < s$), l'elemento $A[s]$ situato originariamente più a destra venga posizionato nel buffer di output $B$ all'indice più alto prima che il decremento del contatore $C[A[s]]$ riduca l'indice per $A[r]$. In questo modo l'ordine temporale relativo originale è preservato al 100%, condizione indispensabile per l'uso come subroutine in Radix Sort.",
      dimostrazione: "**Analisi Computazionale dei Cicli:**\n• Righe 1-2 (azzeramento del vettore dei conteggi $C$): richiede $\\Theta(k)$ operazioni.\n• Righe 3-4 (calcolo dell'istogramma delle frequenze su $A$): richiede $\\Theta(n)$ operazioni.\n• Righe 5-6 (accumulo delle somme prefisse in $C$): richiede $\\Theta(k)$ operazioni.\n• Righe 7-9 (collocamento stabile a ritroso nel buffer di output $B$): richiede $\\Theta(n)$ operazioni.\n\nIl tempo d'esecuzione totale è la somma lineare dei costi:\n$$T(n, k) = \\Theta(k) + \\Theta(n) + \\Theta(k) + \\Theta(n) = \\Theta(n + k)$$\nSe il valore massimo delle chiavi soddisfa la condizione $k = O(n)$, la complessità asintotica risulta strettamente lineare:\n$$T(n) = \\Theta(n + O(n)) = \\Theta(n)$$"
    }
  },
  'counting-inplace': {
    titolo: 'COUNTING-SORT-IN-PLACE(A, k)',
    complessita: 'Θ(n + k)',
    spazio: 'Θ(k) [Non richiede l\'array ausiliario B]',
    tipo: 'In-place per interi, NON Stabile',
    righe: [
      { id: 'CIP-H', num: 'H1', text: '--- COUNTING-SORT-IN-PLACE(A, k) ---' },
      { id: 'CIP-1', num: 1, text: 'for i = 0 to k: C[i] = 0' },
      { id: 'CIP-2', num: 2, text: 'for j = 1 to A.length: C[A[j]] = C[A[j]] + 1' },
      { id: 'CIP-3', num: 3, text: 'idx = 1' },
      { id: 'CIP-4', num: 4, text: 'for i = 0 to k' },
      { id: 'CIP-5', num: 5, text: '    while C[i] > 0' },
      { id: 'CIP-6', num: 6, text: '        A[idx] = i' },
      { id: 'CIP-7', num: 7, text: '        idx = idx + 1' },
      { id: 'CIP-8', num: 8, text: '        C[i] = C[i] - 1' }
    ],
    teoria: {
      funzionamento: "**Precondizione:**\nElementi di input costituiti **esclusivamente da chiavi scalari intere pure** in $[0..k]$ (privi di dati satellite associati).\n\n**Meccanica di Riscrittura In-Place:**\nVariante salva-spazio che elimina la necessità del secondo buffer di output $B$, riducendo la memoria ausiliaria da $\\Theta(n + k)$ a $\\Theta(k)$. Una volta calcolate le frequenze assolute nel vettore $C$, la procedura scorre i possibili valori da $0$ a $k$ e sovrascrive direttamente il vettore di partenza $A$, scrivendo il valore scalare $i$ per esattamente $C[i]$ volte consecutive.",
      invariante: "Compromesso Strutturale della Non-Stabilità:\nPoiché la procedura rigenera i numeri basandosi puramente sul valore intero e sovrascrive distruttivamente $A$, cancella qualsiasi legame con i dati satellite associati originariamente alle chiavi e distrugge l'ordine relativo precedente: non è utilizzabile né per record compositi né come subroutine di Radix Sort.",
      dimostrazione: "**Analisi delle Iterazioni e Complessità:**\nL'inizializzazione e il conteggio delle occorrenze richiedono rispettivamente $\\Theta(k)$ e $\\Theta(n)$ passaggi.\nNel ciclo di riscrittura, il for esterno itera $k + 1$ volte. Il ciclo while interno esegue un numero totale di iterazioni pari alla somma di tutti i conteggi:\n$$\\sum_{i=0}^k C[i] = n$$\nIl numero complessivo di scritture in $A$ è pertanto esattamente $n$.\n$$T(n, k) = \\Theta(k) + \\Theta(n) + \\Theta(k + n) = \\Theta(n + k)$$\nL'algoritmo opera in tempo lineare con ingombro di memoria ausiliaria ridotto a $\\Theta(k)$."
    }
  },
  'radix-sort': {
    titolo: 'RADIX-SORT(A, d)',
    complessita: 'Θ(d · (n + k))',
    spazio: 'Θ(n + k) ausiliario',
    tipo: 'Stabile, Strategia LSD (Least Significant Digit)',
    righe: [
      { id: 'RS-H', num: 'H1', text: '--- RADIX-SORT(A, d) ---' },
      { id: 'RS-1', num: 1, text: 'for i = 1 to d' },
      { id: 'RS-2', num: 2, text: '    usa un algoritmo STABILE (es. Counting Sort) su cifra i-esima (da LSD a MSD)' }
    ],
    teoria: {
      funzionamento: "**Precondizione Indispensabile:**\nCiascun elemento di $A[1..n]$ è rappresentabile come una tupla di $d$ cifre, in cui ciascuna cifra assume valori in un intervallo discreto $[0..k-1]$. Tutte le chiavi hanno la medesima lunghezza $d$.\n\n**Strategia LSD (Least Significant Digit):**\nOrdina le chiavi procedendo dalla colonna meno significativa ($i = 1$) verso quella più significativa ($i = d$). A ogni iterazione invoca una subroutine di ordinamento che **DEVE essere rigorosamente stabile** (come Counting Sort). In questo modo, quando si ordina rispetto alla colonna $i$-esima, elementi aventi la medesima cifra mantengono inalterato l'ordinamento relativo già consolidato sulle prime $i - 1$ cifre.",
      invariante: "Dimostrazione di correttezza per induzione matematica su $d$:\n\n• [emerald]Base induttiva ($d = 1$)[/emerald]:\nCon numeri a cifra singola, la subroutine stabile ordina direttamente l'array, risultando banalmente corretta.\n\n• [emerald]Ipotesi induttiva[/emerald]:\nAssumiamo per ipotesi che l'array sia correttamente ordinato rispetto alle prime $i - 1$ cifre meno significative.\n\n• [emerald]Passo induttivo[/emerald]:\nAll'iterazione $i$, ordiniamo rispetto alla cifra $i$-esima. Consideriamo due generici elementi $u$ e $v$:\n- Se differiscono nella cifra $i$-esima, la subroutine li dispone nell'ordine corretto imposto dalla cifra più significativa esaminata.\n- Se hanno la medesima cifra $i$-esima, la proprietà di stabilità preserva l'ordine relativo acquisito in base alle prime $i - 1$ cifre (che per ipotesi induttiva era corretto).\nL'array risulta quindi ordinato rispetto a tutte le prime $i$ cifre.",
      dimostrazione: "**Analisi Formale del Tempo d'Esecuzione:**\nDati $n$ numeri di $d$ cifre, ciascuna delle quali assume valori nell'intervallo $[0..k-1]$:\nIl ciclo for principale viene eseguito esattamente $d$ volte. A ogni passaggio viene invocato Counting Sort stabile, che impiega tempo $\\Theta(n + k)$:\n$$T(n, d, k) = \\Theta(d \\cdot (n + k))$$\nSe il numero di cifre $d$ è costante ($d = O(1)$) e la base rispetta $k = O(n)$, Radix Sort garantisce tempo di calcolo lineare $\\Theta(n)$."
    }
  },
  'bucket-sort': {
    titolo: 'BUCKET-SORT(A)',
    complessita: 'Θ(n) caso medio | Θ(n²) caso peggiore',
    spazio: 'Θ(n) per array di bucket e liste collegate',
    tipo: 'Distribuzione probabilistica uniforme in [0, 1)',
    righe: [
      { id: 'BS-H', num: 'H1', text: '--- BUCKET-SORT(A) ---' },
      { id: 'BS-1', num: 1, text: 'n = A.length' },
      { id: 'BS-2', num: 2, text: 'crea un nuovo array B[0..n - 1] di liste concatenate vuote' },
      { id: 'BS-3', num: 3, text: 'for i = 1 to n' },
      { id: 'BS-4', num: 4, text: '    inserisci A[i] nella lista B[⌊n · A[i]⌋]' },
      { id: 'BS-5', num: 5, text: 'for i = 0 to n - 1' },
      { id: 'BS-6', num: 6, text: '    ordina la lista B[i] mediante INSERTION-SORT' },
      { id: 'BS-7', num: 7, text: 'concatena ordinatamente le liste B[0], B[1], ..., B[n - 1] in A' }
    ],
    teoria: {
      funzionamento: "**Precondizione Probabilistica Fondamentale:**\nGli $n$ valori di input $A[1..n]$ sono numeri reali generati in modo indipendente e identicamente distribuito (i.i.d.) secondo una **distribuzione uniforme continua** sull'intervallo semiaperto $[0, 1)$.\n\n**Meccanica dei Contenitori (Bucket):**\n1. Suddivide l'intervallo $[0, 1)$ in $n$ contenitori contigui ed equipotenti di ampiezza $1/n$.\n2. Ciascun valore $x$ viene inserito nel contenitore $B[\\lfloor n \\cdot x \\rfloor]$ in tempo $\\Theta(1)$. Per l'ipotesi di uniformità, ogni contenitore riceverà in media un numero costante di elementi.\n3. Ciascun contenitore viene ordinato localmente tramite Insertion Sort.\n4. Tutte le liste ordinate vengono concatenate linearmente da $B[0]$ a $B[n-1]$.",
      invariante: "Invariante di separazione dei contenitori:\nPer ogni coppia di indici di bucket $r < s$, qualsiasi valore appartenente a $B[r]$ è strettamente minore di qualsiasi elemento appartenente a $B[s]$:\n$$\\forall x \\in B[r], \\forall y \\in B[s] \\implies x < y$$\nPertanto la concatenazione lineare delle singole liste ordinate genera l'ordinamento complessivo.",
      dimostrazione: "**Dimostrazione Probabilistica del Tempo Atteso Lineare:**\nSia $n_i$ la variabile casuale che indica il numero di elementi assegnati al bucket $B[i]$.\nPoiché l'ordinamento di ciascuna lista tramite Insertion Sort richiede tempo quadratico $O(n_i^2)$, il tempo totale atteso è:\n$$E[T(n)] = \\Theta(n) + \\sum_{i=0}^{n-1} O\\left(E[n_i^2]\\right)$$\nCiascun elemento cade nel bucket $i$ con probabilità costante $p = 1/n$. Pertanto ogni $n_i$ segue una **distribuzione binomiale** con parametri $n$ e $p = 1/n$:\n$$n_i \\sim \\text{Bin}\\left(n, \\frac{1}{n}\\right)$$\nDalla statistica matematica:\n$$E[n_i] = n \\cdot p = n \\left(\\frac{1}{n}\\right) = 1$$\n$$\\text{Var}(n_i) = n \\cdot p \\cdot (1 - p) = n \\left(\\frac{1}{n}\\right) \\left(1 - \\frac{1}{n}\\right) = 1 - \\frac{1}{n}$$\nSfruttando la relazione fondamentale tra varianza e momento secondo $E[n_i^2] = \\text{Var}(n_i) + (E[n_i])^2$:\n$$E[n_i^2] = \\left(1 - \\frac{1}{n}\\right) + 1^2 = 2 - \\frac{1}{n} = O(1)$$\nSostituendo il valore del momento secondo nella sommatoria del costo atteso:\n$$E[T(n)] = \\Theta(n) + \\sum_{i=0}^{n-1} O(1) = \\Theta(n) + n \\cdot O(1) = \\Theta(n)$$\nNel caso peggiore (tutti gli elementi collidono nello stesso bucket), il tempo degenera a quello di Insertion Sort: $\\Theta(n^2)$."
    }
  }
};