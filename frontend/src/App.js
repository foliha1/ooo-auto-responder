import React, { useState, useEffect } from 'react';
import './App.css';

const styles = {
  appContainer: {
    fontFamily: 'sans-serif',
    backgroundColor: '#fdfcf9',
    color: '#2f2f2f',
    minHeight: '100vh',
    padding: '40px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '48px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#3b3a39',
  },
  toggleBtn: {
    backgroundColor: '#f0ebe3',
    color: '#3b3a39',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  toggleBtnHover: {
    backgroundColor: '#e0dcd4'
  },
  main: {
    maxWidth: '480px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    textAlign: 'center'
  },
  cardTitle: {
    fontSize: '20px',
    marginBottom: '12px',
  },
  cardText: {
    fontSize: '16px',
    color: '#5a5a5a'
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#ffffff',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    borderLeft: '4px solid #cccccc'
  },
  success: {
    borderLeftColor: '#78c2ad'
  },
  error: {
    borderLeftColor: '#f27596'
  }
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{ ...styles.toast, ...(type === 'success' ? styles.success : styles.error) }}>
      <span>{type === 'success' ? '✓' : '⚠️'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '16px' }}>×</button>
    </div>
  );
};

function App() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'https://ooo-api-o6ab.onrender.com/api';

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setToast({ message: 'Connection error. Trying again soon.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const toggleAutomation = async () => {
    try {
      const res = await fetch(`${API_URL}/toggle-automation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !status.automationEnabled })
      });
      const data = await res.json();
      setStatus(prev => ({ ...prev, automationEnabled: data.automationEnabled }));
      setToast({
        message: data.automationEnabled ? 'Protection is now active 🛡️' : 'Automation paused — all you now.',
        type: 'success'
      });
    } catch {
      setToast({ message: 'Could not update status. Try again.', type: 'error' });
    }
  };

  if (loading) {
    return <div style={styles.appContainer}>Loading your space...</div>;
  }

  return (
    <div style={styles.appContainer}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={styles.header}>
        <h1 style={styles.title}>🌿 Space for You</h1>
        <button style={styles.toggleBtn} onClick={toggleAutomation}>
          {status.automationEnabled ? 'Pause Protection' : 'Enable Protection'}
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Status</h2>
          <p style={styles.cardText}>Automation: <strong>{status.automationEnabled ? 'Enabled' : 'Disabled'}</strong></p>
        </section>
      </main>
    </div>
  );
}

export default App;
