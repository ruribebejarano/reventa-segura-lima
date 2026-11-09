import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, Pressable, StyleSheet, TextInput, View, type TextStyle } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';

export type SearchBarProps = {
  value: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Buscar' }: SearchBarProps) {
  return (
    <View style={styles.box}>
      <Ionicons name="search" size={20} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda">
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.navy,
    ...(Platform.OS === 'web' && ({ outlineStyle: 'none' } as unknown as TextStyle)),
  },
});
