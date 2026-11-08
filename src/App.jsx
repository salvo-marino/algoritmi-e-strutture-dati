import React, { useState, useEffect } from 'react';
import katex from 'katex';
import { 
  Code2, 
  BookOpen, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Calculator,
  Compass,
  Info,
  GitCommit,
  ExternalLink,
  X,
  ShieldCheck
} from 'lucide-react';

// Dati Esterni
import { ARCHIVIO_ALGORITMI } from './data/archivioAlgoritmi';
import { PATCH_NOTES, GITHUB_REPO_URL } from './data/patchNotes';

// Modulo 00: Algoritmi Elementari & Fondamentali
import BubbleSortApp from './algoritmi/BubbleSortApp';
import SelectionSortApp from './algoritmi/SelectionSortApp';
import InsertionSortApp from './algoritmi/InsertionSortApp';
import SelectionSortRecApp from './algoritmi/SelectionSortRecApp';
import InsertionSortRecApp from './algoritmi/InsertionSortRecApp';

// Modulo 01: Divide et Impera & Selezione
import MergeSortApp from './algoritmi/MergeSortApp';
import QuickSortApp from './algoritmi/QuickSortApp';
import RandomizedSelectApp from './algoritmi/RandomizedSelectApp';
import BinarySearchApp from './algoritmi/BinarySearchApp';

// Modulo 02: Strutture ad Heap
import MaxHeapifyApp from './algoritmi/MaxHeapifyApp';
import BuildMaxHeapApp from './algoritmi/BuildMaxHeapApp';
import HeapSortApp from './algoritmi/HeapSortApp';
import PriorityQueueApp from './algoritmi/PriorityQueueApp';

// Modulo 03: Ordinamento Lineare
import CountingSortApp from './algoritmi/CountingSortApp';
import CountingInPlaceApp from './algoritmi/CountingInPlaceApp';
import RadixSortApp from './algoritmi/RadixSortApp';
import BucketSortApp from './algoritmi/BucketSortApp';

// Modulo 04: Tabelle Hash
import ChainedHashInsertApp from './algoritmi/ChainedHashInsertApp';
import ChainedHashSearchApp from './algoritmi/ChainedHashSearchApp';
import ChainedHashDeleteApp from './algoritmi/ChainedHashDeleteApp';
import HashInsertApp from './algoritmi/HashInsertApp';
import HashSearchApp from './algoritmi/HashSearchApp';
import HashDeleteApp from './algoritmi/HashDeleteApp';

// Modulo 05: Alberi Rosso-Neri
import LeftRotateApp from './algoritmi/LeftRotateApp';
import RightRotateApp from './algoritmi/RightRotateApp';

