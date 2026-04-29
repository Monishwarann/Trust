import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Scan, User, LayoutDashboard, Settings, Bell } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Profile from './components/Profile';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check for user in localStorage or create a default session
    const savedUser = localStorage.getItem('trustbite_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      // Default placeholder user for demo
      const demoUser = {
        _id: 'demo_123',
        name: 'Guest User',
        email: 'guest@example.com',
        allergies: ['peanuts', 'milk'],
        conditions: ['diabetes']
      };
      setCurrentUser(demoUser);
      localStorage.setItem('trustbite_user', JSON.stringify(demoUser));
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header>
          <div className="logo">
            <div style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              padding: '8px', 
              borderRadius: '12px', 
              color: 'white',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
            }}>
              <Scan size={24} />
            </div>
            <span>TrustBite</span>
          </div>
          <div style={{ background: 'var(--glass)', padding: '8px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <Bell className="text-muted" size={20} />
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard user={currentUser} />} />
            <Route path="/scan" element={<Scanner user={currentUser} />} />
            <Route path="/profile" element={<Profile user={currentUser} setUser={setCurrentUser} />} />
          </Routes>
        </main>

        <Navigation />
      </div>
    </Router>
  );
}

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav>
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Home</span>
      </Link>
      <Link to="/scan" className={`nav-item ${isActive('/scan') ? 'active' : ''}`}>
        <div style={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          color: 'white',
          padding: '14px',
          borderRadius: '16px',
          marginTop: '-40px',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.6)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Scan size={26} />
        </div>
      </Link>
      <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}

export default App;
