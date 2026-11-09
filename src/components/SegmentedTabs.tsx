import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export type SegmentedOption<K extends string> = { key: K; label: string };

export type SegmentedTabsProps<K extends string> = {
  options: SegmentedOption<K>[];
  value: K;
  onChange: (key: K) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedTabs<K extends string>({ options, value, onChange, style }: SegmentedTabsProps<K>) {
  return (
    <View style={[styles.track, style]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.active]}>
            <AppText variant="small" weight="semibold" color={active ? colors.navy : colors.textSecondary}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radius.button,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button - 4,
  },
  active: {
    backgroundColor: colors.surface,
    boxShadow: '0 1px 3px rgba(27, 38, 59, 0.12)',
  },
});
