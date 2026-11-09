import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

const nativeDriver = Platform.OS !== 'web';

/** Escudo con pulso suave mientras se consulta a la ticketera. */
export function PulsingShield({ size = 88 }: { size?: number }) {
  // useState (no useRef): el valor animado se crea una vez y se puede leer durante el render.
  const [pulso] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: nativeDriver }),
        Animated.timing(pulso, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: nativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulso]);

  const circulo = { width: size, height: size };

  return (
    <View style={[styles.wrap, { width: size * 1.4, height: size * 1.4 }]}>
      <Animated.View
        style={[
          styles.circulo,
          circulo,
          styles.halo,
          {
            opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circulo,
          circulo,
          { backgroundColor: colors.primarySoft },
          { transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] },
        ]}>
        <Ionicons name="shield-checkmark" size={size / 2} color={colors.primary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  circulo: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', backgroundColor: colors.primary },
});
