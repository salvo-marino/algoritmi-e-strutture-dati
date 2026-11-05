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

export default function SelectionSortRecApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomArray());
  const [A, setA] = useState([...initial]);
  const [logs, setLogs] = useState(["Array generato. Pronto per SELECTION-SORT-REC (con FIND-MIN-INDEX)."]);
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

    const findMinIndex = (startIdx) => {
      let mIdx = startIdx;
      trace.push({
        A: [...curA],
        currentI: startIdx,
        minIdx: mIdx,
        currentJ: -1,
        codeLine: 'FMI-1',
        log: `FIND-MIN-INDEX(A, ${startIdx + 1}, ${n}): Inizializzo min = ${startIdx + 1} (valore: ${curA[mIdx]}).`
      });

      for (let j = startIdx + 1; j < n; j++) {
        const isSmaller = curA[j] < curA[mIdx];
        trace.push({
          A: [...curA],
          currentI: startIdx,
          minIdx: mIdx,
          currentJ: j,
          codeLine: 'FMI-2',
          log: `FIND-MIN-INDEX: Confronto A[${j + 1}] (${curA[j]}) < A[${mIdx + 1}] (${curA[mIdx]}) -> ${isSmaller ? 'TRUE (nuovo minimo)' : 'FALSE'}.`
        });

        if (isSmaller) {
          mIdx = j;
          trace.push({
            A: [...curA],
            currentI: startIdx,
            minIdx: mIdx,
            currentJ: j,
            codeLine: 'FMI-3',
            log: `FIND-MIN-INDEX: Aggiorno indice del minimo provvisorio min = ${mIdx + 1} (${curA[mIdx]}).`
          });
        }
      }
      return mIdx;
    };

    const selSortRec = (i) => {
      // Riga 1: if i >= n return
      if (i >= n - 1) {
        trace.push({
          A: [...curA],
          currentI: i,
          minIdx: -1,
          currentJ: -1,
          codeLine: 'SSR-1',
          log: `SELECTION-SORT-REC(A, ${i + 1}, ${n}): Caso base raggiunto (i ≥ n). Ricorsione terminata.`
        });
        return;
      }

      trace.push({
        A: [...curA],
        currentI: i,
        minIdx: -1,
        currentJ: -1,
        codeLine: 'SSR-1',
        log: `SELECTION-SORT-REC(A, ${i + 1}, ${n}): Passo ricorsivo per collocare il minimo in A[${i + 1}].`
      });

      // Riga 2: min_idx = FIND-MIN-INDEX(A, i, n)
      const min_idx = findMinIndex(i);

      trace.push({
        A: [...curA],
        currentI: i,
        minIdx: min_idx,
        currentJ: -1,
        codeLine: 'SSR-2',
        log: `SELECTION-SORT-REC: Minimo assoluto su A[${i + 1}..${n}] trovato all'indice ${min_idx + 1} (${curA[min_idx]}).`
      });

      // Riga 3: if min_idx != i scambia
      if (min_idx !== i) {
        const temp = curA[i];
        curA[i] = curA[min_idx];
        curA[min_idx] = temp;

        trace.push({
          A: [...curA],
          currentI: i,
          minIdx: min_idx,
          currentJ: -1,
          codeLine: 'SSR-3',
          log: `Riga 3: Scambio A[${i + 1}] (${temp}) con A[${min_idx + 1}] (${curA[i]}).`
        });
      }

      // Riga 4: SELECTION-SORT-REC(A, i + 1, n)
      trace.push({
        A: [...curA],
        currentI: i + 1,
        minIdx: -1,
        currentJ: -1,
        codeLine: 'SSR-4',
        log: `Riga 4: Chiamata ricorsiva in avanti su SELECTION-SORT-REC(A, ${i + 2}, ${n}).`
      });

      selSortRec(i + 1);
    };

    selSortRec(0);

    trace.push({
      A: [...curA],
      currentI: n,
      minIdx: -1,
      currentJ: -1,
      codeLine: null,
      phase: 'COMPLETATO',
      log: "SELECTION-SORT-REC completato. Ricorsione esaurita ed intero array ordinato!"
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
    setLogs(["Nuovo array casuale generato. Pronto per SELECTION-SORT-REC."]);
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
              SELECTION-SORT-REC Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Formulazione ricorsiva induttiva mediante procedura ausiliaria FIND-MIN-INDEX
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
                const isMin = currentTrace.minIdx === idx;
                const isCurrentJ = currentTrace.currentJ === idx;
                const isSortedPrefix = currentTrace.currentI !== undefined && idx < currentTrace.currentI;
                
                let bg = isDone || isSortedPrefix ? '#064e3b' : isMin ? '#78350f' : isCurrentJ ? '#0c4a6e' : '#111827';
                let border = isDone || isSortedPrefix ? '#10b981' : isMin ? '#f59e0b' : isCurrentJ ? '#38bdf8' : '#1f2937';
                let color = isDone || isSortedPrefix ? '#a7f3d0' : isMin ? '#fef3c7' : isCurrentJ ? '#ffffff' : '#cbd5e1';
                let shadow = isDone || isSortedPrefix ? '0 0 10px rgba(16, 185, 129, 0.3)' : isMin ? '0 0 14px rgba(245, 158, 11, 0.5)' : isCurrentJ ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      color: isMin ? '#f59e0b' : isCurrentJ ? '#38bdf8' : '#64748b', 
                      fontWeight: isMin || isCurrentJ ? 700 : 400,
                      fontFamily: 'monospace', 
                      marginBottom: '3px' 
                    }}>
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
                      transform: isMin || isCurrentJ ? 'scale(1.08)' : 'scale(1)',
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
              STRUTTURA RICORSIVA
            </span>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, textAlign: 'left' }}>
              La procedura ausiliaria <strong style={{ color: '#38bdf8' }}>FIND-MIN-INDEX</strong> scansiona il segmento disordinato determinando l'indice del minimo. Effettuato lo scambio su <strong style={{ color: '#38bdf8' }}>A[i]</strong>, la funzione richiama se stessa sull'intervallo ridotto <strong style={{ color: '#38bdf8' }}>i + 1</strong> fino al raggiungimento del caso base.
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