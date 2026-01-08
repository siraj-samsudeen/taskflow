import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import CustomTextInput from '../../components/CustomTextInput';
import { supabase } from '../../lib/supabase';

const registerSchema = z
  .object({
    email: z.email({ message: 'Please enter a valid email' }),
    password: z.string({ message: 'Password is required' }),
    confirmPassword: z.string({ message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const methods = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    const { error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
    });

    if (error) {
      showMessage('Error', error.message);
    } else {
      showMessage('Success', 'Check your email to confirm your account');
    }
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        <Text>Create Account</Text>
        <CustomTextInput
          name="email"
          label="Email"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          containerStyle={styles.inputContainer}
        />
        <CustomTextInput
          name="password"
          label="Password"
          placeholder="Password"
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
        <TouchableOpacity style={styles.button} onPress={methods.handleSubmit(handleRegister)}>
          <Text style={styles.buttonText}>Register</Text>
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
});
