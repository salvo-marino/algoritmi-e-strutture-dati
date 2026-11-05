import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

// Genera un array casuale disordinato di 7 valori univoci
const generateRandomDisorderedArray = () => {
  const setVals = new Set();
  while (setVals.size < 7) {
    setVals.add(Math.floor(Math.random() * 85) + 10);
  }
  return Array.from(setVals);
};

const initialDefault = [4, 1, 3, 2, 16, 9, 10];

export default function BuildMaxHeapApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => [...initialDefault]);
  const [heap, setHeap] = useState([...initialDefault]);
  const [logs, setLogs] = useState(["Array disordinato caricato. Indice non-foglia iniziale: ⌊7/2⌋ = 3."]);
  const [state, setState] = useState('IDLE'); // IDLE, COMPARING, FOUND_LARGEST, SWAPPING, DONE
  const [loopI, setLoopI] = useState(Math.floor(initialDefault.length / 2) - 1); // 0-based: 2 (nodo 3)
  const [currentNode, setCurrentNode] = useState(Math.floor(initialDefault.length / 2) - 1);
  const [largestNode, setLargestNode] = useState(0);
  const [highlightedNodes, setHighlightedNodes] = useState([]);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Coordinate normalizzate per l'albero (base 600x280)
  const nodeCoords = [
    { cx: 300, cy: 38 },  // 0: Radice (livello 0)
    { cx: 165, cy: 115 }, // 1: Sinistro (livello 1)
    { cx: 435, cy: 115 }, // 2: Destro (livello 1)
    { cx: 95,  cy: 205 }, // 3: LL (livello 2)
    { cx: 235, cy: 205 }, // 4: LR (livello 2)
    { cx: 365, cy: 205 }, // 5: RL (livello 2)
    { cx: 505, cy: 205 }  // 6: RR (livello 2)
  ];

  const left = (i) => 2 * i + 1;
  const right = (i) => 2 * i + 2;
  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const handleRandomize = () => {
    const newArr = generateRandomDisorderedArray();
    setInitial(newArr);
    setHeap([...newArr]);
    setState('IDLE');
    let startIdx = Math.floor(newArr.length / 2) - 1;
    setLoopI(startIdx);
    setCurrentNode(startIdx);
    setLargestNode(0);
    setHighlightedNodes([]);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo array disordinato generato. Pronto a eseguire BUILD-MAX-HEAP."]);
  };

  const nextStep = () => {
    let currentArr = [...heap];
    let i = currentNode;
    let l = left(i);
    let r = right(i);

    switch (state) {
      case 'IDLE': {
        if (loopI < 0) {
          setState('DONE');
          setHighlightedNodes([]);
          if (setRigaAttiva) setRigaAttiva(null);
          addLog("BUILD-MAX-HEAP terminato. Tutti i nodi verificano la proprietà!");
          break;
        }
        let nodes = [i];
        if (l < currentArr.length) nodes.push(l);
        if (r < currentArr.length) nodes.push(r);
        setHighlightedNodes(nodes);
        setState('COMPARING');
        if (setRigaAttiva) setRigaAttiva('BMH-2');
        addLog(`Iterazione i=${loopI + 1}: Eseguo MAX-HEAPIFY sul sotto-albero con radice ${i + 1} (valore: ${currentArr[i]}).`);
        break;
      }

      case 'COMPARING': {
        let largest = i;
        if (l < currentArr.length && currentArr[l] > currentArr[largest]) largest = l;
        if (r < currentArr.length && currentArr[r] > currentArr[largest]) largest = r;

        setLargestNode(largest);
        setHighlightedNodes([largest]);
        setState('FOUND_LARGEST');
        if (setRigaAttiva) setRigaAttiva('BMH-3');
        addLog(`Valore massimo tra radice e figli trovato all'indice ${largest + 1} (valore: ${currentArr[largest]}).`);
        break;
      }

      case 'FOUND_LARGEST': {
        if (largestNode !== i) {
          setState('SWAPPING');
          setHighlightedNodes([i, largestNode]);
          if (setRigaAttiva) setRigaAttiva('BMH-3');
          addLog(`Scambio: A[${i + 1}] (${currentArr[i]}) scambia con A[${largestNode + 1}] (${currentArr[largestNode]}).`);
        } else {
          addLog(`Il sotto-albero con radice ${i + 1} soddisfa la proprietà Max-Heap.`);
          let nextI = loopI - 1;
          if (nextI >= 0) {
            setLoopI(nextI);
            setCurrentNode(nextI);
            setState('IDLE');
            setHighlightedNodes([nextI]);
            if (setRigaAttiva) setRigaAttiva('BMH-2');
          } else {
            setState('DONE');
            setHighlightedNodes([]);
            if (setRigaAttiva) setRigaAttiva(null);
            addLog("BUILD-MAX-HEAP completato: array trasformato in Max-Heap con successo.");
          }
        }
        break;
      }

      case 'SWAPPING': {
        let temp = currentArr[i];
        currentArr[i] = currentArr[largestNode];
        currentArr[largestNode] = temp;
        setHeap(currentArr);

        let nextSubNode = largestNode;
        if (left(nextSubNode) < currentArr.length) {
          setCurrentNode(nextSubNode);
          setState('IDLE');
          if (setRigaAttiva) setRigaAttiva('BMH-3');
          addLog(`Continuo la discesa su indice ${nextSubNode + 1}.`);
        } else {
          let nextI = loopI - 1;
          if (nextI >= 0) {
            setLoopI(nextI);
            setCurrentNode(nextI);
            setState('IDLE');
            setHighlightedNodes([nextI]);
            if (setRigaAttiva) setRigaAttiva('BMH-2');
            addLog(`Discesa completata. Passo al ciclo for precedente: i=${nextI + 1}.`);
          } else {
            setState('DONE');
            setHighlightedNodes([]);
            if (setRigaAttiva) setRigaAttiva(null);
            addLog("Tutti i cicli sono conclusi: BUILD-MAX-HEAP completato in tempo lineare Θ(n).");
          }
        }
        break;
      }

      default:
        break;
    }
  };

  const reset = () => {
    setHeap([...initial]);
    setLogs(["Array ripristinato allo stato iniziale. Pronto a riavviare BUILD-MAX-HEAP."]);
    setState('IDLE');
    let startIdx = Math.floor(initial.length / 2) - 1;
    setLoopI(startIdx);
    setCurrentNode(startIdx);
    setLargestNode(0);
    setHighlightedNodes([]);
    if (setRigaAttiva) setRigaAttiva(null);
  };

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
              BUILD-MAX-HEAP Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Costruzione bottom-up in tempo lineare Θ(n) da ⌊n/2⌋ a ritroso fino a 1
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleRandomize} 
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
            <Shuffle size={14} /> Casuale
          </button>
          <button 
            onClick={reset} 
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
            onClick={nextStep} 
            disabled={state === 'DONE'} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: state === 'DONE' ? '#334155' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              cursor: state === 'DONE' ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              boxShadow: state === 'DONE' ? 'none' : '0 0 14px rgba(2, 132, 199, 0.45)',
              transition: 'all 0.15s ease'
            }}
          >
            {state === 'DONE' ? <CheckCircle2 size={15} /> : <Play size={15} />}
            {state === 'DONE' ? 'Completato' : 'Prossimo Passo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Pannello sinistro: Array e Albero */}
        <div style={{ flex: '1 1 58%', padding: '18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          {/* Array View */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              ARRAY A (ITERAZIONE ATTUALE CICLO FOR: i={loopI >= 0 ? loopI + 1 : 'FINE'})
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {heap.map((val, idx) => {
                const isHighlight = highlightedNodes.includes(idx);
                const isTargetLoop = idx === loopI && state !== 'DONE';
                
                let bg = '#111827';
                let border = '#1f2937';
                let color = '#cbd5e1';
                let shadow = 'none';

                if (state === 'SWAPPING' && (idx === currentNode || idx === largestNode)) {
                  bg = '#78350f'; border = '#f59e0b'; color = '#fef3c7'; shadow = '0 0 12px rgba(245, 158, 11, 0.45)';
                } else if (isHighlight) {
                  bg = '#312e81'; border = '#6366f1'; color = '#e0e7ff'; shadow = '0 0 12px rgba(99, 102, 241, 0.4)';
                } else if (isTargetLoop) {
                  border = '#0284c7'; shadow = '0 0 8px rgba(2, 132, 199, 0.4)';
                }

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '3px' }}>{idx + 1}</span>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: bg,
                      border: `2px solid ${border}`,
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: color,
                      boxShadow: shadow,
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Albero View */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              ALBERO BINARIO IN COSTRUZIONE BOTTOM-UP
            </span>
            <div style={{
              position: 'relative',
              width: '100%',
              flex: 1,
              minHeight: '250px',
              backgroundColor: '#070b14',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              marginTop: '8px',
              overflow: 'hidden'
            }}>
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {nodeCoords.map((coord, idx) => {
                  const l = left(idx);
                  const r = right(idx);
                  const lines = [];
                  if (l < heap.length) {
                    lines.push(
                      <line 
                        key={`l-${idx}`} 
                        x1={`${(coord.cx / 600) * 100}%`} 
                        y1={`${(coord.cy / 280) * 100}%`} 
                        x2={`${(nodeCoords[l].cx / 600) * 100}%`} 
                        y2={`${(nodeCoords[l].cy / 280) * 100}%`} 
                        stroke="#334155" 
                        strokeWidth="2" 
                      />
                    );
                  }
                  if (r < heap.length) {
                    lines.push(
                      <line 
                        key={`r-${idx}`} 
                        x1={`${(coord.cx / 600) * 100}%`} 
                        y1={`${(coord.cy / 280) * 100}%`} 
                        x2={`${(nodeCoords[r].cx / 600) * 100}%`} 
                        y2={`${(nodeCoords[r].cy / 280) * 100}%`} 
                        stroke="#334155" 
                        strokeWidth="2" 
                      />
                    );
                  }
                  return lines;
                })}
              </svg>

              {heap.map((val, idx) => {
                const coord = nodeCoords[idx];
                const isHighlight = highlightedNodes.includes(idx);
                const isTargetLoop = idx === loopI && state !== 'DONE';
                
                let bg = '#0f172a';
                let border = '#334155';
                let color = '#f8fafc';
                let shadow = '0 2px 6px rgba(0,0,0,0.5)';

                if (state === 'SWAPPING' && (idx === currentNode || idx === largestNode)) {
                  bg = '#78350f'; border = '#f59e0b'; color = '#fef3c7'; shadow = '0 0 14px rgba(245, 158, 11, 0.6)';
                } else if (isHighlight) {
                  bg = '#312e81'; border = '#6366f1'; color = '#ffffff'; shadow = '0 0 14px rgba(99, 102, 241, 0.5)';
                } else if (isTargetLoop) {
                  bg = '#0c4a6e'; border = '#38bdf8'; color = '#ffffff'; shadow = '0 0 14px rgba(56, 189, 248, 0.5)';
                }

                return (
                  <div
                    key={`tree-${idx}`}
                    style={{
                      position: 'absolute',
                      left: `${(coord.cx / 600) * 100}%`,
                      top: `${(coord.cy / 280) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: bg,
                      border: `2px solid ${border}`,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      zIndex: isHighlight || isTargetLoop ? 3 : 2,
                      boxShadow: shadow,
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {val}
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-8px',
                      backgroundColor: '#0c1322',
                      border: '1px solid #334155',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      fontSize: '0.62rem',
                      color: '#94a3b8',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      lineHeight: 1
                    }}>
                      i={idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Log di Esecuzione */}
        <div style={{ flex: '1 1 42%', backgroundColor: '#0b1120', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
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
            <ArrowRight size={14} /> Log di Esecuzione
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