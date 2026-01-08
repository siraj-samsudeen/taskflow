import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const url = Linking.useURL();
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    if (!url) return;
    const hash = url.split('#')[1];
    if (!hash) {
      showMessage('Error', 'Invalid or expired reset link. Please request a new one.');
      router.push('/(auth)/forgot-password');
      return;
    }
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) {
      showMessage('Error', 'Invalid or expired reset link. Please request a new one.');
      router.push('/(auth)/forgot-password');
      return;
    }
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  }, [url]);

  const methods = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        showMessage('Error', error.message);
      } else {
        showMessage('Success', 'Your password has been reset.');
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
