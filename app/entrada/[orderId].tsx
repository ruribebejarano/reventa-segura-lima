import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import {
  AppHeader,
  AppText,
  Button,
  Card,
  InfoBox,
  PaymentBadge,
  Screen,
  TicketCard,
  Timeline,
  type Hito,
} from '@/components';
import { SEED_USER } from '@/data/seed';
import type { Order } from '@/data/types';
import { useEvento, useOrden } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';
import { formatSoles } from '@/utils/format';

/** Línea de tiempo de la garantía según el estado de la orden. */
function hitosDe(o: Order): Hito[] {
  const base: Hito[] = [
    { titulo: 'Pagado', detalle: `${formatSoles(o.total)} retenidos por Reventa Verificada`, estado: 'hecho' },
    { titulo: 'Entrada emitida a tu nombre', detalle: `${o.titular} · DNI ${o.dniMasked}`, estado: 'hecho' },
  ];

  switch (o.estadoPago) {
    case 'retenido':
      return [
        ...base,
        { titulo: 'Ingreso al evento', detalle: 'Muestra este QR en la puerta', estado: 'actual' },
        { titulo: 'Pago al vendedor', detalle: 'Se libera cuando ingreses', estado: 'pendiente' },
      ];
    case 'liberado':
      return [
        ...base,
        { titulo: 'Ingreso al evento', estado: 'hecho' },
        { titulo: 'Pago al vendedor', detalle: 'El vendedor recibió el pago', estado: 'hecho' },
      ];
    case 'reembolso_en_proceso':
      return [
        ...base,
        { titulo: 'Problema de ingreso reportado', estado: 'hecho' },
        { titulo: 'Reembolso en proceso', detalle: `Te devolveremos ${formatSoles(o.total)}`, estado: 'actual' },
      ];
    case 'reembolsado':
      return [
        ...base,
        { titulo: 'Problema de ingreso reportado', estado: 'hecho' },
        { titulo: 'Reembolsado', detalle: `Devolvimos ${formatSoles(o.total)} a tu método de pago`, estado: 'hecho' },
      ];
  }
}

export default function DetalleEntrada() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orden = useOrden(orderId);
  const evento = useEvento(orden?.eventId ?? '');
  const modoPrueba = useAppStore((s) => s.modoPrueba);
  const esDemo = useAppStore((s) => s.user?.id === SEED_USER.id);
  const simularIngreso = useAppStore((s) => s.simularIngreso);
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  useEffect(() => {
    registrarEvento('vista', 'entrada');
  }, [registrarEvento]);

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/entradas' as Href));
  const header = <AppHeader title="Tu entrada" onBack={volver} />;

  if (!orden || !evento) {
    return (
      <Screen header={header}>
        <AppText color={colors.textSecondary}>No encontramos esta entrada.</AppText>
      </Screen>
    );
  }

  const vigente = orden.estadoPago === 'retenido';
  const sello = orden.estadoEntrada === 'usada' ? 'Usada' : orden.estadoEntrada === 'anulada' ? 'Anulada' : undefined;

  const reportar = () => {
    registrarEvento('tap_reportar', 'entrada');
    router.push({ pathname: '/reporte/[orderId]', params: { orderId: orden.id } });
  };

  const simular = () => {
    registrarEvento('simular_ingreso', 'entrada');
    simularIngreso(orden.id);
  };

  return (
    <Screen
      scroll
      header={header}
      contentStyle={styles.content}
      footer={
        vigente ? (
          <>
            <Button title="Reportar un problema de ingreso" variant="secondary" icon="alert-circle-outline" onPress={reportar} />
            {modoPrueba || esDemo ? (
              <Button title="Simular ingreso al evento" variant="ghost" onPress={simular} style={styles.discreto} />
            ) : null}
          </>
        ) : undefined
      }>
      <PaymentBadge orden={orden} style={styles.estado} />

      <TicketCard evento={evento} orden={orden} qrSize={220} sello={sello} />

      {vigente ? (
        <InfoBox icon="shield-checkmark">{'Si no entras, te devolvemos el 100 %.'}</InfoBox>
      ) : null}

      <Card style={styles.garantia}>
        <AppText weight="bold">Tu garantía</AppText>
        <Timeline hitos={hitosDe(orden)} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  estado: { alignSelf: 'center' },
  garantia: { gap: spacing.lg },
  discreto: { height: 40 },
});
