import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskListScreen } from '../features/tasks';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <TaskListScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
