import { replicateRxCollection, type RxReplicationState } from 'rxdb/plugins/replication';
import type { RxCollection } from 'rxdb';
import { supabase } from './supabase';
import type { TaskFlowDatabase } from './rxdb';

type ReplicationStates = Map<string, RxReplicationState<unknown, unknown>>;

const replicationStates: ReplicationStates = new Map();

interface SupabaseCheckpoint {
  id: string;
  modifiedAt: string;
}

function createSupabaseReplication<T extends { id: string; modifiedAt: string; isDeleted: boolean }>(
  collection: RxCollection<T>,
  tableName: string
): RxReplicationState<T, SupabaseCheckpoint> {
  const replication = replicateRxCollection<T, SupabaseCheckpoint>({
    collection,
    replicationIdentifier: `supabase-${tableName}`,
    live: true,
    retryTime: 5000,
    waitForLeadership: false,
    autoStart: true,

    push: {
      batchSize: 50,
      async handler(changeRows) {
        for (const row of changeRows) {
          const doc = row.newDocumentState;
          if (!doc) continue;

          const { isDeleted, modifiedAt, ...data } = doc;

          if (isDeleted) {
            await supabase.from(tableName).update({ _deleted: true }).eq('id', doc.id);
          } else {
            await supabase.from(tableName).upsert({
              ...data,
              _deleted: false,
            });
          }
        }
        return [];
      },
    },

    pull: {
      batchSize: 100,
      async handler(lastCheckpoint, batchSize) {
        let query = supabase
          .from(tableName)
          .select('*')
          .order('_modified', { ascending: true })
          .order('id', { ascending: true })
          .limit(batchSize);

        if (lastCheckpoint) {
          query = query.or(
            `_modified.gt.${lastCheckpoint.modifiedAt},and(_modified.eq.${lastCheckpoint.modifiedAt},id.gt.${lastCheckpoint.id})`
          );
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Supabase pull error: ${error.message}`);
        }

        const documents = (data ?? []).map((doc) => {
          const { _deleted, _modified, ...rest } = doc;
          return {
            ...rest,
            id: String(doc.id),
            isDeleted: _deleted ?? false,
            modifiedAt: _modified ?? new Date().toISOString(),
          };
        }) as T[];

        const checkpoint: SupabaseCheckpoint | undefined =
          documents.length > 0
            ? {
                id: documents[documents.length - 1].id,
                modifiedAt: documents[documents.length - 1].modifiedAt,
              }
            : lastCheckpoint;

        return {
          documents,
          checkpoint,
        };
      },
      stream$: undefined,
    },
  });

  replication.error$.subscribe((err) => {
    console.error(`Replication error for ${tableName}:`, err);
  });

  return replication;
}

export async function startReplication(db: TaskFlowDatabase): Promise<void> {
  const tables = ['team_members', 'clients', 'projects', 'tasks'] as const;

  for (const tableName of tables) {
    const collection = db[tableName] as RxCollection<any>;
    if (collection && !replicationStates.has(tableName)) {
      const replication = createSupabaseReplication(collection, tableName);
      replicationStates.set(tableName, replication as RxReplicationState<unknown, unknown>);
    }
  }
}

export async function stopReplication(): Promise<void> {
  for (const [, replication] of replicationStates) {
    await replication.cancel();
  }
  replicationStates.clear();
}

export function getReplicationState(tableName: string): RxReplicationState<unknown, unknown> | undefined {
  return replicationStates.get(tableName);
}
