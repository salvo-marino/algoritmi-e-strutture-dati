import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Shuffle, Search } from 'lucide-react';

const generateSortedRandomArray = () => {
  const setVals = new Set();
  while (setVals.size < 9) {
    setVals.add(Math.floor(Math.random() * 80) + 10);
  }
  return Array.from(setVals).sort((a, b) => a - b);
};

export default function BinarySearchApp({ setRigaAttiva }) {
  const [array, setArray] = useState(() => generateSortedRandomArray());
  const [target, setTarget] = useState(() => array[Math.floor(Math.random() * array.length)]);
  const [logs, setLogs] = useState([`Array ordinato pronto. Elemento target impostato: ${target}.`]);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const buildExecutionTrace = (A, x) => {
    const trace = [];

    const recSearch = (p, r) => {
      if (p > r) {
        trace.push({
          type: 'NOT_FOUND',
          p, r,
          codeLine: 'BS-1',
          log: `Caso base (p > r): Intervallo vuoto! L'elemento ${x} non è presente nell'array.`
        });
        return -1;
      }

      let q = Math.floor(p + (r - p) / 2);
      trace.push({
        type: 'CHECK_MID',
        p, r, q,
        midVal: A[q],
        codeLine: 'BS-3',
        log: `Intervallo [${p + 1}..${r + 1}]: Calcolo punto medio q = ${q + 1} (valore: ${A[q]}).`
      });

      if (A[q] === x) {
        trace.push({
          type: 'FOUND',
          p, r, q,
          val: A[q],
          codeLine: 'BS-5',
          log: `MATCH TROVATO! A[${q + 1}] == ${x}. Ricerca terminata con successo in tempo Θ(log n)!`
        });
        return q;
      }

      if (A[q] > x) {
        trace.push({
          type: 'DISCARD_RIGHT',
          p, r, q,
          codeLine: 'BS-7',
          log: `A[${q + 1}] (${A[q]}) > x (${x}): Scarto la metà destra. Chiamo ricorsivamente su [${p + 1}..${q}].`
        });
        return recSearch(p, q - 1);
      } else {
        trace.push({
          type: 'DISCARD_LEFT',
          p, r, q,
          codeLine: 'BS-8',
          log: `A[${q + 1}] (${A[q]}) < x (${x}): Scarto la metà sinistra. Chiamo ricorsivamente su [${q + 2}..${r + 1}].`
        });
        return recSearch(q + 1, r);
      }
    };

    recSearch(0, A.length - 1);
    return trace;
  };

  const handleRandomize = () => {
    const newArr = generateSortedRandomArray();
    const newTarget = newArr[Math.floor(Math.random() * newArr.length)];
    setArray(newArr);
    setTarget(newTarget);
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([`Nuovo array ordinato generato. Target impostato a: ${newTarget}.`]);
  };

  const nextStep = () => {
    let trace = steps;
    if (trace.length === 0) {
      trace = buildExecutionTrace(array, target);
      setSteps(trace);
    }

    if (stepIndex < trace.length) {
      const current = trace[stepIndex];
      setLogs(prev => [...prev, current.log]);
      
      if (setRigaAttiva) {
        setRigaAttiva(current.codeLine || null);
      }

      setStepIndex(prev => prev + 1);
    }
  };

  const reset = () => {
    setSteps([]);
    setStepIndex(0);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([`Ricerca resettata. Pronto a rieseguire per x = ${target}.`]);
  };

  const currentTrace = steps[stepIndex - 1] || {};
  const isFound = currentTrace.type === 'FOUND';
  const isNotFound = currentTrace.type === 'NOT_FOUND';
  const isDone = isFound || isNotFound;

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
              BINARY-SEARCH Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Dimezzamento ricorsivo dello spazio di ricerca con complessità logaritmica Θ(log n)
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
            {isDone ? 'Concluso' : 'Prossimo Passo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Vista Array & Dettagli */}
        <div style={{ flex: '1 1 58%', padding: '18px', backgroundColor: '#090d16', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', textAlign: 'left' }} className="custom-scrollbar">
          
          {/* Target input */}
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
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>Chiave da ricercare (x):</span>
            <input 
              type="number" 
              value={target} 
              disabled={steps.length > 0}
              onChange={(e) => setTarget(Number(e.target.value))} 
              style={{
                width: '54px',
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

          {/* Array Ordinato A */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', textAlign: 'left' }}>
              ARRAY ORDINATO A
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {array.map((val, idx) => {
                const inRange = currentTrace.p !== undefined && idx >= currentTrace.p && idx <= currentTrace.r;
                const isMid = currentTrace.q === idx;

                let bg = inRange ? '#111827' : '#070b14';
                let border = inRange ? '#334155' : '#1e293b';
                let color = inRange ? '#f8fafc' : '#475569';
                let shadow = 'none';

                if (isFound && isMid) {
                  bg = '#064e3b'; border = '#10b981'; color = '#a7f3d0'; shadow = '0 0 14px rgba(16, 185, 129, 0.4)';
                } else if (isMid) {
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
                      transform: isMid ? 'scale(1.08)' : 'scale(1)',
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
              DIMEZZAMENTO ASINTOTICO
            </span>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, textAlign: 'left' }}>
              L'equazione di ricorrenza associata è <strong style={{ color: '#38bdf8' }}>T(n) = T(n/2) + Θ(1)</strong>. Risolvendola con il 
              <strong style={{ color: '#38bdf8' }}> Caso 2 del Teorema Master</strong> (con k=0), lo spazio di ricerca si riduce esponenzialmente a ogni 
              passo restituendo un costo logaritmico <strong style={{ color: '#38bdf8' }}>Θ(log n)</strong>.
            </p>
          </div>
        </div>

        {/* Log di Ricerca (ancorato rigorosamente senza espandersi) */}
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
            <ArrowRight size={14} /> Log di Ricerca
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