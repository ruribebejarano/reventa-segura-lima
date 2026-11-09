import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type TextInputProps, type TextStyle } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Mensaje de error en línea; se muestra solo si existe. */
  error?: string;
  /** Texto de ayuda bajo el campo (se oculta si hay error). */
  hint?: string;
  /** Campo de contraseña con botón para mostrar/ocultar. */
  password?: boolean;
};

export function TextField({ label, error, hint, password = false, onFocus, onBlur, ...input }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrap}>
      <AppText variant="small" weight="medium">
        {label}
      </AppText>
      <View style={[styles.box, input.multiline && styles.boxMultiline, { borderColor }]}>
        <TextInput
          {...input}
          secureTextEntry={password && !visible}
          placeholderTextColor={colors.textSecondary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
          style={[styles.input, input.multiline && styles.inputMultiline]}
        />
        {password ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={styles.eye}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs + 2 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.navy,
    // En web quitamos el contorno del navegador: el borde del campo ya marca el foco.
    ...(Platform.OS === 'web' && ({ outlineStyle: 'none' } as unknown as TextStyle)),
  },
  eye: { paddingLeft: spacing.sm },
  boxMultiline: { height: undefined, minHeight: 96, alignItems: 'flex-start', paddingVertical: spacing.md },
  inputMultiline: { height: undefined, minHeight: 72, textAlignVertical: 'top' },
});
