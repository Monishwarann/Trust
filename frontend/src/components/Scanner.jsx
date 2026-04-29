import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { AlertTriangle, CheckCircle, XCircle, Info, Camera } from 'lucide-react';

const Scanner = ({ user }) => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error(err));
      }
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      const config = { 
        fps: 20, 
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0
      };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success!
          if (navigator.vibrate) navigator.vibrate(100);
          stopCamera();
          handleScan(decodedText);
        },
        (errorMessage) => {
          // ignore scan errors
        }
      );
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
      // Backend URL - Uses relative path for Vercel compatibility
      const allergyList = user.allergies.join(',');
      const apiUrl = window.location.hostname === 'localhost' 
        ? `http://localhost:5000/_/backend/scan/${barcode}?allergies=${allergyList}`
        : `/_/backend/scan/${barcode}?allergies=${allergyList}`;
        
      const response = await axios.get(apiUrl);
      const data = response.data;
      setScanResult(data);

      // Save to History
      const history = JSON.parse(localStorage.getItem('trustbite_history') || '[]');
      const newEntry = {
        id: Date.now(),
        name: data.product.name,
        brand: data.product.brand,
        image: data.product.image,
        isSafe: data.safety.isSafe,
        date: new Date().toISOString()
      };
      const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
      localStorage.setItem('trustbite_history', JSON.stringify(updatedHistory));

    } catch (err) {
      setError('Product not found or error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scanner-view">
      <h2 style={{ marginBottom: '1rem' }}>Scan Product</h2>
      
      {!scanResult && (
        <>
          {cameraActive && (
            <div style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>Live Scanning...</span>
            </div>
          )}
          <div className="scanner-container" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div id="reader" style={{ width: '100%' }}></div>
            {!cameraActive && (
              <div style={{ position: 'absolute', textAlign: 'center', color: 'white' }}>
                <button className="btn btn-primary" onClick={startCamera}>
                  <Camera size={24} />
                  Start Camera
                </button>
              </div>
            )}
            {cameraActive && (
              <div className="scanner-overlay">
                <div className="scan-line"></div>
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>OR</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  placeholder="Enter barcode manually" 
                  id="manual-barcode"
                  className="card"
                  style={{ 
                    flex: 1, 
                    margin: 0, 
                    padding: '0.875rem', 
                    borderRadius: 'var(--radius)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const val = document.getElementById('manual-barcode').value;
                    if (val) handleScan(val);
                  }}
                >
                  Check
                </button>
              </div>
              
              <label className="btn" style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: 'var(--text)', 
                width: '100%',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)'
              }}>
                <Info size={18} />
                Upload Image
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

      {scanResult && (
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {scanResult.product.image ? (
              <img src={scanResult.product.image} alt={scanResult.product.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                <Info size={32} color="var(--text-muted)" />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>{scanResult.product.name}</h3>
              <p className="text-muted">{scanResult.product.brand}</p>
            </div>
          </div>

          <div className={`safety-badge ${scanResult.safety.isSafe ? 'safety-safe' : 'safety-unsafe'}`}>
            {scanResult.safety.isSafe ? <CheckCircle size={24} style={{ marginBottom: '4px' }} /> : <AlertTriangle size={24} style={{ marginBottom: '4px' }} />}
            <div>{scanResult.safety.message}</div>
          </div>

          {!scanResult.safety.isSafe && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Triggered Allergies:</h4>
              <div className="tag-list">
                {scanResult.safety.unsafeIngredients.map(ing => (
                  <span key={ing} className="tag" style={{ background: '#fee2e2', color: '#991b1b' }}>{ing}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--text)' }}>Ingredients:</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {scanResult.product.ingredients || 'Information not available.'}
            </p>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => window.location.reload()}>Scan Another</button>
        </div>
      )}
    </div>
  );
};

export default Scanner;
