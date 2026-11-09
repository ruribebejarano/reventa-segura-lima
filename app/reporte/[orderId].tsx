import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Button, Card, ResultIcon, Screen, TextField } from '@/components';
import { useOrden } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { formatSoles } from '@/utils/format';

const MOTIVOS = ['Mi QR no funcionó en la puerta', 'No me dejaron ingresar', 'Otro'] as const;
type Motivo = (typeof MOTIVOS)[number];

export default function Reporte() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orden = useOrden(orderId);
  const reportarProblema = useAppStore((s) => s.reportarProblema);
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  const [motivo, setMotivo] = useState<Motivo>();
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    registrarEvento('vista', 'reporte');
  }, [registrarEvento]);

  const irAEntradas = () => {
    router.dismissAll();
    router.navigate('/entradas' as Href);
  };
  const volver = () => (router.canGoBack() ? router.back() : irAEntradas());

  if (!orden) {
    return (
      <Screen header={<AppHeader title="Reportar un problema" onBack={volver} />}>
        <AppText color={colors.textSecondary}>No encontramos esta entrada.</AppText>
      </Screen>
    );
  }

  const monto = formatSoles(orden.total);
  const enviado = orden.estadoPago === 'reembolso_en_proceso' || orden.estadoPago === 'reembolsado';

  // ---------- Confirmación del reembolso (se actualiza sola a los 4 s desde el store) ----------
  if (enviado) {
    const listo = orden.estadoPago === 'reembolsado';
    return (
      <Screen
        header={<AppHeader title="Reporte enviado" showBack={false} />}
        contentStyle={styles.confirmacion}
        footer={<Button title="Ver mis entradas" onPress={irAEntradas} />}>
        {listo ? (
          <ResultIcon ok size={72} />
        ) : (
          <View style={styles.esperando}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <AppText variant="title" align="center" accessibilityLiveRegion="polite">
          {listo ? 'Reembolsado ✓' : 'Reembolso en proceso'}
        </AppText>
        <AppText color={colors.textSecondary} align="center">
          {listo
            ? `Devolvimos ${monto} a tu método de pago.`
            : `Te devolveremos ${monto} a tu método de pago.`}
        </AppText>
      </Screen>
    );
  }

  // Solo se puede reportar mientras el pago sigue retenido.
  if (orden.estadoPago !== 'retenido') {
    return (
      <Screen header={<AppHeader title="Reportar un problema" onBack={volver} />}>
        <AppText color={colors.textSecondary}>
          Ya ingresaste a este evento y el pago se liberó al vendedor.
        </AppText>
      </Screen>
    );
  }

  // ---------- Formulario ----------
  const enviar = () => {
    if (!motivo) return;
    registrarEvento('reporte_enviado', 'reporte');
    reportarProblema(orden.id);
  };

  return (
    <Screen
      scroll
      header={<AppHeader title="Reportar un problema" onBack={volver} />}
      contentStyle={styles.content}
      footer={<Button title="Enviar reporte" onPress={enviar} disabled={!motivo} />}>
      <View style={styles.intro}>
        <AppText variant="h2">¿Qué pasó en la puerta?</AppText>
        <AppText variant="small" color={colors.textSecondary}>
          {`Si no pudiste entrar, te devolvemos ${monto}.`}
        </AppText>
      </View>

      <Card style={styles.opciones}>
        {MOTIVOS.map((m, i) => {
          const activo = motivo === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMotivo(m)}
              accessibilityRole="radio"
              accessibilityState={{ checked: activo }}
              accessibilityLabel={m}
              style={[styles.opcion, i > 0 && styles.opcionBorde]}>
              <Ionicons
                name={activo ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={activo ? colors.primary : colors.textSecondary}
              />
              <AppText style={styles.flex}>{m}</AppText>
            </Pressable>
          );
        })}
      </Card>

      <TextField
        label="Comentario (opcional)"
        placeholder="Cuéntanos qué pasó"
        value={comentario}
        onChangeText={setComentario}
        multiline
        maxLength={300}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  intro: { gap: spacing.xs },
  opciones: { paddingVertical: spacing.xs },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  opcionBorde: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1 },
  confirmacion: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  esperando: {
    width: 72 * 1.4,
    height: 72 * 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
