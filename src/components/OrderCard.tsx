import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Event, Order } from '@/data/types';
import { tituloEvento } from '@/store/selectors';
import { colors, radius, spacing } from '@/theme';
import { formatFechaCorta } from '@/utils/format';
import { AppText } from './AppText';
import { PaymentBadge } from './PaymentBadge';

export type OrderCardProps = {
  orden: Order;
  evento?: Event;
  onPress: () => void;
};

export function OrderCard({ orden, evento, onPress }: OrderCardProps) {
  const titulo = evento ? tituloEvento(evento) : 'Evento';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ${orden.zona}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icono}>
        <Ionicons name="ticket-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <AppText weight="bold" numberOfLines={2}>
          {titulo}
        </AppText>
        <AppText variant="small" color={colors.textSecondary}>
          {evento ? `${formatFechaCorta(evento.fechaISO)} · ` : ''}
          {orden.zona}
        </AppText>
        <PaymentBadge orden={orden} style={styles.badge} />
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
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
    padding: spacing.lg,
  },
  pressed: { backgroundColor: colors.bg },
  icono: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  body: { flex: 1, gap: 2 },
  badge: { marginTop: spacing.xs },
});
