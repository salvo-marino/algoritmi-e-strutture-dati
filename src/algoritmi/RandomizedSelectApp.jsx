import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle, Search } from 'lucide-react';

const generateRandomArray = () => {
  const arr = [];
  while (arr.length < 8) {
    const n = Math.floor(Math.random() * 90) + 10;
    if (!arr.includes(n)) arr.push(n);
  }
  return arr;
};

export default function RandomizedSelectApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomArray());
  const [array, setArray] = useState([...initial]);
  const [statOrder, setStatOrder] = useState(3);
  const [logs, setLogs] = useState(["Array generato. Pronto per RANDOMIZED-SELECT."]);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const buildExecutionTrace = (arrInput, targetI) => {
    const trace = [];
    let A = [...arrInput];

    const partition = (p, r) => {
      let randomPivotIdx = Math.floor(Math.random() * (r - p + 1)) + p;
      let pivotVal = A[randomPivotIdx];
      
      trace.push({
        type: 'PIVOT_SELECT',
        p, r,
        pivotIdx: randomPivotIdx,
        pivotVal,
        A: [...A],
        codeLine: 'RS-3',
        log: `RANDOMIZED-PARTITION: Scelto casualmente pivot A[${randomPivotIdx + 1}] = ${pivotVal}. Scambio con A[${r + 1}].`
      });

      let tempP = A[randomPivotIdx];
      A[randomPivotIdx] = A[r];
      A[r] = tempP;

      let x = A[r];
      let i = p - 1;

      for (let j = p; j < r; j++) {
        if (A[j] <= x) {
          i++;
          let t = A[i];
          A[i] = A[j];
          A[j] = t;
        }
      }

      let tFinal = A[i + 1];
      A[i + 1] = A[r];
      A[r] = tFinal;

      let q = i + 1;
      trace.push({
        type: 'PARTITIONED',
        p, r, q,
        pivotVal: x,
        A: [...A],
        codeLine: 'RS-3',
        log: `Partizione conclusa: Pivot ${x} collocato definitivamente all'indice ${q + 1}.`
      });

      return q;
    };

    const randomizedSelect = (p, r, iTarget) => {
      if (p === r) {
        trace.push({
          type: 'FOUND',
          p, r, q: p,
          val: A[p],
          A: [...A],
          codeLine: 'RS-1',
          log: `Caso base (p === r): Statistica d'ordine trovata! Valore: ${A[p]}.`
        });
        return A[p];
      }

      let q = partition(p, r);
      let k = q - p + 1;

      trace.push({
        type: 'CHECK_K',
        p, r, q, k,
        target: iTarget,
        A: [...A],
        codeLine: 'RS-4',
        log: `Verifica: Posizione relativa k=${k}, cerchiamo statistica i=${iTarget}.`
      });

      if (iTarget === k) {
        trace.push({
          type: 'FOUND',
          p, r, q,
          val: A[q],
          A: [...A],
          codeLine: 'RS-6',
          log: `MATCH! i == k: L'elemento cercato è esattamente il pivot A[${q + 1}] = ${A[q]}. Selezione conclusa!`
        });
        return A[q];
      } else if (iTarget < k) {
        trace.push({
          type: 'BRANCH_LEFT',
          p, r, q,
          A: [...A],
          codeLine: 'RS-8',
          log: `i (${iTarget}) < k (${k}): L'elemento si trova nel sotto-array SINISTRO A[${p + 1}..${q}]. Salto il ramo destro!`
        });
        return randomizedSelect(p, q - 1, iTarget);
      } else {
        trace.push({
          type: 'BRANCH_RIGHT',
          p, r, q,
          A: [...A],
          codeLine: 'RS-9',
          log: `i (${iTarget}) > k (${k}): L'elemento si trova nel sotto-array DESTRO A[${q + 2}..${r + 1}]. Cerco statistica ${iTarget - k}.`
        });
        return randomizedSelect(q + 1, r, iTarget - k);
      }
    };

    randomizedSelect(0, A.length - 1, targetI);
    return trace;
  };

  const handleRandomize = () => {
    const newArr = generateRandomArray();
    setInitial(newArr);
    setArray([...newArr]);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo array casuale generato. Pronto per RANDOMIZED-SELECT."]);
  };

  const nextStep = () => {
    let trace = steps;
    if (trace.length === 0) {
      trace = buildExecutionTrace(array, statOrder);
      setSteps(trace);
    }

    if (stepIndex < trace.length) {
      const current = trace[stepIndex];
      setArray(current.A);
      setLogs(prev => [...prev, current.log]);
      
      if (setRigaAttiva) {
        setRigaAttiva(current.codeLine || null);
      }

      setStepIndex(prev => prev + 1);
    }
  };

  const reset = () => {
    setArray([...initial]);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Array ripristinato. Pronto per una nuova selezione."]);
  };

  const currentTrace = steps[stepIndex - 1] || {};
  const isDone = currentTrace.type === 'FOUND';

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
              RANDOMIZED-SELECT Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Selezione dell'i-esima statistica d'ordine in tempo atteso Θ(n) con partizione casuale
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
            {isDone ? 'Trovato' : 'Prossimo Passo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Vista Array & Dettagli */}
        <div style={{ flex: '1 1 58%', padding: '18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          {/* Configurazione Statistica d'ordine */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#0c1322',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #1e293b'
          }}>
            <Search size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
              Statistica d'ordine cercata (1 = Minimo, {array.length} = Massimo):
            </span>
            <input 
              type="number" 
              min="1" 
              max={array.length} 
              value={statOrder} 
              disabled={steps.length > 0}
              onChange={(e) => setStatOrder(Math.max(1, Math.min(array.length, Number(e.target.value))))} 
              style={{
                width: '46px',
                padding: '4px 6px',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: '#070b14',
                color: '#f8fafc',
                textAlign: 'center',
                fontWeight: 700
              }}
            />
          </div>

          {/* Stato Array A */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              STATO ARRAY A
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {array.map((val, idx) => {
                const isPivot = currentTrace.q === idx;
                const inSubArray = currentTrace.p !== undefined && idx >= currentTrace.p && idx <= currentTrace.r;
                
                let bg = inSubArray ? '#111827' : '#070b14';
                let border = inSubArray ? '#334155' : '#1e293b';
                let color = inSubArray ? '#f8fafc' : '#475569';
                let shadow = 'none';

                if (isDone && idx === currentTrace.q) {
                  bg = '#064e3b'; border = '#10b981'; color = '#a7f3d0'; shadow = '0 0 14px rgba(16, 185, 129, 0.4)';
                } else if (isPivot) {
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
                      transform: isPivot ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dettagli Algoritmo */}
          <div style={{ backgroundColor: '#070b14', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', marginTop: 'auto', textAlign: 'left' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block' }}>
              PARTIZIONAMENTO & RAMIFICAZIONE UNICA
            </span>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, textAlign: 'left' }}>
              A differenza di Quick Sort che esplora entrambi i rami, Randomized-Select compie <strong style={{ color: '#38bdf8' }}>una sola chiamata ricorsiva</strong> esclusivamente sul lato in cui ricade l'indice cercato, garantendo un tempo atteso geometricamente convergente pari a <strong style={{ color: '#38bdf8' }}>Θ(n)</strong>.
            </p>
          </div>
        </div>

        {/* Log di selezione (ancorato rigorosamente senza espandersi) */}
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
            <ArrowRight size={14} /> Log di Selezione
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