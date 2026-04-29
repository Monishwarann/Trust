import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, History, ShieldCheck, HeartPulse } from 'lucide-react';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('trustbite_history') || '[]');
    setHistory(savedHistory);
  }, []);

  const stats = [
    { label: 'Total Scans', value: history.length, icon: <History className="text-primary" /> },
    { label: 'Safety Rating', value: 'High', icon: <ShieldCheck className="text-success" /> },
    { label: 'Allergies', value: user?.allergies.length || 0, icon: <HeartPulse className="text-danger" /> }
  ];

  return (
    <div className="dashboard-view">
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Hey, {user?.name.split(' ')[0]}!</h1>
      <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Check your food safety instantly.</p>

      <div style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius)',
        color: 'white',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>AI Safety Scan</h2>
          <p style={{ opacity: 0.9, marginBottom: '1.75rem', fontSize: '0.9rem', maxWidth: '200px' }}>Real-time allergen detection from Open Food Facts.</p>
          <button 
            className="btn" 
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={() => navigate('/scan')}
          >
            <Scan size={20} />
            Start Scanning
          </button>
        </div>
        <Scan size={160} style={{ 
          position: 'absolute', 
          right: '-30px', 
          bottom: '-30px', 
          opacity: 0.15,
          transform: 'rotate(-15deg)',
          filter: 'blur(1px)'
        }} />
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {stats.slice(0, 2).map((stat, i) => (
          <div key={i} className="card" style={{ marginBottom: 0, padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.value}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Quick Test Barcodes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        {[
          { name: 'Nutella (Has Milk/Nuts)', code: '3017620422003' },
          { name: 'Coca-Cola (Soda)', code: '5449000000996' },
          { name: 'Oreo (Has Wheat/Soy)', code: '7622210449283' }
        ].map((item, i) => (
          <div key={i} className="card" style={{ 
            marginBottom: 0, 
            padding: '0.75rem 1rem', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.03)'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{item.name}</span>
            <code style={{ 
              background: 'rgba(99, 102, 241, 0.15)', 
              color: '#818cf8', 
              padding: '4px 10px', 
              borderRadius: '6px', 
              fontSize: '0.85rem',
              fontWeight: 700,
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              {item.code}
            </code>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className="card" style={{ 
              marginBottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '1rem'
            }}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px' }} />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '10px',
                    background: item.isSafe ? '#dcfce7' : '#fee2e2',
                    color: item.isSafe ? '#166534' : '#991b1b',
                    fontWeight: 600
                  }}>
                    {item.isSafe ? 'Safe' : 'Warning'}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p className="text-muted">No recent scans. Your scan history will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
