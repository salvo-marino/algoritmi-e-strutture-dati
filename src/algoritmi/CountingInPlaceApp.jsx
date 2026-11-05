import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle, AlertTriangle } from 'lucide-react';

const K_MAX = 5;

const generateRandomArray = () => {
  const arr = [];
  for (let i = 0; i < 7; i++) {
    arr.push(Math.floor(Math.random() * (K_MAX + 1)));
  }
  return arr;
};

export default function CountingInPlaceApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomArray());
  const [A, setA] = useState([...initial]);
  const [C, setC] = useState(new Array(K_MAX + 1).fill(0));
  const [logs, setLogs] = useState(["Array generato. Pronto per COUNTING-SORT-IN-PLACE."]);
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
    let curC = new Array(K_MAX + 1).fill(0);

    // 1. Azzeramento C (Riga 1)
    trace.push({
      A: [...curA], C: [...curC],
      highlightA: -1, highlightC: -1,
      phase: 'FASE 1: AZZERAMENTO C',
      codeLine: 'CIP-1',
      log: "Riga 1: Inizializzo C[0..k] a 0. Spazio ausiliario ristretto al solo vettore delle frequenze: Θ(k)."
    });

    // 2. Frequenze (Riga 2)
    for (let j = 0; j < curA.length; j++) {
      let val = curA[j];
      curC[val] = curC[val] + 1;
      trace.push({
        A: [...curA], C: [...curC],
        highlightA: j, highlightC: val,
        phase: 'FASE 2: CONTEGGIO FREQUENZE',
        codeLine: 'CIP-2',
        log: `Riga 2 (j=${j + 1}): Esamino A[${j + 1}] = ${val}. Incremento contatore C[${val}] a ${curC[val]}.`
      });
    }

    // 3. Inizializzazione puntatore idx (Riga 3)
    let idx = 0;
    trace.push({
      A: [...curA], C: [...curC],
      highlightA: idx, highlightC: -1,
      phase: 'FASE 3: INIZIALIZZAZIONE INDICE',
      codeLine: 'CIP-3',
      log: "Riga 3: Imposto puntatore idx = 1. Inizio sovrascrittura diretta su A."
    });

    // 4. Ciclo for esterno e while di svuotamento (Righe 4 - 8 atomiche)
    for (let i = 0; i <= K_MAX; i++) {
      // Controllo del for esterno (Riga 4)
      trace.push({
        A: [...curA], C: [...curC],
        highlightA: idx < curA.length ? idx : -1, highlightC: i,
        phase: 'FASE 4: CICLO CHIAVE VALORE i',
        codeLine: 'CIP-4',
        log: `Riga 4 (i=${i}): Esamino frequenze per il valore i=${i} (occorrenze residue: ${curC[i]}).`
      });

      while (curC[i] > 0) {
        // Verifica condizione while positiva (Riga 5)
        trace.push({
          A: [...curA], C: [...curC],
          highlightA: idx, highlightC: i,
          phase: 'FASE 4: WHILE C[i] > 0',
          codeLine: 'CIP-5',
          log: `Riga 5: While C[${i}] = ${curC[i]} > 0 (TRUE) -> procedo alla sovrascrittura.`
        });

        // Scrittura in-place del valore i in A[idx] (Riga 6)
        curA[idx] = i;
        trace.push({
          A: [...curA], C: [...curC],
          highlightA: idx, highlightC: i,
          phase: 'FASE 4: SOVRASCRITTURA A[idx]',
          codeLine: 'CIP-6',
          log: `Riga 6: Scrivo A[${idx + 1}] = ${i} direttamente nell'array originale.`
        });

        // Decremento C[i] e avanzamento indice idx (Righe 7-8)
        curC[i] = curC[i] - 1;
        trace.push({
          A: [...curA], C: [...curC],
          highlightA: idx, highlightC: i,
          phase: 'FASE 4: AVANZAMENTO E DECREMENTO',
          codeLine: 'CIP-7',
          log: `Righe 7-8: Incremento idx = ${idx + 2} e decremento contatore C[${i}] = ${curC[i]}.`
        });

        idx++;
      }
    }

    trace.push({
      A: [...curA], C: [...curC],
      highlightA: -1, highlightC: -1,
      phase: 'COMPLETATO',
      codeLine: null,
      log: "COUNTING-SORT-IN-PLACE completato: array ordinato in-place in tempo lineare Θ(n + k)!"
    });

    return trace;
  };

  const handleRandomize = () => {
    const newArr = generateRandomArray();
    setInitial(newArr);
    setA([...newArr]);
    setC(new Array(K_MAX + 1).fill(0));
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo array casuale generato. Pronto per COUNTING-SORT-IN-PLACE."]);
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
              COUNTING-SORT IN-PLACE Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Variante in-place senza array ausiliario B per sole chiavi intere in tempo Θ(n + k)
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
            {isDone ? 'Completato' : 'Prossimo Passo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Pannello sinistro: Array A e Vettore C */}
        <div style={{ flex: '1 1 58%', padding: '18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          {/* Box didattico sulla non-stabilità */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(120, 53, 15, 0.25)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '10px 14px',
            borderRadius: '10px',
            color: '#fef3c7',
            fontSize: '0.78rem',
            lineHeight: 1.5
          }}>
            <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: '#f59e0b' }}>Compromesso algoritmico:</strong> Sovrascrive direttamente A riducendo lo spazio ausiliario a Θ(k), ma <u>distrugge la stabilità</u>: non è idoneo per record con dati satellite né come subroutine di Radix Sort.
            </span>
          </div>

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

          {/* Array A */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              ARRAY A (SOVRASCRITTO DIRETTAMENTE IN-PLACE)
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {A.map((val, idx) => {
                const isHighlight = currentTrace.highlightA === idx;
                
                let bg = isDone ? '#064e3b' : isHighlight ? '#78350f' : '#111827';
                let border = isDone ? '#10b981' : isHighlight ? '#f59e0b' : '#1f2937';
                let color = isDone ? '#a7f3d0' : isHighlight ? '#fef3c7' : '#cbd5e1';
                let shadow = isDone ? '0 0 10px rgba(16, 185, 129, 0.3)' : isHighlight ? '0 0 14px rgba(245, 158, 11, 0.5)' : 'none';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '3px' }}>idx={idx + 1}</span>
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

          {/* Array C */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              VETTORE DELLE FREQUENZE RESIDUE C[0..{K_MAX}]
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {C.map((val, idx) => {
                const isHighlight = currentTrace.highlightC === idx;
                
                let bg = isHighlight ? '#312e81' : '#111827';
                let border = isHighlight ? '#6366f1' : '#1f2937';
                let color = isHighlight ? '#e0e7ff' : '#cbd5e1';
                let shadow = isHighlight ? '0 0 12px rgba(99, 102, 241, 0.45)' : 'none';

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
            <ArrowRight size={14} /> Tracciamento Linea per Linea
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