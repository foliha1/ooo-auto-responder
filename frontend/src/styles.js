// Animation keyframes
export const animationStyles = `
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

// Toast styles
export const getToastStyles = (isExiting) => ({
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
});

export const toastTypeStyles = {
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

export const toastIcons = {
  success: '✨',
  error: '🛡️',
  info: '💡',
  warning: '⚡'
};

export const toastCloseButtonStyle = {
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
};

// Main application styles
export const styles = {
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
  },
  toastContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000
  },
  toastWrapper: {
    marginBottom: '10px'
  }
};

// Dynamic style helpers
export const getSliderStyle = (isEnabled) => ({
  ...styles.slider,
  backgroundColor: isEnabled ? '#667eea' : '#ccc'
});

export const getSliderBeforeStyle = (isEnabled) => ({
  ...styles.sliderBefore,
  transform: isEnabled ? 'translateX(26px)' : 'translateX(0)'
});

export const getStatusDotStyle = (isActive) => ({
  ...styles.statusDot,
  ...(isActive ? styles.statusDotActive : styles.statusDotInactive)
});

export const getNavButtonStyle = (isActive) => ({
  ...styles.navButton,
  ...(isActive ? styles.navButtonActive : {})
});

export const getButtonStyle = (base, modifier, disabled) => ({
  ...styles.button,
  ...base,
  opacity: disabled ? 0.5 : 1,
  cursor: disabled ? 'not-allowed' : 'pointer'
});

export const getLogActionColor = (action) => {
  if (action.includes('enabled') || action.includes('toggle')) return '#10b981';
  if (action.includes('disabled')) return '#ef4444';
  if (action.includes('deleted')) return '#f59e0b';
  return '#3b82f6';
};