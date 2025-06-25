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
  getLogActionColor
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
      <span style={{ fontSize: '22px', flexShrink: 0 }}>{toastIcons[type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <button 
        onClick={handleClose}
        style={toastCloseButtonStyle}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
      >
        ×
      </button>
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
        <h1 style={styles.headerTitle}>🌴 Your Boundary Guardian</h1>
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
                >
                  🛡️ Activate Protection
                </button>
                <button 
                  style={getButtonStyle(styles.secondaryButton, {}, !status?.vacationResponder?.enabled)}
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