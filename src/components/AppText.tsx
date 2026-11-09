import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts, typography } from '@/theme';

export type TextVariant = keyof typeof typography;
export type TextWeight = keyof typeof fonts;

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  /** Inter usa una familia por peso; fontWeight no basta en Android. */
  weight?: TextWeight;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function AppText({
  variant = 'body',
  weight,
  color = colors.navy,
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      style={[
        typography[variant],
        { color },
        weight && { fontFamily: fonts[weight] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
