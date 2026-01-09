import { addRxPlugin, createRxDatabase, type RxCollection, type RxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import {
  type ClientDoc,
  collections,
  type ProjectDoc,
  type TaskDoc,
  type TeamMemberDoc,
} from './rxdb-schema';

if (__DEV__) {
  addRxPlugin(RxDBDevModePlugin);
}

function getStorage() {
  const baseStorage = getRxStorageMemory();
  if (__DEV__) {
    return wrappedValidateAjvStorage({ storage: baseStorage });
  }
  return baseStorage;
}

export type TaskFlowCollections = {
  team_members: RxCollection<TeamMemberDoc>;
  clients: RxCollection<ClientDoc>;
  projects: RxCollection<ProjectDoc>;
  tasks: RxCollection<TaskDoc>;
};

export type TaskFlowDatabase = RxDatabase<TaskFlowCollections>;

let dbPromise: Promise<TaskFlowDatabase> | null = null;

export async function getDatabase(): Promise<TaskFlowDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = createRxDatabase<TaskFlowCollections>({
    name: 'taskflow',
    storage: getStorage(),
    multiInstance: false,
    ignoreDuplicate: true,
  }).then(async (db) => {
    await db.addCollections(collections);
    return db;
  });

  return dbPromise;
}

export async function destroyDatabase(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    await db.remove();
    dbPromise = null;
  }
}
