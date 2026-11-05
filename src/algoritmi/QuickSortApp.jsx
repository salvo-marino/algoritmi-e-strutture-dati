import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

const generateRandomArray = () => {
  const arr = [];
  while (arr.length < 7) {
    const n = Math.floor(Math.random() * 85) + 10;
    if (!arr.includes(n)) arr.push(n);
  }
  return arr;
};

export default function QuickSortApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomArray());
  const [A, setA] = useState([...initial]);
  const [logs, setLogs] = useState(["Array generato. Pronto per QUICK-SORT (Partizione di Lomuto)."]);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const buildExecutionTrace = (arrInput) => {
    const trace = [];
    let curA = [...arrInput];

    const partition = (p, r) => {
      const x = curA[r];
      let i = p - 1;

      trace.push({
        A: [...curA],
        p, r, q: -1, i, j: -1, pivotIdx: r, pivotVal: x,
        codeLine: 'PART-1',
        log: `PARTITION(A, ${p + 1}, ${r + 1}): Pivot x = A[${r + 1}] (${x}). Imposto confine i = ${i + 1}.`
      });

      for (let j = p; j < r; j++) {
        const isSmallerOrEqual = curA[j] <= x;
        trace.push({
          A: [...curA],
          p, r, q: -1, i, j, pivotIdx: r, pivotVal: x,
          codeLine: 'PART-3',
          log: `PARTITION: Confronto A[${j + 1}] (${curA[j]}) ≤ pivot (${x}) -> ${isSmallerOrEqual ? 'TRUE' : 'FALSE'}.`
        });

        if (isSmallerOrEqual) {
          i++;
          const temp = curA[i];
          curA[i] = curA[j];
          curA[j] = temp;

          trace.push({
            A: [...curA],
            p, r, q: -1, i, j, pivotIdx: r, pivotVal: x,
            codeLine: 'PART-4',
            log: `PARTITION: Sposto confine i = ${i + 1} e scambio A[${i + 1}] con A[${j + 1}].`
          });
        }
      }

      const tempP = curA[i + 1];
      curA[i + 1] = curA[r];
      curA[r] = tempP;
      const q = i + 1;

      trace.push({
        A: [...curA],
        p, r, q, i: -1, j: -1, pivotIdx: q, pivotVal: x,
        codeLine: 'PART-5',
        log: `PARTITION: Colloco pivot ${x} all'indice finale definitivo A[${q + 1}]. Partizione conclusa.`
      });

      return q;
    };

    const quickSort = (p, r) => {
      if (p < r) {
        trace.push({
          A: [...curA],
          p, r, q: -1, i: -1, j: -1, pivotIdx: -1, pivotVal: null,
          codeLine: 'QS-1',
          log: `QUICK-SORT(A, ${p + 1}, ${r + 1}): Intervallo attivo [${p + 1}..${r + 1}]. Avvio partizione.`
        });

        const q = partition(p, r);

        trace.push({
          A: [...curA],
          p, r, q, i: -1, j: -1, pivotIdx: q, pivotVal: curA[q],
          codeLine: 'QS-3',
          log: `QUICK-SORT: Chiamata ricorsiva sul ramo sinistro A[${p + 1}..${q}].`
        });
        quickSort(p, q - 1);

        trace.push({
          A: [...curA],
          p, r, q, i: -1, j: -1, pivotIdx: q, pivotVal: curA[q],
          codeLine: 'QS-4',
          log: `QUICK-SORT: Chiamata ricorsiva sul ramo destro A[${q + 2}..${r + 1}].`
        });
        quickSort(q + 1, r);
      } else {
        trace.push({
          A: [...curA],
          p, r, q: -1, i: -1, j: -1, pivotIdx: -1, pivotVal: null,
          codeLine: 'QS-1',
          log: `QUICK-SORT: Intervallo unitario o vuoto [${p + 1}..${r + 1}]. Caso base raggiunto.`
        });
      }
    };

    quickSort(0, curA.length - 1);

    trace.push({
      A: [...curA],
      p: -1, r: -1, q: -1, i: -1, j: -1, pivotIdx: -1, pivotVal: null,
      codeLine: null,
      phase: 'COMPLETATO',
      log: "QUICK-SORT completato. Tutti gli elementi sono collocati nel loro ordine definitivo!"
    });

    return trace;
  };

  const handleRandomize = () => {
    const newArr = generateRandomArray();
    setInitial(newArr);
    setA([...newArr]);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo array casuale generato. Pronto per QUICK-SORT."]);
  };

  const nextStep = () => {
    let trace = steps;
    if (trace.length === 0) {
      trace = buildExecutionTrace(A);
      setSteps(trace);
    }

    if (stepIndex < trace.length) {
      const current = trace[stepIndex];
      setA(current.A);
      setLogs(prev => [...prev, current.log]);

      if (setRigaAttiva) {
        setRigaAttiva(current.codeLine || null);
      }

      setStepIndex(prev => prev + 1);
    }
  };

  const reset = () => {
    setA([...initial]);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Array ripristinato allo stato iniziale. Pronto per rieseguire."]);
  };

  const currentTrace = steps[stepIndex - 1] || {};
  const isDone = currentTrace.phase === 'COMPLETATO';

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
              QUICK-SORT Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Partizionamento ricorsivo in-place con perno (pivot) in schema di Lomuto
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
            {isDone ? 'Ordinato' : 'Prossimo Passo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Pannello sinistro */}
        <div style={{ flex: '1 1 58%', padding: '18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          <div>
            {/* Header info perno e range */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textAlign: 'left' }}>
                STATO ARRAY A (INDIRIZZAMENTO 1-BASED)
              </span>

              {currentTrace.pivotVal !== undefined && currentTrace.pivotVal !== null && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    Pivot = {currentTrace.pivotVal}
                  </span>
                  {currentTrace.p !== undefined && currentTrace.p !== -1 && (
                    <span style={{
                      fontSize: '0.74rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#94a3b8',
                      backgroundColor: '#111827',
                      border: '1px solid #1e293b',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      Range: [{currentTrace.p + 1}..{currentTrace.r + 1}]
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Visualizzazione Array con indicatori superiori staccati dalle celle */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              {A.map((val, idx) => {
                const isPivot = currentTrace.pivotIdx === idx;
                const isJ = currentTrace.j === idx;
                const isI = currentTrace.i === idx;
                const inSubArray = currentTrace.p !== undefined && currentTrace.p !== -1 && idx >= currentTrace.p && idx <= currentTrace.r;

                let bg = isDone ? '#064e3b' : isPivot ? '#78350f' : isJ ? '#0c4a6e' : inSubArray ? '#1e293b' : '#070b14';
                let border = isDone ? '#10b981' : isPivot ? '#f59e0b' : isJ ? '#38bdf8' : inSubArray ? '#334155' : '#1e293b';
                let color = isDone ? '#a7f3d0' : isPivot ? '#fef3c7' : isJ ? '#ffffff' : inSubArray ? '#f8fafc' : '#475569';
                let shadow = isDone ? '0 0 10px rgba(16, 185, 129, 0.3)' : isPivot ? '0 0 14px rgba(245, 158, 11, 0.5)' : isJ ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none';

                let topLabel = null;
                if (isPivot) topLabel = currentTrace.q === idx ? 'q (pivot)' : 'pivot';
                else if (isJ) topLabel = 'j';
                else if (isI) topLabel = 'i';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Slot superiore con altezza e spaziatura protetta per evitare sovrapposizioni */}
                    <div style={{
                      minHeight: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px'
                    }}>
                      {topLabel ? (
                        <span style={{
                          fontSize: '0.62rem',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: isPivot ? 'rgba(245, 158, 11, 0.18)' : isJ ? 'rgba(56, 189, 248, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                          color: isPivot ? '#f59e0b' : isJ ? '#38bdf8' : '#10b981',
                          border: `1px solid ${isPivot ? 'rgba(245, 158, 11, 0.35)' : isJ ? 'rgba(56, 189, 248, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                          lineHeight: 1
                        }}>
                          {topLabel}
                        </span>
                      ) : (
                        <span style={{ opacity: 0 }}>-</span>
                      )}
                    </div>

                    {/* Cella Valore */}
                    <div style={{
                      width: '42px',
                      height: '42px',
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
                      transform: isPivot || isJ ? 'scale(1.06)' : 'scale(1)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {val}
                    </div>

                    {/* Indice numerico puro (1-based) */}
                    <span style={{
                      fontSize: '0.68rem',
                      color: isPivot ? '#f59e0b' : isJ ? '#38bdf8' : '#64748b',
                      fontWeight: isPivot || isJ ? 700 : 400,
                      fontFamily: 'monospace',
                      marginTop: '4px'
                    }}>
                      {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ backgroundColor: '#070b14', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', marginTop: 'auto', textAlign: 'left' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block' }}>
              PARTIZIONAMENTO SUL POSTO
            </span>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, textAlign: 'left' }}>
              La procedura <strong style={{ color: '#38bdf8' }}>PARTITION</strong> isola il perno all'indice finale <strong style={{ color: '#f59e0b' }}>q</strong>, garantendo che tutti i valori a sinistra siano minori o uguali e tutti quelli a destra siano maggiori o uguali. Quick Sort ricorre poi indipendentemente sulle due metà.
            </p>
          </div>
        </div>

        {/* Log di esecuzione */}
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