import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  /** Texto junto al spinner mientras carga (p. ej. "Procesando pago…"). */
  loadingText?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
};

const palette: Record<ButtonVariant, { bg: string; bgPressed: string; fg: string; border?: string }> = {
  primary: { bg: colors.accentStrong, bgPressed: colors.accentText, fg: colors.white },
  secondary: { bg: colors.surface, bgPressed: colors.primarySoft, fg: colors.primaryText, border: colors.primary },
  ghost: { bg: 'transparent', bgPressed: colors.primarySoft, fg: colors.primaryText },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingText,
  icon,
  style,
}: ButtonProps) {
  const p = palette[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed && !inactive ? p.bgPressed : p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? 1.5 : 0,
        },
        pressed && !inactive && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator color={p.fg} />
          {loadingText ? (
            <AppText weight="semibold" color={p.fg}>
              {loadingText}
            </AppText>
          ) : null}
        </View>
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={20} color={p.fg} /> : null}
          <AppText weight="semibold" color={p.fg}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    width: '100%',
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
