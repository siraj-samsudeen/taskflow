import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutNav() {
  const { session, isLoading, authEvent } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (authEvent === 'PASSWORD_RECOVERY') {
      router.replace('/(auth)/password-reset-confirm');
      return;
    }

    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isResetPassword = (segments as string[])[1] === 'password-reset-confirm';

    if (session && inAuthGroup && !isResetPassword) {
      router.replace('/');
    } else if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [session, segments, isLoading, authEvent, router]);

  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
