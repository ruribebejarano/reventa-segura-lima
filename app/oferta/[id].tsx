import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Button, Card, InfoBox, Screen } from '@/components';
import { tituloEvento, useEvento, useOferta } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { formatFechaCorta, formatSoles } from '@/utils/format';

export default function DetalleOferta() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const oferta = useOferta(id);
  const evento = useEvento(oferta?.eventId ?? '');
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  useEffect(() => {
    registrarEvento('vista', 'detalle');
  }, [registrarEvento]);

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));
  const header = <AppHeader title="Detalle de la entrada" onBack={volver} />;

  if (!oferta || !evento) {
    return (
      <Screen header={header}>
        <AppText color={colors.textSecondary}>No encontramos esta entrada.</AppText>
      </Screen>
    );
  }

  const disponible = oferta.estado === 'disponible';
  const dentroDelTope = oferta.precio <= oferta.tope;
  const { vendedor } = oferta;

  const verificar = () => {
    registrarEvento('tap_verificar', 'detalle');
    router.push({ pathname: '/verificacion/[id]', params: { id: oferta.id } });
  };

  return (
    <Screen
      scroll
      header={header}
      contentStyle={styles.content}
      footer={
        <Button
          title={disponible ? 'Verificar antes de pagar' : 'Esta entrada ya se vendió'}
          icon={disponible ? 'shield-checkmark-outline' : undefined}
          disabled={!disponible}
          onPress={verificar}
        />
      }>
      {/* Entrada y precio */}
      <Card style={styles.principal}>
        <View style={styles.bloque}>
          <AppText variant="title">{oferta.zona}</AppText>
          <AppText variant="small" color={colors.textSecondary}>
            {tituloEvento(evento)} · {formatFechaCorta(evento.fechaISO)} · {evento.recinto}
          </AppText>
        </View>

        <View style={styles.separador} />

        <View style={styles.bloque}>
          <AppText variant="small" color={colors.textSecondary}>
            Precio de reventa
          </AppText>
          <AppText weight="bold" color={colors.navy} style={styles.precio}>
            {formatSoles(oferta.precio)}
          </AppText>
          <View style={styles.fila}>
            <Ionicons
              name={dentroDelTope ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={dentroDelTope ? colors.success : colors.danger}
            />
            <AppText variant="small" weight="semibold" color={dentroDelTope ? colors.successText : colors.danger}>
              Original {formatSoles(oferta.precioOriginal)} · {dentroDelTope ? 'dentro del tope' : 'supera el tope'}
            </AppText>
          </View>
        </View>
      </Card>

      {/* Vendedor */}
      <Card style={styles.vendedor}>
        <View style={styles.avatar}>
          <AppText variant="h2" color={colors.primaryText}>
            {vendedor.nombre.charAt(0).toUpperCase()}
          </AppText>
        </View>
        <View style={styles.vendedorInfo}>
          <AppText weight="semibold">{vendedor.nombre}</AppText>
          {vendedor.dniVerificado ? (
            <View style={styles.fila}>
              <AppText variant="small" weight="semibold" color={colors.successText}>
                DNI verificado
              </AppText>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            </View>
          ) : null}
          <AppText variant="small" color={colors.textSecondary}>
            {vendedor.ventas === 1 ? '1 venta completada' : `${vendedor.ventas} ventas completadas`}
          </AppText>
        </View>
      </Card>

      <InfoBox icon="lock-closed-outline">
        Antes de pagar, comprobamos esta entrada con la ticketera oficial. No pagas nada hasta ver el resultado.
      </InfoBox>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  principal: { gap: spacing.lg },
  bloque: { gap: spacing.xs },
  separador: { height: 1, backgroundColor: colors.border },
  precio: { fontSize: 32, lineHeight: 38 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  vendedor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendedorInfo: { flex: 1, gap: 2 },
});
