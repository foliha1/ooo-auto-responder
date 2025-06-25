// This is the updated App.js entry point
// We'll move the full inline styles to a separate file called styles.js
// All functionality remains the same

import React, { useState, useEffect } from 'react';
import styles, { animationStyles } from './style'; // styles split into external file
import Toast from './Toast'; // Assume Toast component also lives in its own file

function App() {
  const [status, setStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testMessage, setTestMessage] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [newEvent, setNewEvent] = useState({
    summary: 'Out of Office',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    tone: 'professional',
    customMessage: '',
    allDay: false
  });

  const API_URL = process.env.REACT_APP_API_URL || 'https://ooo-api-o6ab.onrender.com/api';

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    fetchData();
    fetchCalendars();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => { /* ...same as before... */ };
  const fetchCalendars = async () => { /* ... */ };
  const toggleAutomation = async () => { /* ... */ };
  const toggleResponder = async (enabled) => { /* ... */ };
  const updateSettings = async (newSettings) => { /* ... */ };
  const createEvent = async () => { /* ... */ };
  const deleteEvent = async (id, summary) => { /* ... */ };
  const formatDate = (dateString) => { /* ... */ };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Setting up your sanctuary...</p>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Toast notifications, header, nav, and content go here */}
      {/* For brevity, omitted in this version — see full version from earlier */}
    </div>
  );
}

export default App;
