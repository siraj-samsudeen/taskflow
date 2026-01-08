import { zodResolver } from '@hookform/resolvers/zod';
import { useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import CustomTextInput from '../../components/CustomTextInput';
import { supabase } from '../../lib/supabase';

const resetPasswordSchema = z
  .object({
    password: z.string().min(1, { message: 'Password is required' }),
    confirmPassword: z.string().min(1, { message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = useLinkingURL();
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    Toast.show({ type, text1: title, text2: message });
  };

  useEffect(() => {
    if (!url) return;
    const hash = url.split('#')[1];
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const error = params.get('error');
    if (error) {
      const description = params.get('error_description')?.replace(/\+/g, ' ');
      showToast('error', 'Error', description || 'Invalid or expired reset link. Please request a new one.');
      router.push('/(auth)/password-reset-request');
    }
  }, [url, router]);

  const methods = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        showToast('error', 'Error', error.message);
      } else {
        showToast('success', 'Success', 'Your password has been reset.');
        router.push('/(auth)/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        <Text>Set New Password</Text>
        <CustomTextInput
          name="password"
          label="New Password"
          placeholder="New Password"
          secureTextEntry
          autoComplete="password"
          containerStyle={styles.inputContainer}
        />
        <CustomTextInput
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm Password"
          secureTextEntry
          autoComplete="password"
          containerStyle={styles.inputContainer}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={methods.handleSubmit(handleSubmit)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Resetting...' : 'Reset Password'}</Text>
        </TouchableOpacity>
      </View>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inputContainer: { width: '80%', marginTop: 10 },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
