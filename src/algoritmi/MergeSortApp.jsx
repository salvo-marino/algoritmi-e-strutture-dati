import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

const generateRandomArray = () => {
  const arr = [];
  while (arr.length < 8) {
    const n = Math.floor(Math.random() * 80) + 5;
    if (!arr.includes(n)) arr.push(n);
  }
  return arr;
};

export default function MergeSortApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomArray());
  const [array, setArray] = useState([...initial]);
  const [auxL, setAuxL] = useState([]);
  const [auxR, setAuxR] = useState([]);
  const [logs, setLogs] = useState(["Array generato. Pronto per avviare MERGE-SORT."]);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Precalcolo tracciamento di Merge Sort con ID di riga pseudocodice associato
  const buildExecutionTrace = (arrInput) => {
    const trace = [];
    let A = [...arrInput];

    const merge = (p, q, r) => {
      let L = A.slice(p, q + 1);
      let R = A.slice(q + 1, r + 1);

      trace.push({
        type: 'MERGE_START',
        p, q, r,
        A: [...A],
        L: [...L],
        R: [...R],
        idxL: -1,
        idxR: -1,
        codeLine: 'M-2',
        log: `MERGE(A, ${p + 1}, ${q + 1}, ${r + 1}): Alloco sotto-array ausiliari L (dim ${L.length}) e R (dim ${R.length}).`
      });

      let i = 0, j = 0, k = p;

      while (i < L.length && j < R.length) {
        if (L[i] <= R[j]) {
          A[k] = L[i];
          trace.push({
            type: 'MERGE_STEP',
            p, q, r, k,
            activeVal: L[i],
            A: [...A],
            L: [...L],
            R: [...R],
            idxL: i,
            idxR: j,
            codeLine: 'M-9',
            log: `Confronto: L[${i + 1}] (${L[i]}) ≤ R[${j + 1}] (${R[j]}). Posiziono ${L[i]} in A[${k + 1}] e avanzo i.`
          });
          i++;
        } else {
          A[k] = R[j];
          trace.push({
            type: 'MERGE_STEP',
            p, q, r, k,
            activeVal: R[j],
            A: [...A],
            L: [...L],
            R: [...R],
            idxL: i,
            idxR: j,
            codeLine: 'M-10',
            log: `Confronto: R[${j + 1}] (${R[j]}) < L[${i + 1}] (${L[i]}). Posiziono ${R[j]} in A[${k + 1}] e avanzo j.`
          });
          j++;
        }
        k++;
      }

      while (i < L.length) {
        A[k] = L[i];
        trace.push({
          type: 'MERGE_STEP',
          p, q, r, k,
          activeVal: L[i],
          A: [...A],
          L: [...L],
          R: [...R],
          idxL: i,
          idxR: j,
          codeLine: 'M-9',
          log: `Residuo sinistro: copio L[${i + 1}] (${L[i]}) in A[${k + 1}].`
        });
        i++;
        k++;
      }

      while (j < R.length) {
        A[k] = R[j];
        trace.push({
          type: 'MERGE_STEP',
          p, q, r, k,
          activeVal: R[j],
          A: [...A],
          L: [...L],
          R: [...R],
          idxL: i,
          idxR: j,
          codeLine: 'M-10',
          log: `Residuo destro: copio R[${j + 1}] (${R[j]}) in A[${k + 1}].`
        });
        j++;
        k++;
      }

      trace.push({
        type: 'MERGE_DONE',
        p, q, r,
        A: [...A],
        L: [],
        R: [],
        idxL: -1,
        idxR: -1,
        codeLine: 'MS-5',
        log: `Fusione terminata: sotto-array A[${p + 1}..${r + 1}] fuso ed ordinato. Memoria ausiliaria liberata.`
      });
    };

    const mergeSort = (p, r) => {
      if (p >= r) {
        trace.push({
          type: 'BASE_CASE',
          p, r,
          A: [...A],
          L: [],
          R: [],
          idxL: -1,
          idxR: -1,
          codeLine: 'MS-1',
          log: `Caso base raggiunto per p=${p + 1}, r=${r + 1}. Sotto-array di dimensione 1 già ordinato.`
        });
        return;
      }
      let q = Math.floor((p + r) / 2);
      trace.push({
        type: 'DIVIDE',
        p, q, r,
        A: [...A],
        L: [],
        R: [],
        idxL: -1,
        idxR: -1,
        codeLine: 'MS-2',
        log: `DIVIDE: Split A[${p + 1}..${r + 1}] a metà: q = ⌊(${p + 1} + ${r + 1}) / 2⌋ = ${q + 1}.`
      });

      mergeSort(p, q);
      mergeSort(q + 1, r);
      merge(p, q, r);
    };

    mergeSort(0, A.length - 1);
    trace.push({
      type: 'ALL_DONE',
      A: [...A],
      L: [],
      R: [],
      idxL: -1,
      idxR: -1,
      codeLine: null,
      log: 'MERGE-SORT completato. Intero array ordinato in tempo Θ(n log n)!'
    });

    return trace;
  };

  const handleRandomize = () => {
    const newArr = generateRandomArray();
    setInitial(newArr);
    setArray([...newArr]);
    setAuxL([]);
    setAuxR([]);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo array casuale generato. Pronto per MERGE-SORT."]);
  };

  const nextStep = () => {
    let trace = steps;
    if (trace.length === 0) {
      trace = buildExecutionTrace(array);
      setSteps(trace);
    }

    if (stepIndex < trace.length) {
      const current = trace[stepIndex];
      setArray(current.A);
      setAuxL(current.L || []);
      setAuxR(current.R || []);
      setLogs(prev => [...prev, current.log]);
      
      // Comunica la riga attiva a App.jsx per l'highlighter
      if (setRigaAttiva) {
        setRigaAttiva(current.codeLine || null);
      }

      setStepIndex(prev => prev + 1);
    }
  };

  const reset = () => {
    setArray([...initial]);
    setAuxL([]);
    setAuxR([]);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Array ripristinato allo stato iniziale. Pronto per MERGE-SORT."]);
  };

  const currentTrace = steps[stepIndex - 1] || {};
  const isDone = currentTrace.type === 'ALL_DONE';

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
              MERGE-SORT Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Suddivisione binaria, gestione sotto-array ausiliari L / R e fusione ordinata in Θ(n log n)
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
        {/* Vista Array & Range */}
        <div style={{ flex: '1 1 58%', padding: '18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          {/* Array Principale A */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              STATO ARRAY PRINCIPALE A (INDIRIZZAMENTO 1-BASED)
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {array.map((val, idx) => {
                const inRange = currentTrace.p !== undefined && idx >= currentTrace.p && idx <= currentTrace.r;
                const isWriting = currentTrace.k === idx;
                
                let bg = '#111827';
                let border = '#1f2937';
                let color = '#94a3b8';
                let shadow = 'none';

                if (isDone) {
                  bg = '#064e3b'; border = '#10b981'; color = '#a7f3d0'; shadow = '0 0 10px rgba(16, 185, 129, 0.3)';
                } else if (isWriting) {
                  bg = '#78350f'; border = '#f59e0b'; color = '#fef3c7'; shadow = '0 0 14px rgba(245, 158, 11, 0.5)';
                } else if (inRange) {
                  bg = '#312e81'; border = '#6366f1'; color = '#e0e7ff'; shadow = '0 0 12px rgba(99, 102, 241, 0.35)';
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
                      transform: isWriting ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sotto-array Ausiliari L ed R */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px'
          }}>
            {/* Array Ausiliario L */}
            <div style={{
              backgroundColor: '#070b14',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #1e293b'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
                  AUSILIARIO L (SINISTRA)
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {auxL.length > 0 ? `dim ${auxL.length}` : 'inattivo'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', minHeight: '34px', alignItems: 'center', flexWrap: 'wrap' }}>
                {auxL.length === 0 ? (
                  <span style={{ fontSize: '0.72rem', color: '#475569', fontStyle: 'italic' }}>nessuna allocazione</span>
                ) : (
                  auxL.map((v, i) => {
                    const isCur = currentTrace.idxL === i;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', color: isCur ? '#38bdf8' : '#64748b', fontFamily: 'monospace' }}>
                          i={i + 1}
                        </span>
                        <div style={{
                          padding: '3px 8px',
                          backgroundColor: isCur ? '#0c4a6e' : '#111827',
                          border: isCur ? '1.5px solid #38bdf8' : '1px solid #334155',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isCur ? '#ffffff' : '#cbd5e1',
                          boxShadow: isCur ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                          transition: 'all 0.15s ease'
                        }}>
                          {v}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Array Ausiliario R */}
            <div style={{
              backgroundColor: '#070b14',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #1e293b'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a855f7', letterSpacing: '0.04em' }}>
                  AUSILIARIO R (DESTRA)
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {auxR.length > 0 ? `dim ${auxR.length}` : 'inattivo'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', minHeight: '34px', alignItems: 'center', flexWrap: 'wrap' }}>
                {auxR.length === 0 ? (
                  <span style={{ fontSize: '0.72rem', color: '#475569', fontStyle: 'italic' }}>nessuna allocazione</span>
                ) : (
                  auxR.map((v, j) => {
                    const isCur = currentTrace.idxR === j;
                    return (
                      <div key={j} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', color: isCur ? '#c084fc' : '#64748b', fontFamily: 'monospace' }}>
                          j={j + 1}
                        </span>
                        <div style={{
                          padding: '3px 8px',
                          backgroundColor: isCur ? '#581c87' : '#111827',
                          border: isCur ? '1.5px solid #c084fc' : '1px solid #334155',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isCur ? '#ffffff' : '#cbd5e1',
                          boxShadow: isCur ? '0 0 10px rgba(192, 132, 252, 0.4)' : 'none',
                          transition: 'all 0.15s ease'
                        }}>
                          {v}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Dettagli del Range attivo ad alto contrasto */}
          <div style={{ backgroundColor: '#070b14', padding: '12px 14px', borderRadius: '10px', border: '1px solid #1e293b', marginTop: 'auto' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              STATO RICORSIONE ATTUALE (INTERVALLO A[p..r])
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'left' }}>
                <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', marginBottom: '2px' }}>Indice p (Inizio)</span>
                <strong style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  {currentTrace.p !== undefined ? currentTrace.p + 1 : '-'}
                </strong>
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'left' }}>
                <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', marginBottom: '2px' }}>Punto medio q (Divide)</span>
                <strong style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  {currentTrace.q !== undefined ? currentTrace.q + 1 : '-'}
                </strong>
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'left' }}>
                <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', marginBottom: '2px' }}>Indice r (Fine)</span>
                <strong style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  {currentTrace.r !== undefined ? currentTrace.r + 1 : '-'}
                </strong>
              </div>
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
            <ArrowRight size={14} /> Passo di Esecuzione
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