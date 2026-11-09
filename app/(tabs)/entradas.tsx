import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Button, OrderCard, Screen, SegmentedTabs } from '@/components';
import { useOrdenesPasadas, useOrdenesProximas } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

type Segmento = 'proximas' | 'pasadas';

export default function MisEntradas() {
  const [segmento, setSegmento] = useState<Segmento>('proximas');
  const proximas = useOrdenesProximas();
  const pasadas = useOrdenesPasadas();
  const events = useAppStore((s) => s.events);
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  // Las pestañas quedan montadas: registramos la vista cada vez que se enfocan.
  useFocusEffect(
    useCallback(() => {
      registrarEvento('vista', 'entradas');
    }, [registrarEvento]),
  );

  const lista = segmento === 'proximas' ? proximas : pasadas;
  const sinNinguna = proximas.length === 0 && pasadas.length === 0;
  const textoVacio = sinNinguna
    ? 'Aún no tienes entradas'
    : segmento === 'proximas'
      ? 'Aún no tienes entradas próximas'
      : 'Aún no tienes entradas pasadas';

  return (
    <Screen header={<AppHeader />} scroll bottomInset={false} contentStyle={styles.content}>
      <AppText variant="title">Mis entradas</AppText>

      <SegmentedTabs
        value={segmento}
        onChange={setSegmento}
        options={[
          { key: 'proximas', label: `Próximas${proximas.length ? ` (${proximas.length})` : ''}` },
          { key: 'pasadas', label: `Pasadas${pasadas.length ? ` (${pasadas.length})` : ''}` },
        ]}
      />

      {lista.length > 0 ? (
        <View style={styles.lista}>
          {lista.map((o) => (
            <OrderCard
              key={o.id}
              orden={o}
              evento={events.find((e) => e.id === o.eventId)}
              onPress={() => router.push({ pathname: '/entrada/[orderId]', params: { orderId: o.id } })}
            />
          ))}
        </View>
      ) : (
        <View style={styles.vacio}>
          <View style={styles.vacioIcono}>
            <Ionicons name="ticket-outline" size={32} color={colors.primary} />
          </View>
          <AppText variant="h2" align="center">
            {textoVacio}
          </AppText>
          {segmento === 'proximas' ? (
            <Button title="Buscar conciertos" icon="search" onPress={() => router.navigate('/' as Href)} />
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  lista: { gap: spacing.md },
  vacio: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xxl },
  vacioIcono: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
