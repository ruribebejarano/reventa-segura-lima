import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export type InfoBoxVariant = 'primary' | 'info';

export type InfoBoxProps = {
  /** primary = #E3F2EF (verde suave), info = #CFE3F0 (azul suave). */
  variant?: InfoBoxVariant;
  title?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const bg: Record<InfoBoxVariant, string> = {
  primary: colors.primarySoft,
  info: colors.infoBg,
};

/** Textos y números sueltos (o listas de ellos) deben ir dentro de <Text> en React Native. */
function esTexto(node: ReactNode): boolean {
  if (typeof node === 'string' || typeof node === 'number') return true;
  return Array.isArray(node) && node.every((n) => n == null || typeof n === 'string' || typeof n === 'number');
}

export function InfoBox({ variant = 'primary', title, icon, children, style }: InfoBoxProps) {
  const iconColor = variant === 'primary' ? colors.primary : colors.navy;
  return (
    <View style={[styles.box, { backgroundColor: bg[variant] }, style]}>
      {icon ? <Ionicons name={icon} size={20} color={iconColor} /> : null}
      <View style={styles.body}>
        {title ? (
          <AppText variant="small" weight="bold">
            {title}
          </AppText>
        ) : null}
        {esTexto(children) ? <AppText variant="small">{children}</AppText> : children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
  },
  body: { flex: 1, gap: spacing.xs },
});
