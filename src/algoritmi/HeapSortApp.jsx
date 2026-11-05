import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

// Genera un Max-Heap valido iniziale di 7 elementi univoci compresi tra 10 e 99
const generateRandomInitialMaxHeap = () => {
  const setVals = new Set();
  while (setVals.size < 7) {
    setVals.add(Math.floor(Math.random() * 85) + 10);
  }
  const A = Array.from(setVals);

  // Costruisce un Max-Heap valido iniziale
  const maxHeapify = (arr, n, i) => {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest !== i) {
      const temp = arr[i];
      arr[i] = arr[largest];
      arr[largest] = temp;
      maxHeapify(arr, n, largest);
    }
  };

  for (let i = Math.floor(A.length / 2) - 1; i >= 0; i--) {
    maxHeapify(A, A.length, i);
  }

  return A;
};

const initialDefault = [16, 14, 10, 8, 7, 9, 3];

export default function HeapSortApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => [...initialDefault]);
  const [arr, setArr] = useState([...initialDefault]);
  const [heapSize, setHeapSize] = useState(initialDefault.length);
  const [logs, setLogs] = useState(["Max-Heap pronto. Inizio estrazione iterativa con HEAPSORT."]);
  const [state, setState] = useState('IDLE'); // IDLE, SWAP_ROOT_LAST, HEAPIFYING, DONE
  const [currentNode, setCurrentNode] = useState(0);
  const [highlighted, setHighlighted] = useState([]);

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
    const newHeap = generateRandomInitialMaxHeap();
    setInitial(newHeap);
    setArr([...newHeap]);
    setHeapSize(newHeap.length);
    setState('IDLE');
    setCurrentNode(0);
    setHighlighted([]);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo Max-Heap valido generato casualmente. Pronto per HEAPSORT."]);
  };

  const nextStep = () => {
    let currentArr = [...arr];

    switch (state) {
      case 'IDLE': {
        if (heapSize <= 1) {
          setState('DONE');
          setHighlighted([]);
          if (setRigaAttiva) setRigaAttiva(null);
          addLog("HEAPSORT completato con successo: l'intero array è ordinato in modo non decrescente.");
          break;
        }

        let lastIdx = heapSize - 1;
        setHighlighted([0, lastIdx]);
        setState('SWAP_ROOT_LAST');
        if (setRigaAttiva) setRigaAttiva('HS-3'); // Riga 3: scambia A[1] con A[i]
        addLog(`Passo for i=${heapSize}: Scambio A[1] (${currentArr[0]}) con l'ultimo elemento dell'heap A[${heapSize}] (${currentArr[lastIdx]}).`);
        break;
      }

      case 'SWAP_ROOT_LAST': {
        let lastIdx = heapSize - 1;
        let temp = currentArr[0];
        currentArr[0] = currentArr[lastIdx];
        currentArr[lastIdx] = temp;

        let newHeapSize = heapSize - 1;
        setArr(currentArr);
        setHeapSize(newHeapSize);
        setHighlighted([0]);
        setCurrentNode(0);
        setState('HEAPIFYING');
        if (setRigaAttiva) setRigaAttiva('HS-5'); // Riga 4: heap-size - 1, Riga 5: MAX-HEAPIFY(A, 1)
        addLog(`Elemento ${temp} collocato nella sua posizione definitiva. heap-size ridotto a ${newHeapSize}. Inizio MAX-HEAPIFY(A, 1).`);
        break;
      }

      case 'HEAPIFYING': {
        let i = currentNode;
        let l = left(i);
        let r = right(i);
        let largest = i;

        if (l < heapSize && currentArr[l] > currentArr[largest]) largest = l;
        if (r < heapSize && currentArr[r] > currentArr[largest]) largest = r;

        if (largest !== i) {
          let temp = currentArr[i];
          currentArr[i] = currentArr[largest];
          currentArr[largest] = temp;
          setArr(currentArr);
          setHighlighted([i, largest]);
          if (setRigaAttiva) setRigaAttiva('HS-5');
          addLog(`MAX-HEAPIFY: scambiato A[${i + 1}] (${temp}) con A[${largest + 1}] (${currentArr[i]}). Continuo discesa.`);
          setCurrentNode(largest);
        } else {
          setHighlighted([]);
          addLog(`MAX-HEAPIFY concluso. Proprietà di Max-Heap ripristinata sulla radice.`);
          if (heapSize > 1) {
            setState('IDLE');
            if (setRigaAttiva) setRigaAttiva('HS-2'); // Riga 2: prossimo for i downto 2
          } else {
            setState('DONE');
            if (setRigaAttiva) setRigaAttiva(null);
            addLog("Tutti gli elementi sono posizionati. Array ordinato in-place in tempo Θ(n log n)!");
          }
        }
        break;
      }

      default:
        break;
    }
  };

  const reset = () => {
    setArr([...initial]);
    setHeapSize(initial.length);
    setLogs(["Array reimpostato allo stato Max-Heap iniziale. Pronto per HEAPSORT."]);
    setState('IDLE');
    setCurrentNode(0);
    setHighlighted([]);
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
              HEAPSORT Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Ordinamento in-place in tempo Θ(n log n) e memoria ausiliaria costante O(1)
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
              STATO ARRAY (HEAP ATTIVO: 1..{heapSize} | ORDINATI DEFINITIVI: {heapSize + 1}..{arr.length})
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {arr.map((val, idx) => {
                const isSorted = idx >= heapSize;
                const isHighlight = highlighted.includes(idx);
                
                let bg = isSorted ? '#064e3b' : '#111827';
                let border = isSorted ? '#10b981' : '#1f2937';
                let color = isSorted ? '#a7f3d0' : '#cbd5e1';
                let shadow = isSorted ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none';

                if (isHighlight) {
                  bg = '#78350f'; border = '#f59e0b'; color = '#fef3c7'; shadow = '0 0 14px rgba(245, 158, 11, 0.5)';
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
                      transform: isHighlight ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Albero View Con Spaziatura Anti-Sovrapposizione */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              STRUTTURA HEAP RESIDUA (NODI ATTIVI: {heapSize})
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
              {/* Connessioni rami SVG per soli nodi attivi nell'heap */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {nodeCoords.map((coord, idx) => {
                  if (idx >= heapSize) return null;
                  const l = left(idx);
                  const r = right(idx);
                  const lines = [];
                  if (l < heapSize) {
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
                  if (r < heapSize) {
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

              {/* Nodi dell'albero con micro-badge anti-sovrapposizione */}
              {arr.map((val, idx) => {
                if (idx >= heapSize) return null;
                const coord = nodeCoords[idx];
                const isHighlight = highlighted.includes(idx);
                
                let bg = '#0f172a';
                let border = '#334155';
                let color = '#f8fafc';
                let shadow = '0 2px 6px rgba(0,0,0,0.5)';

                if (isHighlight) {
                  bg = '#78350f'; border = '#f59e0b'; color = '#fef3c7'; shadow = '0 0 14px rgba(245, 158, 11, 0.6)';
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
                      zIndex: isHighlight ? 3 : 2,
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

        {/* Log di Esecuzione (ancorato rigorosamente senza espandersi) */}
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