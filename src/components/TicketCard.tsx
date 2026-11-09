import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import type { Event, Order } from '@/data/types';
import { tituloEvento } from '@/store/selectors';
import { colors, radius, spacing } from '@/theme';
import { formatFechaCorta, formatHora } from '@/utils/format';
import { AppText } from './AppText';

export type TicketCardProps = {
  evento: Event;
  orden: Order;
  qrSize?: number;
  /** Si se indica, el QR se atenúa y lleva este sello encima (p. ej. "Usada", "Anulada"). */
  sello?: string;
};

const MUESCA = 22;

/** Entrada con aspecto de ticket: datos del evento, línea punteada con muescas y el QR nominal. */
export function TicketCard({ evento, orden, qrSize = 200, sello }: TicketCardProps) {
  return (
    <View style={styles.ticket}>
      <View style={styles.parteSuperior}>
        <AppText variant="h2">{tituloEvento(evento)}</AppText>
        <AppText variant="small" color={colors.textSecondary}>
          {formatFechaCorta(evento.fechaISO)} · {formatHora(evento.fechaISO)}
        </AppText>
        <AppText variant="small" color={colors.textSecondary}>
          {evento.recinto}
        </AppText>
      </View>

      {/* Recorte decorativo: muescas a los lados y línea punteada. */}
      <View style={styles.corte}>
        <View style={[styles.muesca, styles.muescaIzq]} />
        <View style={styles.punteada} />
        <View style={[styles.muesca, styles.muescaDer]} />
      </View>

      <View style={styles.parteInferior}>
        <View
          style={styles.qr}
          accessible
          accessibilityLabel={`Código QR de la entrada ${orden.qr}${sello ? `, ${sello}` : ''}`}>
          <View style={sello ? styles.qrAtenuado : undefined}>
            <QRCode value={orden.qr} size={qrSize} color={colors.navyDeep} backgroundColor={colors.surface} />
          </View>
          {sello ? (
            <View style={styles.selloWrap} pointerEvents="none">
              <View style={styles.sello}>
                <AppText variant="h2" weight="bold" color={colors.danger}>
                  {sello.toUpperCase()}
                </AppText>
              </View>
            </View>
          ) : null}
        </View>
        <AppText variant="small" weight="semibold" align="center">
          {orden.titular} · DNI {orden.dniMasked} · {orden.zona}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary} align="center">
          {orden.qr}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    // Recorta la mitad exterior de las muescas: queda un semicírculo "mordido" en cada lado.
    overflow: 'hidden',
  },
  parteSuperior: { padding: spacing.lg, paddingBottom: spacing.md, gap: 2 },
  corte: { height: MUESCA, justifyContent: 'center' },
  punteada: {
    marginHorizontal: MUESCA / 2 + spacing.sm,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  muesca: {
    position: 'absolute',
    width: MUESCA,
    height: MUESCA,
    borderRadius: MUESCA / 2,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Se desplazan media muesca hacia fuera (más el borde) para "morder" el ticket.
  muescaIzq: { left: -MUESCA / 2 - 1 },
  muescaDer: { right: -MUESCA / 2 - 1 },
  parteInferior: { padding: spacing.lg, paddingTop: spacing.md, alignItems: 'center', gap: spacing.sm },
  qr: { padding: spacing.sm, backgroundColor: colors.surface },
  qrAtenuado: { opacity: 0.2 },
  selloWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sello: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderWidth: 3,
    borderColor: colors.danger,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    transform: [{ rotate: '-12deg' }],
  },
});
