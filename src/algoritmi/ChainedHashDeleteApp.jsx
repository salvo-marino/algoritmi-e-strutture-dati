import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Trash2, Shuffle, Plus } from 'lucide-react';

const DEFAULT_M = 7;
const INITIAL_KEYS = [15, 28, 19, 20, 33, 12, 17, 10, 5];
const INITIAL_DELETE_QUERIES = [28, 33, 12, 99];
const MAX_QUEUE_CAPACITY = 20;

export default function ChainedHashDeleteApp({ setRigaAttiva }) {
  const [m] = useState(DEFAULT_M);

  const hash = (k) => ((k % m) + m) % m;

  const createTableFromKeys = (keys) => {
    const t = Array.from({ length: DEFAULT_M }, () => []);
    keys.forEach(k => {
      const slot = hash(k);
      t[slot].unshift(k);
    });
    return t;
  };

  const [table, setTable] = useState(() => createTableFromKeys(INITIAL_KEYS));
  const [deleteQueue, setDeleteQueue] = useState([...INITIAL_DELETE_QUERIES]);
  const [customDeleteKey, setCustomDeleteKey] = useState('');
  const [newTableKey, setNewTableKey] = useState('');
  const [logs, setLogs] = useState(["Tabella Hash pronta. Puoi eliminare elementi dalla coda o cliccando direttamente sul cestino dei nodi."]);
  const [currentStep, setCurrentStep] = useState(null);

  const logsEndRef = useRef(null);
  const slotRefs = useRef([]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (currentStep && currentStep.slot !== undefined && slotRefs.current[currentStep.slot]) {
      slotRefs.current[currentStep.slot].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentStep]);

  const executeNextDeleteStep = () => {
    if (deleteQueue.length === 0 && (!currentStep || currentStep.stage === 'DONE')) return;

    if (!currentStep || currentStep.stage === 'DONE') {
      const target = deleteQueue[0];
      const targetSlot = hash(target);
      const chain = table[targetSlot];
      const nodeIndex = chain.indexOf(target);

      if (nodeIndex === -1) {
        setDeleteQueue(prev => prev.slice(1));
        setCurrentStep({
          stage: 'DONE',
          found: false,
          target,
          slot: targetSlot,
          nodeIdx: -1,
          codeLine: null
        });
        if (setRigaAttiva) setRigaAttiva(null);
        setLogs(prev => [
          ...prev,
          `❌ Impossibile eliminare: chiave ${target} non presente in T[${targetSlot}]. Nessuna operazione eseguita.`
        ]);
        return;
      }

      const isHead = nodeIndex === 0;
      setCurrentStep({
        stage: 'LOCATED',
        target,
        slot: targetSlot,
        nodeIdx: nodeIndex,
        isHead,
        codeLine: isHead ? 'CHDC-3' : 'CHDC-2'
      });
      if (setRigaAttiva) setRigaAttiva(isHead ? 'CHDC-3' : 'CHDC-2');
      setLogs(prev => [
        ...prev,
        `1. Nodo individuato: chiave ${target} in T[${targetSlot}][pos ${nodeIndex + 1}]. ${isHead ? 'Il nodo è in TESTA: aggiorno T[' + targetSlot + '].' : 'Il nodo è INTERMEDIO: bypasso x.prev.'}`
      ]);
      return;
    }

    if (currentStep.stage === 'LOCATED') {
      const { slot, target } = currentStep;
      setTable(prev => prev.map((chain, sIdx) => {
        if (sIdx === slot) {
          return chain.filter(k => k !== target);
        }
        return chain;
      }));

      setDeleteQueue(prev => prev.slice(1));
      setCurrentStep({
        stage: 'DONE',
        found: true,
        target,
        slot,
        codeLine: 'CHDC-6'
      });
      if (setRigaAttiva) setRigaAttiva('CHDC-6');
      setLogs(prev => [
        ...prev,
        `2. Rimozione completata in Θ(1): puntatori aggiornati e nodo con chiave ${target} deallocato dalla memoria.`
      ]);
    }
  };

  const handleDirectNodeDelete = (slotIdx, keyVal) => {
    setTable(prev => prev.map((chain, sIdx) => {
      if (sIdx === slotIdx) {
        return chain.filter(k => k !== keyVal);
      }
      return chain;
    }));
    setCurrentStep({
      stage: 'DONE',
      found: true,
      target: keyVal,
      slot: slotIdx,
      codeLine: 'CHDC-6'
    });
    if (setRigaAttiva) setRigaAttiva('CHDC-6');
    setLogs(prev => [
      ...prev,
      `Eliminazione diretta con puntatore: rimosso ${keyVal} da T[${slotIdx}] in tempo costante Θ(1).`
    ]);
  };

  const handleAddDeleteTarget = (e) => {
    e.preventDefault();
    if (deleteQueue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Coda cancellazioni al limite massimo (${MAX_QUEUE_CAPACITY} elementi).`]);
      return;
    }
    const val = parseInt(customDeleteKey, 10);
    if (!isNaN(val)) {
      setDeleteQueue(prev => [...prev, val]);
      setCustomDeleteKey('');
      setLogs(prev => [...prev, `Accodata chiave ${val} da eliminare (${deleteQueue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
    }
  };

  const handleRandomDeleteTarget = () => {
    if (deleteQueue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Limite coda raggiunto (${MAX_QUEUE_CAPACITY} elementi).`]);
      return;
    }
    const allTableKeys = table.flat();
    let r;
    if (allTableKeys.length > 0 && Math.random() < 0.7) {
      r = allTableKeys[Math.floor(Math.random() * allTableKeys.length)];
    } else {
      r = Math.floor(Math.random() * 95) + 5;
    }
    setDeleteQueue(prev => [...prev, r]);
    setLogs(prev => [...prev, `Accodata chiave casuale ${r} in cancellazione (${deleteQueue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
  };

  const handleShuffleTable = () => {
    const randomCount = Math.floor(Math.random() * 5) + 8;
    const newKeys = [];
    while (newKeys.length < randomCount) {
      const val = Math.floor(Math.random() * 85) + 5;
      if (!newKeys.includes(val)) newKeys.push(val);
    }
    setTable(createTableFromKeys(newKeys));
    setCurrentStep(null);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([`Tabella Hash rimescolata con ${newKeys.length} chiavi.`]);
  };

  const handleInsertIntoTable = (e) => {
    e.preventDefault();
    const val = parseInt(newTableKey, 10);
    if (!isNaN(val)) {
      const targetSlot = hash(val);
      setTable(prev => prev.map((chain, idx) => idx === targetSlot ? [val, ...chain] : chain));
      setNewTableKey('');
      setLogs(prev => [...prev, `Inserito ${val} manualmente in testa a T[${targetSlot}].`]);
    }
  };

  const handleReset = () => {
    setTable(createTableFromKeys(INITIAL_KEYS));
    setDeleteQueue([...INITIAL_DELETE_QUERIES]);
    setCurrentStep(null);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Tabella e coda di cancellazione ripristinate allo stato iniziale."]);
  };

  const totalElements = table.reduce((acc, list) => acc + list.length, 0);
  const alpha = (totalElements / m).toFixed(2);
  const isDone = deleteQueue.length === 0 && (!currentStep || currentStep.stage === 'DONE');
  const isQueueFull = deleteQueue.length >= MAX_QUEUE_CAPACITY;

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
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              CHAINED-HASH-DELETE Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Scollegamento puntatori e deallocazione in tempo Θ(1)
          </p>
        </div>

        {/* Pulsanti Azione Header */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={handleShuffleTable}
            title="Rigenera casualmente i nodi della tabella hash"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '7px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Shuffle size={14} /> Shuffle Tabella
          </button>

          <button 
            onClick={handleRandomDeleteTarget}
            disabled={isQueueFull}
            title={isQueueFull ? "Coda al limite (max 20)" : "Aggiungi chiave casuale da eliminare"}
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
            <Plus size={14} /> Delete
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
            onClick={executeNextDeleteStep} 
            disabled={isDone}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isDone ? '#334155' : '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              cursor: isDone ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              boxShadow: isDone ? 'none' : '0 0 14px rgba(220, 38, 38, 0.45)',
              transition: 'all 0.15s ease'
            }}
          >
            {isDone ? <CheckCircle2 size={15} /> : <Trash2 size={15} />}
            {isDone ? 'Concluso' : currentStep && currentStep.stage === 'LOCATED' ? 'Conferma Scollegamento' : 'Prossimo Elimina'}
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
          gap: '10px',
          minHeight: 0,
          overflow: 'hidden',
          textAlign: 'left'
        }}>

          {/* 1. Badge Stato Operazione Attuale */}
          <div style={{
            backgroundColor: currentStep?.stage === 'DONE'
              ? currentStep.found ? 'rgba(239, 68, 68, 0.18)' : 'rgba(100, 116, 139, 0.18)'
              : currentStep?.stage === 'LOCATED'
              ? 'rgba(245, 158, 11, 0.18)'
              : 'rgba(2, 132, 199, 0.15)',
            border: currentStep?.stage === 'DONE'
              ? currentStep.found ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(100, 116, 139, 0.4)'
              : currentStep?.stage === 'LOCATED'
              ? '1px solid rgba(245, 158, 11, 0.4)'
              : '1px solid rgba(56, 189, 248, 0.25)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: currentStep?.stage === 'DONE'
              ? currentStep.found ? '#f87171' : '#94a3b8'
              : currentStep?.stage === 'LOCATED'
              ? '#fbbf24'
              : '#38bdf8',
            letterSpacing: '0.04em',
            flexShrink: 0
          }}>
            {currentStep?.stage === 'LOCATED'
              ? `BYPASS PUNTATORI: Chiave ${currentStep.target} individuata in T[${currentStep.slot}]. Pronto allo scollegamento.`
              : currentStep?.stage === 'DONE'
              ? currentStep.found
                ? `ELIMINATO: Chiave ${currentStep.target} deallocata con successo da T[${currentStep.slot}] in tempo Θ(1).`
                : `FALLITO: Chiave ${currentStep.target} non trovata in T[${currentStep.slot}].`
              : 'STATO INIZIALE: PRONTO PER L\'ELIMINAZIONE DEI NODI'}
          </div>

          {/* 2. Coda Chiavi da Eliminare (Scorrimento Orizzontale a Riga Singola) */}
          <div style={{
            backgroundColor: '#070b14',
            padding: '10px 14px',
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
                  CODA CHIAVI DA ELIMINARE
                </span>
                <span style={{
                  fontSize: '0.66rem',
                  fontFamily: 'monospace',
                  color: isQueueFull ? '#f59e0b' : '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  {deleteQueue.length}/{MAX_QUEUE_CAPACITY}
                </span>
              </div>
              
              <form onSubmit={handleAddDeleteTarget} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder={isQueueFull ? "Coda piena" : "Elimina chiave..."}
                  disabled={isQueueFull}
                  value={customDeleteKey}
                  onChange={(e) => setCustomDeleteKey(e.target.value)}
                  style={{
                    width: '130px',
                    backgroundColor: isQueueFull ? '#070b14' : '#0b1120',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '4px 8px',
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
                    backgroundColor: isQueueFull ? '#334155' : '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '4px 8px',
                    cursor: isQueueFull ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={13} />
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
                minHeight: '34px'
              }}
            >
              {deleteQueue.length === 0 && (!currentStep || currentStep.stage === 'DONE') ? (
                <span style={{ fontSize: '0.74rem', color: '#10b981', fontStyle: 'italic' }}>
                  ✓ Coda eliminazioni svuotata. Aggiungine altre o clicca direttamente sui nodi.
                </span>
              ) : (
                deleteQueue.map((k, idx) => {
                  const isNext = idx === 0 && (!currentStep || currentStep.stage === 'DONE');
                  return (
                    <div 
                      key={idx}
                      style={{
                        flexShrink: 0,
                        padding: '3px 9px',
                        backgroundColor: isNext ? '#7f1d1d' : '#111827',
                        border: isNext ? '1.5px solid #ef4444' : '1px solid #334155',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: isNext ? '#ffffff' : '#94a3b8',
                        fontFamily: 'monospace',
                        boxShadow: isNext ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      del: {k}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Area Liste Confinata con Scorrimento Interno Verticale (200px e righe a 32px) */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
                TABELLA HASH T (m = {m}) — CATENE DI TRABOCCO
              </span>

              {/* Form Rapido per iniettare chiavi nella tabella */}
              <form onSubmit={handleInsertIntoTable} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.64rem', color: '#64748b' }}>Aggiungi a T:</span>
                <input
                  type="number"
                  placeholder="Chiave..."
                  value={newTableKey}
                  onChange={(e) => setNewTableKey(e.target.value)}
                  style={{
                    width: '75px',
                    backgroundColor: '#0b1120',
                    border: '1px solid #334155',
                    borderRadius: '5px',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    color: '#f8fafc',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  title="Inserisci nuova chiave nella tabella hash"
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '5px',
                    color: '#38bdf8',
                    padding: '2px 6px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  +
                </button>
              </form>
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

                return (
                  <div 
                    key={slotIdx}
                    ref={el => slotRefs.current[slotIdx] = el}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: isTargetSlot ? 'rgba(239, 68, 68, 0.08)' : '#0b1120',
                      border: isTargetSlot ? '1.5px solid #ef4444' : '1px solid #1e293b',
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
                      backgroundColor: isTargetSlot ? '#991b1b' : '#111827',
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
                        color: isTargetSlot ? '#fee2e2' : '#64748b',
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
                          const isBeingDeleted = isTargetSlot && currentStep?.stage === 'LOCATED' && currentStep.target === keyVal;

                          return (
                            <div key={nodeIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: isBeingDeleted ? '#7f1d1d' : '#0f172a',
                                border: isBeingDeleted ? '1.5px solid #ef4444' : '1px solid #334155',
                                borderRadius: '5px',
                                overflow: 'hidden',
                                boxShadow: isBeingDeleted ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
                                transform: isBeingDeleted ? 'scale(1.06)' : 'scale(1)',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}>
                                <span style={{
                                  padding: '2px 8px',
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  color: isBeingDeleted ? '#fca5a5' : '#f8fafc',
                                  fontFamily: 'monospace'
                                }}>
                                  {keyVal}
                                </span>

                                {/* Bottone di rimozione diretta */}
                                <button
                                  onClick={() => handleDirectNodeDelete(slotIdx, keyVal)}
                                  title="Elimina direttamente questo nodo in Θ(1) (disponendo del puntatore)"
                                  style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    border: 'none',
                                    borderLeft: '1px solid #334155',
                                    color: '#f87171',
                                    padding: '4px 6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <Trash2 size={11} />
                                </button>
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
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Elementi Memorizzati (n)</span>
              <strong style={{ fontSize: '1rem', color: '#f8fafc', fontFamily: 'monospace' }}>{totalElements}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Numero Slot (m)</span>
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
            <ArrowRight size={14} /> Tracciamento Atomico della Cancellazione
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
                  <span style={{ color: '#ef4444', marginRight: '6px' }}>[{index}]</span>
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