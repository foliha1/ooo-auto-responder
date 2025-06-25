import React, { useState, useEffect } from 'react';
import { 
  styles, 
  animationStyles, 
  getToastStyles, 
  toastTypeStyles, 
  toastIcons,
  toastCloseButtonStyle,
  getSliderStyle,
  getSliderBeforeStyle,
  getStatusDotStyle,
  getNavButtonStyle,
  getButtonStyle,
  getLogActionColor,
  inputFocusStyle,
  buttonHoverStyle
} from './styles';

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

  return (
    <div style={{ ...getToastStyles(isExiting), ...toastTypeStyles[type] }}>
      <span style={{ fontSize: '20px', flexShrink: 0 }}>{toastIcons[type]}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
      <button 
        onClick={handleClose}
        style={toastCloseButtonStyle}
        onMouseEnter={(e) => e.target.style.background = 'rgba(45, 41, 38, 0.05)'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        ×
      </button>
    </div>
  );
};

// Modal component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        ...styles.card,
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={styles.cardTitle}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: styles.cardTitle.color,
              padding: '0.5rem'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
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
  const [ptoBalance, setPtoBalance] = useState({ available: 0, used: 0, planned: 0 });
  const [holidays, setHolidays] = useState([]);
  const [ptoSuggestions, setPtoSuggestions] = useState([]);
  const [showPTOModal, setShowPTOModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showSuggestionConfirm, setShowSuggestionConfirm] = useState(false);
  const [modalData, setModalData] = useState({});
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
    fetchPTOData();
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
      
      // Update PTO planned count based on PTO events
      updatePlannedPTO(eventsData.events || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Oops! Having trouble connecting. We\'ll keep trying 💫', 'error');
      setLoading(false);
    }
  };

  const updatePlannedPTO = (events) => {
    // Count PTO days from events
    const ptoEvents = events.filter(event => {
      const summary = (event.summary || '').toLowerCase();
      return summary.includes('pto') || summary.includes('out of office') || summary.includes('ooo');
    });
    
    let ptoDaysCount = 0;
    ptoEvents.forEach(event => {
      const startDate = new Date(event.start.date || event.start.dateTime);
      const endDate = new Date(event.end.date || event.end.dateTime);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      ptoDaysCount += daysDiff || 1;
    });
    
    setPtoBalance(prev => ({ ...prev, planned: ptoDaysCount }));
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

  const fetchPTOData = async () => {
    try {
      // Fetch PTO balance
      const balanceRes = await fetch(`${API_URL}/pto-balance`);
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setPtoBalance(balanceData);
      }

      // Fetch holidays
      const holidaysRes = await fetch(`${API_URL}/holidays`);
      if (holidaysRes.ok) {
        const holidaysData = await holidaysRes.json();
        setHolidays(holidaysData.holidays || []);
      }

      // Fetch PTO suggestions
      const suggestionsRes = await fetch(`${API_URL}/pto-suggestions`);
      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json();
        setPtoSuggestions(suggestionsData.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching PTO data:', error);
    }
  };

  const updatePTOBalance = async (newBalance) => {
    try {
      await fetch(`${API_URL}/pto-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBalance)
      });
      setPtoBalance(newBalance);
      showToast('PTO balance updated ✨', 'success');
      fetchPTOData(); // Refresh suggestions
    } catch (error) {
      console.error('Error updating PTO balance:', error);
      showToast('Couldn\'t update PTO balance. Let\'s try again 🔄', 'error');
    }
  };

  const addHoliday = async (holiday) => {
    try {
      await fetch(`${API_URL}/holidays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holiday)
      });
      showToast('Holiday added to your calendar 🎉', 'success');
      fetchPTOData();
    } catch (error) {
      console.error('Error adding holiday:', error);
      showToast('Couldn\'t add that holiday. Let\'s try again 🔄', 'error');
    }
  };

  const applyPTOSuggestion = async (suggestion) => {
    try {
      // Create events for each PTO day in the suggestion
      for (const ptoDay of suggestion.ptoDays) {
        await fetch(`${API_URL}/create-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: 'PTO - Extended Weekend',
            startDate: ptoDay,
            endDate: ptoDay,
            allDay: true,
            tone: 'professional',
            customMessage: `Taking a well-deserved break! I'll be back refreshed on ${suggestion.returnDate}.`
          })
        });
      }
      
      // Update PTO balance
      const newBalance = {
        ...ptoBalance,
        available: ptoBalance.available - suggestion.ptoDaysCount,
        used: ptoBalance.used + suggestion.ptoDaysCount
      };
      await updatePTOBalance(newBalance);
      
      showToast(`${suggestion.totalDaysOff} day break scheduled! Enjoy your time off 🌴`, 'success');
      fetchData();
      fetchPTOData();
    } catch (error) {
      console.error('Error applying PTO suggestion:', error);
      showToast('Couldn\'t schedule that time off. Let\'s try again 🔄', 'error');
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
      // Check if this is a PTO/OOO event
      const summaryLower = eventSummary.toLowerCase();
      const isPTOEvent = summaryLower.includes('pto') || summaryLower.includes('out of office') || summaryLower.includes('ooo');
      let ptoDaysToReturn = 0;
      
      if (isPTOEvent) {
        // Find the event to calculate days
        const event = events.find(e => e.id === eventId);
        if (event) {
          const startDate = new Date(event.start.date || event.start.dateTime);
          const endDate = new Date(event.end.date || event.end.dateTime);
          ptoDaysToReturn = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
        }
      }
      
      const response = await fetch(`${API_URL}/delete-event/${eventId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Update PTO balance if it was a PTO event
        if (isPTOEvent && ptoDaysToReturn > 0) {
          const newBalance = {
            ...ptoBalance,
            available: ptoBalance.available + ptoDaysToReturn,
            used: Math.max(0, ptoBalance.used - ptoDaysToReturn)
          };
          await updatePTOBalance(newBalance);
        }
        
        showToast('Event removed — your calendar is updated 📅', 'success');
        fetchData();
        fetchPTOData();
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
      <div style={styles.toastContainer}>
        {toasts.map((toast, index) => (
          <div key={toast.id} style={styles.toastWrapper}>
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>

      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🌿 Your Boundary Guardian</h1>
        <div style={styles.statusBadge}>
          <span style={getStatusDotStyle(status?.automationEnabled)}></span>
          Protection {status?.automationEnabled ? 'Active' : 'Paused'}
        </div>
      </header>

      <nav style={styles.nav}>
        <button 
          style={getNavButtonStyle(activeTab === 'dashboard')}
          onClick={() => setActiveTab('dashboard')}
        >
          Your Space
        </button>
        <button 
          style={getNavButtonStyle(activeTab === 'events')}
          onClick={() => setActiveTab('events')}
        >
          Sacred Time
        </button>
        <button 
          style={getNavButtonStyle(activeTab === 'settings')}
          onClick={() => setActiveTab('settings')}
        >
          Preferences
        </button>
        <button 
          style={getNavButtonStyle(activeTab === 'pto')}
          onClick={() => setActiveTab('pto')}
        >
          Smart PTO
        </button>
        <button 
          style={getNavButtonStyle(activeTab === 'logs')}
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
                    <span style={getSliderStyle(status?.automationEnabled)}>
                      <span style={getSliderBeforeStyle(status?.automationEnabled)}></span>
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
                  style={getButtonStyle(styles.primaryButton, {}, status?.vacationResponder?.enabled)}
                  onClick={() => toggleResponder(true)}
                  disabled={status?.vacationResponder?.enabled}
                  onMouseEnter={(e) => !status?.vacationResponder?.enabled && Object.assign(e.target.style, buttonHoverStyle)}
                  onMouseLeave={(e) => !status?.vacationResponder?.enabled && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 2px 8px rgba(139, 115, 85, 0.15)')}
                >
                  🛡️ Activate Protection
                </button>
                <button 
                  style={getButtonStyle(styles.secondaryButton, {}, !status?.vacationResponder?.enabled)}
                  onClick={() => toggleResponder(false)}
                  disabled={!status?.vacationResponder?.enabled}
                  onMouseEnter={(e) => status?.vacationResponder?.enabled && Object.assign(e.target.style, buttonHoverStyle)}
                  onMouseLeave={(e) => status?.vacationResponder?.enabled && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
                >
                  🚪 Open My Inbox
                </button>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.primaryButton
                  }}
                  onClick={() => setShowScheduler(!showScheduler)}
                  onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
                  onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 2px 8px rgba(139, 115, 85, 0.15)')}
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
                      style={getButtonStyle(styles.primaryButton, {}, (!newEvent.startDate || !newEvent.endDate))}
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
            
            {/* Suggestion Confirmation Modal */}
            <Modal
              isOpen={showSuggestionConfirm}
              onClose={() => setShowSuggestionConfirm(false)}
              title="Schedule Time Off"
            >
              {modalData.suggestion && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#8b7355' }}>
                      {modalData.suggestion.title}
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>
                      {modalData.suggestion.description}
                    </p>
                    <div style={{
                      background: '#faf8f5',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Date Range:</span>
                        <strong>{modalData.suggestion.dateRange}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>PTO Days Used:</span>
                        <strong>{modalData.suggestion.ptoDaysCount} days</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Time Off:</span>
                        <strong style={{ color: '#7ea474' }}>{modalData.suggestion.totalDaysOff} days</strong>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      This will create {modalData.suggestion.ptoDaysCount} PTO event{modalData.suggestion.ptoDaysCount > 1 ? 's' : ''} in your calendar and update your PTO balance.
                    </p>
                  </div>
                  <div style={styles.formActions}>
                    <button
                      style={{ ...styles.button, ...styles.primaryButton }}
                      onClick={() => {
                        applyPTOSuggestion(modalData.suggestion);
                        setShowSuggestionConfirm(false);
                      }}
                    >
                      Schedule It!
                    </button>
                    <button
                      style={{ ...styles.button, ...styles.secondaryButton }}
                      onClick={() => setShowSuggestionConfirm(false)}
                    >
                      Not Yet
                    </button>
                  </div>
                </div>
              )}
            </Modal>
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

        {activeTab === 'pto' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🌟 Smart PTO Planner</h2>
              
              {/* PTO Balance Section */}
              <div style={styles.ptoBalance}>
                <div style={styles.ptoBalanceItem}>
                  <div style={styles.ptoBalanceLabel}>Available Days</div>
                  <div style={styles.ptoBalanceValue}>{ptoBalance.available}</div>
                </div>
                <div style={styles.ptoBalanceItem}>
                  <div style={styles.ptoBalanceLabel}>Used Days</div>
                  <div style={styles.ptoBalanceValue}>{ptoBalance.used}</div>
                </div>
                <div style={styles.ptoBalanceItem}>
                  <div style={styles.ptoBalanceLabel}>Planned Days</div>
                  <div style={styles.ptoBalanceValue}>{ptoBalance.planned}</div>
                </div>
              </div>

              {/* Update PTO Balance */}
              <div style={{ marginBottom: '2rem' }}>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton
                  }}
                  onClick={() => {
                    setModalData({ available: ptoBalance.available });
                    setShowPTOModal(true);
                  }}
                >
                  Update Balance
                </button>
              </div>
            </div>

            {/* PTO Balance Modal */}
            <Modal
              isOpen={showPTOModal}
              onClose={() => setShowPTOModal(false)}
              title="Update PTO Balance"
            >
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Available PTO Days</label>
                <input
                  type="number"
                  style={styles.input}
                  value={modalData.available || 0}
                  onChange={(e) => setModalData({ ...modalData, available: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="365"
                />
              </div>
              <div style={styles.formActions}>
                <button
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onClick={() => {
                    updatePTOBalance({ ...ptoBalance, available: modalData.available });
                    setShowPTOModal(false);
                  }}
                >
                  Save
                </button>
                <button
                  style={{ ...styles.button, ...styles.secondaryButton }}
                  onClick={() => setShowPTOModal(false)}
                >
                  Cancel
                </button>
              </div>
            </Modal>

            {/* Smart Suggestions */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>✨ Optimized Time Off Suggestions</h3>
              <div style={styles.wellnessNote}>
                🧮 These suggestions maximize your time off by strategically using PTO days around holidays and weekends.
              </div>
              
              {ptoSuggestions.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Add some holidays below to get smart PTO suggestions!
                </p>
              ) : (
                <div>
                  {ptoSuggestions.map((suggestion, i) => (
                    <div 
                      key={i} 
                      style={styles.suggestionCard}
                      onClick={() => {
                        setModalData({ suggestion });
                        setShowSuggestionConfirm(true);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={styles.suggestionHeader}>
                        <div>
                          <div style={styles.suggestionTitle}>{suggestion.title}</div>
                          <div style={styles.suggestionDays}>
                            {suggestion.dateRange} • Use {suggestion.ptoDaysCount} PTO day{suggestion.ptoDaysCount > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div style={styles.suggestionBadge}>
                          {suggestion.totalDaysOff} days off
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        {suggestion.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Holiday Management */}
            <div style={styles.card}>
              <div style={styles.ptoHeader}>
                <h3 style={{ margin: 0 }}>📅 Company Holidays</h3>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.primaryButton
                  }}
                  onClick={() => {
                    setModalData({
                      name: '',
                      date: '',
                      observedDate: ''
                    });
                    setShowHolidayModal(true);
                  }}
                >
                  Add Holiday
                </button>
              </div>
              
              {/* Holiday Modal */}
              <Modal
                isOpen={showHolidayModal}
                onClose={() => setShowHolidayModal(false)}
                title="Add Company Holiday"
              >
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Holiday Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={modalData.name || ''}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    placeholder="e.g., Independence Day"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Holiday Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={modalData.date || ''}
                    onChange={(e) => setModalData({ ...modalData, date: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Observed Date (if different)</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={modalData.observedDate || modalData.date || ''}
                    onChange={(e) => setModalData({ ...modalData, observedDate: e.target.value })}
                  />
                  <small style={{ color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                    Leave empty if observed on the same date
                  </small>
                </div>
                <div style={styles.formActions}>
                  <button
                    style={{ ...styles.button, ...styles.primaryButton }}
                    onClick={() => {
                      if (modalData.name && modalData.date) {
                        addHoliday({
                          name: modalData.name,
                          date: modalData.date,
                          observedDate: modalData.observedDate || modalData.date
                        });
                        setShowHolidayModal(false);
                      }
                    }}
                    disabled={!modalData.name || !modalData.date}
                  >
                    Add Holiday
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.secondaryButton }}
                    onClick={() => setShowHolidayModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Modal>
              
              {holidays.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No holidays added yet. Add your company holidays to get smart PTO suggestions!
                </p>
              ) : (
                <div style={styles.holidayList}>
                  {holidays.map((holiday, i) => (
                    <div key={i} style={styles.holidayItem}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{holiday.name}</div>
                        <div style={styles.holidayDates}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Holiday: {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          {holiday.observedDate !== holiday.date && (
                            <span style={{ fontSize: '0.875rem', color: '#8b7355' }}>
                              Observed: {new Date(holiday.observedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        style={styles.deleteButtonSmall}
                        onClick={async () => {
                          if (window.confirm(`Remove ${holiday.name}?`)) {
                            try {
                              await fetch(`${API_URL}/holidays/${holiday.id}`, { method: 'DELETE' });
                              showToast('Holiday removed 📅', 'success');
                              fetchPTOData();
                            } catch (error) {
                              showToast('Couldn\'t remove holiday 🔄', 'error');
                            }
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                        color: getLogActionColor(log.action)
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