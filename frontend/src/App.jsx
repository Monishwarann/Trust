import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Scan, User, LayoutDashboard, Settings, Bell, Clock } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Profile from './components/Profile';
import History from './components/History';

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
            <Route path="/history" element={<History />} />
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
        <LayoutDashboard size={24} />
        <span>Home</span>
      </Link>
      <Link to="/history" className={`nav-item ${isActive('/history') ? 'active' : ''}`}>
        <Clock size={24} />
        <span>History</span>
      </Link>
      
      <Link to="/scan" className="nav-logo-btn">
        <Scan size={32} strokeWidth={2.5} />
        <span style={{ display: 'none' }}>Scanner</span>
      </Link>

      <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </Link>
      
      <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`} style={{ display: location.pathname === '/settings' ? 'flex' : 'none' }}>
        <Settings size={24} />
        <span>Settings</span>
      </Link>
    </nav>
  );
}

export default App;
