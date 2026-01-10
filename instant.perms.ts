import type { InstantRules } from '@instantdb/react-native';
import type { AppSchema } from './instant.schema';

const rules = {
  $users: {
    allow: {
      view: 'auth.id == data.id',
      update: 'auth.id == data.id',
    },
  },
  clients: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: 'auth.id != null',
      delete: 'auth.id != null',
    },
  },
  projects: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: 'auth.id != null',
      delete: 'auth.id != null',
    },
  },
  tasks: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: 'auth.id != null',
      delete: 'auth.id != null',
    },
  },
  teamMembers: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      update: 'auth.id != null',
      delete: 'auth.id != null',
    },
  },
} satisfies InstantRules<AppSchema>;

export default rules;
