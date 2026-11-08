import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Plus, Shuffle, AlertCircle } from 'lucide-react';

const DEFAULT_M = 11; // Numero primo tipico per indirizzamento aperto
const PRESET_KEYS = [22, 15, 36, 44, 10, 85, 99];
const MAX_QUEUE_CAPACITY = 20;

export default function HashInsertApp({ setRigaAttiva }) {
  const [m] = useState(DEFAULT_M);
  // Gli slot possono contenere: null (NIL), "DELETED", oppure un numero intero
  const [table, setTable] = useState(() => Array.from({ length: DEFAULT_M }, () => null));
  const [queue, setQueue] = useState([...PRESET_KEYS]);
  const [customKey, setCustomKey] = useState('');
  const [probingMode, setProbingMode] = useState('linear'); // 'linear' | 'quadratic'
  const [logs, setLogs] = useState(["Tabella Hash a indirizzamento aperto inizializzata (m = 11, tutti slot NIL)."]);
  const [currentStep, setCurrentStep] = useState(null);

  const logsEndRef = useRef(null);
  const slotRefs = useRef([]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Scroll automatico confinato esclusivamente all'interno dell'area degli slot
  useEffect(() => {
    if (currentStep && currentStep.slot !== undefined && slotRefs.current[currentStep.slot]) {
      slotRefs.current[currentStep.slot].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentStep]);

  // Funzione hash ausiliaria primaria: h'(k) = k mod m
  const hPrime = (k) => ((k % m) + m) % m;

  // Funzione di ispezione h(k, i)
  const probeHash = (k, i, mode) => {
    const base = hPrime(k);
    if (mode === 'quadratic') {
      return (base + i + i * i) % m;
    }
    return (base + i) % m; // Lineare: (h'(k) + i) mod m
  };

  // Esecuzione passo-passo atomica di HASH-INSERT
  const executeNextInsertStep = () => {
    if (queue.length === 0 && (!currentStep || currentStep.stage === 'DONE' || currentStep.stage === 'OVERFLOW')) return;

    // Fase 1: Inizio nuovo inserimento
    if (!currentStep || currentStep.stage === 'DONE' || currentStep.stage === 'OVERFLOW') {
      const keyToInsert = queue[0];
      const i = 0;
      const targetSlot = probeHash(keyToInsert, i, probingMode);

      setCurrentStep({
        stage: 'PROBING',
        key: keyToInsert,
        attempt: i,
        slot: targetSlot,
        codeLine: 'HI-3'
      });
      if (setRigaAttiva) setRigaAttiva('HI-3');
      setLogs(prev => [
        ...prev,
        `1. Tentativo i = 0: calcolo j = h(${keyToInsert}, 0) = [Slot ${targetSlot}]. Verifico disponibilità.`
      ]);
      return;
    }

    // Fase 2: Verifica slot e avanzamento
    if (currentStep.stage === 'PROBING') {
      const { key, attempt, slot } = currentStep;
      const currentVal = table[slot];
      const isSlotFree = currentVal === null || currentVal === 'DELETED';

      if (isSlotFree) {
        // Slot disponibile: allocazione (Righe 4-6)
        const updatedTable = [...table];
        updatedTable[slot] = key;
        setTable(updatedTable);
        setQueue(prev => prev.slice(1));

        setCurrentStep({
          stage: 'DONE',
          key,
          attempt,
          slot,
          codeLine: 'HI-5'
        });
        if (setRigaAttiva) setRigaAttiva('HI-5');
        setLogs(prev => [
          ...prev,
          `✓ Slot T[${slot}] era ${currentVal === null ? 'NIL' : 'DELETED'}. Chiave ${key} inserita con successo al tentativo i=${attempt}!`
        ]);
      } else {
        // Collisione: avanzamento al prossimo tentativo (Righe 7-9)
        const nextAttempt = attempt + 1;

        if (nextAttempt >= m) {
          // Tabella satura: Overflow (Riga 10)
          setCurrentStep({
            stage: 'OVERFLOW',
            key,
            attempt: nextAttempt,
            slot: null,
            codeLine: 'HI-10'
          });
          if (setRigaAttiva) setRigaAttiva('HI-10');
          setLogs(prev => [
            ...prev,
            `❌ Errore "hash-table-overflow": esauriti tutti gli m=${m} tentativi. Tabella satura, impossibile allocare ${key}.`
          ]);
        } else {
          const nextSlot = probeHash(key, nextAttempt, probingMode);
          setCurrentStep({
            stage: 'PROBING',
            key,
            attempt: nextAttempt,
            slot: nextSlot,
            codeLine: 'HI-8'
          });
          if (setRigaAttiva) setRigaAttiva('HI-8');
          setLogs(prev => [
            ...prev,
            `Collisione su T[${slot}] (occupato da ${currentVal}). Incremento i=${nextAttempt} ➔ nuovo slot calcolato: T[${nextSlot}].`
          ]);
        }
      }
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (queue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Limite coda raggiunto (${MAX_QUEUE_CAPACITY} elementi). Elabora alcune chiavi prima di aggiungerne.`]);
      return;
    }
    const val = parseInt(customKey, 10);
    if (!isNaN(val)) {
      setQueue(prev => [...prev, val]);
      setCustomKey('');
      setLogs(prev => [...prev, `Accodata chiave ${val} (${queue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
    }
  };

  const handleRandomKey = () => {
    if (queue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Limite coda raggiunto (${MAX_QUEUE_CAPACITY} chiavi).`]);
      return;
    }
    const r = Math.floor(Math.random() * 95) + 5;
    setQueue(prev => [...prev, r]);
    setLogs(prev => [...prev, `Accodata chiave casuale ${r} (${queue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
  };

  // Simula uno slot cancellato (DELETED) per mostrare che HASH-INSERT può riutilizzarlo
  const handleMarkDeleted = (slotIdx) => {
    if (table[slotIdx] === null) return;
    setTable(prev => prev.map((val, idx) => idx === slotIdx ? 'DELETED' : val));
    setLogs(prev => [...prev, `Slot T[${slotIdx}] contrassegnato come DELETED (sarà riutilizzabile da HASH-INSERT).`]);
  };

  const handleReset = () => {
    setTable(Array.from({ length: DEFAULT_M }, () => null));
    setQueue([...PRESET_KEYS]);
    setCurrentStep(null);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Tabella e coda ripristinate allo stato iniziale (tutti gli slot a NIL)."]);
  };

  const occupiedElements = table.filter(x => x !== null && x !== 'DELETED').length;
  const alpha = (occupiedElements / m).toFixed(2);
  const isDone = queue.length === 0 && (!currentStep || currentStep.stage === 'DONE');
  const isQueueFull = queue.length >= MAX_QUEUE_CAPACITY;

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
              HASH-INSERT Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Indirizzamento aperto con sequenza di ispezione e riutilizzo slot DELETED
          </p>
        </div>

        {/* Pulsanti Azione Header */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Selettore Modalità di Ispezione */}
          <div style={{
            display: 'flex',
            backgroundColor: '#111827',
            padding: '2px',
            borderRadius: '7px',
            border: '1px solid #334155',
            marginRight: '4px'
          }}>
            <button
              onClick={() => { setProbingMode('linear'); handleReset(); }}
              style={{
                backgroundColor: probingMode === 'linear' ? '#0284c7' : 'transparent',
                color: probingMode === 'linear' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Lineare
            </button>
            <button
              onClick={() => { setProbingMode('quadratic'); handleReset(); }}
              style={{
                backgroundColor: probingMode === 'quadratic' ? '#0284c7' : 'transparent',
                color: probingMode === 'quadratic' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Quadratica
            </button>
          </div>

          <button 
            onClick={handleRandomKey}
            disabled={isQueueFull}
            title={isQueueFull ? "Coda al limite (max 20)" : "Aggiungi chiave casuale"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              color: isQueueFull ? '#64748b' : '#cbd5e1',
              border: '1px solid #334155',
              padding: '7px 12px',
              borderRadius: '8px',
              cursor: isQueueFull ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Shuffle size={14} /> Casuale
          </button>
          <button 
            onClick={handleReset} 
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
            onClick={executeNextInsertStep} 
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
            {isDone ? 'Inseriti' : currentStep?.stage === 'PROBING' ? 'Verifica Slot' : 'Prossimo Passo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Pannello Sinistro Ancorato */}
        <div style={{
          flex: '1 1 58%',
          padding: '16px',
          backgroundColor: '#090d16',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: 0,
          overflow: 'hidden',
          textAlign: 'left'
        }}>

          {/* 1. Badge Operazione */}
          <div style={{
            backgroundColor: currentStep?.stage === 'OVERFLOW'
              ? 'rgba(239, 68, 68, 0.18)'
              : currentStep?.stage === 'DONE'
              ? 'rgba(16, 185, 129, 0.18)'
              : 'rgba(2, 132, 199, 0.15)',
            border: currentStep?.stage === 'OVERFLOW'
              ? '1px solid rgba(239, 68, 68, 0.4)'
              : currentStep?.stage === 'DONE'
              ? '1px solid rgba(16, 185, 129, 0.4)'
              : '1px solid rgba(56, 189, 248, 0.25)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: currentStep?.stage === 'OVERFLOW'
              ? '#f87171'
              : currentStep?.stage === 'DONE'
              ? '#34d399'
              : '#38bdf8',
            letterSpacing: '0.04em',
            flexShrink: 0
          }}>
            {currentStep?.stage === 'PROBING' 
              ? `ISPEZIONE (i = ${currentStep.attempt}): h(${currentStep.key}, ${currentStep.attempt}) = [Slot ${currentStep.slot}]`
              : currentStep?.stage === 'DONE'
              ? `ALLOCATO: Chiave ${currentStep.key} salvata nello slot T[${currentStep.slot}]`
              : currentStep?.stage === 'OVERFLOW'
              ? `TABELLA SATURA: Raggiunti m=${m} tentativi per la chiave ${currentStep.key}`
              : 'STATO INIZIALE: PRONTO PER L\'INSERIMENTO'}
          </div>

          {/* 2. Coda Chiavi da Inserire (Scorrimento Orizzontale a Riga Singola & Limite 20) */}
          <div style={{
            backgroundColor: '#070b14',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
                  CODA CHIAVI DA INSERIRE
                </span>
                <span style={{
                  fontSize: '0.66rem',
                  fontFamily: 'monospace',
                  color: isQueueFull ? '#f59e0b' : '#38bdf8',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}>
                  {queue.length}/{MAX_QUEUE_CAPACITY}
                </span>
              </div>
              
              <form onSubmit={handleAddCustom} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder={isQueueFull ? "Coda piena (20)" : "Inserisci chiave..."}
                  disabled={isQueueFull}
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  style={{
                    width: '135px',
                    backgroundColor: isQueueFull ? '#070b14' : '#0b1120',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    color: isQueueFull ? '#64748b' : '#f8fafc',
                    outline: 'none',
                    cursor: isQueueFull ? 'not-allowed' : 'text'
                  }}
                />
                <button
                  type="submit"
                  disabled={isQueueFull}
                  style={{
                    backgroundColor: isQueueFull ? '#334155' : '#0284c7',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '5px 10px',
                    cursor: isQueueFull ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={14} />
                </button>
              </form>
            </div>

            {/* Container Orizzontale Scorrevole */}
            <div 
              className="custom-scrollbar"
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                paddingBottom: '4px',
                alignItems: 'center',
                minHeight: '38px'
              }}
            >
              {queue.length === 0 ? (
                <span style={{ fontSize: '0.76rem', color: '#10b981', fontStyle: 'italic' }}>
                  ✓ Coda completata: tutte le chiavi sono state elaborate.
                </span>
              ) : (
                queue.map((k, idx) => {
                  const isNext = idx === 0;
                  return (
                    <div 
                      key={idx}
                      style={{
                        flexShrink: 0,
                        padding: '4px 10px',
                        backgroundColor: isNext ? '#0369a1' : '#111827',
                        border: isNext ? '1.5px solid #38bdf8' : '1px solid #334155',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: isNext ? '#ffffff' : '#94a3b8',
                        fontFamily: 'monospace',
                        boxShadow: isNext ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {k}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Area Slot Confinata con Scorrimento Interno Verticale (200px con righe a 32px) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            height: '200px',
            maxHeight: '200px',
            backgroundColor: '#070b14',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            padding: '8px 10px',
            gap: '6px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                    TABELLA HASH T (m = {m}) — INDIRIZZAMENTO APERTO ({probingMode.toUpperCase()})
                </span>
                <span style={{ fontSize: '0.62rem', color: '#475569', fontStyle: 'italic' }}>
                    (scorri per visualizzare tutti gli slot)
                </span>
            </div>

            <div className="custom-scrollbar" style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingRight: '6px'
            }}>
              {table.map((slotVal, slotIdx) => {
                const isTargetSlot = currentStep && currentStep.slot === slotIdx;
                const isSuccessSlot = isTargetSlot && currentStep.stage === 'DONE';
                const isCollisionSlot = isTargetSlot && currentStep.stage === 'PROBING' && slotVal !== null && slotVal !== 'DELETED';
                const isDeleted = slotVal === 'DELETED';

                let border = '#1e293b';
                let bg = '#0b1120';
                if (isSuccessSlot) {
                  border = '#10b981'; bg = 'rgba(16, 185, 129, 0.12)';
                } else if (isCollisionSlot) {
                  border = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.12)';
                } else if (isTargetSlot) {
                  border = '#38bdf8'; bg = 'rgba(56, 189, 248, 0.08)';
                }

                return (
                  <div 
                    key={slotIdx}
                    ref={el => slotRefs.current[slotIdx] = el}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: bg,
                      border: `1.5px solid ${border}`,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      minHeight: '32px',
                      flexShrink: 0,
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Badge Slot T[j] */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: isTargetSlot ? '#0284c7' : '#111827',
                        border: '1px solid #334155',
                        borderRadius: '5px',
                        padding: '2px 6px',
                        color: isTargetSlot ? '#ffffff' : '#cbd5e1',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        flexShrink: 0
                      }}>
                        T[{slotIdx}]
                      </div>

                      <span style={{ color: '#475569', fontSize: '0.72rem', flexShrink: 0 }}>➔</span>

                      {/* Valore Cella T[j] */}
                      {slotVal === null ? (
                        <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace', fontStyle: 'italic' }}>
                          NIL (libero)
                        </span>
                      ) : isDeleted ? (
                        <span style={{
                          fontSize: '0.66rem',
                          color: '#f59e0b',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid rgba(245, 158, 11, 0.25)'
                        }}>
                          DELETED (riutilizzabile)
                        </span>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: isSuccessSlot ? '#065f46' : '#0f172a',
                          border: isSuccessSlot ? '1.5px solid #10b981' : '1px solid #334155',
                          borderRadius: '5px',
                          padding: '2px 8px',
                          boxShadow: isSuccessSlot ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none',
                          transition: 'all 0.2s ease'
                        }}>
                          <span style={{
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            color: isSuccessSlot ? '#a7f3d0' : '#f8fafc',
                            fontFamily: 'monospace'
                          }}>
                            {slotVal}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Azione rapida: segna come DELETED per testare il riutilizzo */}
                    {slotVal !== null && !isDeleted && (
                      <button
                        onClick={() => handleMarkDeleted(slotIdx)}
                        title="Simula HASH-DELETE impostando DELETED su questa cella"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          color: '#f59e0b',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Del
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Footer Statistiche */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            backgroundColor: '#070b14',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            marginTop: 'auto',
            flexShrink: 0
          }}>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Elementi Attivi (n)</span>
              <strong style={{ fontSize: '1rem', color: '#f8fafc', fontFamily: 'monospace' }}>{occupiedElements}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Capacità Massima (m)</span>
              <strong style={{ fontSize: '1rem', color: '#38bdf8', fontFamily: 'monospace' }}>{m}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Fattore di Carico (α = n/m ≤ 1)</span>
              <strong style={{ fontSize: '1rem', color: alpha >= 0.9 ? '#ef4444' : alpha >= 0.7 ? '#f59e0b' : '#10b981', fontFamily: 'monospace' }}>
                {alpha}
              </strong>
            </div>
          </div>

        </div>

        {/* Pannello Destro: Log Esecuzione Atomico */}
        <div style={{
          flex: '1 1 42%',
          backgroundColor: '#0b1120',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          position: 'relative'
        }}>
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
            <ArrowRight size={14} /> Passo di Esecuzione & Ispezione
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