import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Listing } from '@/data/types';
import { colors, radius, spacing } from '@/theme';
import { formatSoles } from '@/utils/format';
import { AppText } from './AppText';

export type OfferCardProps = {
  oferta: Listing;
  selected?: boolean;
  onPress?: () => void;
};

/** "(+S/ 70)", "(sin recargo)" o "(−S/ 10)" respecto del precio original. */
export function diferenciaOriginal(precio: number, original: number): string {
  const d = precio - original;
  if (d === 0) return 'sin recargo';
  return `${d > 0 ? '+' : '−'}${formatSoles(Math.abs(d))}`;
}

export function OfferCard({ oferta, selected = false, onPress }: OfferCardProps) {
  const { zona, precio, precioOriginal, vendedor } = oferta;
  const ventas = vendedor.ventas === 1 ? '1 venta' : `${vendedor.ventas} ventas`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${zona}, ${formatSoles(precio)}`}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && !selected && styles.pressed]}>
      <View style={styles.body}>
        <AppText weight="bold">
          {zona} · {formatSoles(precio)}
        </AppText>
        <AppText variant="small" color={colors.textSecondary}>
          Original {formatSoles(precioOriginal)} ({diferenciaOriginal(precio, precioOriginal)})
        </AppText>
        <View style={styles.linea}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <AppText variant="small" weight="semibold" color={colors.success}>
            Verificable
          </AppText>
        </View>
        <AppText variant="caption" color={colors.textSecondary}>
          {vendedor.dniVerificado ? 'Vendedor con DNI' : 'Vendedor'} · {ventas}
        </AppText>
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? colors.primary : colors.border}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    // Con borde de 1 px dejamos 1 px extra de padding para que la tarjeta no "salte" al seleccionarla.
    padding: spacing.lg + 1,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.lg,
  },
  pressed: { backgroundColor: colors.bg },
  body: { flex: 1, gap: 2 },
  linea: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
});
