import type { TaskFlowDatabase, TaskFlowCollections } from '../rxdb';

const mockCollection = {
  find: jest.fn().mockReturnValue({
    $: { subscribe: jest.fn() },
    exec: jest.fn().mockResolvedValue([]),
  }),
  findOne: jest.fn().mockReturnValue({
    $: { subscribe: jest.fn() },
    exec: jest.fn().mockResolvedValue(null),
  }),
  insert: jest.fn().mockResolvedValue({}),
  upsert: jest.fn().mockResolvedValue({}),
  bulkInsert: jest.fn().mockResolvedValue({ success: [], error: [] }),
  bulkUpsert: jest.fn().mockResolvedValue({ success: [], error: [] }),
};

export const mockDb = {
  team_members: mockCollection as unknown as TaskFlowCollections['team_members'],
  clients: mockCollection as unknown as TaskFlowCollections['clients'],
  projects: mockCollection as unknown as TaskFlowCollections['projects'],
  tasks: mockCollection as unknown as TaskFlowCollections['tasks'],
  remove: jest.fn().mockResolvedValue(undefined),
} as unknown as TaskFlowDatabase;

let dbPromise: Promise<TaskFlowDatabase> | null = null;

export async function getDatabase(): Promise<TaskFlowDatabase> {
  if (!dbPromise) {
    dbPromise = Promise.resolve(mockDb as TaskFlowDatabase);
  }
  return dbPromise;
}

export async function destroyDatabase(): Promise<void> {
  dbPromise = null;
}
