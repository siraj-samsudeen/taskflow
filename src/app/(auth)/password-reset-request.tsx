import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import CustomTextInput from '../../components/CustomTextInput';
import { supabase } from '../../lib/supabase';

const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Please enter a valid email' }),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/password-reset-confirm`,
      });
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Check your email for a reset link.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        <Text>Reset Password</Text>
        <CustomTextInput
          name="email"
          label="Email"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          containerStyle={styles.inputContainer}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={methods.handleSubmit(handleSubmit)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkContainer} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.linkText}>Back to Login</Text>
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
  },
  inputContainer: {
    width: '80%',
    marginTop: 10,
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
