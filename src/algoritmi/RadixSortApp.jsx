import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react';

const generateRandomThreeDigitArray = () => {
  const arr = [];
  while (arr.length < 7) {
    const num = Math.floor(Math.random() * 899) + 100; // Numeri a 3 cifre tra 100 e 999
    if (!arr.includes(num)) arr.push(num);
  }
  return arr;
};

export default function RadixSortApp({ setRigaAttiva }) {
  const [initial, setInitial] = useState(() => generateRandomThreeDigitArray());
  const [A, setA] = useState([...initial]);
  const [logs, setLogs] = useState(["Array di numeri a d=3 cifre caricato. Pronto per RADIX-SORT (LSD)."]);
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
    const dLabels = ["UNITÀ (LSD, colonna 1)", "DECINE (colonna 2)", "CENTINAIA (MSD, colonna 3)"];

    for (let d = 0; d < 3; d++) {
      let exp = Math.pow(10, d);

      // Passo A: Inizio ciclo esterno sulla cifra d-esima (Riga 1)
      trace.push({
        A: [...curA],
        currentDigit: d,
        phase: `INIZIO PASSAGGIO CIFRA ${dLabels[d]}`,
        codeLine: 'RS-1',
        log: `Riga 1 (i=${d + 1}): Avvio iterazione per la cifra: ${dLabels[d]}.`
      });

      // Esecuzione stabile di Counting Sort sulla cifra corrente (base k=10)
      let output = new Array(curA.length).fill(0);
      let count = new Array(10).fill(0);

      for (let i = 0; i < curA.length; i++) {
        let digit = Math.floor(curA[i] / exp) % 10;
        count[digit]++;
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
      }

      for (let i = curA.length - 1; i >= 0; i--) {
        let digit = Math.floor(curA[i] / exp) % 10;
        output[count[digit] - 1] = curA[i];
        count[digit]--;
      }

      curA = [...output];

      // Passo B: Subroutine stabile applicata e array riordinato (Riga 2 su singola riga)
      trace.push({
        A: [...curA],
        currentDigit: d,
        phase: `FINE PASSAGGIO CIFRA ${dLabels[d]}`,
        codeLine: 'RS-2',
        log: `Riga 2: Counting Sort stabile eseguito su colonna ${dLabels[d]}. Ordine relativo precedente preservato.`
      });
    }

    trace.push({
      A: [...curA],
      currentDigit: -1,
      phase: 'COMPLETATO',
      codeLine: null,
      log: 'RADIX-SORT completato: intero array ordinato in tempo lineare Θ(d · (n + k))!'
    });

    return trace;
  };

  const handleRandomize = () => {
    const newArr = generateRandomThreeDigitArray();
    setInitial(newArr);
    setA([...newArr]);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Nuovo array casuale a 3 cifre generato. Pronto per RADIX-SORT."]);
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
              RADIX-SORT (LSD) Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Ordinamento colonna per colonna dalla meno significativa (LSD) in tempo Θ(d · (n + k))
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
        {/* Pannello sinistro: Array e Dettagli sulle Cifre */}
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

          {/* Array A con evidenziazione cifra attiva */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              STATO ARRAY A (EVIDENZIAZIONE CIFRA ATTIVA: {currentTrace.currentDigit === 0 ? 'UNITÀ' : currentTrace.currentDigit === 1 ? 'DECINE' : currentTrace.currentDigit === 2 ? 'CENTINAIA' : 'NESSUNA'})
            </span>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              {A.map((num, idx) => {
                const strNum = num.toString().padStart(3, '0');
                const d = currentTrace.currentDigit;
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '4px' }}>idx={idx + 1}</span>
                    <div style={{
                      display: 'flex',
                      padding: '8px 12px',
                      backgroundColor: isDone ? '#064e3b' : '#111827',
                      border: isDone ? '2px solid #10b981' : '1px solid #1e293b',
                      borderRadius: '8px',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontWeight: 800,
                      fontSize: '1.15rem',
                      letterSpacing: '3px',
                      boxShadow: isDone ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {/* Centinaia (d=2) */}
                      <span style={{
                        color: d === 2 ? '#38bdf8' : isDone ? '#a7f3d0' : '#64748b',
                        textDecoration: d === 2 ? 'underline' : 'none',
                        textShadow: d === 2 ? '0 0 8px rgba(56, 189, 248, 0.6)' : 'none'
                      }}>
                        {strNum[0]}
                      </span>
                      {/* Decine (d=1) */}
                      <span style={{
                        color: d === 1 ? '#38bdf8' : isDone ? '#a7f3d0' : '#64748b',
                        textDecoration: d === 1 ? 'underline' : 'none',
                        textShadow: d === 1 ? '0 0 8px rgba(56, 189, 248, 0.6)' : 'none'
                      }}>
                        {strNum[1]}
                      </span>
                      {/* Unità (d=0) */}
                      <span style={{
                        color: d === 0 ? '#38bdf8' : isDone ? '#a7f3d0' : '#64748b',
                        textDecoration: d === 0 ? 'underline' : 'none',
                        textShadow: d === 0 ? '0 0 8px rgba(56, 189, 248, 0.6)' : 'none'
                      }}>
                        {strNum[2]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dettagli Teorici sulla Stabilità */}
          <div style={{ backgroundColor: '#070b14', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', marginTop: 'auto', textAlign: 'left' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block' }}>
              NECESSITÀ FORMALE DELLA STABILITÀ
            </span>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, textAlign: 'left' }}>
              Se la subroutine applicata sulla singola colonna non fosse rigorosamente <strong style={{ color: '#38bdf8' }}>stabile</strong>, 
              il passaggio sulle decine o sulle centinaia distruggerebbe l'ordine consolidato sulle cifre meno significative precedenti, 
              corrompendo la correttezza dell'intero algoritmo.
            </p>
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
            <ArrowRight size={14} /> Log dei Passaggi
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