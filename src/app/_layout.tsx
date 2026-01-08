import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/reset-password');
        return;
      }
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    // Wait for auth state before redirecting to prevent flash redirect on app load
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isResetPassword = segments[1] === 'reset-password';

    if (session && inAuthGroup && !isResetPassword) {
      router.replace('/');
    } else if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [session, segments, isLoading]);

  return <Slot />;
}