const MODULI = [
  {
    id: 'elementary-sorting',
    titolo: 'Ordinamento Classico',
    badge: 'Modulo 00',
    algoritmi: [
      { id: 'bubble-sort', label: 'Bubble Sort', comp: <BubbleSortApp /> },
      { id: 'selection-sort', label: 'Selection Sort', comp: <SelectionSortApp /> },
      { id: 'insertion-sort', label: 'Insertion Sort', comp: <InsertionSortApp /> },
      { id: 'selection-sort-rec', label: 'Selection Sort Ricorsivo', comp: <SelectionSortRecApp /> },
      { id: 'insertion-sort-rec', label: 'Insertion Sort Ricorsivo', comp: <InsertionSortRecApp /> },
    ]
  },
  {
    id: 'divide-conquer',
    titolo: 'Divide et Impera & Selezione',
    badge: 'Modulo 01',
    algoritmi: [
      { id: 'merge-sort', label: 'Merge Sort', comp: <MergeSortApp /> },
      { id: 'quick-sort', label: 'Quick Sort', comp: <QuickSortApp /> },
      { id: 'randomized-select', label: 'Randomized-Select', comp: <RandomizedSelectApp /> },
      { id: 'binary-search', label: 'Binary Search', comp: <BinarySearchApp /> },
    ]
  },
  {
    id: 'heaps',
    titolo: 'Strutture ad Heap',
    badge: 'Modulo 02',
    algoritmi: [
      { id: 'max-heapify', label: 'Max-Heapify', comp: <MaxHeapifyApp /> },
      { id: 'build-max-heap', label: 'Build-Max-Heap', comp: <BuildMaxHeapApp /> },
      { id: 'heap-sort', label: 'Heap-Sort', comp: <HeapSortApp /> },
      { id: 'priority-queue', label: 'Code con Priorità', comp: <PriorityQueueApp /> },
    ]
  },
  {
    id: 'linear-sorting',
    titolo: 'Ordinamento Lineare',
    badge: 'Modulo 03',
    algoritmi: [
      { id: 'counting-sort', label: 'Counting Sort Standard', comp: <CountingSortApp /> },
      { id: 'counting-inplace', label: 'Counting In-Place', comp: <CountingInPlaceApp /> },
      { id: 'radix-sort', label: 'Radix Sort (LSD)', comp: <RadixSortApp /> },
      { id: 'bucket-sort', label: 'Bucket Sort', comp: <BucketSortApp /> },
    ]
  },
  {
    id: 'hash-tables',
    titolo: 'Tabelle Hash',
    badge: 'Modulo 04',
    algoritmi: [
      { id: 'chained-hash-insert', label: 'Chained-Hash-Insert', comp: <ChainedHashInsertApp /> },
      { id: 'chained-hash-search', label: 'Chained-Hash-Search', comp: <ChainedHashSearchApp /> },
      { id: 'chained-hash-delete', label: 'Chained-Hash-Delete', comp: <ChainedHashDeleteApp /> },
      { id: 'hash-insert', label: 'Hash-Insert', comp: <HashInsertApp /> },
      { id: 'hash-search', label: 'Hash-Search', comp: <HashSearchApp /> },
      { id: 'hash-delete', label: 'Hash-Delete', comp: <HashDeleteApp /> },
    ]
  },
  {
    id: 'red-black-trees',
    titolo: 'Alberi Rosso-Neri',
    badge: 'Modulo 05',
    algoritmi: [
      { id: 'left-rotate', label: 'Left-Rotate', comp: <LeftRotateApp /> },
      { id: 'right-rotate', label: 'Right-Rotate', comp: <RightRotateApp /> },
    ]
  }
];

