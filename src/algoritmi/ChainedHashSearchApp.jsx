import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Search, Shuffle, Plus } from 'lucide-react';

const DEFAULT_M = 7;
const INITIAL_KEYS = [15, 28, 19, 20, 33, 12, 17, 10, 5];
const INITIAL_QUERIES = [33, 19, 99, 12, 42];
const MAX_QUEUE_CAPACITY = 20;

export default function ChainedHashSearchApp({ setRigaAttiva }) {
  const [m] = useState(DEFAULT_M);

  // Metodo della divisione: h(k) = k mod m
  const hash = (k) => ((k % m) + m) % m;

  // Popolamento iniziale della tabella hash mediante inserimento in testa
  const createTableFromKeys = (keys) => {
    const t = Array.from({ length: DEFAULT_M }, () => []);
    keys.forEach(k => {
      const slot = hash(k);
      t[slot].unshift(k);
    });
    return t;
  };

  const [table, setTable] = useState(() => createTableFromKeys(INITIAL_KEYS));
  const [searchQueue, setSearchQueue] = useState([...INITIAL_QUERIES]);
  const [customSearchKey, setCustomSearchKey] = useState('');
  const [newTableKey, setNewTableKey] = useState('');
  const [logs, setLogs] = useState(["Tabella Hash pronta. Puoi cercare chiavi, generarne di casuali o modificare la tabella."]);
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

  // Esecuzione passo-passo atomica di CHAINED-HASH-SEARCH
  const executeNextSearchStep = () => {
    if (searchQueue.length === 0 && (!currentStep || currentStep.stage === 'DONE')) return;

    // Inizio nuova ricerca
    if (!currentStep || currentStep.stage === 'DONE') {
      const target = searchQueue[0];
      const targetSlot = hash(target);

      setCurrentStep({
        stage: 'HASH_COMPUTE',
        target,
        slot: targetSlot,
        nodeIdx: -1,
        codeLine: 'CHSC-1'
      });
      if (setRigaAttiva) setRigaAttiva('CHSC-1');
      setLogs(prev => [
        ...prev,
        `1. Calcolo Hash: h(${target}) = ${target} mod ${m} = [Slot ${targetSlot}]. Accesso diretto a T[${targetSlot}].`
      ]);
      return;
    }

    // Scansione della catena
    if (currentStep.stage === 'HASH_COMPUTE' || currentStep.stage === 'SCANNING') {
      const chain = table[currentStep.slot];
      const nextNodeIdx = currentStep.nodeIdx + 1;

      // Insuccesso: lista vuota o fine catena raggiunta
      if (nextNodeIdx >= chain.length) {
        const target = currentStep.target;
        const totalChecked = chain.length;
        setSearchQueue(prev => prev.slice(1));
        setCurrentStep({
          stage: 'DONE',
          found: false,
          target,
          slot: currentStep.slot,
          nodeIdx: nextNodeIdx,
          codeLine: 'CHSC-5'
        });
        if (setRigaAttiva) setRigaAttiva('CHSC-5');
        setLogs(prev => [
          ...prev,
          `❌ Raggiunto NIL in T[${currentStep.slot}]. Chiave ${target} NON trovata (esaminati ${totalChecked} nodi).`
        ]);
        return;
      }

      // Confronto nodo corrente
      const currentVal = chain[nextNodeIdx];
      const isMatch = currentVal === currentStep.target;

      if (isMatch) {
        // Successo
        const target = currentStep.target;
        const totalChecked = nextNodeIdx + 1;
        setSearchQueue(prev => prev.slice(1));
        setCurrentStep({
          stage: 'DONE',
          found: true,
          target,
          slot: currentStep.slot,
          nodeIdx: nextNodeIdx,
          codeLine: 'CHSC-5'
        });
        if (setRigaAttiva) setRigaAttiva('CHSC-5');
        setLogs(prev => [
          ...prev,
          `✓ Match trovato! T[${currentStep.slot}][nodo ${nextNodeIdx + 1}] == ${target}. Restituisco puntatore al nodo (confronti: ${totalChecked}).`
        ]);
      } else {
        // Avanzamento su x.next
        setCurrentStep({
          stage: 'SCANNING',
          target: currentStep.target,
          slot: currentStep.slot,
          nodeIdx: nextNodeIdx,
          codeLine: 'CHSC-4'
        });
        if (setRigaAttiva) setRigaAttiva('CHSC-4');
        setLogs(prev => [
          ...prev,
          `Ispezione nodo ${nextNodeIdx + 1}: ${currentVal} ≠ ${currentStep.target}. Scorro su x.next.`
        ]);
      }
    }
  };

  // Aggiungi chiave target alla coda di ricerca
  const handleAddSearchTarget = (e) => {
    e.preventDefault();
    if (searchQueue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Coda di ricerca al limite massimo (${MAX_QUEUE_CAPACITY} query).`]);
      return;
    }
    const val = parseInt(customSearchKey, 10);
    if (!isNaN(val)) {
      setSearchQueue(prev => [...prev, val]);
      setCustomSearchKey('');
      setLogs(prev => [...prev, `Accodata chiave target ${val} da cercare (${searchQueue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
    }
  };

  // Aggiungi query casuale (50% hit, 50% probabile miss)
  const handleRandomSearchTarget = () => {
    if (searchQueue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Limite coda di ricerca raggiunto (${MAX_QUEUE_CAPACITY} query).`]);
      return;
    }
    const allTableKeys = table.flat();
    let r;
    if (allTableKeys.length > 0 && Math.random() < 0.5) {
      r = allTableKeys[Math.floor(Math.random() * allTableKeys.length)];
    } else {
      r = Math.floor(Math.random() * 95) + 5;
    }
    setSearchQueue(prev => [...prev, r]);
    setLogs(prev => [...prev, `Accodata query casuale ${r} in ricerca (${searchQueue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
  };

  // Shuffle della tabella hash
  const handleShuffleTable = () => {
    const randomCount = Math.floor(Math.random() * 6) + 7;
    const newKeys = [];
    while (newKeys.length < randomCount) {
      const val = Math.floor(Math.random() * 85) + 5;
      if (!newKeys.includes(val)) newKeys.push(val);
    }
    setTable(createTableFromKeys(newKeys));
    setCurrentStep(null);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([`Tabella Hash rimescolata con ${newKeys.length} chiavi casuali.`]);
  };

  // Inserimento manuale di un valore nella tabella
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

  // Reset complessivo
  const handleReset = () => {
    setTable(createTableFromKeys(INITIAL_KEYS));
    setSearchQueue([...INITIAL_QUERIES]);
    setCurrentStep(null);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Tabella e coda di ricerca ripristinate allo stato iniziale."]);
  };

  const totalElements = table.reduce((acc, list) => acc + list.length, 0);
  const alpha = (totalElements / m).toFixed(2);
  const isDone = searchQueue.length === 0 && (!currentStep || currentStep.stage === 'DONE');
  const isQueueFull = searchQueue.length >= MAX_QUEUE_CAPACITY;

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
              CHAINED-HASH-SEARCH Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Accesso allo slot in Θ(1) e scansione della lista in tempo atteso Θ(1 + α)
          </p>
        </div>

        {/* Pulsanti Azione Header */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={handleShuffleTable}
            title="Genera casualmente i nodi della tabella hash"
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
            onClick={handleRandomSearchTarget}
            disabled={isQueueFull}
            title={isQueueFull ? "Coda al limite (max 20)" : "Aggiungi query casuale alla coda"}
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
            <Plus size={14} /> Query
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
            onClick={executeNextSearchStep} 
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
            {isDone ? <CheckCircle2 size={15} /> : <Search size={15} />}
            {isDone ? 'Concluso' : currentStep && currentStep.stage !== 'DONE' ? 'Avanza Ispezione' : 'Cerca Prossimo'}
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

          {/* 1. Badge Stato Operazione Attuale */}
          <div style={{
            backgroundColor: currentStep?.stage === 'DONE'
              ? currentStep.found ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)'
              : 'rgba(2, 132, 199, 0.15)',
            border: currentStep?.stage === 'DONE'
              ? currentStep.found ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
              : '1px solid rgba(56, 189, 248, 0.25)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: currentStep?.stage === 'DONE'
              ? currentStep.found ? '#34d399' : '#f87171'
              : '#38bdf8',
            letterSpacing: '0.04em',
            flexShrink: 0
          }}>
            {currentStep?.stage === 'HASH_COMPUTE' 
              ? `CALCOLO SLOT: h(${currentStep.target}) = ${currentStep.target} mod ${m} = [Slot ${currentStep.slot}]`
              : currentStep?.stage === 'SCANNING'
              ? `ISPEZIONE T[${currentStep.slot}]: Confronto x.key (${table[currentStep.slot][currentStep.nodeIdx]}) con target (${currentStep.target})`
              : currentStep?.stage === 'DONE'
              ? currentStep.found
                ? `SUCCESSO: Chiave ${currentStep.target} localizzata in T[${currentStep.slot}] (nodo ${currentStep.nodeIdx + 1})`
                : `INSUCCESSO: Chiave ${currentStep.target} assente in T[${currentStep.slot}] (restituito NIL)`
              : 'STATO INIZIALE: PRONTO PER LA RICERCA'}
          </div>

          {/* 2. Coda Query di Ricerca a Scorrimento Orizzontale */}
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
                  CODA CHIAVI DA CERCARE
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
                  {searchQueue.length}/{MAX_QUEUE_CAPACITY}
                </span>
              </div>
              
              <form onSubmit={handleAddSearchTarget} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder={isQueueFull ? "Coda piena" : "Cerca chiave..."}
                  disabled={isQueueFull}
                  value={customSearchKey}
                  onChange={(e) => setCustomSearchKey(e.target.value)}
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
                    backgroundColor: isQueueFull ? '#334155' : '#0284c7',
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
                  <Search size={13} />
                </button>
              </form>
            </div>

            {/* Container Orizzontale Scorrevole per le Query */}
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
              {searchQueue.length === 0 && (!currentStep || currentStep.stage === 'DONE') ? (
                <span style={{ fontSize: '0.74rem', color: '#10b981', fontStyle: 'italic' }}>
                  ✓ Tutte le ricerche in coda sono state completate. Aggiungine altre o usa "+ Query".
                </span>
              ) : (
                searchQueue.map((k, idx) => {
                  const isNext = idx === 0 && (!currentStep || currentStep.stage === 'DONE');
                  return (
                    <div 
                      key={idx}
                      style={{
                        flexShrink: 0,
                        padding: '3px 9px',
                        backgroundColor: isNext ? '#0369a1' : '#111827',
                        border: isNext ? '1.5px solid #38bdf8' : '1px solid #334155',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: isNext ? '#ffffff' : '#94a3b8',
                        fontFamily: 'monospace',
                        boxShadow: isNext ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      k={k}
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
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                TABELLA HASH T (m = {m}) — CATENE DI TRABOCCO
              </span>

              {/* Inserimento diretto nella struttura hash */}
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
                          const isExamined = isTargetSlot && currentStep.nodeIdx === nodeIdx;
                          const isFound = isTargetSlot && currentStep.stage === 'DONE' && currentStep.found && currentStep.nodeIdx === nodeIdx;
                          const isPassed = isTargetSlot && currentStep.nodeIdx > nodeIdx;

                          let bg = '#0f172a';
                          let border = '#334155';
                          let textColor = '#f8fafc';
                          let shadow = 'none';

                          if (isFound) {
                            bg = '#065f46'; border = '#10b981'; textColor = '#a7f3d0'; shadow = '0 0 10px rgba(16, 185, 129, 0.45)';
                          } else if (isExamined) {
                            bg = '#78350f'; border = '#f59e0b'; textColor = '#fef3c7'; shadow = '0 0 10px rgba(245, 158, 11, 0.45)';
                          } else if (isPassed) {
                            bg = '#1e1b4b'; border = '#4338ca'; textColor = '#a5b4fc';
                          }

                          return (
                            <div key={nodeIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: bg,
                                border: `1.5px solid ${border}`,
                                borderRadius: '5px',
                                overflow: 'hidden',
                                boxShadow: shadow,
                                transform: isExamined ? 'scale(1.06)' : 'scale(1)',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}>
                                <span style={{
                                  padding: '2px 8px',
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  color: textColor,
                                  fontFamily: 'monospace'
                                }}>
                                  {keyVal}
                                </span>
                                {isFound && (
                                  <span style={{
                                    backgroundColor: '#10b981',
                                    color: '#064e3b',
                                    fontSize: '0.56rem',
                                    fontWeight: 900,
                                    padding: '2px 5px'
                                  }}>
                                    MATCH
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
            <ArrowRight size={14} /> Tracciamento Atomico della Ricerca
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