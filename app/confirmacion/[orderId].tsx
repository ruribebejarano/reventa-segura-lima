import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Button, Card, CheckItem, ResultIcon, Screen, TicketCard } from '@/components';
import { useEvento, useOrden } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

/** Vuelve a las pestañas (cerrando la confirmación) y abre la indicada. */
function irA(ruta: Href) {
  router.dismissAll();
  router.navigate(ruta);
}

export default function Confirmacion() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orden = useOrden(orderId);
  const evento = useEvento(orden?.eventId ?? '');
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  useEffect(() => {
    registrarEvento('vista', 'confirmacion');
  }, [registrarEvento]);

  const header = <AppHeader title="Entrada confirmada" showBack={false} />;
  const volverInicio = () => irA('/' as Href);

  if (!orden || !evento) {
    return (
      <Screen header={header} footer={<Button title="Volver al inicio" onPress={volverInicio} />}>
        <AppText color={colors.textSecondary}>No encontramos esta compra.</AppText>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      header={header}
      contentStyle={styles.content}
      footer={
        <>
          <Button title="Ver mis entradas" icon="ticket-outline" onPress={() => irA('/entradas')} />
          <Button title="Volver al inicio" variant="secondary" onPress={volverInicio} />
        </>
      }>
      <View style={styles.cabecera}>
        <ResultIcon ok size={72} />
        <AppText variant="title" align="center">
          ¡Listo! Tu entrada está a tu nombre
        </AppText>
      </View>

      <TicketCard evento={evento} orden={orden} />

      <Card style={styles.estados}>
        <CheckItem text="Pago retenido" />
        <CheckItem text="Entrada emitida a tu nombre" />
        <View style={styles.pendiente}>
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
          <AppText variant="small" color={colors.textSecondary} style={styles.flex}>
            Al ingresar se paga al vendedor
          </AppText>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  cabecera: { alignItems: 'center', gap: spacing.xs },
  estados: { gap: spacing.xs },
  pendiente: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.xs },
  flex: { flex: 1 },
});
