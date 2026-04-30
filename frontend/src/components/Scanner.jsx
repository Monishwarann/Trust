import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { AlertTriangle, CheckCircle, XCircle, Info, Camera, ListFilter, ShoppingBag } from 'lucide-react';

const Scanner = ({ user }) => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Check for barcode in URL parameters
    const params = new URLSearchParams(location.search);
    const barcode = params.get('barcode');
    
    // Only auto-scan if we have a barcode AND the user profile is loaded
    if (barcode && user && !scanResult && !loading) {
      handleScan(barcode);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error(err));
      }
    };
  }, [location.search, user]);

  const startCamera = async () => {
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      const config = { fps: 20, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0 };
      await html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
        if (navigator.vibrate) navigator.vibrate(100);
        stopCamera();
        handleScan(decodedText);
      }, () => {});
      setCameraActive(true);
    } catch (err) {
      setError("Could not access camera. Please ensure permissions are granted.");
      console.error(err);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setCameraActive(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode("reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScan(decodedText);
    } catch (err) {
      setError("Could not find a valid barcode in this image.");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (barcode) => {
    setLoading(true);
    setError(null);
    try {
      const allergyList = (user && user.allergies) ? user.allergies.join(',') : '';
      const apiUrl = window.location.hostname === 'localhost' 
        ? `http://localhost:5000/_/backend/scan/${barcode}?allergies=${allergyList}`
        : `/_/backend/scan/${barcode}?allergies=${allergyList}`;
      const response = await axios.get(apiUrl);
      const data = response.data;
      setScanResult(data);

      const history = JSON.parse(localStorage.getItem('trustbite_history') || '[]');
      const newEntry = {
        id: Date.now(),
        name: data.product.name,
        brand: data.product.brand,
        image: data.product.image,
        ingredients: data.product.ingredients,
        isSafe: data.safety.isSafe,
        safetyMessage: data.safety.message,
        unsafeIngredients: data.safety.unsafeIngredients,
        date: new Date().toISOString()
      };
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      localStorage.setItem('trustbite_history', JSON.stringify(updatedHistory));
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(`Scan failed: ${errorMsg}`);
      console.error('Frontend Scan Error:', err);
    } finally {
      setLoading(false);
    }
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
        padding: depth === 0 ? '0.875rem 0' : '0.4rem 0 0.4rem 1.25rem',
        position: 'relative'
      }}>
        {depth > 0 && (
          <div style={{ position: 'absolute', left: '0.4rem', top: 0, bottom: 0, width: '1px', background: 'var(--glass-border)' }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: depth === 0 ? '6px' : '4px', height: depth === 0 ? '6px' : '4px', borderRadius: '50%', background: depth === 0 ? 'var(--primary)' : 'var(--text-muted)' }}></div>
            <span style={{ fontSize: depth === 0 ? '0.9rem' : '0.8rem', fontWeight: depth === 0 ? 600 : 400, color: depth === 0 ? 'var(--text)' : 'var(--text-muted)' }}>{name}</span>
          </div>
          {percentage && (
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-glow)', padding: '2px 6px', borderRadius: '6px' }}>{percentage}</span>
          )}
        </div>
        {subText && (
          <div style={{ marginTop: '0.2rem' }}>
            {parseIngredients(subText).map((sub, idx) => (
              <IngredientRow key={idx} text={sub} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="scanner-view">
      <h2 style={{ marginBottom: '1rem' }}>Scan Product</h2>
      
      {!scanResult && !loading && (
        <>
          {cameraActive && (
            <div style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>Live Scanning...</span>
            </div>
          )}
          <div className="scanner-container">
            <div id="reader" style={{ width: '100%' }}></div>
            {!cameraActive && (
              <div style={{ position: 'absolute', textAlign: 'center', color: 'white' }}>
                <button className="btn btn-primary" onClick={startCamera}>
                  <Camera size={24} />
                  Start Camera
                </button>
              </div>
            )}
            {cameraActive && <div className="scanner-overlay"><div className="scan-line"></div></div>}
          </div>
          
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>OR</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input type="text" placeholder="Enter barcode manually" id="manual-barcode" className="card" style={{ flex: 1, margin: 0, padding: '0.875rem', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} />
                <button className="btn btn-primary" onClick={() => { const val = document.getElementById('manual-barcode').value; if (val) handleScan(val); }}>Check</button>
              </div>
              <label className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', width: '100%', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
                <Info size={18} /> Upload Image
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div className="scan-line" style={{ position: 'relative', width: '100%', left: 0, margin: '0 0 2rem 0' }}></div>
          <h3 style={{ marginBottom: '0.5rem' }}>Processing Barcode...</h3>
          <p className="text-muted">Fetching product details from Open Food Facts</p>
        </div>
      )}
      
      {error && (
        <div className="card" style={{ color: 'var(--danger)', textAlign: 'center' }}>
          <XCircle style={{ margin: '0 auto 1rem' }} />
          <p>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}

      {scanResult && !loading && (
        <div className="card" style={{ animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {scanResult.product.image ? (
              <div style={{ background: 'white', padding: '6px', borderRadius: '16px' }}>
                <img src={scanResult.product.image} alt={scanResult.product.name} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ width: '70px', height: '70px', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
                <ShoppingBag size={28} color="var(--text-muted)" />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', fontWeight: 700 }}>{scanResult.product.name}</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{scanResult.product.brand}</p>
            </div>
          </div>

          <div className={`safety-badge ${scanResult.safety.isSafe ? 'safety-safe' : 'safety-unsafe'}`} style={{ marginBottom: '1.75rem', padding: '0.875rem', borderRadius: '12px' }}>
            {scanResult.safety.isSafe ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span style={{ fontWeight: 700 }}>{scanResult.safety.message.toUpperCase()}</span>
          </div>

          {!scanResult.safety.isSafe && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ color: 'var(--danger)', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Allergen Alerts:</h4>
              <div className="tag-list" style={{ marginTop: 0 }}>
                {scanResult.safety.unsafeIngredients.map(ing => (
                  <span key={ing} className="tag" style={{ background: 'rgba(244, 63, 94, 0.12)', color: 'var(--danger)', border: '1px solid rgba(244, 63, 94, 0.2)', fontWeight: 600 }}>{ing}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListFilter size={16} className="text-primary" />
              Ingredients & Composition
            </h4>
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '16px', padding: '0 1rem', maxHeight: '350px', overflowY: 'auto' }}>
              {scanResult.product.ingredients ? (
                parseIngredients(scanResult.product.ingredients).map((ing, idx) => (
                  <IngredientRow key={idx} text={ing} />
                ))
              ) : (
                <p className="text-muted" style={{ padding: '1rem', textAlign: 'center' }}>No ingredient data</p>
              )}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', height: '50px' }} onClick={() => window.location.reload()}>Scan Another</button>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
