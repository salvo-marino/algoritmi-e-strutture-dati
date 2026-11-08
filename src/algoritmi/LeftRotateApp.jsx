import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

// Generatore con estrazione casuale delle chiavi e supporto a topologie multiple
const generateDynamicRBTree = (topologyType) => {
  if (topologyType === 'root') {
    // Topologia B: x è la radice dell'albero (x = 15, y = 25)
    // 5 chiavi distinte in ordine crescente: k8 < k15 (x) < k20 (beta) < k25 (y) < k30 (gamma)
    const values = [];
    while (values.length < 5) {
      const val = Math.floor(Math.random() * 85) + 8;
      if (!values.includes(val)) values.push(val);
    }
    values.sort((a, b) => a - b);
    const [k8, k15, k20, k25, k30] = values;

    const initialTree = {
      15: { id: 15, key: k15, color: 'BLACK', left: 8, right: 25, p: null },
      8: { id: 8, key: k8, color: 'BLACK', left: 'nil', right: 'nil', p: 15 },
      25: { id: 25, key: k25, color: 'RED', left: 20, right: 30, p: 15 },
      20: { id: 20, key: k20, color: 'BLACK', left: 'nil', right: 'nil', p: 25 },
      30: { id: 30, key: k30, color: 'BLACK', left: 'nil', right: 'nil', p: 25 }
    };

    return {
      type: 'root',
      tree: initialTree,
      rootId: 15,
      pivotX: 15,
      pivotY: 25,
      betaId: 20,
      keys: { x: k15, y: k25, beta: k20 },
      coordsPre: {
        15: { x: 200, y: 40 },
        8: { x: 120, y: 110 },
        25: { x: 280, y: 110 },
        20: { x: 240, y: 180 },
        30: { x: 330, y: 180 }
      },
      coordsPost: {
        25: { x: 200, y: 40 },
        15: { x: 120, y: 110 },
        30: { x: 280, y: 110 },
        8: { x: 80, y: 180 },
        20: { x: 160, y: 180 }
      },
      steps: [
        {
          stage: 'INIT',
          codeLine: 'LR-1',
          log: `1. Inizio LEFT-ROTATE(T, x=${k15}): il perno x coincide con T.root. Identificato y = x.right (y=${k25}). Sottoalbero mobile β radicato in ${k20}.`,
          treeModifier: (t) => t,
          newRoot: 15
        },
        {
          stage: 'FASE_1',
          codeLine: 'LR-2',
          log: `2. Fase 1: x.right = y.left (${k15}.right = ${k20}). Il sottoalbero β si aggancia a destra di ${k15}.`,
          treeModifier: (t) => {
            const next = JSON.parse(JSON.stringify(t));
            next[15].right = 20;
            if (next[20]) next[20].p = 15;
            return next;
          },
          newRoot: 15
        },
        {
          stage: 'FASE_2',
          codeLine: 'LR-7',
          log: `3. Fase 2: poiché x.p == T.nil, T.root = y (il nodo con chiave ${k25} diventa la nuova radice assoluta). y.p = null.`,
          treeModifier: (t) => {
            const next = JSON.parse(JSON.stringify(t));
            next[25].p = null;
            return next;
          },
          newRoot: 25
        },
        {
          stage: 'FASE_3',
          codeLine: 'LR-11',
          log: `4. Fase 3: y.left = x (${k25}.left = ${k15}) e x.p = y (${k15}.p = ${k25}). Rotazione alla radice completata in Θ(1)!`,
          treeModifier: (t) => {
            const next = JSON.parse(JSON.stringify(t));
            next[25].left = 15;
            next[15].p = 25;
            return next;
          },
          newRoot: 25
        }
      ]
    };
  }

  // Topologia A: x è un nodo interno figlio destro della radice 7 (x = 11, y = 18)
  // 7 chiavi distinte: k4 < k7 (root) < k9 < k11 (x) < k14 (beta) < k18 (y) < k22 (gamma)
  const values = [];
  while (values.length < 7) {
    const val = Math.floor(Math.random() * 85) + 8;
    if (!values.includes(val)) values.push(val);
  }
  values.sort((a, b) => a - b);
  const [k4, k7, k9, k11, k14, k18, k22] = values;

  const initialTree = {
    7: { id: 7, key: k7, color: 'BLACK', left: 4, right: 11, p: null },
    4: { id: 4, key: k4, color: 'BLACK', left: 'nil', right: 'nil', p: 7 },
    11: { id: 11, key: k11, color: 'RED', left: 9, right: 18, p: 7 },
    9: { id: 9, key: k9, color: 'BLACK', left: 'nil', right: 'nil', p: 11 },
    18: { id: 18, key: k18, color: 'BLACK', left: 14, right: 22, p: 11 },
    14: { id: 14, key: k14, color: 'RED', left: 'nil', right: 'nil', p: 18 },
    22: { id: 22, key: k22, color: 'RED', left: 'nil', right: 'nil', p: 18 }
  };

  return {
    type: 'internal',
    tree: initialTree,
    rootId: 7,
    pivotX: 11,
    pivotY: 18,
    betaId: 14,
    keys: { x: k11, y: k18, beta: k14, root: k7 },
    coordsPre: {
      7: { x: 190, y: 35 },
      4: { x: 90, y: 95 },
      11: { x: 290, y: 95 },
      9: { x: 240, y: 155 },
      18: { x: 340, y: 155 },
      14: { x: 300, y: 215 },
      22: { x: 380, y: 215 }
    },
    coordsPost: {
      7: { x: 190, y: 35 },
      4: { x: 90, y: 95 },
      18: { x: 290, y: 95 },
      11: { x: 235, y: 155 },
      22: { x: 345, y: 155 },
      9: { x: 195, y: 215 },
      14: { x: 275, y: 215 }
    },
    steps: [
      {
        stage: 'INIT',
        codeLine: 'LR-1',
        log: `1. Inizio LEFT-ROTATE(T, x=${k11}): identificato y = x.right (y=${k18}). Sottoalbero mobile β radicato nel nodo con chiave ${k14}.`,
        treeModifier: (t) => t,
        newRoot: 7
      },
      {
        stage: 'FASE_1',
        codeLine: 'LR-2',
        log: `2. Fase 1: x.right = y.left (${k11}.right = ${k14}). Il sottoalbero β viene agganciato a destra di ${k11}.`,
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[11].right = 14;
          if (next[14]) next[14].p = 11;
          return next;
        },
        newRoot: 7
      },
      {
        stage: 'FASE_2',
        codeLine: 'LR-5',
        log: `3. Fase 2: y.p = x.p (${k18}.p = ${k7}). Poiché x era figlio destro di ${k7}, colleghiamo ${k7}.right = ${k18}.`,
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[18].p = 7;
          next[7].right = 18;
          return next;
        },
        newRoot: 7
      },
      {
        stage: 'FASE_3',
        codeLine: 'LR-11',
        log: `4. Fase 3: y.left = x (${k18}.left = ${k11}) e x.p = y (${k11}.p = ${k18}). Rotazione sinistra completata in Θ(1)!`,
        treeModifier: (t) => {
          const next = JSON.parse(JSON.stringify(t));
          next[18].left = 11;
          next[11].p = 18;
          return next;
        },
        newRoot: 7
      }
    ]
  };
};

