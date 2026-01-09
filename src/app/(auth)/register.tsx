import { useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import CustomTextInput from '../../components/CustomTextInput';
import { useAuth } from '../../contexts/AuthContext';
import { type RegisterFormValues, registerSchema } from '../../features/auth/schemas/authSchemas';
import { useZodForm } from '../../features/shared/form/useZodForm';

export default function RegisterScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const methods = useZodForm(registerSchema, {
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const handleRegister = async (data: RegisterFormValues) => {
    const { error } = await signup(data.email.trim(), data.password);

    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Check your email to confirm your account',
      });
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
        <TouchableOpacity style={styles.linkContainer} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.linkText}>Login</Text>
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
