import type { StyleProp, ViewStyle } from 'react-native';

import type { Order } from '@/data/types';
import { formatSoles } from '@/utils/format';
import { Badge, type BadgeVariant } from './Badge';

/** Variante y texto del estado del pago de una orden. */
export function estadoPagoBadge(orden: Pick<Order, 'estadoPago' | 'total'>): { variant: BadgeVariant; label: string } {
  switch (orden.estadoPago) {
    case 'retenido':
      return { variant: 'retenido', label: 'Pago retenido' };
    case 'liberado':
      return { variant: 'liberado', label: 'Pago liberado' };
    case 'reembolso_en_proceso':
      return { variant: 'reembolso_proceso', label: 'Reembolso en proceso' };
    case 'reembolsado':
      return { variant: 'reembolsado', label: `Reembolsado ${formatSoles(orden.total)}` };
  }
}

export function PaymentBadge({ orden, style }: { orden: Pick<Order, 'estadoPago' | 'total'>; style?: StyleProp<ViewStyle> }) {
  const { variant, label } = estadoPagoBadge(orden);
  return <Badge variant={variant} label={label} style={style} />;
}
