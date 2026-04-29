import React, { useState } from 'react';
import { X, Plus, Heart, ShieldAlert, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const Profile = ({ user, setUser }) => {
  const [newAllergy, setNewAllergy] = useState('');
  const [loading, setLoading] = useState(false);

  const addAllergy = async (e) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;
    
    const updatedAllergies = [...user.allergies, newAllergy.trim().toLowerCase()];
    updateProfile({ allergies: updatedAllergies });
    setNewAllergy('');
  };

  const removeAllergy = (index) => {
    const updatedAllergies = user.allergies.filter((_, i) => i !== index);
    updateProfile({ allergies: updatedAllergies });
  };

  const updateProfile = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setLoading(true);
    try {
      // In a real app, this would hit the backend
      // await axios.post('http://localhost:5000/api/profile', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('trustbite_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-view">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'var(--primary)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white',
          margin: '0 auto 1rem'
        }}>
          <UserIcon size={40} />
        </div>
        <h2>{user.name}</h2>
        <p className="text-muted">{user.email}</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldAlert color="var(--danger)" />
          <h3 style={{ fontSize: '1.1rem' }}>My Allergies</h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          We'll warn you if a scanned product contains any of these.
        </p>

        <form onSubmit={addAllergy} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="e.g. Soy, Nuts, Milk" 
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: 'var(--radius)', 
              border: '1px solid #e2e8f0',
              outline: 'none'
            }}
          />
          <button className="btn btn-primary" style={{ padding: '0.75rem' }}>
            <Plus size={24} />
          </button>
        </form>

        <div className="tag-list">
          {user.allergies.map((allergy, index) => (
            <span key={index} className="tag">
              {allergy}
              <X className="tag-remove" size={14} onClick={() => removeAllergy(index)} />
            </span>
          ))}
          {user.allergies.length === 0 && <p className="text-muted" style={{ fontSize: '0.875rem' }}>No allergies added yet.</p>}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Heart color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem' }}>Health Conditions</h3>
        </div>
        <div className="tag-list">
          {user.conditions.map((condition, index) => (
            <span key={index} className="tag" style={{ background: '#e0e7ff', color: '#3730a3' }}>{condition}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
