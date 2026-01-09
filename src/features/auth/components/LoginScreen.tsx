import { useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import CustomTextInput from '../../../components/CustomTextInput';
import { useAuth } from '../../../contexts/AuthContext';
import { useZodForm } from '../../shared/form/useZodForm';
import { type LoginFormValues, loginSchema } from '../schemas/authSchemas';

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const methods = useZodForm(loginSchema, {
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = async (data: LoginFormValues) => {
    const { error } = await login(data.email.trim(), data.password);

    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
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
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.linkText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push('/(auth)/password-reset-request')}
        >
          <Text style={styles.linkText}>Forgot Password?</Text>
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
