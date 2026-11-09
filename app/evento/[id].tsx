import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader, AppText, Button, Chip, InfoBox, OfferCard, Screen } from '@/components';
import { calcularTope } from '@/data/rules';
import type { Zona } from '@/data/types';
import { tituloEvento, useEvento, useOfertasPorEvento } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { formatFechaCorta, formatHora, formatSoles } from '@/utils/format';

const TODAS = 'Todas';

/** Precio original y tope de una zona: la base de la transparencia de precios. */
function TopeZona({ zona }: { zona: Zona }) {
  return (
    <View style={styles.topeFila}>
      <AppText variant="small" weight="semibold">
        {zona.nombre} · Original: {formatSoles(zona.precioOriginal)}
      </AppText>
      <AppText variant="small" color={colors.textSecondary}>
        Tope de reventa: {formatSoles(calcularTope(zona.precioOriginal))}
      </AppText>
    </View>
  );
}

export default function Evento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const evento = useEvento(id);
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  const [zona, setZona] = useState<string>(TODAS);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const ofertas = useOfertasPorEvento(id, zona === TODAS ? undefined : zona);
  const elegida = ofertas.find((o) => o.id === seleccion);

  useEffect(() => {
    registrarEvento('vista', 'ofertas');
  }, [registrarEvento]);

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));

  if (!evento) {
    return (
      <Screen header={<AppHeader title="Evento" onBack={volver} />}>
        <AppText color={colors.textSecondary}>No encontramos este evento.</AppText>
      </Screen>
    );
  }

  const variasZonas = evento.zonas.length > 1;
  const zonasInfo = zona === TODAS ? evento.zonas : evento.zonas.filter((z) => z.nombre === zona);

  const filtrar = (z: string) => {
    setZona(z);
    // Si la entrada elegida no pertenece a la nueva zona, se deselecciona.
    if (z !== TODAS && elegida && elegida.zona !== z) setSeleccion(null);
  };

  const continuar = () => {
    if (!elegida) return;
    router.push({ pathname: '/oferta/[id]', params: { id: elegida.id } });
  };

  return (
    <Screen
      scroll
      header={<AppHeader title={tituloEvento(evento)} onBack={volver} />}
      contentStyle={styles.content}
      footer={
        <Button
          title={elegida ? `Elegir ${elegida.zona} · ${formatSoles(elegida.precio)}` : 'Elige una entrada'}
          disabled={!elegida}
          onPress={continuar}
        />
      }>
      <AppText variant="small" color={colors.textSecondary}>
        {evento.recinto} · {formatFechaCorta(evento.fechaISO)} · {formatHora(evento.fechaISO)}
      </AppText>

      <View style={styles.tope}>
        <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
        <View style={styles.topeLista}>
          {zonasInfo.map((z) => (
            <TopeZona key={z.nombre} zona={z} />
          ))}
        </View>
      </View>

      {evento.estadoVenta === 'venta_general' ? (
        <InfoBox variant="info" icon="information-circle">
          Aún hay entradas en la ticketera oficial
        </InfoBox>
      ) : null}

      {variasZonas ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}>
          {[TODAS, ...evento.zonas.map((z) => z.nombre)].map((z) => (
            <Chip key={z} label={z} selected={zona === z} onPress={() => filtrar(z)} />
          ))}
        </ScrollView>
      ) : null}

      {ofertas.length > 0 ? (
        <View style={styles.lista} accessibilityRole="radiogroup">
          {ofertas.map((o) => (
            <OfferCard key={o.id} oferta={o} selected={o.id === seleccion} onPress={() => setSeleccion(o.id)} />
          ))}
        </View>
      ) : (
        <AppText color={colors.textSecondary} align="center" style={styles.vacio}>
          No hay entradas en reventa para esta zona.
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  tope: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.primarySoft,
  },
  topeLista: { flex: 1, gap: spacing.md },
  topeFila: { gap: 2 },
  chipsScroll: { marginHorizontal: -spacing.lg, flexGrow: 0 },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  lista: { gap: spacing.md },
  vacio: { paddingVertical: spacing.xxl },
});
