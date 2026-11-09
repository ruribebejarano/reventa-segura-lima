import type { TextStyle } from 'react-native';

export const colors = {
  primary: '#2A9D8F',
  primarySoft: '#E3F2EF',
  accent: '#E76F51',
  accentSoft: '#FDE4DD',
  navy: '#1B263B',
  navyDeep: '#14213D',
  textSecondary: '#5C677D',
  success: '#2E9E5B',
  danger: '#B23A1E',
  warningText: '#8A5A00',
  warningBg: '#FFF4D6',
  infoBg: '#CFE3F0',
  bg: '#F4F6F9',
  surface: '#FFFFFF',
  border: '#E3E8EF',
  white: '#FFFFFF',
  /**
   * Tonos oscuros SOLO para texto pequeño sobre fondos claros (contraste AA ≥ 4,5:1).
   * Los colores de marca de arriba se mantienen para fondos, íconos y bordes.
   */
  primaryText: '#1D7468',
  successText: '#237A46',
  accentText: '#A8432A',
  /** Fondo del botón principal: naranja más oscuro para que el texto blanco cumpla AA (4,75:1). */
  accentStrong: '#C24E2F',
  /** Fondo exterior en web (alrededor del "celular"). */
  webOuter: '#E9EEF3',
} as const;

/** Nombres de familia registrados en el layout raíz con useFonts. */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export const radius = {
  card: 12,
  button: 12,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const theme = { colors, fonts, typography, radius, spacing } as const;
export type Theme = typeof theme;
