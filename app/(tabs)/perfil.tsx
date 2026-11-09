import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppHeader, AppText, Button, Card, ConfirmDialog, ListRow, Screen } from '@/components';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import {
  formatConfianza,
  formatDuracion,
  nombrePantalla,
  resumirSesion,
  textoResultados,
} from '@/utils/sesionPrueba';

type Dialogo = 'reiniciar' | 'nueva' | null;

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

function Fila({ label, valor, ok }: { label: string; valor: string; ok?: boolean }) {
  return (
    <View style={styles.fila}>
      <AppText variant="small" color={colors.textSecondary} style={styles.flex}>
        {label}
      </AppText>
      <View style={styles.valor}>
        {ok !== undefined ? (
          <Ionicons
            name={ok ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={ok ? colors.success : colors.danger}
          />
        ) : null}
        <AppText variant="small" weight="semibold">
          {valor}
        </AppText>
      </View>
    </View>
  );
}

export default function Perfil() {
  const user = useAppStore((s) => s.user);
  const modoPrueba = useAppStore((s) => s.modoPrueba);
  const testEvents = useAppStore((s) => s.testEvents);
  const confianza = useAppStore((s) => s.confianza);
  const logout = useAppStore((s) => s.logout);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const setModoPrueba = useAppStore((s) => s.setModoPrueba);
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [aviso, setAviso] = useState<string>();
  const timerAviso = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Se registra en cada visita: marca el fin del tiempo en la pantalla anterior.
  useFocusEffect(
    useCallback(() => {
      registrarEvento('vista', 'perfil');
    }, [registrarEvento]),
  );
  useEffect(() => () => clearTimeout(timerAviso.current), []);

  const resumen = useMemo(() => resumirSesion(testEvents, confianza), [testEvents, confianza]);

  const mostrarAviso = (texto: string) => {
    setAviso(texto);
    clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(undefined), 2500);
  };

  const copiar = async () => {
    try {
      await Clipboard.setStringAsync(textoResultados(resumen, testEvents, user?.nombre));
      mostrarAviso('Resultados copiados ✓');
    } catch {
      mostrarAviso('No se pudo copiar. Inténtalo otra vez.');
    }
  };

  const confirmar = () => {
    resetDemo();
    if (dialogo === 'nueva') {
      // Igual que el enlace ?prueba=1: el participante empieza en el primer evento.
      router.push({ pathname: '/evento/[id]', params: { id: 'e1' } });
    } else {
      mostrarAviso('Datos de la demo reiniciados ✓');
    }
    setDialogo(null);
  };

  if (!user) return null;

  return (
    <View style={styles.root}>
      <Screen header={<AppHeader />} scroll bottomInset={false} contentStyle={styles.content}>
        {/* Cabecera */}
        <Card style={styles.cabecera}>
          <View style={styles.avatar}>
            <AppText variant="h2" color={colors.white}>
              {iniciales(user.nombre)}
            </AppText>
          </View>
          <View style={styles.flex}>
            <AppText variant="h2">{user.nombre}</AppText>
            <AppText variant="small" color={user.dniVerificado ? colors.successText : colors.textSecondary} weight="semibold">
              DNI {user.dniMasked}
              {user.dniVerificado ? ' · Verificado ✓' : ''}
            </AppText>
            <AppText variant="small" color={colors.textSecondary}>
              {user.email}
            </AppText>
          </View>
        </Card>

        {/* Cuenta */}
        <Card style={styles.lista}>
          <ListRow label="Métodos de pago (demo)" icon="card-outline" onPress={() => router.push('/metodos-pago')} />
          <ListRow label="Ayuda y garantía" icon="help-circle-outline" separada onPress={() => router.push('/ayuda')} />
          <ListRow label="Cerrar sesión" icon="log-out-outline" separada danger onPress={logout} />
        </Card>

        {/* Modo demo */}
        <View style={styles.seccion}>
          <AppText variant="caption" weight="semibold" color={colors.textSecondary} style={styles.titulo}>
            MODO DEMO
          </AppText>
          <Card style={styles.lista}>
            <ListRow
              label="Modo prueba con usuarios"
              icon="flask-outline"
              // Toda la fila activa el interruptor: área táctil cómoda también en web.
              onPress={() => setModoPrueba(!modoPrueba)}
              right={
                <Switch
                  value={modoPrueba}
                  onValueChange={setModoPrueba}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                  accessibilityLabel="Modo prueba con usuarios"
                />
              }
            />
            <ListRow
              label="Reiniciar datos de la demo"
              icon="refresh-outline"
              separada
              onPress={() => setDialogo('reiniciar')}
            />
          </Card>
        </View>

        {/* Sesión de prueba */}
        {modoPrueba ? (
          <View style={styles.seccion}>
            <AppText variant="caption" weight="semibold" color={colors.textSecondary} style={styles.titulo}>
              SESIÓN DE PRUEBA
            </AppText>
            <Card style={styles.resumen}>
              {resumen.hayDatos ? (
                <>
                  <Fila label='Tocó "Verificar" antes de pagar' valor={resumen.verificoAntesDePagar ? 'Sí' : 'No'} ok={resumen.verificoAntesDePagar} />
                  <Fila label="Completó el pago" valor={resumen.pago ? 'Sí' : 'No'} ok={resumen.pago} />
                  <Fila label="Confianza antes → después" valor={formatConfianza(resumen.confianzaAntes, resumen.confianzaDespues)} />
                  <Fila label="Tiempo total" valor={formatDuracion(resumen.totalMs)} />
                  <View style={styles.separador} />
                  <AppText variant="small" weight="semibold">
                    Tiempo por pantalla
                  </AppText>
                  {resumen.porPantalla.map((p) => (
                    <Fila
                      key={p.pantalla}
                      label={`${nombrePantalla(p.pantalla)}${p.visitas > 1 ? ` (×${p.visitas})` : ''}`}
                      valor={formatDuracion(p.ms)}
                    />
                  ))}
                </>
              ) : (
                <AppText variant="small" color={colors.textSecondary}>
                  Aún no hay datos. Los registros empiezan cuando el participante usa la app con el modo prueba activo.
                </AppText>
              )}
            </Card>
            <Button title="Copiar resultados" icon="copy-outline" onPress={copiar} disabled={!resumen.hayDatos} />
            <Button title="Nueva sesión" variant="secondary" icon="add-circle-outline" onPress={() => setDialogo('nueva')} />
          </View>
        ) : null}
      </Screen>

      {/* Aviso flotante: visible aunque la lista esté desplazada. */}
      {aviso ? (
        <View style={styles.aviso} accessibilityLiveRegion="polite">
          <AppText variant="small" weight="semibold" color={colors.white} align="center">
            {aviso}
          </AppText>
        </View>
      ) : null}

      <ConfirmDialog
        visible={dialogo !== null}
        titulo={dialogo === 'nueva' ? '¿Empezar una nueva sesión?' : '¿Reiniciar los datos de la demo?'}
        mensaje={
          dialogo === 'nueva'
            ? 'Se borrarán los resultados de esta sesión y las compras de la demo. Copia los resultados antes si los necesitas.'
            : 'Se borrarán las compras, publicaciones y resultados de prueba. Tu sesión y el modo prueba se mantienen.'
        }
        confirmar={dialogo === 'nueva' ? 'Empezar nueva sesión' : 'Reiniciar datos'}
        onConfirmar={confirmar}
        onCancelar={() => setDialogo(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: spacing.lg },
  flex: { flex: 1 },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: { padding: 0, overflow: 'hidden' },
  seccion: { gap: spacing.sm },
  titulo: { letterSpacing: 0.6, marginLeft: spacing.xs },
  resumen: { gap: spacing.sm },
  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  valor: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  separador: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  aviso: {
    pointerEvents: 'none',
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
