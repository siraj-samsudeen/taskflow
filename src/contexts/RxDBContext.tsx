import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getDatabase, type TaskFlowDatabase } from '../lib/rxdb';
import { startReplication, stopReplication } from '../lib/rxdb-replication';

interface RxDBContextValue {
  db: TaskFlowDatabase | null;
  isReady: boolean;
  isReplicating: boolean;
}

const RxDBContext = createContext<RxDBContextValue>({
  db: null,
  isReady: false,
  isReplicating: false,
});

interface RxDBProviderProps {
  children: ReactNode;
  enableReplication?: boolean;
}

export function RxDBProvider({ children, enableReplication = true }: RxDBProviderProps) {
  const [db, setDb] = useState<TaskFlowDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isReplicating, setIsReplicating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const database = await getDatabase();
        if (!mounted) return;

        setDb(database);
        setIsReady(true);

        if (enableReplication) {
          await startReplication(database);
          if (mounted) {
            setIsReplicating(true);
          }
        }
      } catch (err) {
        console.error('Failed to initialize RxDB:', err);
      }
    }

    init();

    return () => {
      mounted = false;
      stopReplication();
    };
  }, [enableReplication]);

  return (
    <RxDBContext.Provider value={{ db, isReady, isReplicating }}>
      {children}
    </RxDBContext.Provider>
  );
}

export function useRxDB(): TaskFlowDatabase {
  const { db } = useContext(RxDBContext);
  if (!db) {
    throw new Error('useRxDB must be used within RxDBProvider after database is ready');
  }
  return db;
}

export function useRxDBContext(): RxDBContextValue {
  return useContext(RxDBContext);
}
