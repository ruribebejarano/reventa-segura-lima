import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type ScrollViewInstance } from 'react-native';

import {
  AppHeader,
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  InfoBox,
  PriceRow,
  PulsingShield,
  ResultIcon,
  Screen,
  StepIndicator,
  TextField,
  VerifyStep,
  type EstadoPaso,
} from '@/components';
import { calcularTope } from '@/data/rules';
import type { Event, MyListing } from '@/data/types';
import { tituloEvento, useEventosFiltrados } from '@/store/selectors';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { formatFechaCorta, formatSoles } from '@/utils/format';

const PASOS = ['Tu entrada', 'Verificación', 'Publicada'];

const CHECKS = ['Entrada auténtica', 'No ha sido usada', 'Está a tu nombre'] as const;
const CHECK_USADA = 1;
const TEXTO_USADA = 'Esta entrada ya fue usada. No puedes publicarla.';
/** 3 comprobaciones en ~2 s. */
const INTERVALO_MS = 600;
const PAUSA_RESULTADO_MS = 400;

const CODIGO_RE = /^[A-Z0-9]{8,12}$/;

type Paso = 0 | 1 | 2;
type Form = { eventId: string; zona: string; codigo: string; precio: string };
const FORM_VACIO: Form = { eventId: '', zona: '', codigo: '', precio: '' };

