// TEMPORAL: relleno para pestañas y rutas que aún no tienen pantalla.
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

export function EnConstruccion({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <AppText variant="h2">{titulo}</AppText>
      <AppText variant="small" color={colors.textSecondary}>
        Pantalla en construcción.
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
});
