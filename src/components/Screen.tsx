import { StatusBar } from 'expo-status-bar';
import type { ReactNode, Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  /** Normalmente un <AppHeader />. Se pinta también bajo la barra de estado. */
  header?: ReactNode;
  /** Contenido fijo abajo (p. ej. el botón principal). */
  footer?: ReactNode;
  /** Si es true, el contenido hace scroll. */
  scroll?: boolean;
  /** Padding de 16 alrededor del contenido (por defecto true). */
  padded?: boolean;
  /** Pon false dentro de las pestañas: la barra inferior ya respeta el área segura. */
  bottomInset?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Referencia al ScrollView (solo con scroll), p. ej. para desplazarse a una sección. */
  scrollRef?: Ref<ScrollViewInstance>;
};

// El marco de 480 px en web lo pone <PhoneFrame /> en el layout raíz.
export function Screen({
  children,
  header,
  footer,
  scroll = false,
  padded = true,
  bottomInset = true,
  contentStyle,
  scrollRef,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const inner = [padded && styles.padded, contentStyle];
  const safeBottom = bottomInset ? insets.bottom : 0;
  const bottomPad = footer ? undefined : { paddingBottom: (padded ? spacing.lg : 0) + safeBottom };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'web' ? undefined : 'padding'}>
      <StatusBar style={header ? 'light' : 'dark'} />
      <View style={{ paddingTop: insets.top, backgroundColor: header ? colors.primary : colors.bg }}>
        {header}
      </View>

      {scroll ? (
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[inner, bottomPad]}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner, bottomPad]}>{children}</View>
      )}

      {footer ? (
        <View style={[styles.footer, { paddingBottom: spacing.lg + safeBottom }]}>{footer}</View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  padded: { padding: spacing.lg },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
});
