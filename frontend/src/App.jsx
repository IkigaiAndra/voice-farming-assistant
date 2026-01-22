import React, { useState } from 'react';
import './App.css';

// Lazy load components
const MasterDashboard = React.lazy(() => import('./components/MasterDashboard'));
const SimplePage = () => (
  <div style={{
    background: 'linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)',
    color: '#e0e7ff',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'system-ui'
  }}>
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌾</div>
      <h1 style={{ color: '#4ecca3', marginBottom: '10px' }}>Voice Farming Assistant</h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Your Complete Agricultural Platform</p>
      
      <div style={{
        background: 'rgba(51, 65, 85, 0.5)',
        border: '2px solid #4ecca3',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#4ecca3', marginBottom: '20px' }}>✨ Features Ready</h2>
        <ul style={{ textAlign: 'left', display: 'inline-block', listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>✅ 🤖 AI Chatbot</li>
          <li style={{ marginBottom: '10px' }}>✅ 🏛️ 12 Government Schemes</li>
          <li style={{ marginBottom: '10px' }}>✅ 📚 12 Educational Videos</li>
          <li style={{ marginBottom: '10px' }}>✅ 📞 16+ Helpline Contacts</li>
        </ul>
      </div>

      <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>Loading dashboard...</p>
    </div>
  </div>
);

function App() {
  return (
    <React.Suspense fallback={<SimplePage />}>
      <MasterDashboard />
    </React.Suspense>
  );
}

export default App;