export default function Vender() {
  const eventos = useEventosFiltrados('');
  const myListings = useAppStore((s) => s.myListings);
  const publicarOferta = useAppStore((s) => s.publicarOferta);
  const registrarEvento = useAppStore((s) => s.registrarEvento);

  const [paso, setPaso] = useState<Paso>(0);
  const [form, setForm] = useState<Form>(FORM_VACIO);
  const [codigoTocado, setCodigoTocado] = useState(false);
  const [errorPublicar, setErrorPublicar] = useState<string>();
  const [checks, setChecks] = useState<EstadoPaso[]>(CHECKS.map(() => 'oculto'));
  const [fallo, setFallo] = useState(false);
  const [publicada, setPublicada] = useState<MyListing>();

  const scrollRef = useRef<ScrollViewInstance>(null);
  const yPublicaciones = useRef(0);

  // Las pestañas quedan montadas: registramos la vista cada vez que se enfocan.
  useFocusEffect(
    useCallback(() => {
      registrarEvento('vista', 'vender');
    }, [registrarEvento]),
  );

  // ---------- Validación en vivo del paso 1 ----------
  const evento = eventos.find((e) => e.id === form.eventId);
  const zona = evento?.zonas.find((z) => z.nombre === form.zona);
  const tope = zona ? calcularTope(zona.precioOriginal) : undefined;
  const precio = form.precio ? Number(form.precio) : undefined;

  const codigoRepetido = myListings.some((m) => m.codigo === form.codigo);
  const errorCodigo = !codigoTocado || !form.codigo
    ? undefined
    : !CODIGO_RE.test(form.codigo)
      ? 'Usa de 8 a 12 letras o números'
      : codigoRepetido
        ? 'Ya publicaste una entrada con ese código'
        : undefined;
  const errorPrecio =
    precio === undefined || tope === undefined
      ? undefined
      : precio <= 0
        ? 'Ingresa un precio mayor a S/ 0'
        : precio > tope
          ? `El precio supera el tope permitido (${formatSoles(tope)})`
          : undefined;

  const valido =
    !!evento && !!zona && CODIGO_RE.test(form.codigo) && !codigoRepetido && precio !== undefined && !errorPrecio;

  const cambiar = (cambios: Partial<Form>) => setForm((f) => ({ ...f, ...cambios }));

  const elegirEvento = (e: Event) =>
    // Si el evento tiene una sola zona, la elegimos de una vez.
    cambiar({ eventId: e.id, zona: e.zonas.length === 1 ? e.zonas[0].nombre : '' });

  // ---------- Paso 2: verificación simulada ----------
  useEffect(() => {
    if (paso !== 1) return;
    const usada = form.codigo.startsWith('USED');
    const timers: ReturnType<typeof setTimeout>[] = [];
    const en = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    const marcar = (i: number, e: EstadoPaso) => setChecks((prev) => prev.map((x, j) => (j === i ? e : x)));

    for (let i = 0; i < CHECKS.length; i++) {
      en(i * INTERVALO_MS, () => marcar(i, 'cargando'));
      if (usada && i === CHECK_USADA) {
        en((i + 1) * INTERVALO_MS, () => marcar(i, 'error'));
        en((i + 1) * INTERVALO_MS + PAUSA_RESULTADO_MS, () => {
          setFallo(true);
          registrarEvento('publicacion_falla', 'vender');
        });
        break;
      }
      en((i + 1) * INTERVALO_MS, () => marcar(i, 'ok'));
    }

    if (!usada) {
      en(CHECKS.length * INTERVALO_MS + PAUSA_RESULTADO_MS, () => {
        const r = publicarOferta({
          eventId: form.eventId,
          zona: form.zona,
          codigo: form.codigo,
          precio: Number(form.precio),
        });
        if (r.ok) {
          setPublicada(r.oferta);
          setPaso(2);
          registrarEvento('publicacion_ok', 'vender');
        } else {
          setErrorPublicar(r.error);
          setPaso(0);
        }
      });
    }
    return () => timers.forEach(clearTimeout);
    // Solo se dispara al entrar al paso 2; los datos del formulario ya están fijos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  const continuar = () => {
    if (!valido) return;
    setErrorPublicar(undefined);
    setChecks(CHECKS.map(() => 'oculto'));
    setFallo(false);
    setPaso(1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const corregir = () => {
    setFallo(false);
    setPaso(0);
  };

  const publicarOtra = () => {
    setForm(FORM_VACIO);
    setCodigoTocado(false);
    setPublicada(undefined);
    setPaso(0);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const verPublicaciones = () => scrollRef.current?.scrollTo({ y: yPublicaciones.current, animated: true });

  const footer =
    paso === 0 ? (
      <Button title="Continuar" onPress={continuar} disabled={!valido} />
    ) : paso === 1 && fallo ? (
      <Button title="Corregir datos" variant="secondary" onPress={corregir} />
    ) : paso === 2 ? (
      <>
        <Button title="Ver mis publicaciones" onPress={verPublicaciones} />
        <Button title="Publicar otra" variant="secondary" onPress={publicarOtra} />
      </>
    ) : undefined;

  return (
    <Screen
      header={<AppHeader />}
      scroll
      scrollRef={scrollRef}
      bottomInset={false}
      contentStyle={styles.content}
      footer={footer}>
      <AppText variant="title">Vender una entrada</AppText>
      <StepIndicator pasos={PASOS} actual={paso} />

      {/* ---------- Paso 1: Tu entrada ---------- */}
      {paso === 0 ? (
        <View style={styles.form}>
          {errorPublicar ? (
            <AppText variant="small" color={colors.danger}>
              {errorPublicar}
            </AppText>
          ) : null}

          <View style={styles.campo}>
            <AppText variant="small" weight="medium">
              Evento
            </AppText>
            <Card style={styles.opciones}>
              {eventos.map((e, i) => {
                const activo = e.id === form.eventId;
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => elegirEvento(e)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: activo }}
                    accessibilityLabel={tituloEvento(e)}
                    style={[styles.opcion, i > 0 && styles.opcionBorde]}>
                    <Ionicons
                      name={activo ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={activo ? colors.primary : colors.textSecondary}
                    />
                    <View style={styles.flex}>
                      <AppText variant="small" weight="semibold">
                        {tituloEvento(e)}
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {formatFechaCorta(e.fechaISO)} · {e.recinto}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </Card>
          </View>

          {evento ? (
            <View style={styles.campo}>
              <AppText variant="small" weight="medium">
                Zona
              </AppText>
              <View style={styles.chips}>
                {evento.zonas.map((z) => (
                  <Chip
                    key={z.nombre}
                    label={z.nombre}
                    selected={z.nombre === form.zona}
                    onPress={() => cambiar({ zona: z.nombre })}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <TextField
            label="Código de la entrada"
            placeholder="Ej. AUR7K2Q9"
            hint="Está en tu entrada de la ticketera: 8 a 12 letras o números."
            value={form.codigo}
            onChangeText={(v) => cambiar({ codigo: v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) })}
            onBlur={() => setCodigoTocado(true)}
            error={errorCodigo}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
          />

          <TextField
            label="Precio de venta (S/)"
            placeholder="Ej. 200"
            value={form.precio}
            onChangeText={(v) => cambiar({ precio: v.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 5) })}
            error={errorPrecio}
            keyboardType="number-pad"
            inputMode="numeric"
          />

          {zona && tope !== undefined ? (
            <View style={styles.tope}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <View style={styles.flex}>
                <AppText variant="small" weight="semibold">
                  Original {formatSoles(zona.precioOriginal)} · Máximo {formatSoles(tope)}
                </AppText>
                {precio !== undefined && !errorPrecio ? (
                  <AppText variant="small" color={colors.successText} weight="semibold">
                    Recibirás {formatSoles(precio)} cuando el comprador ingrese
                  </AppText>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* ---------- Paso 2: Verificación ---------- */}
      {paso === 1 ? (
        <View style={styles.centro}>
          {fallo ? <ResultIcon ok={false} size={72} /> : <PulsingShield size={72} />}
          <AppText variant="h2" align="center" accessibilityLiveRegion="polite">
            {fallo ? 'No pudimos verificar tu entrada' : 'Verificando con la ticketera…'}
          </AppText>
          <Card style={styles.checks}>
            {CHECKS.map((texto, i) =>
              checks[i] === 'oculto' ? null : (
                <VerifyStep
                  key={texto}
                  texto={texto}
                  estado={checks[i] as Exclude<EstadoPaso, 'oculto'>}
                  textoError={TEXTO_USADA}
                />
              ),
            )}
          </Card>
        </View>
      ) : null}

      {/* ---------- Paso 3: Publicada ---------- */}
      {paso === 2 && publicada ? (
        <View style={styles.publicada}>
          <View style={styles.centro}>
            <ResultIcon ok size={72} />
            <AppText variant="title" align="center">
              Oferta publicada ✓
            </AppText>
          </View>
          <Card style={styles.resumen}>
            <AppText weight="bold">{evento ? tituloEvento(evento) : ''}</AppText>
            <AppText variant="small" color={colors.textSecondary}>
              {publicada.zona} · Código {publicada.codigo}
            </AppText>
            <View style={styles.separador} />
            <PriceRow label="Precio de venta" amount={publicada.precio} />
            <PriceRow label="Recibirás al ingresar el comprador" amount={publicada.precio} total />
          </Card>
          <InfoBox icon="information-circle">
            Cobras cuando el comprador ingresa. Tu QR actual se anulará al venderse.
          </InfoBox>
        </View>
      ) : null}

      {/* ---------- Mis publicaciones ---------- */}
      <View
        style={styles.seccion}
        onLayout={(e) => {
          yPublicaciones.current = e.nativeEvent.layout.y;
        }}>
        <AppText variant="h2">Mis publicaciones</AppText>
        {myListings.length > 0 ? (
          myListings.map((m) => <Publicacion key={m.id} oferta={m} eventos={eventos} />)
        ) : (
          <AppText variant="small" color={colors.textSecondary}>
            Aún no publicas entradas.
          </AppText>
        )}
      </View>
    </Screen>
  );
}

function Publicacion({ oferta, eventos }: { oferta: MyListing; eventos: Event[] }) {
  const evento = eventos.find((e) => e.id === oferta.eventId);
  const vendida = oferta.estado === 'vendida';
  return (
    <Card style={styles.publicacion}>
      <View style={styles.flex}>
        <AppText weight="semibold">{evento ? tituloEvento(evento) : 'Evento'}</AppText>
        <AppText variant="small" color={colors.textSecondary}>
          {oferta.zona} · {formatSoles(oferta.precio)}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Código {oferta.codigo}
        </AppText>
      </View>
      <Badge variant={vendida ? 'liberado' : 'verificado'} label={vendida ? 'Vendida' : 'Publicada'} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  flex: { flex: 1 },
  form: { gap: spacing.lg },
  campo: { gap: spacing.xs + 2 },
  opciones: { paddingVertical: spacing.xs },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  opcionBorde: { borderTopWidth: 1, borderTopColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tope: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.primarySoft,
  },
  centro: { alignItems: 'center', gap: spacing.md },
  checks: { alignSelf: 'stretch', gap: spacing.xs, minHeight: 3 * 36 + spacing.lg * 2 },
  publicada: { gap: spacing.lg },
  resumen: { gap: spacing.xs },
  separador: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  seccion: { gap: spacing.md, marginTop: spacing.lg },
  publicacion: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
