import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

export type ResultIconProps = {
  /** true = check verde; false = X roja. */
  ok: boolean;
  size?: number;
};

const nativeDriver = Platform.OS !== 'web';

/** Círculo de resultado que entra con un pequeño rebote. */
export function ResultIcon({ ok, size = 88 }: ResultIconProps) {
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrada, { toValue: 1, friction: 6, tension: 80, useNativeDriver: nativeDriver }).start();
  }, [entrada]);

  return (
    <View style={[styles.wrap, { width: size * 1.4, height: size * 1.4 }]}>
      <Animated.View
        style={[
          styles.circulo,
          { width: size, height: size, backgroundColor: ok ? colors.success : colors.danger },
          {
            opacity: entrada,
            transform: [{ scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          },
        ]}>
        <Ionicons name={ok ? 'checkmark' : 'close'} size={size * 0.6} color={colors.white} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  circulo: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
