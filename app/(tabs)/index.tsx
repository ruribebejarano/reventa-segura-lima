import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader, AppText, EventCard, InfoBox, Screen, SearchBar } from '@/components';
import { useConteoOfertas, useEventosFiltrados } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

export default function Inicio() {
  const [busqueda, setBusqueda] = useState('');
  const eventos = useEventosFiltrados(busqueda);
  const conteo = useConteoOfertas();
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  useEffect(() => {
    registrarEvento('vista', 'inicio');
  }, [registrarEvento]);

  return (
    <Screen header={<AppHeader />} scroll bottomInset={false} contentStyle={styles.content}>
      <SearchBar value={busqueda} onChangeText={setBusqueda} placeholder="Buscar concierto o artista" />

      <InfoBox title="¿Te quedaste sin entrada?">
        Aquí solo se venden entradas comprobadas con la ticketera oficial.
      </InfoBox>

      {eventos.length > 0 ? (
        <View style={styles.lista}>
          {eventos.map((e) => (
            <EventCard
              key={e.id}
              evento={e}
              ofertas={conteo[e.id] ?? 0}
              onPress={() => router.push({ pathname: '/evento/[id]', params: { id: e.id } })}
            />
          ))}
        </View>
      ) : (
        <AppText color={colors.textSecondary} align="center" style={styles.vacio}>
          No encontramos ese concierto. Prueba con otro nombre.
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  lista: { gap: spacing.lg },
  vacio: { paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
});
