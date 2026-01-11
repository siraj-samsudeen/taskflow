import type { ComponentProps } from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, typography } from '../../lib/theme';

type Variant = 'heading1' | 'heading2' | 'body' | 'bodyMedium' | 'bodySemibold' | 'caption' | 'captionMedium' | 'captionSmall';

type AppTextProps = {
  variant?: Variant;
  color?: string;
} & TextProps;

export function AppText({
  variant = 'body',
  color = colors.black,
  style,
  ...props
}: AppTextProps) {
  const variantStyle = typography[variant];

  return (
    <Text
      {...props}
      style={[variantStyle, { color }, style]}
    />
  );
}
