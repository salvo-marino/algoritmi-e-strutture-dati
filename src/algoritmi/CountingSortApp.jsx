import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

const K_MAX = 5; // Chiavi comprese tra 0 e 5

const generateRandomArray = () => {
  const arr = [];
  for (let i = 0; i < 7; i++) {
    arr.push(Math.floor(Math.random() * (K_MAX + 1)));
  }
  return arr;
};

export default function CountingSortApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomArray());
  const [A, setA] = useState([...initial]);
  const [B, setB] = useState(new Array(initial.length).fill(null));
  const [C, setC] = useState(new Array(K_MAX + 1).fill(0));
  const [logs, setLogs] = useState(["Array di input A generato (chiavi in 0..5). Pronto per COUNTING-SORT."]);
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
    let curB = new Array(curA.length).fill(null);
    let curC = new Array(K_MAX + 1).fill(0);

    // Fase 1: Inizializzazione C
    trace.push({
      A: [...curA], B: [...curB], C: [...curC],
      highlightA: -1, highlightC: -1, highlightB: -1,
      phase: 'FASE 1: AZZERAMENTO C',
      codeLine: 'CS-1',
      log: "Riga 1: Inizializzazione del vettore di conteggio C[0..k] a tutti zeri. Tempo: Θ(k)."
    });

    // Fase 2: Conteggio occorrenze
    for (let j = 0; j < curA.length; j++) {
      let val = curA[j];
      curC[val] = curC[val] + 1;
      trace.push({
        A: [...curA], B: [...curB], C: [...curC],
        highlightA: j, highlightC: val, highlightB: -1,
        phase: 'FASE 2: CONTEGGIO FREQUENZE',
        codeLine: 'CS-2',
        log: `Riga 2 (j=${j + 1}): Esamino A[${j + 1}] = ${val}. Incremento contatore C[${val}] a ${curC[val]}.`
      });
    }

    // Fase 3: Somme prefisse
    for (let i = 1; i <= K_MAX; i++) {
      curC[i] = curC[i] + curC[i - 1];
      trace.push({
        A: [...curA], B: [...curB], C: [...curC],
        highlightA: -1, highlightC: i, highlightB: -1,
        phase: 'FASE 3: SOMME PREFISSE',
        codeLine: 'CS-3',
        log: `Riga 3 (i=${i}): Somma prefissa C[${i}] = C[${i}] + C[${i - 1}] = ${curC[i]}. Indica elementi totali ≤ ${i}.`
      });
    }

    // Fase 4: Posizionamento in B e decremento (tracciamento atomico riga 5 e riga 6)
    for (let j = curA.length - 1; j >= 0; j--) {
      let val = curA[j];
      let targetPos = curC[val] - 1; // Posizione 0-based

      // Passo 4A: Scrittura stabile in B (Riga 5)
      curB[targetPos] = val;
      trace.push({
        A: [...curA], B: [...curB], C: [...curC],
        highlightA: j, highlightC: val, highlightB: targetPos,
        phase: 'FASE 4: POSIZIONAMENTO IN B',
        codeLine: 'CS-5',
        log: `Riga 5 (j=${j + 1}): Posiziono A[${j + 1}] = ${val} nell'indice B[${targetPos + 1}] guidato da C[${val}].`
      });

      // Passo 4B: Decremento del contatore C (Riga 6)
      curC[val] = curC[val] - 1;
      trace.push({
        A: [...curA], B: [...curB], C: [...curC],
        highlightA: -1, highlightC: val, highlightB: targetPos,
        phase: 'FASE 4: AGGIORNAMENTO CONTATORE',
        codeLine: 'CS-6',
        log: `Riga 6 (j=${j + 1}): Decremento contatore C[${val}] = ${curC[val]} per la stabilità della prossima occorrenza.`
      });
    }

    trace.push({
      A: [...curA], B: [...curB], C: [...curC],
      highlightA: -1, highlightC: -1, highlightB: -1,
      phase: 'COMPLETATO',
      codeLine: null,
      log: "COUNTING-SORT completato: ordinamento stabile ottenuto in tempo lineare Θ(n + k)!"
    });

    return trace;
  };

  const handleRandomize = () => {
    const newArr = generateRandomArray();
    setInitial(newArr);
    setA([...newArr]);
    setB(new Array(newArr.length).fill(null));
    setC(new Array(K_MAX + 1).fill(0));
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo array casuale generato. Pronto per COUNTING-SORT."]);
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
      setB(current.B);
      setC(current.C);
      setLogs(prev => [...prev, current.log]);
      
      if (setRigaAttiva) {
        setRigaAttiva(current.codeLine || null);
      }

      setStepIndex(prev => prev + 1);
    }
  };

  const reset = () => {
    setA([...initial]);
    setB(new Array(initial.length).fill(null));
    setC(new Array(K_MAX + 1).fill(0));
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
              COUNTING-SORT Standard
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Ordinamento lineare stabile mediante array ausiliario B e frequenze C in Θ(n + k)
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
        {/* Pannello sinistro: Tre Array (A, C, B) */}
        <div style={{ flex: '1 1 58%', padding: '18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          {/* Badge Fase Attuale */}
          <div style={{
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: '#38bdf8',
            letterSpacing: '0.04em'
          }}>
            {currentTrace.phase || 'STATO INIZIALE: PRONTO'}
          </div>

          {/* Array Input A */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              ARRAY A (INPUT, LUNGHEZZA n={A.length})
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {A.map((val, idx) => {
                const isHighlight = currentTrace.highlightA === idx;
                let bg = '#111827';
                let border = '#1f2937';
                let color = '#cbd5e1';
                let shadow = 'none';

                if (isHighlight) {
                  bg = '#312e81'; border = '#6366f1'; color = '#e0e7ff'; shadow = '0 0 12px rgba(99, 102, 241, 0.45)';
                }

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '3px' }}>j={idx + 1}</span>
                    <div style={{
                      width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
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

          {/* Array Ausiliario C */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              ARRAY C (FREQUENZE E POSIZIONI, INDICE 0..k={K_MAX})
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {C.map((val, idx) => {
                const isHighlight = currentTrace.highlightC === idx;
                let bg = '#111827';
                let border = '#1f2937';
                let color = '#cbd5e1';
                let shadow = 'none';

                if (isHighlight) {
                  bg = '#78350f'; border = '#f59e0b'; color = '#fef3c7'; shadow = '0 0 12px rgba(245, 158, 11, 0.45)';
                }

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '3px' }}>i={idx}</span>
                    <div style={{
                      width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
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

          {/* Array Output B */}
          <div style={{ marginTop: 'auto' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              ARRAY B (OUTPUT ORDINATO FINALE)
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {B.map((val, idx) => {
                const isHighlight = currentTrace.highlightB === idx;
                const isAssigned = val !== null;
                
                let bg = isAssigned ? '#064e3b' : '#070b14';
                let border = isHighlight ? '#38bdf8' : isAssigned ? '#10b981' : '#1e293b';
                let color = isAssigned ? '#a7f3d0' : '#475569';
                let shadow = isHighlight ? '0 0 14px rgba(56, 189, 248, 0.5)' : isAssigned ? '0 0 8px rgba(16, 185, 129, 0.25)' : 'none';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '3px' }}>idx={idx + 1}</span>
                    <div style={{
                      width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: bg,
                      border: isAssigned ? `2px solid ${border}` : `1.5px dashed ${border}`,
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: color,
                      boxShadow: shadow,
                      transform: isHighlight ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {isAssigned ? val : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Log di esecuzione (ancorato rigorosamente senza espandersi) */}
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
            <ArrowRight size={14} /> Passi Linea per Linea
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