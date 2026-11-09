import { Pressable, StyleSheet, View } from 'react-native';

import type { NivelConfianza } from '@/data/types';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

const NIVELES: NivelConfianza[] = [1, 2, 3, 4, 5];

export type ConfianzaModalProps = {
  visible: boolean;
  onResponder: (nivel: NivelConfianza) => void;
};

/**
 * Pregunta de confianza (1 a 5) para las pruebas con usuarios.
 * Es una capa dentro de la pantalla (no un Modal nativo) para que en web quede dentro del marco de celular.
 */
export function ConfianzaModal({ visible, onResponder }: ConfianzaModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.backdrop} accessibilityViewIsModal>
      <View style={styles.card}>
        <AppText variant="h2" align="center">
          ¿Qué tan seguro te sentirías pagando esta entrada?
        </AppText>
        <AppText variant="small" color={colors.textSecondary} align="center">
          Elige de 1 a 5
        </AppText>

        <View style={styles.escala}>
          {NIVELES.map((n) => (
            <Pressable
              key={n}
              onPress={() => onResponder(n)}
              accessibilityRole="button"
              accessibilityLabel={`${n} de 5`}
              style={({ pressed }) => [styles.opcion, pressed && styles.opcionPressed]}>
              {({ pressed }) => (
                <AppText variant="h2" color={pressed ? colors.white : colors.primary}>
                  {n}
                </AppText>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.extremos}>
          <AppText variant="caption" color={colors.textSecondary}>
            Nada seguro
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Muy seguro
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(20, 33, 61, 0.55)',
    justifyContent: 'center',
    padding: spacing.xl,
    zIndex: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  escala: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  opcion: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcionPressed: { backgroundColor: colors.primary },
  extremos: { flexDirection: 'row', justifyContent: 'space-between' },
});
