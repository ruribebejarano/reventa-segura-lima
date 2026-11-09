import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export type BadgeVariant =
  | 'agotado'
  | 'verificado'
  | 'retenido'
  | 'liberado'
  | 'reembolsado'
  | 'reembolso_proceso'
  | 'error'
  | 'neutro';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Verde muy suave derivado de success (#2E9E5B) para fondos de píldora. */
const successSoft = '#E3F4EA';

const config: Record<BadgeVariant, { bg: string; fg: string; label: string; icon?: IconName }> = {
  agotado: { bg: colors.accentSoft, fg: colors.accentText, label: 'Agotado' },
  verificado: { bg: successSoft, fg: colors.successText, label: 'Verificada', icon: 'checkmark-circle' },
  retenido: { bg: colors.warningBg, fg: colors.warningText, label: 'Pago retenido', icon: 'lock-closed' },
  liberado: { bg: successSoft, fg: colors.successText, label: 'Pago liberado', icon: 'checkmark-done' },
  reembolsado: { bg: colors.infoBg, fg: colors.navy, label: 'Reembolsado', icon: 'arrow-undo' },
  reembolso_proceso: { bg: colors.infoBg, fg: colors.navy, label: 'Reembolso en proceso', icon: 'time-outline' },
  error: { bg: colors.accentSoft, fg: colors.danger, label: 'Error', icon: 'alert-circle' },
  neutro: { bg: colors.border, fg: colors.textSecondary, label: 'Info' },
};

export type BadgeProps = {
  variant: BadgeVariant;
  /** Texto opcional; por defecto el de la variante. */
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ variant, label, style }: BadgeProps) {
  const c = config[variant];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }, style]}>
      {c.icon ? <Ionicons name={c.icon} size={14} color={c.fg} /> : null}
      <AppText variant="caption" weight="semibold" color={c.fg}>
        {label ?? c.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
