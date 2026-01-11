import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { AppButton, AppText, AppTextInput, colors, spacing } from '../../../components/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { useZodForm } from '../../shared/form/useZodForm';

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function LoginScreen() {
  const { sendMagicCode, verifyMagicCode } = useAuth();
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeValue, setCodeValue] = useState('');

  const emailMethods = useZodForm(emailSchema, {
    defaultValues: { email: '' },
  });

  const handleSendCode = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await sendMagicCode(data.email.trim());
      setSentToEmail(data.email.trim());
      Toast.show({
        type: 'success',
        text1: 'Code sent',
        text2: 'Check your email for the magic code.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to send code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!sentToEmail) return;
    const code = codeValue.trim();
    if (!code) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter the code',
      });
      return;
    }
    setIsLoading(true);
    try {
      await verifyMagicCode(sentToEmail, code);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Invalid code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (sentToEmail) {
    return (
      <View style={styles.container}>
          <AppText variant="heading1" style={styles.title}>
            Enter Code
          </AppText>
          <AppText variant="body" color={colors.gray600} style={styles.subtitle}>
            We sent a code to {sentToEmail}
          </AppText>
          <AppTextInput
            placeholder="Enter code"
            value={codeValue}
            onChangeText={setCodeValue}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            containerStyle={styles.inputContainer}
          />
          <AppButton
            label={isLoading ? 'Verifying...' : 'Verify'}
            onPress={handleVerifyCode}
            loading={isLoading}
            style={styles.button}
          />
          <TouchableOpacity style={styles.linkContainer} onPress={() => setSentToEmail(null)}>
            <AppText variant="bodySemibold" color={colors.primary}>
              Use different email
            </AppText>
          </TouchableOpacity>
        </View>
    );
  }

  return (
    <FormProvider {...emailMethods}>
      <View style={styles.container}>
        <AppText variant="heading1" style={styles.title}>
          TaskFlow
        </AppText>
        <AppText variant="body" color={colors.gray600} style={styles.subtitle}>
          Enter your email to sign in
        </AppText>
        <AppTextInput
          placeholder="Email"
          name="email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          containerStyle={styles.inputContainer}
        />
        <AppButton
          label={isLoading ? 'Sending...' : 'Send Magic Code'}
          onPress={() => emailMethods.handleSubmit(handleSendCode)()}
          loading={isLoading}
          style={styles.button}
        />
      </View>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    width: '80%',
    marginBottom: spacing.lg,
  },
  button: {
    width: '80%',
  },
  linkContainer: {
    marginTop: spacing.lg,
  },
});
