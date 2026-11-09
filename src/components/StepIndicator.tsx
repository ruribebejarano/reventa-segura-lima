import Ionicons from '@expo/vector-icons/Ionicons';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export type StepIndicatorProps = {
  pasos: string[];
  /** Índice del paso actual (0 = primero). */
  actual: number;
};

/** Indicador de pasos: completados con check verde, actual en primario, siguientes en gris. */
export function StepIndicator({ pasos, actual }: StepIndicatorProps) {
  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`Paso ${actual + 1} de ${pasos.length}: ${pasos[actual]}`}>
      <View style={styles.fila}>
        {pasos.map((p, i) => {
          const hecho = i < actual;
          const esActual = i === actual;
          return (
            <Fragment key={p}>
              {i > 0 ? (
                <View style={[styles.linea, { backgroundColor: i <= actual ? colors.primary : colors.border }]} />
              ) : null}
              <View
                style={[
                  styles.punto,
                  hecho && { backgroundColor: colors.success, borderColor: colors.success },
                  esActual && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}>
                {hecho ? (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                ) : (
                  <AppText variant="caption" weight="bold" color={esActual ? colors.white : colors.textSecondary}>
                    {i + 1}
                  </AppText>
                )}
              </View>
            </Fragment>
          );
        })}
      </View>
      <View style={styles.etiquetas}>
        {pasos.map((p, i) => (
          <AppText
            key={p}
            variant="caption"
            weight={i === actual ? 'semibold' : 'regular'}
            color={i === actual ? colors.navy : colors.textSecondary}
            align={i === 0 ? 'left' : i === pasos.length - 1 ? 'right' : 'center'}
            style={styles.etiqueta}>
            {p}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const PUNTO = 28;

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  fila: { flexDirection: 'row', alignItems: 'center' },
  linea: { flex: 1, height: 2, marginHorizontal: spacing.xs },
  punto: {
    width: PUNTO,
    height: PUNTO,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiquetas: { flexDirection: 'row' },
  etiqueta: { flex: 1 },
});
