import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { useAuth } from '../../../contexts/AuthContext';
import { useZodForm } from '../../shared/form/useZodForm';

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
});

const codeSchema = z.object({
  code: z.string().min(1, { message: 'Please enter the code' }),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;

export function LoginScreen() {
  const { sendMagicCode, verifyMagicCode } = useAuth();
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailMethods = useZodForm(emailSchema, {
    defaultValues: { email: '' },
  });

  const codeMethods = useZodForm(codeSchema, {
    defaultValues: { code: '' },
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

  const handleVerifyCode = async (data: CodeFormValues) => {
    if (!sentToEmail) return;
    setIsLoading(true);
    try {
      await verifyMagicCode(sentToEmail, data.code.trim());
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
      <FormProvider {...codeMethods}>
        <View style={styles.container}>
          <Text style={styles.title}>Enter Code</Text>
          <Text style={styles.subtitle}>We sent a code to {sentToEmail}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter code"
            placeholderTextColor="#999"
            value={codeMethods.watch('code')}
            onChangeText={(text) => codeMethods.setValue('code', text)}
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />
          {codeMethods.formState.errors.code && (
            <Text style={styles.error}>{codeMethods.formState.errors.code.message}</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={codeMethods.handleSubmit(handleVerifyCode)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkContainer} onPress={() => setSentToEmail(null)}>
            <Text style={styles.linkText}>Use different email</Text>
          </TouchableOpacity>
        </View>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...emailMethods}>
      <View style={styles.container}>
        <Text style={styles.title}>TaskFlow</Text>
        <Text style={styles.subtitle}>Enter your email to sign in</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={emailMethods.watch('email')}
          onChangeText={(text) => emailMethods.setValue('email', text)}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        {emailMethods.formState.errors.email && (
          <Text style={styles.error}>{emailMethods.formState.errors.email.message}</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={emailMethods.handleSubmit(handleSendCode)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Sending...' : 'Send Magic Code'}</Text>
        </TouchableOpacity>
      </View>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    width: '80%',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    color: '#000',
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    width: '80%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 15,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
