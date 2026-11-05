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

export default function InsertionSortRecApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomArray());
  const [A, setA] = useState([...initial]);
  const [logs, setLogs] = useState(["Array generato. Pronto per INSERTION-SORT-REC."]);
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

    const insert = (p, keyVal) => {
      let i = p - 1;
      trace.push({
        A: [...curA],
        currentP: p,
        compareIdx: i,
        keyVal: keyVal,
        codeLine: 'ISR-INS-1',
        log: `INSERT: Inizio scorrimento per inserire key = ${keyVal} nel prefisso ordinato [1..${p}].`
      });

      while (i >= 0 && curA[i] > keyVal) {
        trace.push({
          A: [...curA],
          currentP: p,
          compareIdx: i,
          keyVal: keyVal,
          codeLine: 'ISR-INS-2',
          log: `INSERT: A[${i + 1}] (${curA[i]}) > key (${keyVal}) -> TRUE. Sposto A[${i + 1}] a destra in A[${i + 2}].`
        });

        curA[i + 1] = curA[i];
        trace.push({
          A: [...curA],
          currentP: p,
          compareIdx: i,
          keyVal: keyVal,
          codeLine: 'ISR-INS-3',
          log: `INSERT: Assegno A[${i + 2}] = ${curA[i]}.`
        });

        i--;
      }

      curA[i + 1] = keyVal;
      trace.push({
        A: [...curA],
        currentP: p,
        compareIdx: i + 1,
        keyVal: keyVal,
        codeLine: 'ISR-INS-4',
        log: `INSERT: Trovata la posizione corretta. Inserisco key = ${keyVal} nella cella A[${i + 2}].`
      });
    };

    const insertionSortRec = (n) => {
      // Caso base
      if (n <= 1) {
        trace.push({
          A: [...curA],
          currentP: n - 1,
          compareIdx: -1,
          keyVal: null,
          codeLine: 'ISR-1',
          log: `INSERTION-SORT-REC(A, ${n}): Caso base raggiunto (n ≤ 1). Un singolo elemento è banalmente ordinato.`
        });
        return;
      }

      // Chiamata ricorsiva su n - 1
      trace.push({
        A: [...curA],
        currentP: n - 1,
        compareIdx: -1,
        keyVal: null,
        codeLine: 'ISR-2',
        log: `INSERTION-SORT-REC: Chiamata ricorsiva discendente su prefisso ridotto A[1..${n - 1}].`
      });

      insertionSortRec(n - 1);

      // Risalita: inserimento dell'n-esimo elemento
      const key = curA[n - 1];
      trace.push({
        A: [...curA],
        currentP: n - 1,
        compareIdx: -1,
        keyVal: key,
        codeLine: 'ISR-3',
        log: `INSERTION-SORT-REC: Risalita ricorsiva per n = ${n}. Invoco INSERT per posizionare A[${n}] = ${key}.`
      });

      insert(n - 1, key);
    };

    insertionSortRec(curA.length);

    trace.push({
      A: [...curA],
      currentP: -1,
      compareIdx: -1,
      keyVal: null,
      codeLine: null,
      phase: 'COMPLETATO',
      log: "INSERTION-SORT-REC completato. Intero array ordinato con successo!"
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
    setLogs(["Nuovo array casuale generato. Pronto per INSERTION-SORT-REC."]);
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
              INSERTION-SORT-REC Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Formulazione induttiva ricorsiva con subroutine di inserimento a scorrimento
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textAlign: 'left' }}>
                STATO ARRAY A (INDIRIZZAMENTO 1-BASED)
              </span>
              {currentTrace.keyVal !== undefined && currentTrace.keyVal !== null && (
                <span style={{
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#38bdf8',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  key = {currentTrace.keyVal}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {A.map((val, idx) => {
                const isKey = currentTrace.currentP === idx;
                const isComparing = currentTrace.compareIdx === idx;
                const isSortedPrefix = currentTrace.currentP !== undefined && currentTrace.currentP !== -1 && idx < currentTrace.currentP;

                let bg = isDone ? '#064e3b' : isKey ? '#78350f' : isComparing ? '#0c4a6e' : isSortedPrefix ? '#1e293b' : '#111827';
                let border = isDone ? '#10b981' : isKey ? '#f59e0b' : isComparing ? '#38bdf8' : isSortedPrefix ? '#334155' : '#1f2937';
                let color = isDone ? '#a7f3d0' : isKey ? '#fef3c7' : isComparing ? '#ffffff' : '#cbd5e1';
                let shadow = isDone ? '0 0 10px rgba(16, 185, 129, 0.3)' : isKey ? '0 0 14px rgba(245, 158, 11, 0.5)' : isComparing ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: isKey ? '#f59e0b' : isComparing ? '#38bdf8' : '#64748b', fontFamily: 'monospace', marginBottom: '3px' }}>
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
                      transform: isKey || isComparing ? 'scale(1.08)' : 'scale(1)',
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
              PRINCIPIO INDUTTIVO
            </span>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, textAlign: 'left' }}>
              La formulazione ricorsiva presuppone per induzione che il sotto-array <strong style={{ color: '#38bdf8' }}>A[1..n-1]</strong> sia già stato ordinato dalle chiamate precedenti. In fase di risalita, l'elemento <strong style={{ color: '#f59e0b' }}>A[n]</strong> viene inserito nella posizione corretta mediante la subroutine <strong style={{ color: '#38bdf8' }}>INSERT</strong>.
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