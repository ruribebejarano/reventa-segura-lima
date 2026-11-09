import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

export type AppHeaderProps = {
  /** Si se pasa, muestra la variante interna: flecha "‹" + este título. */
  title?: string;
  /** Acción de la flecha; por defecto router.back(). */
  onBack?: () => void;
  /** Elemento opcional a la derecha. */
  right?: ReactNode;
  /** Pon false para mostrar el título sin flecha (p. ej. en la confirmación de compra). */
  showBack?: boolean;
};

export function AppHeader({ title, onBack, right, showBack = true }: AppHeaderProps) {
  const isInner = title !== undefined;

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.bar}>
      {isInner ? (
        <>
          {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
            <AppText weight="bold" color={colors.white} style={styles.backIcon}>
              ‹
            </AppText>
          </Pressable>
          ) : null}
          <AppText weight="bold" color={colors.white} numberOfLines={1} style={styles.title}>
            {title}
          </AppText>
        </>
      ) : (
        <AppText weight="bold" color={colors.white} style={styles.title}>
          ✓ Reventa Verificada
        </AppText>
      )}
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  back: {
    width: 28,
    height: 44,
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  backIcon: {
    fontSize: 34,
    lineHeight: 40,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
  },
});
