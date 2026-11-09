import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

// Generatore di chiavi numeriche casuali ordinate per preservare l'invariante BST
const generateRandomKeys = (count = 7) => {
  const nums = [];
  while (nums.length < count) {
    const val = Math.floor(Math.random() * 80) + 10;
    if (!nums.includes(val)) nums.push(val);
  }
  return nums.sort((a, b) => a - b);
};

// Costruttore completo dei 3 Scenari didattici con valori e topologia dinamici
const createScenarioData = (presetIndex) => {
  const K = generateRandomKeys(7);

  if (presetIndex === 0) {
    // SCENARIO 1: Violazione a Sinistra -> CASO 2 (Zig-Zag) -> CASO 3 (Lineare)
    // Chiavi ordinate: K[0] < K[1] < K[2] < K[3] < K[4] < K[5] < K[6]
    // Inseriamo z = K[1] (figlio destro di K[0], con genitore K[0] rosso e zio K[4] nero)
    const zKey = K[1];
    const initialTree = {
      11: { id: 11, key: K[5], color: 'BLACK', left: 7, right: 14, p: null },
      7: { id: 7, key: K[3], color: 'BLACK', left: 4, right: 9, p: 11 },   // nonno z.p.p
      14: { id: 14, key: K[6], color: 'BLACK', left: 'nil', right: 'nil', p: 11 },
      4: { id: 4, key: K[0], color: 'RED', left: 'nil', right: 'nil', p: 7 },      // genitore z.p (rosso)
      9: { id: 9, key: K[4], color: 'BLACK', left: 'nil', right: 'nil', p: 7 }     // zio y (nero)
    };

    const steps = [
      {
        stage: 'INIT_BST',
        codeLine: 'RBI-1',
        pointers: {},
        log: `1. Inizio RB-INSERT(T, z=${zKey}): y = T.NIL, x = T.root (${K[5]}).`,
        coordsId: 't1-init',
        treeModifier: (t) => t
      },
      {
        stage: 'DESCEND_1',
        codeLine: 'RBI-5',
        pointers: { x: 11 },
        log: `2. Confronto BST: z.key (${zKey}) < x.key (${K[5]}). Si scende a sinistra: x = x.left (nodo ${K[3]}), y = ${K[5]}.`,
        coordsId: 't1-init',
        treeModifier: (t) => t
      },
      {
        stage: 'DESCEND_2',
        codeLine: 'RBI-5',
        pointers: { x: 7, y: 11 },
        log: `3. Confronto BST: z.key (${zKey}) < x.key (${K[3]}). Si scende a sinistra: x = x.left (nodo ${K[0]}), y = ${K[3]}.`,
        coordsId: 't1-init',
        treeModifier: (t) => t
      },
      {
        stage: 'DESCEND_3',
        codeLine: 'RBI-7',
        pointers: { x: 4, y: 7 },
        log: `4. Confronto BST: z.key (${zKey}) > x.key (${K[0]}). Si scende a destra: x = x.right (T.NIL), y = ${K[0]}.`,
        coordsId: 't1-init',
        treeModifier: (t) => t
      },
      {
        stage: 'LINK_PARENT',
        codeLine: 'RBI-8',
        pointers: { p: 4 },
        log: `5. Trovata la posizione foglia: z.p = y (${K[0]}). Poiché z.key > y.key, y.right = z.`,
        coordsId: 't1-inserted',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[5] = { id: 5, key: zKey, color: 'BLACK', left: 'nil', right: 'nil', p: 4 };
          next[4].right = 5;
          return next;
        }
      },
      {
        stage: 'SET_SENTINELS_RED',
        codeLine: 'RBI-16',
        pointers: { z: 5, p: 4 },
        log: `6. Inizializzazione sentinelle: z.left = z.right = T.NIL. z.color = RED. Viene invocata RB-INSERT-FIXUP(T, z).`,
        coordsId: 't1-inserted',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[5].color = 'RED';
          return next;
        }
      },
      {
        stage: 'CHECK_VIOLATION',
        codeLine: 'FIX-1',
        pointers: { z: 5, p: 4 },
        log: `7. FIXUP Check: while (z.p.color == RED). Sia z (${zKey}) che z.p (${K[0]}) sono ROSSI: violata la Proprietà 4!`,
        coordsId: 't1-inserted',
        treeModifier: (t) => t
      },
      {
        stage: 'EVAL_BRANCH_UNCLE',
        codeLine: 'FIX-3',
        pointers: { z: 5, p: 4, uncle: 9, grand: 7 },
        log: `8. Identificazione ramo: z.p (${K[0]}) è figlio sinistro del nonno ${K[3]}. Lo zio è y = z.p.p.right (nodo ${K[4]}). Lo zio è NERO!`,
        coordsId: 't1-inserted',
        treeModifier: (t) => t
      },
      {
        stage: 'DETECT_CASO_2',
        codeLine: 'FIX-10',
        pointers: { z: 5, p: 4, uncle: 9, grand: 7 },
        log: `9. Check Zig-zag: z (${zKey}) è figlio DESTRO di z.p. Riconosciuto [CASO 2: Zig-zag]. Prepariamo la rotazione ponendo z = z.p (${K[0]}).`,
        coordsId: 't1-inserted',
        treeModifier: (t) => t
      },
      {
        stage: 'EXEC_LEFT_ROTATE_C2',
        codeLine: 'FIX-12',
        pointers: { z: 4, p: 5, grand: 7, uncle: 9 },
        log: `10. LEFT-ROTATE(T, z=${K[0]}): Il perno ${zKey} sale al posto di ${K[0]}, che diventa suo figlio sinistro. Il Caso 2 si trasforma nel CASO 3 (Lineare)!`,
        coordsId: 't1-post-lr',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[4].right = 'nil';
          next[5].left = 4;
          next[4].p = 5;
          next[5].p = 7;
          next[7].left = 5;
          return next;
        }
      },
      {
        stage: 'RECOLOR_CASO_3',
        codeLine: 'FIX-14',
        pointers: { z: 4, p: 5, grand: 7 },
        log: `11. CASO 3 (Ricolorazione): z.p (${zKey}) diventa NERO; z.p.p (${K[3]}) diventa ROSSO per preparare la rotazione finale.`,
        coordsId: 't1-post-lr',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[5].color = 'BLACK';
          next[7].color = 'RED';
          return next;
        }
      },
      {
        stage: 'EXEC_RIGHT_ROTATE_C3',
        codeLine: 'FIX-15',
        pointers: { z: 4, p: 5, grand: 7 },
        log: `12. RIGHT-ROTATE(T, z.p.p=${K[3]}): ${zKey} diventa la nuova radice locale, mentre ${K[3]} scende a destra. Ribilanciamento locale completato!`,
        coordsId: 't1-post-rr',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[7].left = 'nil';
          next[5].right = 7;
          next[7].p = 5;
          next[5].p = 11;
          next[11].left = 5;
          return next;
        }
      },
      {
        stage: 'TERMINATION',
        codeLine: 'FIX-30',
        pointers: {},
        log: `13. Fine Fixup: z.p.color è NERO. T.root.color = BLACK (${K[5]} è nera). Tutte le 5 proprietà rosso-nere sono ripristinate con successo!`,
        coordsId: 't1-post-rr',
        treeModifier: (t) => t
      }
    ];

    const coordsMap = {
      't1-init': {
        11: { x: 225, y: 35 },
        7: { x: 125, y: 95 },
        14: { x: 325, y: 95 },
        4: { x: 70, y: 155 },
        9: { x: 175, y: 155 }
      },
      't1-inserted': {
        11: { x: 225, y: 35 },
        7: { x: 125, y: 95 },
        14: { x: 325, y: 95 },
        4: { x: 70, y: 155 },
        9: { x: 175, y: 155 },
        5: { x: 105, y: 215 }
      },
      't1-post-lr': {
        11: { x: 225, y: 35 },
        7: { x: 125, y: 95 },
        14: { x: 325, y: 95 },
        5: { x: 70, y: 155 },
        4: { x: 35, y: 215 },
        9: { x: 175, y: 155 }
      },
      't1-post-rr': {
        11: { x: 225, y: 35 },
        14: { x: 325, y: 95 },
        5: { x: 125, y: 95 },
        4: { x: 70, y: 155 },
        7: { x: 175, y: 155 },
        9: { x: 215, y: 215 }
      }
    };

    return {
      title: 'Scenario 1: Violazione a Sinistra (Caso 2 Zig-zag -> Caso 3 Lineare)',
      insertKey: zKey,
      initialTree,
      steps,
      coordsMap
    };
  }

  if (presetIndex === 1) {
    // SCENARIO 2: Violazione a Destra -> RAMO SIMMETRICO (Caso 2 Simm. -> Caso 3 Simm.)
    // Inseriamo z = K[5] (figlio sinistro di K[6], con genitore K[6] rosso e zio K[2] nero)
    const zKey = K[5];
    const initialTree = {
      9: { id: 9, key: K[1], color: 'BLACK', left: 4, right: 13, p: null },
      4: { id: 4, key: K[0], color: 'BLACK', left: 'nil', right: 'nil', p: 9 },
      13: { id: 13, key: K[3], color: 'BLACK', left: 11, right: 18, p: 9 },  // nonno z.p.p
      11: { id: 11, key: K[2], color: 'BLACK', left: 'nil', right: 'nil', p: 13 }, // zio y (nero a sx)
      18: { id: 18, key: K[6], color: 'RED', left: 'nil', right: 'nil', p: 13 }     // genitore z.p (rosso a dx)
    };

    const steps = [
      {
        stage: 'INIT_BST_S2',
        codeLine: 'RBI-1',
        pointers: {},
        log: `1. Inizio RB-INSERT (Ramo Simmetrico): x = T.root (${K[1]}), y = T.NIL. Cerchiamo la posizione per z = ${zKey}.`,
        coordsId: 't2-init',
        treeModifier: (t) => t
      },
      {
        stage: 'DESCEND_S2_1',
        codeLine: 'RBI-7',
        pointers: { x: 9 },
        log: `2. Confronto BST: z.key (${zKey}) > x.key (${K[1]}). Si scende a destra: x = x.right (nodo ${K[3]}), y = ${K[1]}.`,
        coordsId: 't2-init',
        treeModifier: (t) => t
      },
      {
        stage: 'DESCEND_S2_2',
        codeLine: 'RBI-7',
        pointers: { x: 13, y: 9 },
        log: `3. Confronto BST: z.key (${zKey}) > x.key (${K[3]}). Si scende a destra: x = x.right (nodo ${K[6]}), y = ${K[3]}.`,
        coordsId: 't2-init',
        treeModifier: (t) => t
      },
      {
        stage: 'DESCEND_S2_3',
        codeLine: 'RBI-5',
        pointers: { x: 18, y: 13 },
        log: `4. Confronto BST: z.key (${zKey}) < x.key (${K[6]}). Si scende a sinistra: x = x.left (T.NIL), y = ${K[6]}.`,
        coordsId: 't2-init',
        treeModifier: (t) => t
      },
      {
        stage: 'LINK_PARENT_S2',
        codeLine: 'RBI-12',
        pointers: { p: 18 },
        log: `5. Trovata la foglia: z.p = y (${K[6]}). Poiché z.key < y.key, y.left = z. z.left = z.right = T.NIL.`,
        coordsId: 't2-inserted',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[15] = { id: 15, key: zKey, color: 'BLACK', left: 'nil', right: 'nil', p: 18 };
          next[18].left = 15;
          return next;
        }
      },
      {
        stage: 'SET_RED_S2',
        codeLine: 'RBI-16',
        pointers: { z: 15, p: 18 },
        log: `6. Colorazione iniziale: z.color = RED. Viene invocata RB-INSERT-FIXUP(T, z).`,
        coordsId: 't2-inserted',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[15].color = 'RED';
          return next;
        }
      },
      {
        stage: 'CHECK_VIOLATION_S2',
        codeLine: 'FIX-1',
        pointers: { z: 15, p: 18 },
        log: `7. FIXUP Check: while (z.p.color == RED). Entrambi z (${zKey}) e z.p (${K[6]}) sono ROSSI!`,
        coordsId: 't2-inserted',
        treeModifier: (t) => t
      },
      {
        stage: 'EVAL_BRANCH_S2',
        codeLine: 'FIX-16',
        pointers: { z: 15, p: 18, grand: 13, uncle: 11 },
        log: `8. Ramo Simmetrico: z.p (${K[6]}) è figlio DESTRO del nonno ${K[3]}. Lo zio y = z.p.p.left (nodo ${K[2]}) è NERO.`,
        coordsId: 't2-inserted',
        treeModifier: (t) => t
      },
      {
        stage: 'DETECT_CASO_2_SIMM',
        codeLine: 'FIX-24',
        pointers: { z: 15, p: 18, grand: 13, uncle: 11 },
        log: `9. Check Zig-zag Simmetrico: z (${zKey}) è figlio SINISTRO. [CASO 2 SIMMETRICO]. Poniamo z = z.p (${K[6]}).`,
        coordsId: 't2-inserted',
        treeModifier: (t) => t
      },
      {
        stage: 'EXEC_RIGHT_ROTATE_C2_S2',
        codeLine: 'FIX-26',
        pointers: { z: 18, p: 15, grand: 13 },
        log: `10. RIGHT-ROTATE(T, z=${K[6]}): ${zKey} sale al posto di ${K[6]}. La catena a destra si allinea trasformandosi nel CASO 3 Simmetrico!`,
        coordsId: 't2-post-rr',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[18].left = 'nil';
          next[15].right = 18;
          next[18].p = 15;
          next[15].p = 13;
          next[13].right = 15;
          return next;
        }
      },
      {
        stage: 'RECOLOR_CASO_3_S2',
        codeLine: 'FIX-28',
        pointers: { z: 18, p: 15, grand: 13 },
        log: `11. CASO 3 Simmetrico (Ricolorazione): z.p (${zKey}) diventa NERO; z.p.p (${K[3]}) diventa ROSSO.`,
        coordsId: 't2-post-rr',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[15].color = 'BLACK';
          next[13].color = 'RED';
          return next;
        }
      },
      {
        stage: 'EXEC_LEFT_ROTATE_C3_S2',
        codeLine: 'FIX-29',
        pointers: { z: 18, p: 15, grand: 13 },
        log: `12. LEFT-ROTATE(T, z.p.p=${K[3]}): ${zKey} diventa radice del sottoalbero destro; ${K[3]} scende a sinistra. Bilanciamento ultimato!`,
        coordsId: 't2-post-lr',
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[13].right = 'nil';
          next[15].left = 13;
          next[13].p = 15;
          next[15].p = 9;
          next[9].right = 15;
          return next;
        }
      },
      {
        stage: 'TERMINATION_S2',
        codeLine: 'FIX-30',
        pointers: {},
        log: `13. T.root.color = BLACK (${K[1]} è nera). Albero rosso-nero perfettamente valido e bilanciato in O(log n).`,
        coordsId: 't2-post-lr',
        treeModifier: (t) => t
      }
    ];

    const coordsMap = {
      't2-init': {
        9: { x: 225, y: 35 },
        4: { x: 125, y: 95 },
        13: { x: 325, y: 95 },
        11: { x: 275, y: 155 },
        18: { x: 375, y: 155 }
      },
      't2-inserted': {
        9: { x: 225, y: 35 },
        4: { x: 125, y: 95 },
        13: { x: 325, y: 95 },
        11: { x: 275, y: 155 },
        18: { x: 375, y: 155 },
        15: { x: 345, y: 215 }
      },
      't2-post-rr': {
        9: { x: 225, y: 35 },
        4: { x: 125, y: 95 },
        13: { x: 325, y: 95 },
        11: { x: 275, y: 155 },
        15: { x: 375, y: 155 },
        18: { x: 410, y: 215 }
      },
      't2-post-lr': {
        9: { x: 225, y: 35 },
        4: { x: 125, y: 95 },
        15: { x: 325, y: 95 },
        13: { x: 275, y: 155 },
        18: { x: 375, y: 155 },
        11: { x: 240, y: 215 }
      }
    };

    return {
      title: 'Scenario 2: Ramo Destro Simmetrico (Caso 2 Simm. -> Caso 3 Simm.)',
      insertKey: zKey,
      initialTree,
      steps,
      coordsMap
    };
  }

  // SCENARIO 3: Violazione con ZIO ROSSO -> CASO 1 (Ricolorazione & Risalita di 2 livelli)
  // Inseriamo z = K[0] sotto K[1] (rosso), con zio K[5] (rosso)
  const zKey = K[0];
  const initialTree = {
    11: { id: 11, key: K[4], color: 'BLACK', left: 7, right: 18, p: null }, // nonno z.p.p
    7: { id: 7, key: K[2], color: 'RED', left: 4, right: 9, p: 11 },       // genitore z.p (rosso)
    18: { id: 18, key: K[6], color: 'RED', left: 'nil', right: 'nil', p: 11 }, // zio y (rosso)
    4: { id: 4, key: K[1], color: 'BLACK', left: 'nil', right: 'nil', p: 7 },
    9: { id: 9, key: K[3], color: 'BLACK', left: 'nil', right: 'nil', p: 7 }
  };

  const steps = [
    {
      stage: 'INIT_BST_S3',
      codeLine: 'RBI-1',
      pointers: {},
      log: `1. Inizio RB-INSERT: x = T.root (${K[4]}), y = T.NIL. Ricerchiamo la posizione foglia per z = ${zKey}.`,
      coordsId: 't3-init',
      treeModifier: (t) => t
    },
    {
      stage: 'DESCEND_S3',
      codeLine: 'RBI-5',
      pointers: { x: 11 },
      log: `2. Confronto BST: z.key (${zKey}) < x.key (${K[4]}). Si scende a sinistra su x = ${K[2]}, poi su ${K[1]}.`,
      coordsId: 't3-init',
      treeModifier: (t) => t
    },
    {
      stage: 'LINK_S3',
      codeLine: 'RBI-12',
      pointers: { p: 4 },
      log: `3. Ancoraggio foglia: z.p = ${K[1]}. Il nodo z viene agganciato a sinistra di ${K[1]}.`,
      coordsId: 't3-inserted',
      treeModifier: (t) => {
        const next = JSON.parse(JSON.stringify(t));
        next[3] = { id: 3, key: zKey, color: 'BLACK', left: 'nil', right: 'nil', p: 4 };
        next[4].left = 3;
        return next;
      }
    },
    {
      stage: 'COLOR_RED_S3',
      codeLine: 'RBI-16',
      pointers: { z: 3, p: 4 },
      log: `4. Colorazione: z.color = RED. Poiché il genitore ${K[1]} è NERO, il nodo foglia non crea violazioni immediate.`,
      coordsId: 't3-inserted',
      treeModifier: (t) => {
        const next = JSON.parse(JSON.stringify(t));
        next[3].color = 'RED';
        return next;
      }
    },
    {
      stage: 'SIMULATE_PROPAGATION',
      codeLine: 'FIX-1',
      pointers: { z: 7, p: 11 },
      log: `5. Propagazione: Esaminiamo la violazione superiore dove z=7 (${K[2]}) è ROSSO e suo genitore ${K[4]} è la radice.`,
      coordsId: 't3-inserted',
      treeModifier: (t) => t
    },
    {
      stage: 'DETECT_CASO_1',
      codeLine: 'FIX-4',
      pointers: { z: 7, p: 7, uncle: 18, grand: 11 },
      log: `6. Identificazione Zio: Lo zio y = z.p.p.right (${K[6]}) è ROSSO! Siamo nel [CASO 1: Zio Rosso].`,
      coordsId: 't3-inserted',
      treeModifier: (t) => t
    },
    {
      stage: 'RECOLOR_CASO_1',
      codeLine: 'FIX-7',
      pointers: { z: 7, p: 7, uncle: 18, grand: 11 },
      log: `7. Risoluzione CASO 1: z.p (${K[2]}) -> NERO; y (${K[6]}) -> NERO; z.p.p (${K[4]}) -> ROSSO. Nessuna rotazione necessaria!`,
      coordsId: 't3-inserted',
      treeModifier: (t) => {
        const next = JSON.parse(JSON.stringify(t));
        next[7].color = 'BLACK';
        next[18].color = 'BLACK';
        next[11].color = 'RED';
        return next;
      }
    },
    {
      stage: 'ADVANCE_TWO_LEVELS',
      codeLine: 'FIX-8',
      pointers: { z: 11 },
      log: `8. Avanzamento Puntatore: z = z.p.p (nodo radice ${K[4]}). La violazione è salita di 2 livelli verso la radice.`,
      coordsId: 't3-inserted',
      treeModifier: (t) => t
    },
    {
      stage: 'FIX_ROOT_BLACK',
      codeLine: 'FIX-30',
      pointers: { z: 11 },
      log: `9. Uscita dal ciclo: z (${K[4]}) è la radice T.root. Si forza T.root.color = BLACK sanando la Proprietà 2. Fixup completato!`,
      coordsId: 't3-inserted',
      treeModifier: (t) => {
        const next = JSON.parse(JSON.stringify(t));
        next[11].color = 'BLACK';
        return next;
      }
    }
  ];

  const coordsMap = {
    't3-init': {
      11: { x: 225, y: 35 },
      7: { x: 125, y: 95 },
      18: { x: 325, y: 95 },
      4: { x: 70, y: 155 },
      9: { x: 175, y: 155 }
    },
    't3-inserted': {
      11: { x: 225, y: 35 },
      7: { x: 125, y: 95 },
      18: { x: 325, y: 95 },
      4: { x: 70, y: 155 },
      9: { x: 175, y: 155 },
      3: { x: 35, y: 215 }
    }
  };

  return {
    title: 'Scenario 3: Propagazione con Ricolorazione (Caso 1: Zio Rosso -> Radice)',
    insertKey: zKey,
    initialTree,
    steps,
    coordsMap
  };
};

