import { init } from '@instantdb/react-native';
import schema from '../../instant.schema';

const appId = process.env.EXPO_PUBLIC_INSTANT_APP_ID!;

export const db = init({ appId, schema });

export { id } from '@instantdb/react-native';
