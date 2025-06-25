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
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Color palette inspired by My Mind
const colors = {
  // Soft, warm neutrals
  background: '#fdfbf7',      // Very soft warm white
  surface: '#ffffff',         // Pure white for cards
  surfaceAlt: '#faf8f5',     // Slightly warmer surface
  
  // Text colors
  textPrimary: '#2d2926',    // Soft black
  textSecondary: '#6b6460',  // Warm gray
  textMuted: '#a09691',      // Muted brown-gray
  
  // Accent colors (softer, more muted)
  primary: '#8b7355',        // Warm brown
  primaryLight: '#a89072',   // Lighter warm brown
  primaryDark: '#6e5a42',    // Darker warm brown
  
  // Status colors (gentler versions)
  success: '#7ea474',        // Sage green
  error: '#d68876',          // Dusty rose
  warning: '#e4a853',        // Warm yellow
  info: '#7a95b8',           // Soft blue
  
  // Borders and dividers
  border: 'rgba(45, 41, 38, 0.08)',
  borderLight: 'rgba(45, 41, 38, 0.04)',
};

// Toast styles
export const getToastStyles = (isExiting) => ({
  position: 'fixed',
  top: '24px',
  right: '24px',
  padding: '18px 24px',
  borderRadius: '16px',
  color: colors.textPrimary,
  fontWeight: '400',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  boxShadow: '0 4px 20px rgba(45, 41, 38, 0.08)',
  border: `1px solid ${colors.borderLight}`,
  animation: isExiting ? 'slideOut 0.3s ease-in' : 'slideIn 0.3s ease-out',
  zIndex: 1000,
  maxWidth: '380px',
  minWidth: '280px',
  backgroundColor: colors.surface,
  fontSize: '15px',
  lineHeight: '1.5'
});

export const toastTypeStyles = {
  success: { 
    backgroundColor: colors.surface,
    borderColor: colors.success + '30',
  },
  error: { 
    backgroundColor: colors.surface,
    borderColor: colors.error + '30',
  },
  info: { 
    backgroundColor: colors.surface,
    borderColor: colors.info + '30',
  },
  warning: {
    backgroundColor: colors.surface,
    borderColor: colors.warning + '30',
  }
};

export const toastIcons = {
  success: '🌱',
  error: '🌸',
  info: '💫',
  warning: '🌟'
};

