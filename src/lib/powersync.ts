import '@powersync/react-native';
import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from './schema';
import { SupabaseConnector } from './SupabaseConnector';

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: 'taskflow.db',
  },
});

export const connector = new SupabaseConnector();

export async function initPowerSync() {
  await db.init();
  await db.connect(connector);
}

export async function disconnectPowerSync() {
  await db.disconnectAndClear();
}
