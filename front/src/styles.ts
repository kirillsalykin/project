// Design system constants
export const colors = {
  primary: '#4F46E5', // Indigo
  primaryHover: '#4338CA',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    700: '#B91C1C'
  },
  green: {
    50: '#D1FAE5',
    100: '#A7F3D0',
    700: '#065F46'
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    700: '#1E40AF'
  }
};

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem'
};

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem'
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  default: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  full: '9999px'
};

// Component styles
export const layoutStyles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: colors.gray[100],
    display: 'flex',
    flexDirection: 'column' as const
  },
  container: {
    maxWidth: '72rem',
    margin: '0 auto',
    padding: `0 ${spacing[4]}`
  },
  formContainer: {
    width: '100%',
    maxWidth: '28rem',
    margin: `${spacing[6]} auto`,
    padding: `0 ${spacing[4]}`
  }
};

export const headerStyles = {
  header: {
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.gray[200]}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: spacing[16]
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  logoIcon: {
    color: colors.primary
  },
  logoText: {
    marginLeft: spacing[3],
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.gray[800]
  },
  navigationContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  navigationLinks: {
    display: 'flex',
    gap: spacing[4],
    alignItems: 'center'
  }
};

export const buttonStyles = {
  primary: {
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  },
  secondary: {
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: colors.white,
    color: colors.gray[700],
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  },
  link: {
    color: colors.gray[600],
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    textDecoration: 'none',
    cursor: 'pointer'
  },
  disabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  }
};

export const cardStyles = {
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    width: '100%'
  },
  cardHeader: {
    padding: `${spacing[6]} ${spacing[6]}`,
    textAlign: 'center' as const
  },
  cardTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.gray[900],
    marginBottom: spacing[2]
  },
  cardBody: {
    padding: `0 ${spacing[6]} ${spacing[6]} ${spacing[6]}`,
    width: '100%',
    boxSizing: 'border-box' as const
  },
  cardFooter: {
    padding: `${spacing[4]} ${spacing[6]}`,
    backgroundColor: colors.gray[50],
    borderTop: `1px solid ${colors.gray[200]}`,
    textAlign: 'center' as const,
    fontSize: fontSizes.sm,
    color: colors.gray[500]
  }
};

export const formStyles = {
  form: {
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[4]
  },
  formGroup: {
    marginBottom: spacing[4],
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const
  },
  label: {
    display: 'block',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.gray[700],
    marginBottom: spacing[1]
  },
  input: {
    width: '100%',
    padding: `${spacing[2]} ${spacing[3]}`,
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
    fontSize: fontSizes.sm,
    boxSizing: 'border-box' as const
  },
  formRow: {
    marginBottom: spacing[6],
    width: '100%'
  }
};

export const alertStyles = {
  error: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.red[50],
    border: `1px solid ${colors.red[100]}`,
    borderRadius: borderRadius.md,
    color: colors.red[700],
    fontSize: fontSizes.sm
  },
  success: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.green[50],
    border: `1px solid ${colors.green[100]}`,
    borderRadius: borderRadius.md,
    color: colors.green[700],
    fontSize: fontSizes.sm
  },
  info: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.blue[50],
    border: `1px solid ${colors.blue[100]}`,
    borderRadius: borderRadius.md,
    color: colors.blue[700],
    fontSize: fontSizes.sm
  }
};