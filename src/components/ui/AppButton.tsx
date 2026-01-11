import { StyleSheet, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { colors, spacing } from '../../lib/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'danger';

type AppButtonProps = {
  label: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
} & TouchableOpacityProps;

export function AppButton({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = styles[variant];
  const variantTextColor = variantTextColors[variant];

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      style={[
        styles.base,
        variantStyle,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <AppText
        variant="bodySemibold"
        color={isDisabled ? colors.gray400 : variantTextColor}
      >
        {loading ? 'Loading...' : label}
      </AppText>
    </TouchableOpacity>
  );
}

const variantTextColors = {
  primary: colors.white,
  secondary: colors.primary,
  danger: colors.white,
} as const;

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    backgroundColor: colors.gray100,
  },
});