export default function LeftRotateApp({ setRigaAttiva }) {
  const [topologyMode, setTopologyMode] = useState('internal'); // 'internal' | 'root'
  const [config, setConfig] = useState(() => generateDynamicRBTree('internal'));
  const [tree, setTree] = useState(() => JSON.parse(JSON.stringify(config.tree)));
  const [, setRootId] = useState(config.rootId);
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState(() => [
    `Albero Rosso-Nero pronto. Perno x = ${config.keys.x}, figlio destro y = ${config.keys.y} (${config.type === 'root' ? 'Perno alla Radice' : 'Perno Interno'}).`
  ]);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleNextStep = () => {
    if (stepIndex >= config.steps.length) return;

    const current = config.steps[stepIndex];
    setTree(current.treeModifier(tree));
    setRootId(current.newRoot);
    setLogs(prev => [...prev, current.log]);
    if (setRigaAttiva) setRigaAttiva(current.codeLine);
    setStepIndex(prev => prev + 1);
  };

  const handleReset = () => {
    setTree(JSON.parse(JSON.stringify(config.tree)));
    setRootId(config.rootId);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([`Albero ripristinato allo stato iniziale (Perno x = ${config.keys.x}, y = ${config.keys.y}).`]);
  };

  const handleShuffle = () => {
    // Alterna tra topologia a perno interno e rotazione alla radice, randomizzando contemporaneamente le chiavi
    const nextTopology = topologyMode === 'internal' ? 'root' : 'internal';
    setTopologyMode(nextTopology);
    const newConfig = generateDynamicRBTree(nextTopology);
    setConfig(newConfig);
    setTree(JSON.parse(JSON.stringify(newConfig.tree)));
    setRootId(newConfig.rootId);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([
      `Nuova configurazione casuale generata (${nextTopology === 'root' ? 'Perno x coincide con T.root' : 'Perno x nodo interno'})! x = ${newConfig.keys.x}, y = ${newConfig.keys.y}.`
    ]);
  };

  const isDone = stepIndex >= config.steps.length;
  const currentStage = stepIndex > 0 ? config.steps[stepIndex - 1].stage : 'PRONTO';
  const currentCoords = isDone ? config.coordsPost : config.coordsPre;

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
              LEFT-ROTATE Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Riorganizzazione locale dei puntatori in tempo Θ(1) preservando la proprietà BST
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={handleShuffle} 
            title="Alterna la struttura (perno interno vs radice) e rigenera chiavi casuali"
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
            <Shuffle size={14} /> Shuffle Struttura
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
            {isDone ? 'Rotazione Completata' : stepIndex === 0 ? 'Avvia Rotazione' : 'Prossima Fase'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Pannello Sinistro: Rappresentazione Topologica ad Albero SVG */}
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
              ? `ROTAZIONE COMPLETATA: y (${config.keys.y}) È LA NUOVA RADICE LOCALE, x (${config.keys.x}) È SUO FIGLIO SX`
              : currentStage === 'PRONTO'
              ? `STATO INIZIALE: PERNO x = ${config.keys.x}, y = x.right = ${config.keys.y} (${config.type === 'root' ? 'x coincide con T.root' : 'x nodo interno'})`
              : `FASE ATTUALE: ${currentStage} — APPLICAZIONE PUNTATORI`}
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
              {/* Linee di collegamento tra nodi padri e figli */}
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
                        strokeDasharray={node.id === config.pivotY && leftChild.id === config.pivotX ? "4 2" : "none"}
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
                        strokeDasharray={node.id === config.pivotX && rightChild.id === config.betaId ? "4 2" : "none"}
                      />
                    )}
                  </g>
                );
              })}

              {/* Rendering dei Nodi Cerchio */}
              {Object.values(tree).map(node => {
                const coord = currentCoords[node.id];
                if (!coord) return null;

                const isPivotX = node.id === config.pivotX;
                const isPivotY = node.id === config.pivotY;
                const isBeta = node.id === config.betaId;

                const isRed = node.color === 'RED';
                const fillColor = isRed ? '#991b1b' : '#020617';
                const strokeColor = isPivotX ? '#38bdf8' : isPivotY ? '#10b981' : isBeta ? '#f59e0b' : isRed ? '#ef4444' : '#475569';
                const strokeWidth = isPivotX || isPivotY || isBeta ? 3 : 2;

                return (
                  <g key={`node-${node.id}`} style={{ transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
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

                    {/* Tag descrittivi perni */}
                    {isPivotX && (
                      <text x={coord.x - 24} y={coord.y + 4} fill="#38bdf8" fontSize="9px" fontWeight="bold">
                        x
                      </text>
                    )}
                    {isPivotY && (
                      <text x={coord.x + 20} y={coord.y + 4} fill="#10b981" fontSize="9px" fontWeight="bold">
                        y
                      </text>
                    )}
                    {isBeta && (
                      <text x={coord.x + 20} y={coord.y + 4} fill="#f59e0b" fontSize="8px" fontWeight="bold">
                        β
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
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Perno di Rotazione (x)</span>
              <strong style={{ fontSize: '0.95rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                {config.keys.x} ({config.tree[config.pivotX].color})
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Nuova Radice Locale (y)</span>
              <strong style={{ fontSize: '0.95rem', color: '#10b981', fontFamily: 'monospace' }}>
                {config.keys.y} ({config.tree[config.pivotY].color})
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Topologia</span>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc', fontFamily: 'monospace' }}>
                {config.type === 'root' ? 'Radice Assoluta' : 'Nodo Interno'}
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
            <ArrowRight size={14} /> Tracciamento Atomico dei Puntatori
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