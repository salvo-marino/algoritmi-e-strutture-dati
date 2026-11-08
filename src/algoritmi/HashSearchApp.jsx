import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Search, Shuffle, Plus } from 'lucide-react';

const DEFAULT_M = 11;
// Pre-popolamento iniziale con elementi inseriti e una cella DELETED per testare lo scavalcamento
const INITIAL_KEYS = [22, 15, 36, 44, 10, 85];
const INITIAL_SEARCH_QUERIES = [36, 44, 99, 10, 15]; // Contiene sia hit che miss
const MAX_QUEUE_CAPACITY = 20;

export default function HashSearchApp({ setRigaAttiva }) {
  const [m] = useState(DEFAULT_M);
  const [probingMode, setProbingMode] = useState('linear'); // 'linear' | 'quadratic'

  const hPrime = (k) => ((k % DEFAULT_M) + DEFAULT_M) % DEFAULT_M;

  const probeHash = (k, i, mode) => {
    const base = hPrime(k);
    if (mode === 'quadratic') {
      return (base + i + i * i) % DEFAULT_M;
    }
    return (base + i) % DEFAULT_M;
  };

  // Funzione per costruire la tabella aperta popolata
  const createInitialTable = (keys, mode) => {
    const t = Array.from({ length: DEFAULT_M }, () => null);
    keys.forEach(k => {
      let i = 0;
      while (i < DEFAULT_M) {
        const slot = probeHash(k, i, mode);
        if (t[slot] === null || t[slot] === 'DELETED') {
          t[slot] = k;
          break;
        }
        i++;
      }
    });
    // Impostiamo intenzionalmente uno slot DELETED per visualizzare lo scavalcamento
    if (t[1] !== null && t[1] !== undefined) {
      t[1] = 'DELETED';
    }
    return t;
  };

  const [table, setTable] = useState(() => createInitialTable(INITIAL_KEYS, 'linear'));
  const [searchQueue, setSearchQueue] = useState([...INITIAL_SEARCH_QUERIES]);
  const [customSearchKey, setCustomSearchKey] = useState('');
  const [newTableKey, setNewTableKey] = useState('');
  const [logs, setLogs] = useState(["Tabella Hash pronta. Avvia la ricerca per tracciare la sequenza di ispezione."]);
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

  // Esecuzione passo-passo atomica di HASH-SEARCH
  const executeNextSearchStep = () => {
    if (searchQueue.length === 0 && (!currentStep || currentStep.stage === 'DONE')) return;

    // Fase 1: Inizio nuova ricerca
    if (!currentStep || currentStep.stage === 'DONE') {
      const target = searchQueue[0];
      const i = 0;
      const targetSlot = probeHash(target, i, probingMode);

      setCurrentStep({
        stage: 'PROBING',
        target,
        attempt: i,
        slot: targetSlot,
        codeLine: 'HS-3'
      });
      if (setRigaAttiva) setRigaAttiva('HS-3');
      setLogs(prev => [
        ...prev,
        `1. Calcolo ispezione i = 0: j = h(${target}, 0) = [Slot ${targetSlot}]. Verifico contenuto T[${targetSlot}].`
      ]);
      return;
    }

    // Fase 2: Verifica della cella corrente
    if (currentStep.stage === 'PROBING') {
      const { target, attempt, slot } = currentStep;
      const currentVal = table[slot];

      // Caso 1: Match con Successo (Righe 4-5)
      if (currentVal === target) {
        setSearchQueue(prev => prev.slice(1));
        setCurrentStep({
          stage: 'DONE',
          found: true,
          target,
          attempt,
          slot,
          codeLine: 'HS-5'
        });
        if (setRigaAttiva) setRigaAttiva('HS-5');
        setLogs(prev => [
          ...prev,
          `✓ Match trovato! T[${slot}] == ${target}. Restituisco l'indice dello slot (ispezioni eseguite: ${attempt + 1}).`
        ]);
        return;
      }

      // Caso 2: Cella NIL incontrata -> Insuccesso certificato (Righe 8-9)
      if (currentVal === null) {
        setSearchQueue(prev => prev.slice(1));
        setCurrentStep({
          stage: 'DONE',
          found: false,
          target,
          attempt,
          slot,
          codeLine: 'HS-9'
        });
        if (setRigaAttiva) setRigaAttiva('HS-9');
        setLogs(prev => [
          ...prev,
          `❌ Trovato NIL allo slot T[${slot}]. Certificato che ${target} NON appartiene al dizionario (restituisco NIL).`
        ]);
        return;
      }

      // Caso 3: Cella occupata da altra chiave o DELETED -> Avanzamento (Righe 6-8)
      const nextAttempt = attempt + 1;

      if (nextAttempt >= m) {
        // Tabella completamente ispezionata senza successo
        setSearchQueue(prev => prev.slice(1));
        setCurrentStep({
          stage: 'DONE',
          found: false,
          target,
          attempt: nextAttempt,
          slot,
          codeLine: 'HS-9'
        });
        if (setRigaAttiva) setRigaAttiva('HS-9');
        setLogs(prev => [
          ...prev,
          `❌ Esauriti tutti gli m=${m} tentativi di ispezione. Chiave ${target} assente nella tabella.`
        ]);
      } else {
        const nextSlot = probeHash(target, nextAttempt, probingMode);
        setCurrentStep({
          stage: 'PROBING',
          target,
          attempt: nextAttempt,
          slot: nextSlot,
          codeLine: 'HS-7'
        });
        if (setRigaAttiva) setRigaAttiva('HS-7');
        setLogs(prev => [
          ...prev,
          `Slot T[${slot}] ${currentVal === 'DELETED' ? 'è DELETED: scavalcato' : `contiene ${currentVal} ≠ ${target}`}. Incremento i=${nextAttempt} ➔ verifico T[${nextSlot}].`
        ]);
      }
    }
  };

  const handleAddSearchTarget = (e) => {
    e.preventDefault();
    if (searchQueue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Coda di ricerca al limite massimo (${MAX_QUEUE_CAPACITY} elementi).`]);
      return;
    }
    const val = parseInt(customSearchKey, 10);
    if (!isNaN(val)) {
      setSearchQueue(prev => [...prev, val]);
      setCustomSearchKey('');
      setLogs(prev => [...prev, `Accodata chiave ${val} da ricercare (${searchQueue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
    }
  };

  const handleRandomSearchTarget = () => {
    if (searchQueue.length >= MAX_QUEUE_CAPACITY) {
      setLogs(prev => [...prev, `Limite coda di ricerca raggiunto (${MAX_QUEUE_CAPACITY} elementi).`]);
      return;
    }
    const activeKeys = table.filter(x => x !== null && x !== 'DELETED');
    let r;
    // 50% chance di cercare una chiave presente (hit) e 50% numero casuale (probabile miss)
    if (activeKeys.length > 0 && Math.random() < 0.5) {
      r = activeKeys[Math.floor(Math.random() * activeKeys.length)];
    } else {
      r = Math.floor(Math.random() * 95) + 5;
    }
    setSearchQueue(prev => [...prev, r]);
    setLogs(prev => [...prev, `Accodata query casuale ${r} in ricerca (${searchQueue.length + 1}/${MAX_QUEUE_CAPACITY}).`]);
  };

  const handleShuffleTable = () => {
    const randomCount = Math.floor(Math.random() * 4) + 5; // 5-8 chiavi
    const newKeys = [];
    while (newKeys.length < randomCount) {
      const val = Math.floor(Math.random() * 85) + 5;
      if (!newKeys.includes(val)) newKeys.push(val);
    }
    setTable(createInitialTable(newKeys, probingMode));
    setCurrentStep(null);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs([`Tabella rigenerata con ${newKeys.length} chiavi casuali distribuite secondo ispezione ${probingMode}.`]);
  };

  const handleInsertIntoTable = (e) => {
    e.preventDefault();
    const val = parseInt(newTableKey, 10);
    if (!isNaN(val)) {
      let i = 0;
      let inserted = false;
      const updated = [...table];
      while (i < m) {
        const slot = probeHash(val, i, probingMode);
        if (updated[slot] === null || updated[slot] === 'DELETED') {
          updated[slot] = val;
          inserted = true;
          break;
        }
        i++;
      }
      if (inserted) {
        setTable(updated);
        setNewTableKey('');
        setLogs(prev => [...prev, `Inserita chiave ${val} manualmente nello slot T[${probeHash(val, i, probingMode)}].`]);
      } else {
        setLogs(prev => [...prev, `Impossibile inserire ${val}: tabella completamente satura.`]);
      }
    }
  };

  const handleToggleDeleted = (slotIdx) => {
    if (table[slotIdx] === null) return;
    setTable(prev => prev.map((val, idx) => {
      if (idx === slotIdx) {
        return val === 'DELETED' ? null : 'DELETED';
      }
      return val;
    }));
  };

  const handleReset = () => {
    setTable(createInitialTable(INITIAL_KEYS, probingMode));
    setSearchQueue([...INITIAL_SEARCH_QUERIES]);
    setCurrentStep(null);
    if (setRigaAttiva) setRigaAttiva(null);
    setLogs(["Ricerca ripristinata allo stato iniziale."]);
  };

  const occupiedElements = table.filter(x => x !== null && x !== 'DELETED').length;
  const alpha = (occupiedElements / m).toFixed(2);
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
              HASH-SEARCH Visualizer
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'left' }}>
            Ricerca con sequenza di ispezione e scavalcamento DELETED
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
              onClick={() => {
                setProbingMode('linear');
                setTable(createInitialTable(INITIAL_KEYS, 'linear'));
                setCurrentStep(null);
              }}
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
              onClick={() => {
                setProbingMode('quadratic');
                setTable(createInitialTable(INITIAL_KEYS, 'quadratic'));
                setCurrentStep(null);
              }}
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
            onClick={handleShuffleTable}
            title="Rigenera casualmente le chiavi della tabella"
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
            <Shuffle size={14} /> Shuffle
          </button>

          <button 
            onClick={handleRandomSearchTarget}
            disabled={isQueueFull}
            title={isQueueFull ? "Coda al limite (max 20)" : "Aggiungi query casuale"}
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
            {isDone ? 'Concluso' : currentStep && currentStep.stage !== 'DONE' ? 'Avanza Ispezione' : 'Cerca Target'}
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
            {currentStep?.stage === 'PROBING' 
              ? `ISPEZIONE (i = ${currentStep.attempt}): Calcolo j = h(${currentStep.target}, ${currentStep.attempt}) = [Slot ${currentStep.slot}]`
              : currentStep?.stage === 'DONE'
              ? currentStep.found
                ? `SUCCESSO: Chiave ${currentStep.target} localizzata nello slot T[${currentStep.slot}] in ${currentStep.attempt + 1} ispezioni`
                : `INSUCCESSO: Chiave ${currentStep.target} assente nella tabella (restituito NIL)`
              : 'STATO INIZIALE: PRONTO PER LA RICERCA'}
          </div>

          {/* 2. Coda Query da Cercare (Scorrimento Orizzontale a Riga Singola & Limite 20) */}
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
                  <Search size={14} />
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
              {searchQueue.length === 0 && (!currentStep || currentStep.stage === 'DONE') ? (
                <span style={{ fontSize: '0.76rem', color: '#10b981', fontStyle: 'italic' }}>
                  ✓ Tutte le ricerche in coda sono state completate.
                </span>
              ) : (
                searchQueue.map((k, idx) => {
                  const isNext = idx === 0 && (!currentStep || currentStep.stage === 'DONE');
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
                      k={k}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Area Slot Confinata con Scorrimento Interno Verticale (200px con righe a 32px e scritta a capo) */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  TABELLA HASH T (m = {m}) — INDIRIZZAMENTO APERTO ({probingMode.toUpperCase()})
                </span>
                <span style={{ fontSize: '0.62rem', color: '#475569', fontStyle: 'italic' }}>
                  (scorri per visualizzare tutti gli slot)
                </span>
              </div>

              {/* Inserimento rapido di una chiave nella tabella per testare la ricerca */}
              <form onSubmit={handleInsertIntoTable} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.64rem', color: '#64748b' }}>Aggiungi:</span>
                <input
                  type="number"
                  placeholder="Chiave..."
                  value={newTableKey}
                  onChange={(e) => setNewTableKey(e.target.value)}
                  style={{
                    width: '65px',
                    backgroundColor: '#0b1120',
                    border: '1px solid #334155',
                    borderRadius: '5px',
                    padding: '2px 5px',
                    fontSize: '0.7rem',
                    color: '#f8fafc',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
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
              {table.map((slotVal, slotIdx) => {
                const isTargetSlot = currentStep && currentStep.slot === slotIdx;
                const isFoundSlot = isTargetSlot && currentStep.stage === 'DONE' && currentStep.found;
                const isExaminedSlot = isTargetSlot && currentStep.stage === 'PROBING';
                const isDeleted = slotVal === 'DELETED';

                let border = '#1e293b';
                let bg = '#0b1120';
                if (isFoundSlot) {
                  border = '#10b981'; bg = 'rgba(16, 185, 129, 0.15)';
                } else if (isExaminedSlot) {
                  border = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.12)';
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

                      {/* Contenuto Cella */}
                      {slotVal === null ? (
                        <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace', fontStyle: 'italic' }}>
                          NIL (arresto ricerca)
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
                          DELETED (scavalcato da Search)
                        </span>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: isFoundSlot ? '#065f46' : '#0f172a',
                          border: isFoundSlot ? '1.5px solid #10b981' : '1px solid #334155',
                          borderRadius: '5px',
                          padding: '2px 8px',
                          boxShadow: isFoundSlot ? '0 0 10px rgba(16, 185, 129, 0.45)' : 'none',
                          transform: isExaminedSlot ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.2s ease'
                        }}>
                          <span style={{
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            color: isFoundSlot ? '#a7f3d0' : '#f8fafc',
                            fontFamily: 'monospace'
                          }}>
                            {slotVal}
                          </span>
                          {isFoundSlot && (
                            <span style={{
                              marginLeft: '6px',
                              backgroundColor: '#10b981',
                              color: '#064e3b',
                              fontSize: '0.54rem',
                              fontWeight: 900,
                              padding: '1px 4px',
                              borderRadius: '3px'
                            }}>
                              MATCH
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Toggle DELETED per sperimentare dal vivo lo scavalcamento */}
                    {slotVal !== null && (
                      <button
                        onClick={() => handleToggleDeleted(slotIdx)}
                        title={isDeleted ? "Ripristina come cella libera (NIL)" : "Imposta come DELETED per testare lo scavalcamento"}
                        style={{
                          backgroundColor: isDeleted ? 'rgba(56, 189, 248, 0.12)' : 'rgba(245, 158, 11, 0.1)',
                          border: `1px solid ${isDeleted ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
                          color: isDeleted ? '#38bdf8' : '#f59e0b',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {isDeleted ? 'NIL' : 'Del'}
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
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Elementi Presenti (n)</span>
              <strong style={{ fontSize: '1rem', color: '#f8fafc', fontFamily: 'monospace' }}>{occupiedElements}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Capacità Tabella (m)</span>
              <strong style={{ fontSize: '1rem', color: '#38bdf8', fontFamily: 'monospace' }}>{m}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Fattore di Carico (α = n/m)</span>
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