import React, { useState, useEffect } from 'react';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 4000); // Increased from 3000 to give more reading time
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const toastStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
    animation: isExiting ? 'slideOut 0.3s ease-in' : 'slideIn 0.3s ease-out',
    zIndex: 1000,
    maxWidth: '400px',
    minWidth: '300px'
  };

  const typeStyles = {
    success: { 
      backgroundColor: '#10b981',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    error: { 
      backgroundColor: '#ef4444',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    info: { 
      backgroundColor: '#3b82f6',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    warning: {
      backgroundColor: '#f59e0b',
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
  };

  const icons = {
    success: '✨',
    error: '🛡️',
    info: '💡',
    warning: '⚡'
  };

  return (
    <div style={{ ...toastStyles, ...typeStyles[type] }}>
      <span style={{ fontSize: '22px', flexShrink: 0 }}>{icons[type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <button 
        onClick={handleClose}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
          marginLeft: '8px'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
      >
        ×
      </button>
    </div>
  );
};

// Add animation keyframes
const animationStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// All styles defined in JavaScript
const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f7fa'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.75rem'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '0.5rem'
  },
  statusDotActive: {
    backgroundColor: '#4ade80',
    boxShadow: '0 0 0 2px rgba(74, 222, 128, 0.3)'
  },
  statusDotInactive: {
    backgroundColor: '#ef4444',
    boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.3)'
  },
  nav: {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    padding: '0 2rem',
    gap: '0.5rem'
  },
  navButton: {
    background: 'none',
    border: 'none',
    padding: '1rem 1.5rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  },
  navButtonActive: {
    color: '#667eea',
    borderBottomColor: '#667eea'
  },
  content: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto'
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
    color: '#1f2937'
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0'
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  primaryButton: {
    background: '#667eea',
    color: 'white'
  },
  secondaryButton: {
    background: '#e5e7eb',
    color: '#374151'
  },
  deleteButton: {
    background: '#ef4444',
    color: 'white',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem'
  },
  deleteButtonSmall: {
    background: 'transparent',
    border: '1px solid #ef4444',
    color: '#ef4444',
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  quickActions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap'
  },
  eventItem: {
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '6px',
    borderLeft: '3px solid #667eea',
    marginBottom: '1rem'
  },
  eventItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  eventCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem'
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#374151',
    fontWeight: '500'
  },
  scheduler: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '24px'
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '.4s',
    borderRadius: '24px'
  },
  sliderBefore: {
    position: 'absolute',
    content: '""',
    height: '16px',
    width: '16px',
    left: '4px',
    bottom: '4px',
    backgroundColor: 'white',
    transition: '.4s',
    borderRadius: '50%'
  },
  logItem: {
    display: 'grid',
    gridTemplateColumns: '180px 150px 1fr',
    gap: '1rem',
    padding: '0.75rem',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.9rem'
  },
  calendarSelect: {
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#f3f4f6',
    borderRadius: '6px'
  },
  calendarOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem'
  },
  calendarDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0
  },
  wellnessNote: {
    background: '#f3f4f6',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: '#6b7280',
    fontStyle: 'italic'
  }
};

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

  // Toast notification helper with stacking support
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => {
      // Limit to 3 toasts max to prevent overwhelming the user
      const newToasts = [...prev, { id, message, type }];
      return newToasts.slice(-3);
    });
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
    fetchCalendars();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, eventsRes, settingsRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/status`),
        fetch(`${API_URL}/events`),
        fetch(`${API_URL}/settings`),
        fetch(`${API_URL}/logs`)
      ]);

      const statusData = await statusRes.json();
      const eventsData = await eventsRes.json();
      const settingsData = await settingsRes.json();
      const logsData = await logsRes.json();

      setStatus(statusData);
      setEvents(eventsData.events || []);
      setSettings(settingsData);
      setLogs(logsData.logs || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Oops! Having trouble connecting. We\'ll keep trying 💫', 'error');
      setLoading(false);
    }
  };

  const fetchCalendars = async () => {
    try {
      const response = await fetch(`${API_URL}/calendars`);
      const data = await response.json();
      setCalendars(data.calendars || []);
    } catch (error) {
      console.error('Error fetching calendars:', error);
    }
  };

  const toggleAutomation = async () => {
    try {
      const res = await fetch(`${API_URL}/toggle-automation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !status.automationEnabled })
      });
      const data = await res.json();
      setStatus({ ...status, automationEnabled: data.automationEnabled });
      showToast(
        data.automationEnabled 
          ? 'Your boundaries are now protected 🛡️' 
          : 'Automation paused — you\'re in full control',
        'success'
      );
      fetchData();
    } catch (error) {
      console.error('Error toggling automation:', error);
      showToast('Something went sideways. Let\'s try that again 🔄', 'error');
    }
  };

  const toggleResponder = async (enabled) => {
    try {
      const message = testMessage || settings.templates[settings.defaultTone];
      await fetch(`${API_URL}/toggle-responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, message })
      });
      showToast(
        enabled 
          ? 'Your time is now protected ✨' 
          : 'Responder paused — welcome back!',
        'success'
      );
      fetchData();
    } catch (error) {
      console.error('Error toggling responder:', error);
      showToast('Hmm, that didn\'t work. Mind trying again? 🤔', 'error');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      setSettings(newSettings);
      showToast('Your preferences are saved 💾', 'success');
      fetchData();
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast('Couldn\'t save those changes. Let\'s try again 🔄', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const createEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/create-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      
      if (response.ok) {
        setNewEvent({
          summary: 'Out of Office',
          startDate: '',
          startTime: '09:00',
          endDate: '',
          endTime: '17:00',
          tone: 'professional',
          customMessage: '',
          allDay: false
        });
        setShowScheduler(false);
        showToast('Your time off is scheduled! Rest well 🌴', 'success');
        fetchData();
      } else {
        showToast('Couldn\'t create that event. Let\'s troubleshoot 🔧', 'error');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('Something unexpected happened. We\'re on it! 🚀', 'error');
    }
  };

  const deleteEvent = async (eventId, eventSummary) => {
    if (!window.confirm(`Are you sure you want to delete "${eventSummary}"? You can always create it again later.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/delete-event/${eventId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showToast('Event removed — your calendar is updated 📅', 'success');
        fetchData();
      } else {
        const error = await response.json();
        showToast(`Couldn't delete that: ${error.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Having trouble with that deletion. Try again? 🔄', 'error');
    }
  };

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
      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ marginBottom: '10px' }}>
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>

      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🌴 Your Boundary Guardian</h1>
        <div style={styles.statusBadge}>
          <span style={{
            ...styles.statusDot,
            ...(status?.automationEnabled ? styles.statusDotActive : styles.statusDotInactive)
          }}></span>
          Protection {status?.automationEnabled ? 'Active' : 'Paused'}
        </div>
      </header>

      <nav style={styles.nav}>
        <button 
          style={{
            ...styles.navButton,
            ...(activeTab === 'dashboard' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('dashboard')}
        >
          Your Space
        </button>
        <button 
          style={{
            ...styles.navButton,
            ...(activeTab === 'events' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('events')}
        >
          Sacred Time
        </button>
        <button 
          style={{
            ...styles.navButton,
            ...(activeTab === 'settings' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('settings')}
        >
          Preferences
        </button>
        <button 
          style={{
            ...styles.navButton,
            ...(activeTab === 'logs' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('logs')}
        >
          Your Journey
        </button>
      </nav>

      <main style={styles.content}>
        {activeTab === 'dashboard' && (
          <div>
            <div style={styles.wellnessNote}>
              💡 Remember: Rest is not a reward for finishing work — it's a requirement for sustainable creativity and wellbeing.
            </div>
            
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Your Current Status</h2>
              <div>
                <div style={styles.statusRow}>
                  <span>Email Guardian:</span>
                  <strong style={{ color: status?.vacationResponder?.enabled ? '#4ade80' : '#ef4444' }}>
                    {status?.vacationResponder?.enabled ? '✨ Protecting Your Peace' : '🚪 Open for Messages'}
                  </strong>
                </div>
                <div style={styles.statusRow}>
                  <span>Smart Protection:</span>
                  <label style={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={status?.automationEnabled || false}
                      onChange={toggleAutomation}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      ...styles.slider,
                      backgroundColor: status?.automationEnabled ? '#667eea' : '#ccc'
                    }}>
                      <span style={{
                        ...styles.sliderBefore,
                        transform: status?.automationEnabled ? 'translateX(26px)' : 'translateX(0)'
                      }}></span>
                    </span>
                  </label>
                </div>
              </div>

              {status?.vacationResponder?.enabled && (
                <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Your Active Boundary Message:</h3>
                  <p style={{ margin: 0 }}>{status.vacationResponder.message}</p>
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Quick Actions</h2>
              <div style={styles.quickActions}>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    opacity: status?.vacationResponder?.enabled ? 0.5 : 1,
                    cursor: status?.vacationResponder?.enabled ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => toggleResponder(true)}
                  disabled={status?.vacationResponder?.enabled}
                >
                  🛡️ Activate Protection
                </button>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    opacity: !status?.vacationResponder?.enabled ? 0.5 : 1,
                    cursor: !status?.vacationResponder?.enabled ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => toggleResponder(false)}
                  disabled={!status?.vacationResponder?.enabled}
                >
                  🚪 Open My Inbox
                </button>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.primaryButton
                  }}
                  onClick={() => setShowScheduler(!showScheduler)}
                >
                  📅 Plan Sacred Time
                </button>
              </div>
              
              {showScheduler && (
                <div style={styles.scheduler}>
                  <h3 style={{ marginTop: 0 }}>Schedule Your Sacred Time</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>What are you doing?</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={newEvent.summary}
                      onChange={(e) => setNewEvent({...newEvent, summary: e.target.value})}
                      placeholder="Recharging my batteries, Solo adventure, Family time..."
                    />
                  </div>
                  
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>First day of freedom:</label>
                      <input
                        type="date"
                        style={styles.input}
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                      />
                    </div>
                    {!newEvent.allDay && (
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Starting at:</label>
                        <input
                          type="time"
                          style={styles.input}
                          value={newEvent.startTime}
                          onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Back in action on:</label>
                      <input
                        type="date"
                        style={styles.input}
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                      />
                    </div>
                    {!newEvent.allDay && (
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Returning at:</label>
                        <input
                          type="time"
                          style={styles.input}
                          value={newEvent.endTime}
                          onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        checked={newEvent.allDay}
                        onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Full day(s) of restoration
                    </label>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Message vibe:</label>
                    <select
                      style={styles.select}
                      value={newEvent.tone}
                      onChange={(e) => setNewEvent({...newEvent, tone: e.target.value})}
                    >
                      <option value="professional">Professional & Clear</option>
                      <option value="casual">Warm & Friendly</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Custom boundary message (optional):</label>
                    <textarea
                      style={styles.textarea}
                      value={newEvent.customMessage}
                      onChange={(e) => setNewEvent({...newEvent, customMessage: e.target.value})}
                      placeholder="Leave blank for our thoughtful default, or craft your own message..."
                      rows="3"
                    />
                  </div>
                  
                  <div style={styles.formActions}>
                    <button 
                      style={{
                        ...styles.button,
                        ...styles.primaryButton,
                        opacity: (!newEvent.startDate || !newEvent.endDate) ? 0.5 : 1,
                        cursor: (!newEvent.startDate || !newEvent.endDate) ? 'not-allowed' : 'pointer'
                      }}
                      onClick={createEvent}
                      disabled={!newEvent.startDate || !newEvent.endDate}
                    >
                      ✨ Protect This Time
                    </button>
                    <button 
                      style={{
                        ...styles.button,
                        ...styles.secondaryButton
                      }}
                      onClick={() => setShowScheduler(false)}
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '2rem' }}>
                <h3>Test Your Boundary Message:</h3>
                <textarea
                  style={styles.textarea}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Try out a custom message here..."
                  rows="3"
                />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Your Protected Time</h2>
              {events.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No sacred time scheduled yet. Remember: rest is productive! 🌱
                </p>
              ) : (
                <div>
                  {events.slice(0, 3).map((event, i) => (
                    <div key={i} style={styles.eventItem}>
                      <div style={styles.eventItemHeader}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>{event.summary}</h4>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                            {formatDate(event.start.dateTime || event.start.date)}
                          </p>
                        </div>
                        <button 
                          style={styles.deleteButtonSmall}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#ef4444';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#ef4444';
                          }}
                          onClick={() => deleteEvent(event.id, event.summary)}
                          title="Remove this protected time"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <p style={{ marginTop: '1rem', color: '#6b7280', fontStyle: 'italic' }}>
                      <small>+ {events.length - 3} more moments of peace. View all in Sacred Time tab.</small>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📅 Your Sacred Time Calendar</h2>
              <div style={styles.wellnessNote}>
                🧘🏾‍♂️ These are your moments for restoration, play, and discovery. Guard them fiercely.
              </div>
              {events.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Your calendar is wide open. Ready to claim some time for yourself?
                </p>
              ) : (
                <div>
                  {events.map((event, i) => (
                    <div key={i} style={styles.eventCard}>
                      <div style={styles.eventHeader}>
                        <h3 style={{ margin: 0 }}>{event.summary}</h3>
                        <button 
                          style={{
                            ...styles.button,
                            ...styles.deleteButton
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                          onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                          onClick={() => deleteEvent(event.id, event.summary)}
                          title="Release this time"
                        >
                          🗑️ Release
                        </button>
                      </div>
                      <div style={{ color: '#6b7280' }}>
                        <p><strong>Freedom begins:</strong> {formatDate(event.start.dateTime || event.start.date)}</p>
                        <p><strong>Back in action:</strong> {formatDate(event.end.dateTime || event.end.date)}</p>
                        {event.description && (
                          <p><strong>Notes:</strong> {event.description.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && settings && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>⚙️ Your Preferences</h2>
              
              <div style={styles.calendarSelect}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Which Calendar Holds Your Sacred Time?</h3>
                <select 
                  style={styles.select}
                  value={settings.selectedCalendarId || 'primary'}
                  onChange={(e) => updateSettings({ ...settings, selectedCalendarId: e.target.value })}
                >
                  {calendars.map(cal => (
                    <option key={cal.id} value={cal.id}>
                      {cal.summary} {cal.primary ? '(Your main calendar)' : ''}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#6b7280', display: 'block', marginTop: '0.5rem' }}>
                  We'll watch this calendar for your Out of Office events
                </small>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3>Default Message Tone</h3>
                <select 
                  style={{ ...styles.select, width: '200px' }}
                  value={settings.defaultTone}
                  onChange={(e) => updateSettings({ ...settings, defaultTone: e.target.value })}
                >
                  <option value="professional">Professional & Clear</option>
                  <option value="casual">Warm & Friendly</option>
                </select>
              </div>

              <div>
                <h3>Your Boundary Messages</h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Craft messages that honor your time while maintaining connection.
                </p>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4>Professional & Clear</h4>
                  <textarea
                    style={styles.textarea}
                    value={settings.templates.professional}
                    onChange={(e) => updateSettings({
                      ...settings,
                      templates: { ...settings.templates, professional: e.target.value }
                    })}
                    rows="4"
                  />
                  <small style={{ color: '#6b7280' }}>Use {'{date}'} to automatically insert your return date</small>
                </div>

                <div>
                  <h4>Warm & Friendly</h4>
                  <textarea
                    style={styles.textarea}
                    value={settings.templates.casual}
                    onChange={(e) => updateSettings({
                      ...settings,
                      templates: { ...settings.templates, casual: e.target.value }
                    })}
                    rows="4"
                  />
                  <small style={{ color: '#6b7280' }}>Use {'{date}'} to automatically insert your return date</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 Your Journey</h2>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                A record of how you've been protecting your peace and honoring your rhythms.
              </p>
              {logs.length === 0 ? (
                <p style={{ color: '#6b7280' }}>Your journey begins now. Make your first move above! ✨</p>
              ) : (
                <div>
                  {logs.map((log, i) => (
                    <div key={i} style={styles.logItem}>
                      <span style={{ color: '#6b7280' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span style={{
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        color: log.action.includes('enabled') || log.action.includes('toggle') ? '#10b981' :
                               log.action.includes('disabled') ? '#ef4444' :
                               log.action.includes('deleted') ? '#f59e0b' : '#3b82f6'
                      }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span style={{ color: '#374151' }}>{log.details}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
