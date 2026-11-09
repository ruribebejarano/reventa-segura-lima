import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppText,
  Button,
  Card,
  ConfianzaModal,
  PulsingShield,
  ResultIcon,
  Screen,
  VerifyStep,
  type EstadoPaso,
} from '@/components';
import type { NivelConfianza } from '@/data/types';
import { useOferta } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

const PASOS = [
  'Auténtica: confirmada con la ticketera',
  'Nunca ha sido usada',
  'Venta única: el QR del vendedor se anula',
  'Se emitirá a tu nombre y DNI',
] as const;

/** Paso que falla cuando la oferta tiene verificacionFalla. */
const PASO_FALLA = 1;
const TEXTO_FALLA = 'Esta entrada ya fue utilizada';
/** Cada comprobación tarda esto; 4 pasos + cierre ≈ 2,5 s. */
const INTERVALO_MS = 500;
const PAUSA_RESULTADO_MS = 500;
/** Tiempo para que el fan vea el resultado antes de la pregunta de confianza. */
const PAUSA_PREGUNTA_MS = 1200;

type Fase = 'pregunta' | 'verificando' | 'verificada' | 'fallida';

export default function Verificacion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const oferta = useOferta(id);
  const registrarEvento = useAppStore((s) => s.registrarEvento);
  const setConfianza = useAppStore((s) => s.setConfianza);
  const marcarVerificada = useAppStore((s) => s.marcarVerificada);

  // Se lee una vez: si cambia a mitad de pantalla no queremos preguntas a medias.
  const [modoPrueba] = useState(() => useAppStore.getState().modoPrueba);
  const [fase, setFase] = useState<Fase>(modoPrueba ? 'pregunta' : 'verificando');
  const [pasos, setPasos] = useState<EstadoPaso[]>(PASOS.map(() => 'oculto'));
  const [preguntaDespues, setPreguntaDespues] = useState<'pendiente' | 'visible' | 'respondida'>(
    modoPrueba ? 'pendiente' : 'respondida',
  );

  const falla = !!oferta?.verificacionFalla;
  const terminada = fase === 'verificada' || fase === 'fallida';

  useEffect(() => {
    registrarEvento('vista', 'verificacion');
  }, [registrarEvento]);

  // Secuencia simulada: cada paso aparece con spinner y se resuelve 500 ms después.
  useEffect(() => {
    if (fase !== 'verificando') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const en = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    const marcar = (i: number, estado: EstadoPaso) =>
      setPasos((prev) => prev.map((e, j) => (j === i ? estado : e)));

    for (let i = 0; i < PASOS.length; i++) {
      en(i * INTERVALO_MS, () => marcar(i, 'cargando'));
      if (falla && i === PASO_FALLA) {
        en((i + 1) * INTERVALO_MS, () => marcar(i, 'error'));
        en((i + 1) * INTERVALO_MS + PAUSA_RESULTADO_MS, () => setFase('fallida'));
        break;
      }
      en((i + 1) * INTERVALO_MS, () => marcar(i, 'ok'));
    }
    if (!falla) en(PASOS.length * INTERVALO_MS + PAUSA_RESULTADO_MS, () => setFase('verificada'));

    return () => timers.forEach(clearTimeout);
  }, [fase, falla]);

  useEffect(() => {
    if (fase === 'verificada') {
      registrarEvento('resultado_ok', 'verificacion');
      marcarVerificada(id);
    }
    if (fase === 'fallida') registrarEvento('resultado_falla', 'verificacion');
  }, [fase, id, registrarEvento, marcarVerificada]);

  // Segunda pregunta de confianza, una vez visto el resultado.
  useEffect(() => {
    if (!terminada || preguntaDespues !== 'pendiente') return;
    const t = setTimeout(() => setPreguntaDespues('visible'), PAUSA_PREGUNTA_MS);
    return () => clearTimeout(t);
  }, [terminada, preguntaDespues]);

  const responder = (nivel: NivelConfianza) => {
    if (fase === 'pregunta') {
      setConfianza('antes', nivel);
      setFase('verificando');
    } else {
      setConfianza('despues', nivel);
      setPreguntaDespues('respondida');
    }
  };

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));
  const header = <AppHeader title="Verificación" onBack={volver} />;

  if (!oferta) {
    return (
      <Screen header={header}>
        <AppText color={colors.textSecondary}>No encontramos esta entrada.</AppText>
      </Screen>
    );
  }

  const continuarAlPago = () => router.push({ pathname: '/pago/[id]', params: { id: oferta.id } });
  const verOtras = () => router.dismissTo({ pathname: '/evento/[id]', params: { id: oferta.eventId } });

  // El botón espera la respuesta de confianza para que no se salte la pregunta.
  const bloqueado = preguntaDespues !== 'respondida';
  const footer =
    fase === 'verificada' ? (
      <Button title="Continuar al pago" onPress={continuarAlPago} disabled={bloqueado} />
    ) : fase === 'fallida' ? (
      <Button title="Ver otras entradas" onPress={verOtras} disabled={bloqueado} />
    ) : undefined;

  return (
    <View style={styles.root}>
      <Screen scroll header={header} footer={footer} contentStyle={styles.content}>
        <View style={styles.cabecera}>
          {terminada ? <ResultIcon ok={fase === 'verificada'} /> : <PulsingShield />}

          {fase === 'verificada' ? (
            <AppText variant="title" align="center">
              Entrada verificada
            </AppText>
          ) : fase === 'fallida' ? (
            <>
              <AppText variant="title" align="center">
                No pudimos verificar esta entrada
              </AppText>
              <AppText color={colors.textSecondary} align="center">
                No se te cobró nada. Te mostramos otras opciones.
              </AppText>
            </>
          ) : (
            <AppText variant="h2" align="center" accessibilityLiveRegion="polite">
              Consultando con la ticketera oficial…
            </AppText>
          )}
        </View>

        <Card style={styles.pasos}>
          {PASOS.map((texto, i) =>
            pasos[i] === 'oculto' ? null : (
              <VerifyStep
                key={texto}
                texto={texto}
                estado={pasos[i] as Exclude<EstadoPaso, 'oculto'>}
                textoError={TEXTO_FALLA}
              />
            ),
          )}
          {fase === 'pregunta' ? (
            <AppText variant="small" color={colors.textSecondary} align="center">
              Preparando la consulta…
            </AppText>
          ) : null}
        </Card>

        {fase === 'verificada' ? (
          <View style={styles.garantia}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            <AppText weight="bold" style={styles.garantiaTexto}>
              {'Si no entras, te devolvemos el 100 %.'}
            </AppText>
          </View>
        ) : null}
      </Screen>

      <ConfianzaModal visible={fase === 'pregunta' || preguntaDespues === 'visible'} onResponder={responder} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: spacing.xl, paddingTop: spacing.xl },
  cabecera: { alignItems: 'center', gap: spacing.md },
  pasos: { gap: spacing.xs, minHeight: 4 * 36 + spacing.lg * 2 },
  garantia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.primarySoft,
  },
  garantiaTexto: { flex: 1 },
});
