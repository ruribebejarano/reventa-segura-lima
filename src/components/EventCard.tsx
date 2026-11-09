import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import type { Event } from '@/data/types';
import { tituloEvento } from '@/store/selectors';
import { colors, spacing } from '@/theme';
import { formatFechaCorta } from '@/utils/format';
import { AppText } from './AppText';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export type EventCardProps = {
  evento: Event;
  /** Ofertas disponibles en reventa para este evento. */
  ofertas: number;
  onPress: () => void;
};

export function EventCard({ evento, ofertas, onPress }: EventCardProps) {
  const agotada = evento.estadoVenta === 'preventa_agotada';

  return (
    <Card style={styles.card}>
      <View style={styles.info}>
        <AppText variant="h2" style={styles.titulo}>
          {tituloEvento(evento)}
        </AppText>
        <AppText variant="small" color={colors.textSecondary}>
          {evento.recinto} · {formatFechaCorta(evento.fechaISO)}
        </AppText>
      </View>

      <Badge variant={agotada ? 'agotado' : 'neutro'} label={agotada ? 'Preventa agotada' : 'Venta general'} />

      {ofertas > 0 ? (
        <View style={styles.verificables}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <AppText variant="small" weight="semibold" color={colors.success}>
            {ofertas === 1 ? '1 entrada verificable' : `${ofertas} entradas verificables`}
          </AppText>
        </View>
      ) : (
        <AppText variant="small" color={colors.textSecondary}>
          Aún no hay entradas en reventa
        </AppText>
      )}

      <Button title="Ver entradas en reventa" onPress={onPress} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  info: { gap: spacing.xs },
  titulo: { fontSize: 18, lineHeight: 24 },
  verificables: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
});
