export const colors = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#0A84FF',
  primaryDark: '#0051D5',

  // Semantic
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',

  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  gray900: '#1a1a1a',
  gray800: '#2d2d2d',
  gray700: '#404040',
  gray600: '#666666',
  gray500: '#808080',
  gray400: '#999999',
  gray300: '#b3b3b3',
  gray200: '#cccccc',
  gray100: '#e5e5e5',
  gray50: '#f5f5f5',
  lightGray: '#f0f0f0',

  // Legacy (to be replaced)
  gainsboro: 'gainsboro',
  crimson: 'crimson',
  dimgray: 'dimgray',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const typography = {
  heading1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySemibold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  captionMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  captionSmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

export const theme = {
  colors,
  spacing,
  typography,
} as const;
