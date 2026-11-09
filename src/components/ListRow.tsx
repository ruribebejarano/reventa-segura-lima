import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

export type ListRowProps = {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  /** Elemento a la derecha (p. ej. un Switch). Si no hay, se muestra una flecha cuando hay onPress. */
  right?: ReactNode;
  /** Texto e ícono en rojo (acciones destructivas como cerrar sesión). */
  danger?: boolean;
  /** Dibuja una línea separadora arriba. */
  separada?: boolean;
};

/** Fila de lista con ícono, texto y flecha o control a la derecha. */
export function ListRow({ label, icon, onPress, right, danger = false, separada = false }: ListRowProps) {
  const color = danger ? colors.danger : colors.navy;
  const contenido = (
    <>
      <Ionicons name={icon} size={22} color={danger ? colors.danger : colors.primary} />
      <AppText style={styles.label} color={color}>
        {label}
      </AppText>
      {right ?? (onPress && !danger ? <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} /> : null)}
    </>
  );

  if (!onPress) return <View style={[styles.row, separada && styles.borde]}>{contenido}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, separada && styles.borde, pressed && styles.pressed]}>
      {contenido}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  borde: { borderTopWidth: 1, borderTopColor: colors.border },
  pressed: { backgroundColor: colors.bg },
  label: { flex: 1 },
});
