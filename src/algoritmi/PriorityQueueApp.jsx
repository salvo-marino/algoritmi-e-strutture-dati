import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, PlusCircle, ArrowUpCircle, MinusCircle, Eye, Shuffle } from 'lucide-react';

// Genera un Max-Heap valido di 6 elementi compresi tra 10 e 95
const generateRandomMaxHeapQueue = () => {
  const setVals = new Set();
  while (setVals.size < 6) {
    setVals.add(Math.floor(Math.random() * 85) + 10);
  }
  const A = Array.from(setVals);

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

export default function PriorityQueueApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => [...initialDefault]);
  const [heap, setHeap] = useState([...initialDefault]);
  const [logs, setLogs] = useState(["Coda con priorità pronta. Seleziona un'operazione per avviare il tracciamento."]);
  const [highlighted, setHighlighted] = useState([]);
  
  // Parametri degli input utente
  const [insertVal, setInsertVal] = useState(15);
  const [incIdx, setIncIdx] = useState(5); // 1-based default (nodo con valore 7)
  const [incVal, setIncVal] = useState(18);

  // Motore a stati per l'esecuzione passo-passo
  const [currentOp, setCurrentOp] = useState(null); // 'MAX', 'EXTRACT', 'INCREASE', 'INSERT'
  const [opState, setOpState] = useState('IDLE');
  const [subContext, setSubContext] = useState({});

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Coordinate normalizzate per l'albero (base 600x260) con buon margine superiore (cy: 42)
  const nodeCoords = [
    { cx: 300, cy: 42 },  // 0: Radice (livello 0)
    { cx: 165, cy: 115 }, // 1: Sinistro (livello 1)
    { cx: 435, cy: 115 }, // 2: Destro (livello 1)
    { cx: 95,  cy: 195 }, // 3: LL (livello 2)
    { cx: 235, cy: 195 }, // 4: LR (livello 2)
    { cx: 365, cy: 195 }, // 5: RL (livello 2)
    { cx: 505, cy: 195 }  // 6: RR (livello 2)
  ];

  const parent = (i) => Math.floor((i - 1) / 2);
  const left = (i) => 2 * i + 1;
  const right = (i) => 2 * i + 2;
  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const handleRandomize = () => {
    const newHeap = generateRandomMaxHeapQueue();
    setInitial(newHeap);
    setHeap([...newHeap]);
    setHighlighted([]);
    setCurrentOp(null);
    setOpState('IDLE');
    setSubContext({});
    setIncIdx(Math.min(5, newHeap.length));
    setIncVal(newHeap[0] + 5);
    setInsertVal(Math.floor(Math.random() * 50) + 20);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuova coda con priorità generata casualmente. Pronto per eseguire le operazioni."]);
  };

  const startOperation = (opType) => {
    let currentArr = [...heap];
    setCurrentOp(opType);

    if (opType === 'MAX') {
      if (currentArr.length < 1) {
        addLog("ERRORE HEAP-MAXIMUM: heap underflow (heap-size < 1).");
        setCurrentOp(null);
        if (setRigaAttiva) setRigaAttiva(null);
        return;
      }
      setHighlighted([0]);
      setOpState('MAX_SHOW');
      if (setRigaAttiva) setRigaAttiva('PQ-M1');
      addLog("Avviato HEAP-MAXIMUM(A): esamina la radice all'indice 1.");
    } 
    else if (opType === 'EXTRACT') {
      if (currentArr.length < 1) {
        addLog("ERRORE HEAP-EXTRACT-MAX: heap underflow!");
        setCurrentOp(null);
        if (setRigaAttiva) setRigaAttiva(null);
        return;
      }
      setHighlighted([0]);
      setOpState('EXTRACT_SAVE_MAX');
      setSubContext({ max: currentArr[0], lastIdx: currentArr.length - 1 });
      if (setRigaAttiva) setRigaAttiva('PQ-E2');
      addLog(`Avviato HEAP-EXTRACT-MAX(A): salvo max = A[1] (${currentArr[0]}).`);
    } 
    else if (opType === 'INCREASE') {
      let zeroIdx = incIdx - 1;
      if (zeroIdx < 0 || zeroIdx >= currentArr.length) {
        addLog(`ERRORE HEAP-INCREASE-KEY: Indice ${incIdx} fuori dai limiti.`);
        setCurrentOp(null);
        if (setRigaAttiva) setRigaAttiva(null);
        return;
      }
      if (incVal < currentArr[zeroIdx]) {
        addLog(`ERRORE HEAP-INCREASE-KEY: La nuova chiave (${incVal}) è minore di A[${incIdx}] (${currentArr[zeroIdx]}).`);
        setCurrentOp(null);
        if (setRigaAttiva) setRigaAttiva(null);
        return;
      }
      setHighlighted([zeroIdx]);
      setOpState('INC_VALIDATE');
      setSubContext({ i: zeroIdx, key: incVal });
      if (setRigaAttiva) setRigaAttiva('PQ-I1');
      addLog(`Avviato HEAP-INCREASE-KEY(A, ${incIdx}, ${incVal}): verifica key ≥ A[${incIdx}] superata.`);
    } 
    else if (opType === 'INSERT') {
      if (currentArr.length >= 7) {
        addLog("Limite visualizzazione: Massimo 7 nodi per mantenere l'albero compatto.");
        setCurrentOp(null);
        if (setRigaAttiva) setRigaAttiva(null);
        return;
      }
      setOpState('INSERT_PUSH_INF');
      setSubContext({ key: insertVal });
      if (setRigaAttiva) setRigaAttiva('PQ-N1');
      addLog(`Avviato MAX-HEAP-INSERT(A, ${insertVal}): aumento heap-size e assegno foglia provvisoria A[heap-size] = -∞.`);
    }
  };

  const nextStep = () => {
    let currentArr = [...heap];

    if (currentOp === 'MAX') {
      if (opState === 'MAX_SHOW') {
        if (setRigaAttiva) setRigaAttiva('PQ-M1');
        addLog(`return A[1] -> Il massimo è ${currentArr[0]}. Complessità costante: Θ(1).`);
        setOpState('DONE');
      }
    }
    else if (currentOp === 'EXTRACT') {
      switch (opState) {
        case 'EXTRACT_SAVE_MAX': {
          let lastIdx = subContext.lastIdx;
          setHighlighted([0, lastIdx]);
          setOpState('EXTRACT_MOVE_LAST');
          if (setRigaAttiva) setRigaAttiva('PQ-E3');
          addLog(`Copio l'ultimo elemento A[${lastIdx + 1}] (${currentArr[lastIdx]}) nella radice A[1] e decremento heap-size.`);
          break;
        }

        case 'EXTRACT_MOVE_LAST': {
          let lastVal = currentArr.pop();
          if (currentArr.length > 0) {
            currentArr[0] = lastVal;
            setHeap(currentArr);
            setHighlighted([0]);
            setSubContext({ ...subContext, currentNode: 0 });
            setOpState('EXTRACT_HEAPIFY_COMPARE');
            if (setRigaAttiva) setRigaAttiva('PQ-E4');
            addLog(`Radice sovrascritta con ${lastVal}. Ora invoco MAX-HEAPIFY(A, 1) per ripristinare le proprietà dell'heap.`);
          } else {
            setHeap([]);
            setHighlighted([]);
            setOpState('DONE');
            if (setRigaAttiva) setRigaAttiva(null);
            addLog("Heap svuotato. Estrazione completata.");
          }
          break;
        }

        case 'EXTRACT_HEAPIFY_COMPARE': {
          let i = subContext.currentNode;
          let l = left(i);
          let r = right(i);
          let largest = i;

          let cand = [i];
          if (l < currentArr.length) cand.push(l);
          if (r < currentArr.length) cand.push(r);
          setHighlighted(cand);

          if (l < currentArr.length && currentArr[l] > currentArr[largest]) largest = l;
          if (r < currentArr.length && currentArr[r] > currentArr[largest]) largest = r;

          setSubContext({ ...subContext, largest });
          setOpState('EXTRACT_HEAPIFY_DECIDE');
          if (setRigaAttiva) setRigaAttiva('PQ-E4');
          addLog(`MAX-HEAPIFY: Confronto padre A[${i + 1}] (${currentArr[i]}) con i figli. Il massimo locale è all'indice ${largest + 1} (${currentArr[largest]}).`);
          break;
        }

        case 'EXTRACT_HEAPIFY_DECIDE': {
          let { currentNode: i, largest } = subContext;
          if (largest !== i) {
            let temp = currentArr[i];
            currentArr[i] = currentArr[largest];
            currentArr[largest] = temp;
            setHeap(currentArr);
            setHighlighted([i, largest]);
            setSubContext({ ...subContext, currentNode: largest });
            setOpState('EXTRACT_HEAPIFY_COMPARE');
            if (setRigaAttiva) setRigaAttiva('PQ-E4');
            addLog(`Scambio A[${i + 1}] con A[${largest + 1}]. La chiave scende. Continuo la discesa ricorsiva.`);
          } else {
            setHighlighted([i]);
            setOpState('DONE');
            if (setRigaAttiva) setRigaAttiva(null);
            addLog(`MAX-HEAPIFY completato: il nodo A[${i + 1}] è ≥ di entrambi i figli. return max = ${subContext.max}.`);
          }
          break;
        }

        default:
          break;
      }
    }
    else if (currentOp === 'INCREASE') {
      switch (opState) {
        case 'INC_VALIDATE': {
          let { i, key } = subContext;
          currentArr[i] = key;
          setHeap(currentArr);
          setHighlighted([i]);
          setOpState('INC_WHILE_CHECK');
          if (setRigaAttiva) setRigaAttiva('PQ-I2');
          addLog(`Imposto A[${i + 1}] = ${key}. Inizio ciclo while di risalita (Bubble-Up).`);
          break;
        }

        case 'INC_WHILE_CHECK': {
          let { i } = subContext;
          if (setRigaAttiva) setRigaAttiva('PQ-I3');
          if (i > 0) {
            let p = parent(i);
            setHighlighted([i, p]);
            if (currentArr[p] < currentArr[i]) {
              setOpState('INC_SWAP');
              addLog(`While TRUE: Indice i=${i + 1} > 1 e padre A[${p + 1}] (${currentArr[p]}) < A[${i + 1}] (${currentArr[i]}). Violazione proprietà!`);
            } else {
              setOpState('DONE');
              if (setRigaAttiva) setRigaAttiva(null);
              addLog(`While FALSE: Il padre A[${p + 1}] (${currentArr[p]}) ≥ A[${i + 1}] (${currentArr[i]}). Proprietà Max-Heap rispettata. Fine.`);
            }
          } else {
            setHighlighted([i]);
            setOpState('DONE');
            if (setRigaAttiva) setRigaAttiva(null);
            addLog("While FALSE: Il nodo ha raggiunto la radice (i=1). Fine risalita.");
          }
          break;
        }

        case 'INC_SWAP': {
          let { i } = subContext;
          let p = parent(i);
          let temp = currentArr[i];
          currentArr[i] = currentArr[p];
          currentArr[p] = temp;
          setHeap(currentArr);

          let nextI = p;
          setSubContext({ ...subContext, i: nextI });
          setHighlighted([nextI]);
          setOpState('INC_WHILE_CHECK');
          if (setRigaAttiva) setRigaAttiva('PQ-I4');
          addLog(`Scambio effettuato: aggiorno i = PARENT(i) -> nuovo indice i=${nextI + 1}.`);
          break;
        }

        default:
          break;
      }
    }
    else if (currentOp === 'INSERT') {
      switch (opState) {
        case 'INSERT_PUSH_INF': {
          currentArr.push(-Infinity);
          let newIdx = currentArr.length - 1;
          setHeap(currentArr);
          setHighlighted([newIdx]);
          setSubContext({ i: newIdx, key: subContext.key });
          setOpState('INSERT_CALL_INCREASE');
          if (setRigaAttiva) setRigaAttiva('PQ-N1');
          addLog(`heap-size incrementato a ${currentArr.length}, allocata foglia A[${newIdx + 1}] = -∞.`);
          break;
        }

        case 'INSERT_CALL_INCREASE': {
          let { i, key } = subContext;
          addLog(`Invoco HEAP-INCREASE-KEY(A, ${i + 1}, ${key}) per risalire la nuova chiave.`);
          setCurrentOp('INCREASE');
          setOpState('INC_VALIDATE');
          if (setRigaAttiva) setRigaAttiva('PQ-N2');
          break;
        }

        default:
          break;
      }
    }
  };

  const resetAll = () => {
    setHeap([...initial]);
    setLogs(["Coda con priorità ripristinata allo stato iniziale."]);
    setHighlighted([]);
    setCurrentOp(null);
    setOpState('IDLE');
    setSubContext({});
    if (setRigaAttiva) setRigaAttiva(null);
  };

  const isOperationActive = currentOp !== null && opState !== 'DONE';

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
              PRIORITY QUEUE Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Tracciamento atomico delle 4 operazioni fondamentali con bubble-up e discesa
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleRandomize} 
            disabled={isOperationActive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '7px 12px',
              borderRadius: '8px',
              cursor: isOperationActive ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease',
              opacity: isOperationActive ? 0.4 : 1
            }}
          >
            <Shuffle size={14} /> Casuale
          </button>
          <button 
            onClick={resetAll} 
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
            disabled={!isOperationActive} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: isOperationActive ? '#0284c7' : '#334155', 
              color: '#ffffff', 
              border: 'none', 
              padding: '7px 16px', 
              borderRadius: '8px', 
              cursor: isOperationActive ? 'pointer' : 'not-allowed', 
              fontWeight: 700, 
              fontSize: '0.8rem',
              boxShadow: isOperationActive ? '0 0 14px rgba(2, 132, 199, 0.45)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {opState === 'DONE' ? <CheckCircle2 size={15} /> : <Play size={15} />}
            {opState === 'DONE' ? 'Concluso' : 'Prossimo Passo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Pannello sinistro: Solo Array e Albero (Spazio verticale liberato al 100%) */}
        <div style={{ flex: '1 1 58%', padding: '18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          {/* Array View */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              STATO ARRAY A (HEAP-SIZE: {heap.length})
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {heap.map((val, idx) => {
                const isHighlight = highlighted.includes(idx);
                let bg = isHighlight ? '#312e81' : '#111827';
                let border = isHighlight ? '#6366f1' : '#1f2937';
                let color = isHighlight ? '#e0e7ff' : '#cbd5e1';
                let shadow = isHighlight ? '0 0 12px rgba(99, 102, 241, 0.5)' : 'none';

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
                      fontSize: val === -Infinity ? '0.8rem' : '1rem',
                      color: color,
                      boxShadow: shadow,
                      transform: isHighlight ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {val === -Infinity ? '-∞' : val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tree View con Spazio Verticale Ottimale (non collassa più la radice) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              STRUTTURA HEAP ATTIVA
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
                  if (idx >= heap.length) return null;
                  const l = left(idx);
                  const r = right(idx);
                  const lines = [];
                  if (l < heap.length) {
                    lines.push(
                      <line 
                        key={`l-${idx}`} 
                        x1={`${(coord.cx / 600) * 100}%`} 
                        y1={`${(coord.cy / 260) * 100}%`} 
                        x2={`${(nodeCoords[l].cx / 600) * 100}%`} 
                        y2={`${(nodeCoords[l].cy / 260) * 100}%`} 
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
                        y1={`${(coord.cy / 260) * 100}%`} 
                        x2={`${(nodeCoords[r].cx / 600) * 100}%`} 
                        y2={`${(nodeCoords[r].cy / 260) * 100}%`} 
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
                const isHighlight = highlighted.includes(idx);
                let bg = isHighlight ? '#312e81' : '#0f172a';
                let border = isHighlight ? '#6366f1' : '#334155';
                let color = isHighlight ? '#ffffff' : '#f8fafc';
                let shadow = isHighlight ? '0 0 14px rgba(99, 102, 241, 0.6)' : '0 2px 6px rgba(0,0,0,0.5)';

                return (
                  <div
                    key={`tree-${idx}`}
                    style={{
                      position: 'absolute',
                      left: `${(coord.cx / 600) * 100}%`,
                      top: `${(coord.cy / 260) * 100}%`,
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
                      fontSize: val === -Infinity ? '0.8rem' : '0.95rem',
                      zIndex: isHighlight ? 3 : 2,
                      boxShadow: shadow,
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {val === -Infinity ? '-∞' : val}
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

        {/* Pannello destro: Log di Esecuzione in alto + Pulsantiera Operazioni integrata in basso */}
        <div style={{ flex: '1 1 42%', backgroundColor: '#0b1120', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 0, gap: '12px' }}>
          
          {/* Finestra Log di Esecuzione (scorrevole) */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#38bdf8',
              marginBottom: '8px',
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

          {/* Dashboard comandi operativi integrata in basso a destra */}
          <div style={{
            backgroundColor: '#070b14',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Operazioni Coda con Priorità:
            </span>

            {/* Riga 1 comandi: Maximum & Extract-Max */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={() => startOperation('MAX')} 
                disabled={isOperationActive}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '7px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  cursor: isOperationActive ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  opacity: isOperationActive ? 0.4 : 1
                }}
              >
                <Eye size={13} color="#38bdf8" /> Maximum
              </button>

              <button 
                onClick={() => startOperation('EXTRACT')} 
                disabled={isOperationActive}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '7px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#9f1239',
                  color: '#ffffff',
                  cursor: isOperationActive ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  opacity: isOperationActive ? 0.4 : 1
                }}
              >
                <MinusCircle size={13} /> Extract-Max
              </button>
            </div>

            {/* Riga 2 comandi: Increase Key */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>i:</span>
              <input 
                type="number" 
                value={incIdx} 
                min="1"
                max={heap.length}
                disabled={isOperationActive}
                onChange={(e) => setIncIdx(Number(e.target.value))} 
                style={{ width: '36px', padding: '4px', fontSize: '0.76rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#090d16', color: '#f8fafc', textAlign: 'center' }} 
                title="Indice nodo (1-based)" 
              />
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>val:</span>
              <input 
                type="number" 
                value={incVal} 
                disabled={isOperationActive}
                onChange={(e) => setIncVal(Number(e.target.value))} 
                style={{ width: '44px', padding: '4px', fontSize: '0.76rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#090d16', color: '#f8fafc', textAlign: 'center' }} 
                title="Nuovo valore chiave" 
              />
              <button 
                onClick={() => startOperation('INCREASE')} 
                disabled={isOperationActive}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  cursor: isOperationActive ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  opacity: isOperationActive ? 0.4 : 1
                }}
              >
                <ArrowUpCircle size={13} /> Increase-Key
              </button>
            </div>

            {/* Riga 3 comandi: Insert */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>key:</span>
              <input 
                type="number" 
                value={insertVal} 
                disabled={isOperationActive}
                onChange={(e) => setInsertVal(Number(e.target.value))} 
                style={{ width: '56px', padding: '4px', fontSize: '0.76rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#090d16', color: '#f8fafc', textAlign: 'center' }} 
                title="Valore da inserire"
              />
              <button 
                onClick={() => startOperation('INSERT')} 
                disabled={isOperationActive}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  cursor: isOperationActive ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  opacity: isOperationActive ? 0.4 : 1
                }}
              >
                <PlusCircle size={13} /> Max-Heap-Insert
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}