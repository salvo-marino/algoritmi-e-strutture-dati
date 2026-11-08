import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Plus, Shuffle } from 'lucide-react';

const DEFAULT_M = 7; // Dimensione tabella m (numero primo)
const PRESET_KEYS = [15, 28, 19, 20, 33, 12, 17, 10, 5];
const MAX_QUEUE_CAPACITY = 20; // Limite massimo di chiavi in attesa nella coda

export default function ChainedHashInsertApp({ setRigaAttiva }) {
  const [m] = useState(DEFAULT_M);
  const [table, setTable] = useState(() => Array.from({ length: DEFAULT_M }, () => []));
  const [queue, setQueue] = useState([...PRESET_KEYS]);
  const [customKey, setCustomKey] = useState('');
  const [logs, setLogs] = useState(["Tabella Hash inizializzata (m = 7). In attesa di inserimenti."]);
  const [currentStep, setCurrentStep] = useState(null);

  const logsEndRef = useRef(null);
  const slotRefs = useRef([]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Scroll automatico confinato esclusivamente all'interno dell'area delle liste
  useEffect(() => {
    if (currentStep && currentStep.slot !== undefined && slotRefs.current[currentStep.slot]) {
      slotRefs.current[currentStep.slot].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentStep]);

  // Funzione hash: metodo della divisione h(k) = k mod m
  const hash = (k) => ((k % m) + m) % m;

  // Inserimento passo-passo
  const executeNextInsert = () => {
    if (queue.length === 0) return;

    const keyToInsert = queue[0];
    const targetSlot = hash(keyToInsert);

    // Fase 1: Calcolo Hash
    if (!currentStep || currentStep.stage === 'DONE') {
      setCurrentStep({
        stage: 'HASH_COMPUTE',
        key: keyToInsert,
        slot: targetSlot,
        codeLine: 'CHIC-1'
      });
      if (setRigaAttiva) setRigaAttiva('CHIC-1');
      setLogs(prev => [
        ...prev,
        `1. Calcolo Hash: h(${keyToInsert}) = ${keyToInsert} mod ${m} = [Slot ${targetSlot}].`
      ]);
      return;
    }

    // Fase 2: Inserimento in Testa ed aggiornamento lista
    if (currentStep.stage === 'HASH_COMPUTE') {
      const updatedTable = table.map((slotList, idx) => {
        if (idx === targetSlot) {
          return [keyToInsert, ...slotList]; // Inserimento in TESTA
        }
        return slotList;
      });

      setTable(updatedTable);
      setQueue(prev => prev.slice(1));
      setCurrentStep({
        stage: 'DONE',
        key: keyToInsert,
        slot: targetSlot,
        codeLine: 'CHIC-6'
      });
      if (setRigaAttiva) setRigaAttiva('CHIC-6');

      const oldHead = table[targetSlot].length > 0 ? table[targetSlot][0] : 'NIL';
      setLogs(prev => [
        ...prev,
        `2. Inserimento completato in Θ(1): ${keyToInsert} collocato in testa a T[${targetSlot}]. Vecchia testa: ${oldHead}.`
      ]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (queue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Limite coda raggiunto (massimo ${MAX_QUEUE_CAPACITY} elementi). Elabora alcune chiavi prima di aggiungerne altre.`]);
      return;
    }
    const val = parseInt(customKey, 10);
    if (!isNaN(val)) {
      setQueue(prev => [...prev, val]);
      setCustomKey('');
      setLogs(prev => [...prev, `Aggiunta chiave ${val} alla coda di inserimento (${queue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
    }
  };

  const handleReset = () => {
    setTable(Array.from({ length: DEFAULT_M }, () => []));
    setQueue([...PRESET_KEYS]);
    setCurrentStep(null);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Tabella e coda ripristinate allo stato iniziale."]);
  };

  const handleRandomKey = () => {
    if (queue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Limite coda raggiunto (${MAX_QUEUE_CAPACITY} chiavi). Impossibile generarne altre.`]);
      return;
    }
    const r = Math.floor(Math.random() * 90) + 5;
    setQueue(prev => [...prev, r]);
    setLogs(prev => [...prev, `Generata chiave casuale ${r} in coda (${queue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
  };

  const totalElements = table.reduce((acc, list) => acc + list.length, 0);
  const alpha = (totalElements / m).toFixed(2);
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
              CHAINED-HASH-INSERT Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Risoluzione collisioni per concatenamento con inserimento in testa in tempo Θ(1)
          </p>
        </div>

        {/* Pulsanti Azione Header */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={handleRandomKey}
            disabled={isQueueFull}
            title={isQueueFull ? "Coda al limite (max 20)" : "Aggiungi chiave casuale"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isQueueFull ? '#1e293b' : '#1e293b',
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
            onClick={executeNextInsert} 
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
            {isDone ? 'Inseriti' : currentStep?.stage === 'HASH_COMPUTE' ? 'Inserisci in Testa' : 'Prossimo Passo'}
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

          {/* 1. Badge Operazione (Fisso in alto) */}
          <div style={{
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: '#38bdf8',
            letterSpacing: '0.04em',
            flexShrink: 0
          }}>
            {currentStep?.stage === 'HASH_COMPUTE' 
              ? `CALCOLO SLOT: h(${currentStep.key}) = ${currentStep.key} mod ${m} = [Slot ${currentStep.slot}]`
              : currentStep?.stage === 'DONE'
              ? `INSERITO: Chiave ${currentStep.key} in testa alla lista T[${currentStep.slot}]`
              : 'STATO INIZIALE: PRONTO PER L\'INSERIMENTO'}
          </div>

          {/* 2. Coda Chiavi da inserire (Scorrimento Orizzontale a Riga Singola & Limite 20) */}
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
                  ✓ Coda completata: tutte le chiavi sono state allocate nella tabella hash.
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

          {/* 3. Area Liste Confinata con Scorrimento Interno Verticale (200px) */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                TABELLA HASH T (m = {m}) — SLOT & CATENE
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
              {table.map((chain, slotIdx) => {
                const isTargetSlot = currentStep && currentStep.slot === slotIdx;
                const isJustInserted = isTargetSlot && currentStep.stage === 'DONE';

                return (
                  <div 
                    key={slotIdx}
                    ref={el => slotRefs.current[slotIdx] = el}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: isTargetSlot ? 'rgba(56, 189, 248, 0.08)' : '#0b1120',
                      border: isTargetSlot ? '1.5px solid #38bdf8' : '1px solid #1e293b',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      minHeight: '32px',
                      flexShrink: 0,
                      transition: 'all 0.18s ease'
                    }}
                  >
                    {/* Badge Slot T[j] Compatto */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
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
                      <span>T[{slotIdx}]</span>
                      <span style={{
                        fontSize: '0.6rem',
                        color: isTargetSlot ? '#e0f2fe' : '#64748b',
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        padding: '1px 4px',
                        borderRadius: '3px'
                      }}>
                        n={chain.length}
                      </span>
                    </div>

                    <span style={{ color: '#475569', fontSize: '0.72rem', flexShrink: 0 }}>➔</span>

                    {/* Nodi della lista concatenata compatti */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {chain.length === 0 ? (
                        <span style={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'monospace', fontStyle: 'italic' }}>
                          NIL
                        </span>
                      ) : (
                        chain.map((keyVal, nodeIdx) => {
                          const isNewNode = isJustInserted && nodeIdx === 0;

                          return (
                            <div key={nodeIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: isNewNode ? '#065f46' : '#0f172a',
                                border: isNewNode ? '1.5px solid #10b981' : '1px solid #334155',
                                borderRadius: '5px',
                                overflow: 'hidden',
                                boxShadow: isNewNode ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none',
                                transition: 'all 0.2s ease'
                              }}>
                                <span style={{
                                  padding: '2px 8px',
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  color: isNewNode ? '#a7f3d0' : '#f8fafc',
                                  fontFamily: 'monospace'
                                }}>
                                  {keyVal}
                                </span>
                                {nodeIdx === 0 && (
                                  <span style={{
                                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                                    color: '#38bdf8',
                                    fontSize: '0.56rem',
                                    fontWeight: 800,
                                    padding: '2px 4px',
                                    borderLeft: '1px solid #334155'
                                  }}>
                                    HEAD
                                  </span>
                                )}
                              </div>

                              <span style={{ color: '#64748b', fontSize: '0.66rem', fontFamily: 'monospace' }}>
                                {nodeIdx < chain.length - 1 ? '⇄' : '➔ NIL'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Footer Statistiche (Fisso in basso) */}
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
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Elementi Inseriti (n)</span>
              <strong style={{ fontSize: '1rem', color: '#f8fafc', fontFamily: 'monospace' }}>{totalElements}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Dimensione Tabella (m)</span>
              <strong style={{ fontSize: '1rem', color: '#38bdf8', fontFamily: 'monospace' }}>{m}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Fattore di Carico (α = n/m)</span>
              <strong style={{ fontSize: '1rem', color: alpha > 1.0 ? '#f59e0b' : '#10b981', fontFamily: 'monospace' }}>
                {alpha}
              </strong>
            </div>
          </div>

        </div>

        {/* Pannello Destro: Log Esecuzione Atomico (Fisso con scroll) */}
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
            <ArrowRight size={14} /> Passo di Esecuzione & Tracciamento
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