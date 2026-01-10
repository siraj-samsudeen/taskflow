import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      router.replace('/');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, segments, isLoading, router]);

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
