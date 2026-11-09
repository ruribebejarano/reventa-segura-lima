import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

export type EstadoPaso = 'oculto' | 'cargando' | 'ok' | 'error';

export type VerifyStepProps = {
  texto: string;
  estado: Exclude<EstadoPaso, 'oculto'>;
  /** Texto que reemplaza al normal cuando el paso falla. */
  textoError?: string;
};

const nativeDriver = Platform.OS !== 'web';

/** Fila de comprobación: spinner gris → check verde (o X roja). Aparece con un fundido suave. */
export function VerifyStep({ texto, estado, textoError }: VerifyStepProps) {
  // useState (no useRef): el valor animado se crea una vez y se puede leer durante el render.
  const [aparicion] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(aparicion, { toValue: 1, duration: 250, useNativeDriver: nativeDriver }).start();
  }, [aparicion]);

  const error = estado === 'error';
  const color = estado === 'cargando' ? colors.textSecondary : error ? colors.danger : colors.navy;

  return (
    <Animated.View
      style={[
        styles.row,
        {
          opacity: aparicion,
          transform: [{ translateY: aparicion.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
        },
      ]}
      accessibilityLiveRegion="polite">
      <View style={styles.icono}>
        {estado === 'cargando' ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <Ionicons
            name={error ? 'close-circle' : 'checkmark-circle'}
            size={22}
            color={error ? colors.danger : colors.success}
          />
        )}
      </View>
      <AppText variant="small" weight={error ? 'semibold' : undefined} color={color} style={styles.texto}>
        {error && textoError ? textoError : texto}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs + 2 },
  icono: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  texto: { flex: 1 },
});
