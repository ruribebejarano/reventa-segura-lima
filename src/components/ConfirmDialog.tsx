import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

export type ConfirmDialogProps = {
  visible: boolean;
  titulo: string;
  mensaje: string;
  confirmar: string;
  cancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

/**
 * Confirmación dentro de la app (sin alert del navegador).
 * Es una capa sobre la pantalla: el padre debe ocupar toda la pantalla (flex: 1) para que cubra todo.
 */
export function ConfirmDialog({
  visible,
  titulo,
  mensaje,
  confirmar,
  cancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  if (!visible) return null;
  return (
    <View style={styles.backdrop} accessibilityViewIsModal>
      <View style={styles.card} accessibilityRole="alert">
        <AppText variant="h2">{titulo}</AppText>
        <AppText variant="small" color={colors.textSecondary}>
          {mensaje}
        </AppText>
        <View style={styles.botones}>
          <Button title={confirmar} onPress={onConfirmar} />
          <Button title={cancelar} variant="ghost" onPress={onCancelar} />
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
  botones: { gap: spacing.xs, marginTop: spacing.sm },
});
