import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import CustomTextInput from '../../components/CustomTextInput';
import { supabase } from '../../lib/supabase';

const loginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email' }),
  password: z.string({ message: 'Password is required' }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const methods = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Error', message);
    }
  };

  const handleLogin = async (data: LoginForm) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    });

    if (error) {
      showError(error.message);
    }
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        <Text>TaskFlow</Text>
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
        <TouchableOpacity style={styles.button} onPress={methods.handleSubmit(handleLogin)}>
          <Text style={styles.buttonText}>Login</Text>
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
