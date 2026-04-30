import React, { useState, useEffect } from 'react';
import { Clock, Trash2, CheckCircle, AlertTriangle, ChevronRight, ShoppingBag, X, Info, Layers, ListFilter } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('trustbite_history') || '[]');
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your scan history?')) {
      localStorage.removeItem('trustbite_history');
      setHistory([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const parseIngredients = (text) => {
    if (!text) return [];
    const result = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '(' || char === '[' || char === '{') depth++;
      if (char === ')' || char === ']' || char === '}') depth--;
      if (char === ',' && depth === 0) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) result.push(current.trim());
    return result;
  };

  const IngredientRow = ({ text, depth = 0 }) => {
    const percentageMatch = text.match(/(\d+(?:\.\d+)?%)/);
    const percentage = percentageMatch ? percentageMatch[0] : null;
    const subMatch = text.match(/^([^(]+)\s*\((.*)\)$/);
    const name = subMatch ? subMatch[1].trim() : text.replace(/(\d+(?:\.\d+)?%)/, '').trim();
    const subText = subMatch ? subMatch[2].trim() : null;

    return (
      <div style={{ 
        borderBottom: depth === 0 ? '1px solid var(--glass-border)' : 'none',
        padding: depth === 0 ? '1rem 0' : '0.4rem 0 0.4rem 1.5rem',
        position: 'relative'
      }}>
        {depth > 0 && (
          <div style={{ 
            position: 'absolute', 
            left: '0.5rem', 
            top: 0, 
            bottom: 0, 
            width: '1px', 
            background: 'var(--glass-border)' 
          }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {depth === 0 ? (
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
            ) : (
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></div>
            )}
            <span style={{ 
              fontSize: depth === 0 ? '0.95rem' : '0.85rem', 
              fontWeight: depth === 0 ? 600 : 400,
              color: depth === 0 ? 'var(--text)' : 'var(--text-muted)'
            }}>
              {name}
            </span>
          </div>
          {percentage && (
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: 'var(--primary)', 
              background: 'var(--primary-glow)', 
              padding: '2px 8px', 
              borderRadius: '6px',
              fontFamily: 'monospace'
            }}>
              {percentage}
            </span>
          )}
        </div>
        {subText && (
          <div style={{ marginTop: '0.25rem' }}>
            {parseIngredients(subText).map((sub, idx) => (
              <IngredientRow key={idx} text={sub} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="history-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock className="text-primary" size={24} />
          Scan History
        </h2>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            style={{ 
              background: 'rgba(244, 63, 94, 0.1)', 
              color: 'var(--danger)', 
              border: '1px solid rgba(244, 63, 94, 0.2)',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--glass)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem' 
          }}>
            <ShoppingBag size={32} className="text-muted" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>No history yet</h3>
          <p className="text-muted">Your scanned products will appear here for quick reference.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((item) => (
            <div 
              key={item.id} 
              className="card" 
              onClick={() => setSelectedItem(item)}
              style={{ padding: '1rem', marginBottom: 0, transition: 'all 0.2s', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '12px', background: 'white', padding: '4px' }} 
                    />
                  ) : (
                    <div style={{ width: '60px', height: '60px', background: 'var(--glass)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={24} className="text-muted" />
                    </div>
                  )}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-4px', 
                    right: '-4px', 
                    background: item.isSafe ? 'var(--success)' : 'var(--danger)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--background)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }}>
                    {item.isSafe ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    marginBottom: '0.25rem', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {item.name || 'Unknown Product'}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="text-muted" style={{ fontSize: '0.75rem' }}>{item.brand || 'No brand'}</p>
                    <p className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(item.date)}</p>
                  </div>
                </div>
                
                <ChevronRight size={18} className="text-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(15px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '440px',
            margin: 0,
            padding: '2rem',
            maxHeight: '85vh',
            overflowY: 'auto',
            animation: 'modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <button 
              onClick={() => setSelectedItem(null)}
              style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                background: 'var(--glass)', 
                border: 'none', 
                borderRadius: '50%', 
                padding: '0.5rem', 
                color: 'white', 
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              {selectedItem.image ? (
                <div style={{ background: 'white', display: 'inline-block', padding: '12px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', marginBottom: '1.5rem' }}>
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                    style={{ width: '100px', height: '100px', objectFit: 'contain' }} 
                  />
                </div>
              ) : (
                <div style={{ width: '100px', height: '100px', background: 'var(--glass)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <ShoppingBag size={40} className="text-muted" />
                </div>
              )}
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem', fontWeight: 800 }}>{selectedItem.name}</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{selectedItem.brand}</p>
            </div>

            <div className={`safety-badge ${selectedItem.isSafe ? 'safety-safe' : 'safety-unsafe'}`} style={{ marginBottom: '2.5rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: '16px' }}>
              {selectedItem.isSafe ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedItem.safetyMessage || (selectedItem.isSafe ? 'CERTIFIED SAFE' : 'WARNING DETECTED')}</span>
            </div>

            {selectedItem.unsafeIngredients && selectedItem.unsafeIngredients.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} />
                  Harmful Components
                </h4>
                <div className="tag-list" style={{ marginTop: 0 }}>
                  {selectedItem.unsafeIngredients.map(ing => (
                    <span key={ing} className="tag" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.4rem 1rem', borderRadius: '10px', fontWeight: 600 }}>{ing}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ListFilter size={16} className="text-primary" />
                  Ingredients & Composition
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--glass)', padding: '2px 8px', borderRadius: '10px' }}>
                  {parseIngredients(selectedItem.ingredients).length} ITEMS
                </span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '0.5rem 1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                {selectedItem.ingredients ? (
                  parseIngredients(selectedItem.ingredients).map((ing, idx) => (
                    <IngredientRow key={idx} text={ing} />
                  ))
                ) : (
                  <p className="text-muted" style={{ padding: '1rem', textAlign: 'center' }}>Data unavailable</p>
                )}
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '2.5rem', height: '54px', borderRadius: '16px' }}
              onClick={() => setSelectedItem(null)}
            >
              Back to History
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .history-view {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default History;
