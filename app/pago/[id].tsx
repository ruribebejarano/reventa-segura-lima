import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Button, Card, PriceRow, Screen } from '@/components';
import { TARIFA_GARANTIA } from '@/data/rules';
import { useOferta } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { formatSoles } from '@/utils/format';

const PROCESANDO_MS = 1500;

type Metodo = 'tarjeta' | 'yape';

const METODOS: { key: Metodo; label: string; icon: ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'tarjeta', label: 'Tarjeta •••• 4242', icon: 'card-outline' },
  { key: 'yape', label: 'Yape', icon: 'phone-portrait-outline' },
];

const PASOS_DINERO = [
  'Pagas: queda retenido',
  'Recibes la entrada a tu nombre',
  'Ingresas: recién se paga al vendedor',
];

export default function Pago() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const oferta = useOferta(id);
  const user = useAppStore((s) => s.user);
  const verificada = useAppStore((s) => s.verificadas.includes(id));
  const comprar = useAppStore((s) => s.comprar);
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  const [metodo, setMetodo] = useState<Metodo>('tarjeta');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    registrarEvento('vista', 'pago');
    return () => clearTimeout(timer.current);
  }, [registrarEvento]);

  // Sin verificación previa (o si la oferta ya no está a la venta) no se puede pagar.
  // Mientras se procesa no redirigimos: comprar() marca la oferta como vendida justo antes de navegar.
  if (!procesando && (!oferta || !verificada || oferta.estado !== 'disponible')) {
    return <Redirect href={{ pathname: '/oferta/[id]', params: { id } }} />;
  }
  if (!oferta) return null;

  const total = oferta.precio + TARIFA_GARANTIA;

  const pagar = () => {
    if (procesando) return;
    setError(undefined);
    setProcesando(true);
    timer.current = setTimeout(() => {
      const order = comprar(oferta.id);
      if (!order) {
        setProcesando(false);
        setError('No pudimos completar el pago. Esta entrada ya no está disponible.');
        return;
      }
      registrarEvento('pago_completado', 'pago');
      // Sacamos de la pila evento → oferta → verificación → pago: desde la confirmación no se vuelve a pagar.
      if (router.canDismiss()) router.dismissAll();
      router.push({ pathname: '/confirmacion/[orderId]', params: { orderId: order.id } });
    }, PROCESANDO_MS);
  };

  return (
    <Screen
      scroll
      header={<AppHeader title="Pago con garantía" onBack={procesando ? () => {} : undefined} />}
      contentStyle={styles.content}
      footer={
        <>
          {error ? (
            <AppText variant="small" color={colors.danger} align="center">
              {error}
            </AppText>
          ) : null}
          <Button
            title={`Pagar ${formatSoles(total)} con garantía`}
            icon="lock-closed"
            loading={procesando}
            loadingText="Procesando pago…"
            onPress={pagar}
          />
        </>
      }>
      {/* Resumen */}
      <Card style={styles.resumen}>
        <PriceRow label="Entrada" amount={oferta.precio} />
        <PriceRow label="Tarifa de garantía" amount={TARIFA_GARANTIA} />
        <View style={styles.separador} />
        <PriceRow label="Total" amount={total} total />
      </Card>

      {user ? (
        <View style={styles.titular}>
          <Ionicons name="person" size={18} color={colors.primary} />
          <AppText variant="small" style={styles.flex}>
            A nombre de: <AppText variant="small" weight="semibold">{user.nombre}</AppText> · DNI {user.dniMasked}
          </AppText>
        </View>
      ) : null}

      {/* Qué pasa con el dinero */}
      <Card style={styles.pasosCard}>
        <AppText weight="bold">¿Qué pasa con tu dinero?</AppText>
        {PASOS_DINERO.map((texto, i) => (
          <View key={texto} style={styles.paso}>
            <View style={styles.numero}>
              <AppText variant="small" weight="bold" color={colors.white}>
                {i + 1}
              </AppText>
            </View>
            <AppText variant="small" style={styles.flex}>
              {texto}
            </AppText>
          </View>
        ))}
      </Card>

      {/* Método de pago */}
      <View style={styles.metodos} accessibilityRole="radiogroup">
        <AppText weight="bold">Método de pago</AppText>
        {METODOS.map((m) => {
          const activo = metodo === m.key;
          return (
            <Pressable
              key={m.key}
              onPress={() => setMetodo(m.key)}
              disabled={procesando}
              accessibilityRole="radio"
              accessibilityState={{ checked: activo }}
              accessibilityLabel={m.label}
              style={[styles.metodo, activo && styles.metodoActivo]}>
              <Ionicons name={m.icon} size={22} color={colors.navy} />
              <AppText style={styles.flex}>{m.label}</AppText>
              <Ionicons
                name={activo ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={activo ? colors.primary : colors.border}
              />
            </Pressable>
          );
        })}
        <AppText variant="caption" color={colors.textSecondary}>
          Pago de demostración: no se realizará ningún cobro.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  flex: { flex: 1 },
  resumen: { gap: spacing.xs },
  separador: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  titular: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs },
  pasosCard: { gap: spacing.md },
  paso: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  numero: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metodos: { gap: spacing.sm },
  metodo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.lg + 1,
  },
  metodoActivo: { borderWidth: 2, borderColor: colors.primary, padding: spacing.lg },
});
