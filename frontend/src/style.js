// styles.js

const colors = {
  background: '#fefefe',
  card: '#ffffff',
  border: '#e6e6e6',
  text: '#2e2e2e',
  mutedText: '#9a9a9a',
  accent: '#7e6cca',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  lightGray: '#f4f4f5'
};

const shadows = {
  card: '0 2px 8px rgba(0,0,0,0.04)',
  focus: '0 0 0 3px rgba(126, 108, 202, 0.3)'
};

const radii = {
  soft: '16px',
  pill: '9999px',
  subtle: '8px'
};

const typography = {
  fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`,
  heading: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: colors.text
  },
  subheading: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: colors.text
  },
  body: {
    fontSize: '1rem',
    fontWeight: '400',
    color: colors.text
  },
  muted: {
    fontSize: '0.875rem',
    color: colors.mutedText
  }
};

const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '2rem',
  xl: '4rem'
};

const layout = {
  container: {
    padding: spacing.lg,
    maxWidth: '900px',
    margin: '0 auto'
  },
  card: {
    background: colors.card,
    borderRadius: radii.soft,
    boxShadow: shadows.card,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  button: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: '0.95rem',
    borderRadius: radii.pill,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.3s ease, color 0.3s ease'
  },
  input: {
    padding: spacing.sm,
    borderRadius: radii.subtle,
    border: `1px solid ${colors.border}`,
    fontSize: '1rem',
    width: '100%'
  },
  textarea: {
    padding: spacing.sm,
    borderRadius: radii.subtle,
    border: `1px solid ${colors.border}`,
    fontSize: '1rem',
    width: '100%',
    resize: 'vertical'
  }
};

export default {
  colors,
  shadows,
  radii,
  typography,
  spacing,
  layout
};