export const toastCloseButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: colors.textMuted,
  cursor: 'pointer',
  fontSize: '20px',
  width: '28px',
  height: '28px',
  borderRadius: '8px',
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
    backgroundColor: colors.background,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: colors.textPrimary,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    minHeight: '100vh',
    gap: '24px'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: `2px solid ${colors.borderLight}`,
    borderTop: `2px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    background: colors.surface,
    color: colors.textPrimary,
    padding: '2rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.borderLight}`,
    boxShadow: '0 1px 3px rgba(45, 41, 38, 0.03)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '500',
    letterSpacing: '-0.02em',
    color: colors.textPrimary
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    background: colors.surfaceAlt,
    padding: '0.625rem 1.25rem',
    borderRadius: '24px',
    fontSize: '0.875rem',
    border: `1px solid ${colors.borderLight}`,
    fontWeight: '500'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '0.625rem'
  },
  statusDotActive: {
    backgroundColor: colors.success,
    boxShadow: `0 0 0 3px ${colors.success}20`
  },
  statusDotInactive: {
    backgroundColor: colors.textMuted,
    boxShadow: `0 0 0 3px ${colors.textMuted}20`
  },
  nav: {
    background: colors.surface,
    borderBottom: `1px solid ${colors.borderLight}`,
    display: 'flex',
    padding: '0 2.5rem',
    gap: '2rem'
  },
  navButton: {
    background: 'none',
    border: 'none',
    padding: '1.125rem 0',
    cursor: 'pointer',
    fontSize: '0.9375rem',
    color: colors.textSecondary,
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease',
    fontWeight: '500',
    letterSpacing: '-0.01em'
  },
  navButtonActive: {
    color: colors.primary,
    borderBottomColor: colors.primary
  },
  content: {
    flex: 1,
    padding: '2.5rem',
    maxWidth: '1120px',
    width: '100%',
    margin: '0 auto',
    animation: 'fadeIn 0.4s ease-out'
  },
  card: {
    background: colors.surface,
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '1.5rem',
    border: `1px solid ${colors.borderLight}`,
    boxShadow: '0 2px 8px rgba(45, 41, 38, 0.04)',
    transition: 'all 0.2s ease'
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '1.75rem',
    color: colors.textPrimary,
    fontSize: '1.25rem',
    fontWeight: '500',
    letterSpacing: '-0.02em'
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 0',
    borderBottom: `1px solid ${colors.borderLight}`,
    ':last-child': {
      borderBottom: 'none'
    }
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500',
    letterSpacing: '-0.01em'
  },
  primaryButton: {
    background: colors.primary,
    color: colors.surface,
    boxShadow: '0 2px 8px rgba(139, 115, 85, 0.15)'
  },
  secondaryButton: {
    background: colors.surfaceAlt,
    color: colors.textPrimary,
    border: `1px solid ${colors.borderLight}`
  },
  deleteButton: {
    background: colors.error,
    color: colors.surface,
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem'
  },
  deleteButtonSmall: {
    background: 'transparent',
    border: `1px solid ${colors.error}40`,
    color: colors.error,
    padding: '0.375rem 0.75rem',
    fontSize: '0.8125rem',
    borderRadius: '8px',
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
    padding: '1.25rem',
    background: colors.surfaceAlt,
    borderRadius: '12px',
    marginBottom: '1rem',
    border: `1px solid ${colors.borderLight}`,
    transition: 'all 0.2s ease'
  },
  eventItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  eventCard: {
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '12px',
    padding: '1.75rem',
    marginBottom: '1rem',
    background: colors.surface,
    transition: 'all 0.2s ease'
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem'
  },
  textarea: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '10px',
    fontFamily: 'inherit',
    resize: 'vertical',
    background: colors.surfaceAlt,
    color: colors.textPrimary,
    fontSize: '0.9375rem',
    lineHeight: '1.6',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '10px',
    fontSize: '0.9375rem',
    background: colors.surfaceAlt,
    color: colors.textPrimary,
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '10px',
    fontSize: '0.9375rem',
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  formGroup: {
    marginBottom: '1.25rem'
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.625rem',
    color: colors.textPrimary,
    fontWeight: '500',
    fontSize: '0.875rem',
    letterSpacing: '-0.01em'
  },
  scheduler: {
    marginTop: '2rem',
    padding: '2rem',
    background: colors.surfaceAlt,
    borderRadius: '12px',
    border: `1px solid ${colors.borderLight}`
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.75rem'
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '48px',
    height: '26px'
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.borderLight,
    transition: '.3s',
    borderRadius: '26px',
    border: `1px solid ${colors.border}`
  },
  sliderBefore: {
    position: 'absolute',
    content: '""',
    height: '18px',
    width: '18px',
    left: '3px',
    bottom: '3px',
    backgroundColor: colors.surface,
    transition: '.3s',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(45, 41, 38, 0.1)'
  },
  logItem: {
    display: 'grid',
    gridTemplateColumns: '180px 150px 1fr',
    gap: '1.25rem',
    padding: '1rem 0',
    borderBottom: `1px solid ${colors.borderLight}`,
    fontSize: '0.875rem',
    color: colors.textSecondary
  },
  calendarSelect: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: colors.surfaceAlt,
    borderRadius: '12px',
    border: `1px solid ${colors.borderLight}`
  },
  calendarOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    marginBottom: '0.375rem'
  },
  calendarDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  wellnessNote: {
    background: `linear-gradient(135deg, ${colors.surfaceAlt}, ${colors.surface})`,
    padding: '1.25rem 1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.9375rem',
    color: colors.textSecondary,
    lineHeight: '1.6',
    border: `1px solid ${colors.borderLight}`,
    fontStyle: 'normal'
  },
  toastContainer: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: 1000
  },
  toastWrapper: {
    marginBottom: '12px'
  },
  // PTO Planner styles
  ptoCard: {
    background: colors.surface,
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: `1px solid ${colors.borderLight}`,
    boxShadow: '0 2px 8px rgba(45, 41, 38, 0.04)'
  },
  ptoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  ptoBalance: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1.5rem',
    padding: '1.25rem',
    background: colors.surfaceAlt,
    borderRadius: '12px',
    border: `1px solid ${colors.borderLight}`
  },
  ptoBalanceItem: {
    flex: 1,
    textAlign: 'center'
  },
  ptoBalanceLabel: {
    fontSize: '0.875rem',
    color: colors.textSecondary,
    marginBottom: '0.5rem'
  },
  ptoBalanceValue: {
    fontSize: '1.75rem',
    fontWeight: '500',
    color: colors.primary
  },
  holidayList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  holidayItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: colors.surfaceAlt,
    borderRadius: '10px',
    border: `1px solid ${colors.borderLight}`,
    transition: 'all 0.2s ease'
  },
  holidayDates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  suggestionCard: {
    padding: '1.25rem',
    background: `linear-gradient(135deg, ${colors.success}10, ${colors.surface})`,
    borderRadius: '12px',
    border: `1px solid ${colors.success}30`,
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  suggestionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  suggestionTitle: {
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '0.25rem'
  },
  suggestionDays: {
    fontSize: '0.875rem',
    color: colors.textSecondary
  },
  suggestionBadge: {
    padding: '0.25rem 0.75rem',
    background: colors.success,
    color: colors.surface,
    borderRadius: '16px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  calendarDay: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '400',
    cursor: 'default',
    transition: 'all 0.2s ease'
  },
  calendarDayWeekend: {
    background: colors.surfaceAlt,
    color: colors.textSecondary
  },
  calendarDayHoliday: {
    background: colors.primary,
    color: colors.surface,
    fontWeight: '500'
  },
  calendarDayPTO: {
    background: colors.success,
    color: colors.surface,
    fontWeight: '500'
  },
  calendarDayBridge: {
    background: `${colors.warning}20`,
    border: `2px dashed ${colors.warning}`,
    color: colors.textPrimary
  }
};

// Dynamic style helpers
export const getSliderStyle = (isEnabled) => ({
  ...styles.slider,
  backgroundColor: isEnabled ? colors.primary : colors.borderLight,
  borderColor: isEnabled ? colors.primaryDark : colors.border
});

export const getSliderBeforeStyle = (isEnabled) => ({
  ...styles.sliderBefore,
  transform: isEnabled ? 'translateX(20px)' : 'translateX(0)'
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
  opacity: disabled ? 0.6 : 1,
  cursor: disabled ? 'not-allowed' : 'pointer'
});

export const getLogActionColor = (action) => {
  if (action.includes('enabled') || action.includes('toggle')) return colors.success;
  if (action.includes('disabled')) return colors.error;
  if (action.includes('deleted')) return colors.warning;
  return colors.info;
};

// Hover effects and focus states
export const inputFocusStyle = {
  borderColor: colors.primary,
  boxShadow: `0 0 0 3px ${colors.primary}15`
};

export const buttonHoverStyle = {
  transform: 'translateY(-1px)',
  boxShadow: '0 4px 12px rgba(45, 41, 38, 0.08)'
};

export const cardHoverStyle = {
  boxShadow: '0 4px 16px rgba(45, 41, 38, 0.06)'
};