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

export default function BubbleSortApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomArray());
  const [A, setA] = useState([...initial]);
  const [logs, setLogs] = useState(["Array generato. Pronto per BUBBLE-SORT con ottimizzazione flag swapped."]);
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
    const n = curA.length;

    for (let i = 0; i < n - 1; i++) {
      trace.push({
        A: [...curA],
        highlightA: -1,
        highlightB: -1,
        sortedUpTo: i,
        codeLine: 'BSORT-1',
        log: `Riga 1 (i=${i + 1}): Inizio iterazione esterna. Porzione consolidata: [1..${i}].`
      });

      let swapped = false;
      trace.push({
        A: [...curA],
        highlightA: -1,
        highlightB: -1,
        sortedUpTo: i,
        codeLine: 'BSORT-2',
        log: `Riga 2: Imposto swapped = false per verificare se l'array è già ordinato.`
      });

      for (let j = n - 1; j > i; j--) {
        const needSwap = curA[j] < curA[j - 1];
        trace.push({
          A: [...curA],
          highlightA: j - 1,
          highlightB: j,
          sortedUpTo: i,
          codeLine: 'BSORT-4',
          log: `Riga 4 (j=${j + 1}): Confronto A[${j + 1}] (${curA[j]}) < A[${j}] (${curA[j - 1]}) -> ${needSwap ? 'TRUE (scambio necessario)' : 'FALSE'}.`
        });

        if (needSwap) {
          const temp = curA[j];
          curA[j] = curA[j - 1];
          curA[j - 1] = temp;
          swapped = true;

          trace.push({
            A: [...curA],
            highlightA: j - 1,
            highlightB: j,
            sortedUpTo: i,
            codeLine: 'BSORT-5',
            log: `Riga 5: Scambio eseguito! La bolla ${temp} risale all'indice ${j}.`
          });

          trace.push({
            A: [...curA],
            highlightA: j - 1,
            highlightB: j,
            sortedUpTo: i,
            codeLine: 'BSORT-6',
            log: `Riga 6: Imposto swapped = true.`
          });
        }
      }

      trace.push({
        A: [...curA],
        highlightA: -1,
        highlightB: -1,
        sortedUpTo: i + 1,
        codeLine: 'BSORT-7',
        log: `Riga 7: Verifica fine passata: swapped = ${swapped ? 'TRUE' : 'FALSE'}.`
      });

      if (!swapped) {
        trace.push({
          A: [...curA],
          highlightA: -1,
          highlightB: -1,
          sortedUpTo: n,
          codeLine: 'BSORT-7',
          log: `Ottimizzazione: Nessuno scambio avvenuto! Array già ordinato. Uscita anticipata in tempo lineare Θ(n).`
        });
        break;
      }
    }

    trace.push({
      A: [...curA],
      highlightA: -1,
      highlightB: -1,
      sortedUpTo: n,
      codeLine: null,
      phase: 'COMPLETATO',
      log: "BUBBLE-SORT completato. Tutti gli elementi sono nel loro ordine non decrescente definitivo."
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
    setLogs(["Nuovo array casuale generato. Pronto per BUBBLE-SORT."]);
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
              BUBBLE-SORT Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Risalita ordinata a bolla per coppie adiacenti con rilevamento array già ordinato
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
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              STATO ARRAY A (INDIRIZZAMENTO 1-BASED)
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {A.map((val, idx) => {
                const isComparing = currentTrace.highlightA === idx || currentTrace.highlightB === idx;
                const isSortedPrefix = currentTrace.sortedUpTo !== undefined && idx < currentTrace.sortedUpTo;
                
                let bg = isDone || isSortedPrefix ? '#064e3b' : isComparing ? '#78350f' : '#111827';
                let border = isDone || isSortedPrefix ? '#10b981' : isComparing ? '#f59e0b' : '#1f2937';
                let color = isDone || isSortedPrefix ? '#a7f3d0' : isComparing ? '#fef3c7' : '#cbd5e1';
                let shadow = isDone || isSortedPrefix ? '0 0 10px rgba(16, 185, 129, 0.3)' : isComparing ? '0 0 14px rgba(245, 158, 11, 0.5)' : 'none';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '3px' }}>
                      {idx + 1}
                    </span>
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
                      transform: isComparing ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ backgroundColor: '#070b14', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', marginTop: 'auto', textAlign: 'left' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block' }}>
              MECCANICA DELLA RISALITA
            </span>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, textAlign: 'left' }}>
              Il ciclo interno scansiona il vettore a ritroso scambiando elementi adiacenti invertiti. Al termine dell'iterazione esterna <strong style={{ color: '#38bdf8' }}>i</strong>, l'elemento minimo della parte disordinata risiede garantito nella posizione finale <strong style={{ color: '#38bdf8' }}>A[i]</strong>.
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