import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/react-native';
import { supabase } from './supabase';

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL!;

const FATAL_RESPONSE_CODES = [
  /^22\d{3}$/,
  /^23\d{3}$/,
  /^42\d{3}$/,
  /^PGRST\d{3}$/,
];

export class SupabaseConnector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error?.message}`);
    }

    return {
      endpoint: POWERSYNC_URL,
      token: session.access_token,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;

    try {
      for (const op of transaction.crud) {
        lastOp = op;
        const table = supabase.from(op.table);
        let result;

        switch (op.op) {
          case UpdateType.PUT:
            result = await table.upsert({ ...op.opData, id: op.id });
            break;
          case UpdateType.PATCH:
            result = await table.update(op.opData).eq('id', op.id);
            break;
          case UpdateType.DELETE:
            result = await table.delete().eq('id', op.id);
            break;
        }

        if (result?.error) {
          throw new Error(`Could not update Supabase: ${result.error.message}`);
        }
      }

      await transaction.complete();
    } catch (ex: any) {
      if (
        typeof ex.code === 'string' &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))
      ) {
        console.error(`Fatal data upload error - discarding transaction`, ex);
        await transaction.complete();
      } else {
        throw ex;
      }
    }
  }
}