export default function RBInsertApp({ setRigaAttiva }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scenario, setScenario] = useState(() => createScenarioData(0));
  const [tree, setTree] = useState(() => JSON.parse(JSON.stringify(scenario.initialTree)));
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState([`Albero pronto. Clicca "Avvia Inserimento" per inserire la chiave z = ${scenario.insertKey}.`]);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleNextStep = () => {
    if (stepIndex >= scenario.steps.length) return;
    const current = scenario.steps[stepIndex];
    setTree(current.treeModifier(tree));
    setLogs((prev) => [...prev, current.log]);
    if (setRigaAttiva) setRigaAttiva(current.codeLine);
    setStepIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    setTree(JSON.parse(JSON.stringify(scenario.initialTree)));
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([`Albero ripristinato allo stato iniziale. Pronto a inserire z = ${scenario.insertKey}.`]);
  };

  const handleShuffle = () => {
    // Alterna a rotazione tra i 3 Scenari, ricalcolando tutte le chiavi in modo casuale
    const nextScenarioIdx = (scenarioIndex + 1) % 3;
    setScenarioIndex(nextScenarioIdx);
    const newScenario = createScenarioData(nextScenarioIdx);
    setScenario(newScenario);
    setTree(JSON.parse(JSON.stringify(newScenario.initialTree)));
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([`Nuovo Scenario Didattico caricato [${nextScenarioIdx + 1}/3]: ${newScenario.title}. Chiavi ricalcolate casualmente in ordine BST.`]);
  };

  const isDone = stepIndex >= scenario.steps.length;
  const currentStage = stepIndex > 0 ? scenario.steps[stepIndex - 1].stage : 'PRONTO';
  const currentCoordsId = stepIndex > 0 ? scenario.steps[stepIndex - 1].coordsId : Object.keys(scenario.coordsMap)[0];
  const currentCoords = scenario.coordsMap[currentCoordsId] || Object.values(scenario.coordsMap)[0];
  const currentPointers = stepIndex > 0 ? scenario.steps[stepIndex - 1].pointers : {};

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#0b1120',
      border: '1px solid #1e293b',
      borderRadius: '16px',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Visualizer */}
      <div style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              RB-INSERT & FIXUP Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            {scenario.title}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={handleShuffle} 
            title="Alterna tra i vari scenari didattici rigenerando chiavi casuali conformi"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '7px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Shuffle size={14} /> Shuffle Scenario & Valori
          </button>

          <button 
            onClick={handleReset} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '7px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>

          <button 
            onClick={handleNextStep} 
            disabled={isDone}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isDone ? '#334155' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              cursor: isDone ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              boxShadow: isDone ? 'none' : '0 0 14px rgba(2, 132, 199, 0.45)',
              transition: 'all 0.15s ease'
            }}
          >
            {isDone ? <CheckCircle2 size={15} /> : <Play size={15} />}
            {isDone ? 'Inserimento Terminato' : stepIndex === 0 ? `Inserisci z = ${scenario.insertKey}` : 'Passo Successivo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Pannello Sinistro: Canvas Grafico SVG dell'Albero */}
        <div style={{
          flex: '1 1 58%',
          padding: '16px',
          backgroundColor: '#090d16',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minHeight: 0,
          overflow: 'hidden',
          textAlign: 'left'
        }}>

          {/* 1. Badge Operazione */}
          <div style={{
            backgroundColor: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
            border: isDone ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(56, 189, 248, 0.25)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: isDone ? '#34d399' : '#38bdf8',
            letterSpacing: '0.04em',
            flexShrink: 0
          }}>
            {isDone 
              ? 'RB-INSERT COMPLETATO: INSERIMENTO E BILANCIAMENTO COMPLETATI'
              : currentStage === 'PRONTO'
              ? `PRONTO PER INSERIRE z = ${scenario.insertKey} NELL'ALBERO`
              : `FASE ATTUALE [PASSO ${stepIndex}/${scenario.steps.length}]: ${currentStage.replace(/_/g, ' ')}`}
          </div>

          {/* 2. Canvas Grafico SVG dell'Albero */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            height: '240px',
            maxHeight: '240px',
            backgroundColor: '#070b14',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 450 260">
              {/* Archi tra nodi padri e nodi figli */}
              {Object.values(tree).map(node => {
                const pCoord = currentCoords[node.id];
                if (!pCoord) return null;

                const leftChild = tree[node.left];
                const rightChild = tree[node.right];

                return (
                  <g key={`links-${node.id}`}>
                    {leftChild && currentCoords[leftChild.id] && (
                      <line
                        x1={pCoord.x}
                        y1={pCoord.y}
                        x2={currentCoords[leftChild.id].x}
                        y2={currentCoords[leftChild.id].y}
                        stroke="#334155"
                        strokeWidth="2"
                      />
                    )}
                    {rightChild && currentCoords[rightChild.id] && (
                      <line
                        x1={pCoord.x}
                        y1={pCoord.y}
                        x2={currentCoords[rightChild.id].x}
                        y2={currentCoords[rightChild.id].y}
                        stroke="#334155"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                );
              })}

              {/* Rendering dei Nodi Cerchio */}
              {Object.values(tree).map(node => {
                const coord = currentCoords[node.id];
                if (!coord) return null;

                const isZ = currentPointers.z === node.id;
                const isP = currentPointers.p === node.id;
                const isUncle = currentPointers.uncle === node.id;
                const isGrand = currentPointers.grand === node.id;
                const isX = currentPointers.x === node.id;

                const isRed = node.color === 'RED';
                const fillColor = isRed ? '#991b1b' : '#020617';
                
                // Evidenziazione cromaticamente differenziata dei ruoli
                const strokeColor = isZ ? '#38bdf8' : isP ? '#10b981' : isUncle ? '#f59e0b' : isX ? '#a855f7' : isRed ? '#ef4444' : '#475569';
                const strokeWidth = isZ || isP || isUncle || isGrand || isX ? 3 : 2;

                return (
                  <g key={`node-${node.id}`} style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={16}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                    <text
                      x={coord.x}
                      y={coord.y + 4}
                      fill="#ffffff"
                      fontSize="10px"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.key}
                    </text>

                    {/* Tag descrittivi dei puntatori dell'algoritmo in tempo reale */}
                    {isZ && (
                      <text x={coord.x - 24} y={coord.y + 4} fill="#38bdf8" fontSize="9px" fontWeight="bold">
                        z
                      </text>
                    )}
                    {isP && (
                      <text x={coord.x + 22} y={coord.y - 6} fill="#10b981" fontSize="8px" fontWeight="bold">
                        z.p
                      </text>
                    )}
                    {isUncle && (
                      <text x={coord.x + 20} y={coord.y + 12} fill="#f59e0b" fontSize="8px" fontWeight="bold">
                        y (zio)
                      </text>
                    )}
                    {(isX) && (
                        <text 
                            x={coord.x} 
                            y={coord.y - 20} 
                            fill="#c084fc" 
                            fontSize="8px" 
                            fontFamily="monospace"
                            fontWeight="bold" 
                            textAnchor="middle"
                        >
                            x (cur)
                        </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 3. Footer Proprietà & Statistiche */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            backgroundColor: '#070b14',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            marginTop: 'auto',
            flexShrink: 0
          }}>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Nuova Chiave z</span>
              <strong style={{ fontSize: '0.95rem', color: '#38bdf8', fontFamily: 'monospace' }}>{scenario.insertKey}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Costo Asintotico</span>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc', fontFamily: 'monospace' }}>O(log n)</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Rotazioni Eseguite</span>
              <strong style={{ fontSize: '0.95rem', color: '#10b981', fontFamily: 'monospace' }}>
                {scenarioIndex === 2 ? '0 (Solo Ricolorazione)' : isDone ? '2 (Max Bound)' : stepIndex >= 10 ? '1' : '0'}
              </strong>
            </div>
          </div>

        </div>

        {/* Pannello Destro: Log Esecuzione Atomico */}
        <div style={{
          flex: '1 1 42%',
          backgroundColor: '#0b1120',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#38bdf8',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            flexShrink: 0
          }}>
            <ArrowRight size={14} /> Risoluzione Violazioni & Puntatori
          </div>

          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <div className="custom-scrollbar" style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#070b14',
              borderRadius: '10px',
              border: '1px solid #1e293b',
              padding: '12px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              textAlign: 'left'
            }}>
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  style={{
                    paddingBottom: '8px',
                    marginBottom: '8px',
                    borderBottom: index === logs.length - 1 ? 'none' : '1px solid #111827',
                    color: index === logs.length - 1 ? '#f8fafc' : '#64748b',
                    fontWeight: index === logs.length - 1 ? 600 : 400,
                    lineHeight: 1.5,
                    textAlign: 'left'
                  }}
                >
                  <span style={{ color: '#38bdf8', marginRight: '6px' }}>[{index}]</span>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}