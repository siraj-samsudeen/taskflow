import { forwardRef } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { type StyleProp, StyleSheet, TextInput, type TextInputProps, View, type ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../lib/theme';
import { AppText } from './AppText';

type AppTextInputProps = {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  name?: string;
  error?: string;
} & TextInputProps;

export const AppTextInput = forwardRef<any, AppTextInputProps>(
  ({ label, containerStyle, name, error: externalError, ...textInputProps }, ref) => {
    const formContext = useFormContext();
    
    // If no name provided, use uncontrolled mode
    if (!name) {
      return (
        <View style={containerStyle}>
          {label && <AppText variant="bodyMedium" color={colors.gray600} style={styles.label}>{label}</AppText>}
          <View style={[styles.inputContainer, externalError && styles.inputContainerError]}>
            <TextInput
              ref={ref}
              {...textInputProps}
              style={[styles.input, textInputProps.style]}
              placeholderTextColor={colors.gray400}
            />
          </View>
          {externalError && (
            <AppText variant="captionSmall" color={colors.danger} style={styles.errorText}>
              {externalError}
            </AppText>
          )}
        </View>
      );
    }

    // Controlled mode with form (if form context exists)
    // useController will throw if there's no FormProvider, so this is only safe if formContext exists
    if (!formContext) {
      return (
        <View style={containerStyle}>
          {label && <AppText variant="bodyMedium" color={colors.gray600} style={styles.label}>{label}</AppText>}
          <View style={[styles.inputContainer, externalError && styles.inputContainerError]}>
            <TextInput
              ref={ref}
              {...textInputProps}
              style={[styles.input, textInputProps.style]}
              placeholderTextColor={colors.gray400}
            />
          </View>
          {externalError && (
            <AppText variant="captionSmall" color={colors.danger} style={styles.errorText}>
              {externalError}
            </AppText>
          )}
        </View>
      );
    }

    const {
      field: { value, onBlur, onChange },
      fieldState: { error: formError },
    } = useController({ name });

    const error = externalError || formError?.message;

    return (
      <View style={containerStyle}>
        {label && <AppText variant="bodyMedium" color={colors.gray600} style={styles.label}>{label}</AppText>}
        <View
          style={[
            styles.inputContainer,
            error && styles.inputContainerError,
          ]}
        >
          <TextInput
            ref={ref}
            {...textInputProps}
            value={String(value ?? '')}
            onBlur={onBlur}
            onChangeText={onChange}
            style={[styles.input, textInputProps.style]}
            placeholderTextColor={colors.gray400}
          />
        </View>
        {error && (
          <AppText variant="captionSmall" color={colors.danger} style={styles.errorText}>
            {error}
          </AppText>
        )}
      </View>
    );
  },
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.gray100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputContainerError: {
    borderColor: colors.danger,
  },
  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.black,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
