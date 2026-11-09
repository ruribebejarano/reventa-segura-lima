import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';
import { formatSoles } from '@/utils/format';
import { AppText } from './AppText';

export type PriceRowProps = {
  label: string;
  amount: number;
  /** Fila de total: más grande y en negrita. */
  total?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PriceRow({ label, amount, total = false, style }: PriceRowProps) {
  return (
    <View style={[styles.row, style]}>
      <AppText
        variant={total ? 'body' : 'small'}
        weight={total ? 'bold' : undefined}
        color={total ? colors.navy : colors.textSecondary}
        style={styles.label}>
        {label}
      </AppText>
      <AppText variant={total ? 'h2' : 'small'} weight={total ? 'bold' : 'medium'}>
        {formatSoles(amount)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: { flex: 1 },
});
