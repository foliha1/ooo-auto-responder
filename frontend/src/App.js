import React, { useState, useEffect } from 'react';
import './App.css';

const API = 'https://ooo-api-o6ab.onrender.com';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {message}
      <button className="toast-close" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/status`)
      .then((res) => res.json())
      .then((data) => {
        setEnabled(data.enabled);
        setLoading(false);
      })
      .catch(() => {
        setToast({ message: 'Failed to fetch status', type: 'error' });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (view === 'scheduler') loadEvents();
    if (view === 'settings') loadSettings();
    if (view === 'logs') loadLogs();
  }, [view]);

  const toggleAutomation = () => {
    setLoading(true);
    fetch(`${API}/api/toggle`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        setEnabled(data.enabled);
        setToast({ message: `Automation ${data.enabled ? 'enabled' : 'disabled'}`, type: 'success' });
      })
      .catch(() => {
        setToast({ message: 'Toggle failed', type: 'error' });
      })
      .finally(() => setLoading(false));
  };

  const loadEvents = () => {
    fetch(`${API}/api/events`)
      .then(res => res.json())
      .then(setEvents)
      .catch(() => setToast({ message: 'Failed to load events', type: 'error' }));
  };

  const loadSettings = () => {
    fetch(`${API}/api/settings`)
      .then(res => res.json())
      .then(setSettings)
      .catch(() => setToast({ message: 'Failed to load settings', type: 'error' }));
  };

  const loadLogs = () => {
    fetch(`${API}/api/logs`)
      .then(res => res.json())
      .then(setLogs)
      .catch(() => setToast({ message: 'Failed to load logs', type: 'error' }));
  };

  const renderView = () => {
    if (loading) return <div className="app-loading">Loading...</div>;

    switch (view) {
      case 'dashboard':
        return (
          <div className="status-card">
            <h2>Status: {enabled ? 'Enabled' : 'Disabled'}</h2>
            <p>
              Your automatic out-of-office responder is currently <strong>{enabled ? 'on' : 'off'}</strong>.
            </p>
          </div>
        );
      case 'scheduler':
        return (
          <div className="status-card">
            <h2>Scheduled Events</h2>
            {events.length === 0 ? <p>No upcoming events.</p> : (
              <ul>
                {events.map(event => (
                  <li key={event.id}>
                    <strong>{event.summary}</strong> — {new Date(event.start.dateTime).toLocaleString()} to {new Date(event.end.dateTime).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="status-card">
            <h2>Settings</h2>
            <p>Primary Calendar: {settings.primaryCalendar}</p>
            <p>Default Message: {settings.defaultMessage}</p>
            {/* Add settings form as needed */}
          </div>
        );
      case 'logs':
        return (
          <div className="status-card">
            <h2>Activity Logs</h2>
            {logs.length === 0 ? <p>No logs available.</p> : (
              <ul>
                {logs.map(log => (
                  <li key={log.id}>
                    <strong>{log.action}</strong> — {new Date(log.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <header className="app-header">
        <h1>Out of Office</h1>
        <div>
          <button className="toggle-btn" onClick={toggleAutomation} disabled={loading}>
            {enabled ? 'Disable' : 'Enable'} Automation
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button onClick={() => setView('dashboard')}>Dashboard</button>
        <button onClick={() => setView('scheduler')}>Scheduler</button>
        <button onClick={() => setView('settings')}>Settings</button>
        <button onClick={() => setView('logs')}>Logs</button>
      </nav>

      <main className="app-main">{renderView()}</main>
    </div>
  );
};

export default App;
