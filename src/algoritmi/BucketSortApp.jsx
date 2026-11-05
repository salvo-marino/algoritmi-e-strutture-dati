import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

const generateRandomFloatArray = () => {
  const arr = [];
  for (let i = 0; i < 7; i++) {
    arr.push(parseFloat((Math.random() * 0.9 + 0.05).toFixed(2))); // Valori distribuiti in [0.05, 0.95]
  }
  return arr;
};

export default function BucketSortApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomFloatArray());
  const [A, setA] = useState([...initial]);
  const [buckets, setBuckets] = useState([[], [], [], [], []]); // 5 bucket: [0, 0.2), [0.2, 0.4), ecc.
  const [logs, setLogs] = useState(["Array generato in [0, 1). Pronto per BUCKET-SORT."]);
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
    let curBuckets = [[], [], [], [], []];
    const nB = 5;

    // Fase 1: Inizializzazione array dei bucket B[0..n-1] (Righe 1-2)
    trace.push({
      A: [...curA],
      buckets: curBuckets.map(b => [...b]),
      highlightA: -1,
      highlightBucket: -1,
      phase: 'FASE 1: INIZIALIZZAZIONE BUCKET',
      codeLine: 'BS-2',
      log: `Righe 1-2: n = ${curA.length}. Creo array B[0..${nB - 1}] di liste concatenate vuote.`
    });

    // Fase 2: Distribuzione nei bucket (Righe 3-4 atomiche)
    for (let i = 0; i < curA.length; i++) {
      let val = curA[i];
      let bIdx = Math.floor(nB * val);
      if (bIdx >= nB) bIdx = nB - 1;

      // Riga 3: Controllo del ciclo di scansione su A[i]
      trace.push({
        A: [...curA],
        buckets: curBuckets.map(b => [...b]),
        highlightA: i,
        highlightBucket: -1,
        phase: 'FASE 2: SCANSIONE INPUT A[i]',
        codeLine: 'BS-3',
        log: `Riga 3 (i=${i + 1}): Esamino valore A[${i + 1}] = ${val}. Calcolo indice bucket ⌊${nB} · ${val}⌋ = ${bIdx}.`
      });

      // Riga 4: Inserimento di A[i] nella lista B[bIdx]
      curBuckets[bIdx].push(val);
      trace.push({
        A: [...curA],
        buckets: curBuckets.map(b => [...b]),
        highlightA: i,
        highlightBucket: bIdx,
        phase: 'FASE 2: INSERIMENTO NEL BUCKET',
        codeLine: 'BS-4',
        log: `Riga 4: Inserisco ${val} nella lista del Bucket B[${bIdx}] (intervallo [${(bIdx * 0.2).toFixed(1)}..${((bIdx + 1) * 0.2).toFixed(1)})).`
      });
    }

    // Fase 3: Ordinamento locale dei bucket con Insertion Sort (Righe 5-6 atomiche)
    for (let b = 0; b < nB; b++) {
      // Riga 5: Scansione del for sui bucket
      trace.push({
        A: [...curA],
        buckets: curBuckets.map(bk => [...bk]),
        highlightA: -1,
        highlightBucket: b,
        phase: 'FASE 3: SELEZIONE BUCKET',
        codeLine: 'BS-5',
        log: `Riga 5 (i=${b}): Verifico elementi presenti nella lista B[${b}]. Cardinalità: ${curBuckets[b].length}.`
      });

      if (curBuckets[b].length > 1) {
        curBuckets[b].sort((x, y) => x - y);
        trace.push({
          A: [...curA],
          buckets: curBuckets.map(bk => [...bk]),
          highlightA: -1,
          highlightBucket: b,
          phase: 'FASE 3: ORDINAMENTO LOCALE (INSERTION SORT)',
          codeLine: 'BS-6',
          log: `Riga 6: Ordino lista B[${b}] con INSERTION-SORT. Elementi ordinati: [${curBuckets[b].join(', ')}].`
        });
      }
    }

    // Fase 4: Concatenazione finale in A (Riga 7)
    let flatA = [];
    for (let b = 0; b < nB; b++) {
      flatA = flatA.concat(curBuckets[b]);
    }

    trace.push({
      A: [...flatA],
      buckets: curBuckets.map(b => [...b]),
      highlightA: -1,
      highlightBucket: -1,
      phase: 'FASE 4: CONCATENAZIONE LISTE',
      codeLine: 'BS-7',
      log: "Riga 7: Concateno ordinatamente le liste B[0], B[1], ..., B[4] nel vettore originario A."
    });

    trace.push({
      A: [...flatA],
      buckets: curBuckets.map(b => [...b]),
      highlightA: -1,
      highlightBucket: -1,
      phase: 'COMPLETATO',
      codeLine: null,
      log: "BUCKET-SORT completato: ordinamento ottenuto in tempo medio lineare Θ(n)!"
    });

    return trace;
  };

  const handleRandomize = () => {
    const newArr = generateRandomFloatArray();
    setInitial(newArr);
    setA([...newArr]);
    setBuckets([[], [], [], [], []]);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo array casuale generato in [0, 1). Pronto per BUCKET-SORT."]);
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
      setBuckets(current.buckets);
      setLogs(prev => [...prev, current.log]);
      
      if (setRigaAttiva) {
        setRigaAttiva(current.codeLine || null);
      }

      setStepIndex(prev => prev + 1);
    }
  };

  const reset = () => {
    setA([...initial]);
    setBuckets([[], [], [], [], []]);
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
      {/* Header Visualizer compatto */}
      <div style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '10px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              BUCKET-SORT Visualizer
            </h2>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'left' }}>
            Distribuzione uniforme e ordinamento locale dei bucket in tempo atteso Θ(n)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={handleRandomize} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '6px 11px',
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.78rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Shuffle size={13} /> Casuale
          </button>
          <button 
            onClick={reset} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '6px 11px',
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.78rem',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button 
            onClick={nextStep} 
            disabled={isDone} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: isDone ? '#334155' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '7px',
              cursor: isDone ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              boxShadow: isDone ? 'none' : '0 0 12px rgba(2, 132, 199, 0.45)',
              transition: 'all 0.15s ease'
            }}
          >
            {isDone ? <CheckCircle2 size={14} /> : <Play size={14} />}
            {isDone ? 'Ordinato' : 'Prossimo Passo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Pannello sinistro: Array A e Contenitori Bucket ottimizzati verticalmente */}
        <div style={{ flex: '1 1 58%', padding: '14px 18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          {/* Badge Fase Attuale compatto */}
          <div style={{
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#38bdf8',
            letterSpacing: '0.04em'
          }}>
            {currentTrace.phase || 'STATO INIZIALE: PRONTO'}
          </div>

          {/* Array Input / Output */}
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', display: 'block', textAlign: 'left' }}>
              STATO ARRAY A (INDIRIZZAMENTO 1-BASED)
            </span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {A.map((val, idx) => {
                const isHighlight = currentTrace.highlightA === idx;
                
                let bg = isDone ? '#064e3b' : isHighlight ? '#78350f' : '#111827';
                let border = isDone ? '#10b981' : isHighlight ? '#f59e0b' : '#1f2937';
                let color = isDone ? '#a7f3d0' : isHighlight ? '#fef3c7' : '#cbd5e1';
                let shadow = isDone ? '0 0 10px rgba(16, 185, 129, 0.3)' : isHighlight ? '0 0 14px rgba(245, 158, 11, 0.5)' : 'none';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '2px' }}>idx={idx + 1}</span>
                    <div style={{
                      width: '44px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: bg,
                      border: `2px solid ${border}`,
                      borderRadius: '7px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      color: color,
                      boxShadow: shadow,
                      transform: isHighlight ? 'scale(1.06)' : 'scale(1)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* I 5 Bucket snelli e proporzionati */}
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', display: 'block', textAlign: 'left' }}>
              I CONTENITORI (BUCKET B[0..4])
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
              {buckets.map((bList, bIdx) => {
                const isHighlight = currentTrace.highlightBucket === bIdx;
                
                let bBg = isHighlight ? 'rgba(2, 132, 199, 0.15)' : '#070b14';
                let bBorder = isHighlight ? '#38bdf8' : '#1e293b';
                let bShadow = isHighlight ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none';

                return (
                  <div key={bIdx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '5px 10px',
                    backgroundColor: bBg,
                    border: `1px solid ${bBorder}`,
                    borderRadius: '7px',
                    boxShadow: bShadow,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 800, color: '#38bdf8', width: '130px', flexShrink: 0 }}>
                      B[{bIdx}] [{(bIdx * 0.2).toFixed(1)}..{((bIdx + 1) * 0.2).toFixed(1)}):
                    </span>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {bList.length === 0 ? (
                        <span style={{ fontSize: '0.7rem', color: '#475569', fontStyle: 'italic' }}>vuoto</span>
                      ) : (
                        bList.map((num, nIdx) => (
                          <span key={nIdx} style={{
                            padding: '2px 7px',
                            backgroundColor: '#111827',
                            border: '1px solid #334155',
                            borderRadius: '5px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: '#f8fafc'
                          }}>
                            {num}
                          </span>
                        ))
                      )}
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
            <ArrowRight size={14} /> Log di Distribuzione
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