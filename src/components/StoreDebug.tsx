// TEMPORAL: panel para probar el store desde la galería de componentes.
import { StyleSheet, View } from 'react-native';

import {
  useEventosFiltrados,
  useOfertasPorEvento,
  useOrdenesPasadas,
  useOrdenesProximas,
} from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';

export function StoreDebug() {
  const user = useAppStore((s) => s.user);
  const modoPrueba = useAppStore((s) => s.modoPrueba);
  const nEventosTest = useAppStore((s) => s.testEvents.length);
  const confianza = useAppStore((s) => s.confianza);
  const { loginDemo, logout, comprar, simularIngreso, reportarProblema, resetDemo, publicarOferta } =
    useAppStore.getState();

  const busqueda = useEventosFiltrados('condores');
  const todos = useEventosFiltrados();
  const ofertasE1 = useOfertasPorEvento('e1');
  const campoA = useOfertasPorEvento('e1', 'Campo A');
  const proximas = useOrdenesProximas();
  const pasadas = useOrdenesPasadas();
  const ultima = proximas[0];

  const lineas = [
    `usuario: ${user ? `${user.nombre} ${user.dniMasked}` : '—'}`,
    `eventos: ${todos.map((e) => e.id).join(', ')} · "condores" → ${busqueda.map((e) => e.id).join(', ')}`,
    `ofertas e1: ${ofertasE1.length} · Campo A: ${campoA.map((l) => l.precio).join(', ')}`,
    `próximas: ${proximas.map((o) => `${o.id}:${o.estadoPago}`).join(', ') || '—'}`,
    `pasadas: ${pasadas.map((o) => `${o.id}:${o.estadoPago}/${o.estadoEntrada}`).join(', ')}`,
    `qr última: ${ultima?.qr ?? '—'}`,
    `modoPrueba: ${modoPrueba} · eventos test: ${nEventosTest} · confianza: ${JSON.stringify(confianza)}`,
  ];

  return (
    <Card style={styles.card}>
      {lineas.map((l) => (
        <AppText key={l} variant="caption" color={colors.navy}>
          {l}
        </AppText>
      ))}
      <View style={styles.row}>
        <Button variant="secondary" title={user ? 'Logout' : 'Login demo'} onPress={user ? logout : loginDemo} style={styles.btn} />
        <Button variant="secondary" title="Comprar más barata e1" onPress={() => ofertasE1[0] && comprar(ofertasE1[0].id)} style={styles.btn} />
      </View>
      <View style={styles.row}>
        <Button variant="secondary" title="Simular ingreso" disabled={!ultima} onPress={() => ultima && simularIngreso(ultima.id)} style={styles.btn} />
        <Button variant="secondary" title="Reportar problema" disabled={!ultima} onPress={() => ultima && reportarProblema(ultima.id)} style={styles.btn} />
      </View>
      <View style={styles.row}>
        <Button
          variant="secondary"
          title="Publicar 999 (falla)"
          onPress={() => {
            const r = publicarOferta({ eventId: 'e1', zona: 'Campo A', codigo: 'TK-0001', precio: 999 });
            alert(r.ok ? 'publicada' : r.error);
          }}
          style={styles.btn}
        />
        <Button variant="ghost" title="Reset demo" onPress={resetDemo} style={styles.btn} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: { flex: 1, width: 'auto' },
});
