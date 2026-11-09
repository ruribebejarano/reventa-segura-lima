import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Card, Screen } from '@/components';
import { TARIFA_GARANTIA } from '@/data/rules';
import { colors, spacing } from '@/theme';
import { formatSoles } from '@/utils/format';

const PREGUNTAS = [
  {
    pregunta: '¿Cómo verifican la entrada?',
    respuesta:
      'Antes de que pagues, consultamos con la ticketera oficial que la entrada sea auténtica y que nunca se haya usado. Si todo está bien, la ticketera anula el QR del vendedor y emite uno nuevo a tu nombre y DNI.',
  },
  {
    pregunta: '¿Qué cubre la garantía?',
    respuesta: `Tu pago queda retenido y recién se libera al vendedor cuando ingresas al evento. Si no puedes entrar por un problema con la entrada, te devolvemos el 100 %. La tarifa de garantía es de ${formatSoles(TARIFA_GARANTIA)} por compra.`,
  },
  {
    pregunta: '¿Cómo pido un reembolso?',
    respuesta:
      'En Mis entradas, abre tu entrada y toca "Reportar un problema de ingreso". Cuéntanos qué pasó y te devolvemos el dinero a tu método de pago.',
  },
];

function Pregunta({ pregunta, respuesta, separada }: { pregunta: string; respuesta: string; separada: boolean }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <View style={[styles.item, separada && styles.borde]}>
      <Pressable
        onPress={() => setAbierta((a) => !a)}
        accessibilityRole="button"
        accessibilityState={{ expanded: abierta }}
        style={styles.pregunta}>
        <AppText weight="semibold" style={styles.flex}>
          {pregunta}
        </AppText>
        <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
      </Pressable>
      {abierta ? (
        <AppText variant="small" color={colors.textSecondary}>
          {respuesta}
        </AppText>
      ) : null}
    </View>
  );
}

export default function Ayuda() {
  return (
    <Screen scroll header={<AppHeader title="Ayuda y garantía" onBack={() => router.back()} />} contentStyle={styles.content}>
      <AppText variant="h2">Preguntas frecuentes</AppText>
      <Card style={styles.lista}>
        {PREGUNTAS.map((p, i) => (
          <Pregunta key={p.pregunta} {...p} separada={i > 0} />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  lista: { paddingVertical: 0 },
  item: { paddingVertical: spacing.md, gap: spacing.sm },
  borde: { borderTopWidth: 1, borderTopColor: colors.border },
  pregunta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 32 },
  flex: { flex: 1 },
});