function FormattedTheoryText({ text }) {
  if (!text) return null;

  const renderMathSafely = (mathStr, displayMode = false) => {
    try {
      return {
        __html: katex.renderToString(mathStr.trim(), {
          displayMode,
          throwOnError: false,
          output: 'htmlAndMathml'
        })
      };
    } catch (e) {
      return { __html: mathStr };
    }
  };

  const parseInlineMath = (segment, baseKey) => {
    const mathParts = segment.split(/(\$.*?\$)/gs);
    return mathParts.map((part, mIdx) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
        const mathContent = part.slice(1, -1);
        return (
          <span 
            key={`${baseKey}-m-${mIdx}`} 
            style={{ margin: '0 2px' }}
            dangerouslySetInnerHTML={renderMathSafely(mathContent, false)} 
          />
        );
      }
      return part;
    });
  };

  const lines = text.split('\n');

  return (
    <div style={{ textAlign: 'left', lineHeight: 1.65, fontSize: '0.82rem', color: '#cbd5e1' }}>
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
          const mathContent = trimmed.slice(2, -2).trim();
          return (
            <div 
              key={lIdx} 
              className="custom-scrollbar"
              style={{
                margin: '10px 0',
                padding: '10px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                overflowX: 'auto',
                textAlign: 'center'
              }}
              dangerouslySetInnerHTML={renderMathSafely(mathContent, true)}
            />
          );
        }

        const tokens = line.split(/(\[cyan\].*?\[\/cyan\]|\[amber\].*?\[\/amber\]|\[emerald\].*?\[\/emerald\]|\*\*.*?\*\*|\$.*?\$)/g);

        return (
          <div key={lIdx} style={{ marginBottom: line.trim() === '' ? '8px' : '4px', textAlign: 'left' }}>
            {tokens.map((token, tIdx) => {
              if (token.startsWith('[cyan]') && token.endsWith('[/cyan]')) {
                const inner = token.slice(6, -7);
                return (
                  <span key={tIdx} style={{ color: '#38bdf8', fontWeight: 700 }}>
                    {parseInlineMath(inner, `${lIdx}-${tIdx}`)}
                  </span>
                );
              }
              if (token.startsWith('[amber]') && token.endsWith('[/amber]')) {
                const inner = token.slice(7, -8);
                return (
                  <span key={tIdx} style={{ color: '#fbbf24', fontWeight: 700 }}>
                    {parseInlineMath(inner, `${lIdx}-${tIdx}`)}
                  </span>
                );
              }
              if (token.startsWith('[emerald]') && token.endsWith('[/emerald]')) {
                const inner = token.slice(9, -10);
                return (
                  <span key={tIdx} style={{ color: '#34d399', fontWeight: 700 }}>
                    {parseInlineMath(inner, `${lIdx}-${tIdx}`)}
                  </span>
                );
              }
              if (token.startsWith('**') && token.endsWith('**')) {
                const inner = token.slice(2, -2);
                return (
                  <strong key={tIdx} style={{ color: '#f8fafc', fontWeight: 700 }}>
                    {parseInlineMath(inner, `${lIdx}-${tIdx}`)}
                  </strong>
                );
              }
              if (token.startsWith('$') && token.endsWith('$') && token.length >= 2) {
                const inlineMath = token.slice(1, -1);
                return (
                  <span 
                    key={tIdx} 
                    style={{ margin: '0 2px' }}
                    dangerouslySetInnerHTML={renderMathSafely(inlineMath, false)} 
                  />
                );
              }
              return <span key={tIdx}>{token}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [categoriaAttiva, setCategoriaAttiva] = useState('elementary-sorting');
  const [algoritmoAttivo, setAlgoritmoAttivo] = useState('bubble-sort');
  const [mostraCodice, setMostraCodice] = useState(true);
  const [rigaAttiva, setRigaAttiva] = useState(null);
  const [mostraInfoModal, setMostraInfoModal] = useState(false);
  const [varianteCodice, setVarianteCodice] = useState('appunti');

  useEffect(() => {
    const linkId = 'katex-css-cdn';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  const moduloCorrente = MODULI.find(m => m.id === categoriaAttiva) || MODULI[0];
  const algoritmoSelezionato = moduloCorrente.algoritmi.find(a => a.id === algoritmoAttivo) || moduloCorrente.algoritmi[0];
  const datiCorrenti = ARCHIVIO_ALGORITMI[algoritmoSelezionato.id] || null;

  const haDoppiaVersione = datiCorrenti && Boolean(datiCorrenti.righeComplete);
  const righeVisualizzate = (haDoppiaVersione && varianteCodice === 'completo') 
    ? datiCorrenti.righeComplete 
    : (datiCorrenti ? datiCorrenti.righe : []);

  const cambiaCategoria = (catId) => {
    setCategoriaAttiva(catId);
    const nuovoModulo = MODULI.find(m => m.id === catId);
    if (nuovoModulo && nuovoModulo.algoritmi.length > 0) {
      setAlgoritmoAttivo(nuovoModulo.algoritmi[0].id);
      setRigaAttiva(null);
      setVarianteCodice('appunti');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '12px 18px 18px 18px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-height: 100vh !important;
          max-width: 100% !important;
          background-color: #050811 !important;
          background-image: 
            radial-gradient(ellipse 65% 50% at 5% 0%, rgba(14, 165, 233, 0.18), transparent 70%),
            radial-gradient(ellipse 60% 55% at 95% 100%, rgba(99, 102, 241, 0.16), transparent 70%),
            linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px) !important;
          background-size: 100% 100%, 100% 100%, 36px 36px, 36px 36px !important;
          background-attachment: fixed !important;
        }

        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(6px) scale(0.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .anim-fade { 
          animation: fadeInScale 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }

        @keyframes modalOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalBoxPopIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-overlay {
          animation: modalOverlayFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .modal-box {
          animation: modalBoxPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #090d16; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0284c7; }

        button {
          transition: background-color 0.18s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1), 
                      color 0.18s cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
        }
        button:active:not(:disabled) {
          transform: translateY(1px) scale(0.99);
        }

        .katex { font-size: 1.05em; text-rendering: geometricPrecision; color: #f8fafc; }
        .katex-display { margin: 6px 0 !important; }
      `}</style>

      {/* Header Hub Widescreen */}
      <header style={{
        width: '100%',
        margin: '0 0 10px 0',
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.22)',
        borderRadius: '12px',
        padding: '10px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(14, 165, 233, 0.08)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #0284c7, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
            flexShrink: 0
          }}>
            <Cpu size={20} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Algoritmi & Strutture Dati
              </h1>
              <span style={{
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.66rem',
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                DMI • UNICT
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.2, textAlign: 'left' }}>
              Piattaforma avanzata per l'analisi e il tracciamento atomico degli algoritmi
            </p>
          </div>
        </div>

        {/* Pulsanti Azione Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#0c1322',
            padding: '3px',
            borderRadius: '9px',
            border: '1px solid #1e293b'
          }}>
            <button
              onClick={() => setMostraCodice(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: mostraCodice ? '#0284c7' : 'transparent',
                color: mostraCodice ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                boxShadow: mostraCodice ? '0 2px 8px rgba(2, 132, 199, 0.35)' : 'none'
              }}
            >
              <Code2 size={14} />
              <span>Pseudocodice</span>
            </button>
            <button
              onClick={() => setMostraCodice(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: !mostraCodice ? '#6366f1' : 'transparent',
                color: !mostraCodice ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                boxShadow: !mostraCodice ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <BookOpen size={14} />
              <span>Teoria & Dimostrazione</span>
            </button>
          </div>

          <button
            onClick={() => setMostraInfoModal(true)}
            title="Info Progetto & Note di rilascio"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0c1322',
              color: '#38bdf8',
              border: '1px solid #1e293b',
              padding: '6px 10px',
              borderRadius: '9px',
              cursor: 'pointer',
              fontSize: '0.76rem',
              fontWeight: 700,
              gap: '6px'
            }}
          >
            <Info size={15} />
            <span style={{ color: '#cbd5e1' }}>Release</span>
          </button>
        </div>
      </header>

      {/* Livello 1: Categorie Moduli */}
      <div 
        className="custom-scrollbar"
        style={{
          width: '100%',
          margin: '0 0 8px 0',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '3px',
          alignItems: 'stretch',
          flexShrink: 0
        }}
      >
        {MODULI.map((cat) => {
          const isSelected = categoriaAttiva === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => cambiaCategoria(cat.id)}
              style={{
                flex: '0 0 auto',
                minWidth: '210px',
                position: 'relative',
                backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.18)' : 'rgba(15, 23, 42, 0.7)',
                color: isSelected ? '#ffffff' : '#94a3b8',
                border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.65)',
                borderRadius: '9px',
                padding: '7px 12px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isSelected ? '0 4px 18px rgba(56, 189, 248, 0.18)' : 'none',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  color: isSelected ? '#38bdf8' : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {cat.badge}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#f8fafc' : '#cbd5e1', whiteSpace: 'nowrap' }}>
                {cat.titolo}
              </div>
            </button>
          );
        })}

        <div 
          aria-hidden="true"
          style={{
            flex: '1 1 auto',
            minWidth: '60px',
            backgroundColor: 'rgba(15, 23, 42, 0.35)',
            border: '1px dashed rgba(51, 65, 85, 0.45)',
            borderRadius: '9px',
            pointerEvents: 'none',
            userSelect: 'none'
          }} 
        />
      </div>

      {/* Livello 2: Barra Sottomenu Algoritmi */}
      <nav 
        className="custom-scrollbar"
        style={{
          width: '100%',
          margin: '0 0 10px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(14px)',
          padding: '6px 10px',
          borderRadius: '9px',
          border: '1px solid rgba(51, 65, 85, 0.7)',
          flexWrap: 'nowrap',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '8px', borderRight: '1px solid #334155', marginRight: '4px', flexShrink: 0 }}>
          <Layers size={13} color="#38bdf8" />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Algoritmi:
          </span>
        </div>

        {moduloCorrente.algoritmi.map((algo) => {
          const isCurrent = algoritmoSelezionato.id === algo.id;
          return (
            <button
              key={algo.id}
              onClick={() => {
                setAlgoritmoAttivo(algo.id);
                setRigaAttiva(null);
                setVarianteCodice('appunti');
              }}
              style={{
                flexShrink: 0,
                backgroundColor: isCurrent ? '#0284c7' : 'transparent',
                color: isCurrent ? '#ffffff' : '#cbd5e1',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: isCurrent ? 700 : 500,
                fontSize: '0.78rem',
                boxShadow: isCurrent ? '0 2px 8px rgba(2, 132, 199, 0.35)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {algo.label}
            </button>
          );
        })}
      </nav>

      {/* AREA DI LAVORO A DUE COLONNE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.3fr) minmax(320px, 1fr)',
        gap: '14px',
        alignItems: 'stretch',
        width: '100%',
        flex: 1,
        minHeight: 0,
        height: 'clamp(520px, calc(100vh - 220px), 820px)'
      }}>
        
        {/* COLONNA SINISTRA: Simulatore Visuale Interattivo */}
        <main className="anim-fade" key={algoritmoSelezionato.id} style={{
          width: '100%',
          minWidth: 0,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {algoritmoSelezionato.comp ? (
            <div style={{ width: '100%', height: '100%', minHeight: 0 }}>
              {React.cloneElement(algoritmoSelezionato.comp, { setRigaAttiva })}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              border: '1px dashed #334155',
              height: '100%'
            }}>
              <BookOpen size={28} color="#64748b" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>
                {algoritmoSelezionato.label}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>Modulo in arrivo.</p>
            </div>
          )}
        </main>

        {/* COLONNA DESTRA: Scheda Analisi & Pseudocodice */}
        <aside className="anim-fade" style={{
          width: '100%',
          minWidth: 0,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {datiCorrenti ? (
            <div style={{
              height: '100%',
              backgroundColor: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              {/* Header Box Destra */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '10px 16px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mostraCodice ? <Code2 size={15} color="#38bdf8" /> : <Calculator size={15} color="#818cf8" />}
                  <strong style={{ fontSize: '0.84rem', color: '#f8fafc', fontFamily: 'monospace' }}>
                    {mostraCodice ? datiCorrenti.titolo : 'Analisi & Dimostrazione Asintotica'}
                  </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {mostraCodice && haDoppiaVersione && (
                    <div style={{
                      display: 'flex',
                      backgroundColor: '#070b14',
                      padding: '2px',
                      borderRadius: '6px',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      marginRight: '4px'
                    }}>
                      <button
                        onClick={() => setVarianteCodice('appunti')}
                        title="Formulazione sintetica presente negli appunti"
                        style={{
                          backgroundColor: varianteCodice === 'appunti' ? '#0284c7' : 'transparent',
                          color: varianteCodice === 'appunti' ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Appunti
                      </button>
                      <button
                        onClick={() => setVarianteCodice('completo')}
                        title="Pseudocodice procedurale dettagliato (CLRS)"
                        style={{
                          backgroundColor: varianteCodice === 'completo' ? '#0284c7' : 'transparent',
                          color: varianteCodice === 'completo' ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Completo
                      </button>
                    </div>
                  )}

                  <span style={{
                    fontSize: '0.72rem',
                    color: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}>
                    {datiCorrenti.complessita}
                  </span>
                </div>
              </div>

              {/* Contenuto Flessibile Scorrevole */}
              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                {mostraCodice ? (
                  <div className="custom-scrollbar" style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '14px 12px',
                    backgroundColor: '#060911',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.8rem',
                    lineHeight: 1.55
                  }}>
                    <div style={{ minWidth: 'max-content', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {righeVisualizzate.map((r, idx) => {
                        const isHeader = typeof r.num === 'string' && r.num.startsWith('H');
                        const isHighlighted = rigaAttiva === r.id || rigaAttiva === r.num;

                        if (isHeader) {
                          return (
                            <div key={idx} style={{
                              color: '#38bdf8',
                              fontWeight: 800,
                              padding: idx === 0 ? '2px 6px 6px 6px' : '12px 6px 6px 6px',
                              borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
                              marginBottom: '5px',
                              fontSize: '0.74rem',
                              letterSpacing: '0.04em',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ color: '#0284c7' }}>▸</span>
                              <span>{r.text.replace(/---/g, '').trim()}</span>
                            </div>
                          );
                        }

                        const commentIndex = r.text.indexOf('//');
                        const codePart = commentIndex !== -1 ? r.text.slice(0, commentIndex) : r.text;
                        const commentPart = commentIndex !== -1 ? r.text.slice(commentIndex) : null;

                        return (
                          <div 
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '2px 6px',
                              borderRadius: '5px',
                              backgroundColor: isHighlighted ? 'rgba(56, 189, 248, 0.22)' : 'transparent',
                              borderLeft: isHighlighted ? '3px solid #38bdf8' : '3px solid transparent',
                              color: isHighlighted ? '#ffffff' : '#cbd5e1',
                              fontWeight: isHighlighted ? 700 : 400,
                              textAlign: 'left',
                              boxShadow: isHighlighted ? '0 0 10px rgba(56, 189, 248, 0.2)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{
                              width: '26px',
                              color: isHighlighted ? '#38bdf8' : '#475569',
                              fontSize: '0.7rem',
                              userSelect: 'none',
                              flexShrink: 0,
                              textAlign: 'left'
                            }}>
                              {r.num}.
                            </span>
                            <span style={{ whiteSpace: 'pre' }}>
                              {codePart}
                              {commentPart && (
                                <span style={{ color: '#64748b', fontStyle: 'italic', fontWeight: 400 }}>
                                  {commentPart}
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="custom-scrollbar" style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '16px 18px',
                    backgroundColor: '#070b14',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ backgroundColor: '#0f172a', padding: '9px 11px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'left' }}>
                        <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block' }}>Memoria Spaziale</span>
                        <strong style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace' }}>{datiCorrenti.spazio}</strong>
                      </div>
                      <div style={{ backgroundColor: '#0f172a', padding: '9px 11px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'left' }}>
                        <span style={{ fontSize: '0.66rem', color: '#64748b', display: 'block' }}>Proprietà Strutturali</span>
                        <strong style={{ fontSize: '0.8rem', color: '#818cf8' }}>{datiCorrenti.tipo}</strong>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#0b1120', padding: '12px', borderRadius: '9px', border: '1px solid #1e293b', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Compass size={15} color="#38bdf8" />
                        <strong style={{ fontSize: '0.74rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Funzionamento & Strategia Algoritmica
                        </strong>
                      </div>
                      <FormattedTheoryText text={datiCorrenti.teoria.funzionamento} />
                    </div>

                    <div style={{ backgroundColor: '#0b1120', padding: '12px', borderRadius: '9px', border: '1px solid #1e293b', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CheckCircle2 size={15} color="#10b981" />
                        <strong style={{ fontSize: '0.74rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Invariante di Ciclo & Dimostrazione di Correttezza
                        </strong>
                      </div>
                      <FormattedTheoryText text={datiCorrenti.teoria.invariante} />
                    </div>

                    <div style={{ backgroundColor: '#0b1120', padding: '12px', borderRadius: '9px', border: '1px solid #1e293b', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Calculator size={15} color="#f59e0b" />
                        <strong style={{ fontSize: '0.74rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Dimostrazione Formale della Complessità
                        </strong>
                      </div>
                      <FormattedTheoryText text={datiCorrenti.teoria.dimostrazione} />
                    </div>

                  </div>
                )}
              </div>

            </div>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              border: '1px dashed #334155'
            }}>
              <Code2 size={28} color="#64748b" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Pseudocodice & Teoria</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>Trattazione e codice in arrivo.</p>
            </div>
          )}
        </aside>

      </div>

      {/* MODAL: INFO AUTORE, COPYRIGHT & RELEASE */}
      {mostraInfoModal && (
        <div 
          className="modal-overlay"
          onClick={() => setMostraInfoModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 8, 17, 0.82)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999
          }}
        >
          <div 
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '85vh',
              backgroundColor: '#090d16',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '14px 20px',
              backgroundColor: '#0f172a',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
                  Info Progetto & Note di rilascio
                </h3>
              </div>
              <button
                onClick={() => setMostraInfoModal(false)}
                title="Chiudi finestra"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="custom-scrollbar" style={{
              padding: '18px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'left'
            }}>
              <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '12px 16px'
              }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  Autore & Contesto Didattico
                </span>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  Progetto didattico per il supporto allo studio realizzato da <strong style={{ color: '#f8fafc' }}>Salvatore Pio Marino</strong> per il corso di <strong style={{ color: '#38bdf8' }}>Algoritmi e Laboratorio</strong> (Corso di Laurea in Informatica, Dipartimento di Matematica e Informatica — <strong>DMI • UNICT</strong>). Sviluppato e redatto con il supporto di modelli di intelligenza artificiale.
                </p>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    © {new Date().getFullYear()} Salvatore Pio Marino • All Rights Reserved
                  </span>
                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#38bdf8',
                      textDecoration: 'none',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(56, 189, 248, 0.3)'
                    }}
                  >
                    <ExternalLink size={12} /> Repository GitHub
                  </a>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
                  Cronologia Release di GitHub
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {PATCH_NOTES.map((p, idx) => (
                    <div key={idx} style={{
                      backgroundColor: '#0b1120',
                      border: '1px solid #1e293b',
                      borderRadius: '10px',
                      padding: '12px 14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: '#38bdf8',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            padding: '2px 6px',
                            borderRadius: '5px'
                          }}>
                            {p.version}
                          </span>
                          <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{p.tag}</strong>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.date}</span>
                      </div>

                      <ul style={{ margin: '6px 0 10px 0', paddingLeft: '18px', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        {p.changes.map((c, cIdx) => (
                          <li key={cIdx}>{c}</li>
                        ))}
                      </ul>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <a
                          href={`${GITHUB_REPO_URL}/${p.commitRef || 'commits/main'}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            color: '#818cf8',
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          <GitCommit size={13} /> Visualizza modifiche su GitHub
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}