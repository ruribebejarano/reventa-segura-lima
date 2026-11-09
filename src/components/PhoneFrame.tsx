import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

/**
 * En web encierra toda la app (pantallas y barra de pestañas) en una columna
 * de 480 px centrada, para que se vea como un celular. En nativo no hace nada.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={styles.outer}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.webOuter,
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: colors.bg,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
});
