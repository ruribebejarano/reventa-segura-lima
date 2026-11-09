import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

export type CheckItemProps = {
  text: string;
  style?: StyleProp<ViewStyle>;
};

export function CheckItem({ text, style }: CheckItemProps) {
  return (
    <View style={[styles.row, style]}>
      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      <AppText variant="small" style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: { flex: 1 },
});
