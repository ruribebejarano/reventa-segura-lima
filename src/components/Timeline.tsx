import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export type EstadoHito = 'hecho' | 'actual' | 'pendiente';

export type Hito = {
  titulo: string;
  detalle?: string;
  estado: EstadoHito;
};

const PUNTO = 24;

/** Línea de tiempo vertical: hechos en verde, el actual resaltado y los pendientes en gris. */
export function Timeline({ hitos }: { hitos: Hito[] }) {
  return (
    <View>
      {hitos.map((h, i) => {
        const ultimo = i === hitos.length - 1;
        const siguienteHecho = !ultimo && hitos[i + 1].estado !== 'pendiente';
        return (
          <View key={h.titulo} style={styles.fila}>
            <View style={styles.carril}>
              <Punto estado={h.estado} />
              {!ultimo ? (
                <View style={[styles.linea, { backgroundColor: siguienteHecho ? colors.success : colors.border }]} />
              ) : null}
            </View>
            <View style={[styles.texto, !ultimo && styles.textoConEspacio]}>
              <AppText
                variant="small"
                weight={h.estado === 'pendiente' ? 'regular' : 'semibold'}
                color={h.estado === 'pendiente' ? colors.textSecondary : h.estado === 'actual' ? colors.primary : colors.navy}>
                {h.titulo}
              </AppText>
              {h.detalle ? (
                <AppText variant="caption" color={colors.textSecondary}>
                  {h.detalle}
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Punto({ estado }: { estado: EstadoHito }) {
  if (estado === 'hecho') {
    return (
      <View style={[styles.punto, { backgroundColor: colors.success }]}>
        <Ionicons name="checkmark" size={16} color={colors.white} />
      </View>
    );
  }
  if (estado === 'actual') {
    return (
      <View style={[styles.punto, styles.actual]}>
        <View style={styles.actualCentro} />
      </View>
    );
  }
  return <View style={[styles.punto, styles.pendiente]} />;
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', gap: spacing.md },
  carril: { width: PUNTO, alignItems: 'center' },
  linea: { flex: 1, width: 2, marginVertical: 2, minHeight: spacing.lg },
  texto: { flex: 1, paddingTop: 2, gap: 2 },
  textoConEspacio: { paddingBottom: spacing.lg },
  punto: {
    width: PUNTO,
    height: PUNTO,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actual: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  actualCentro: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  pendiente: { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
});
