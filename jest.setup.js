jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: {
    get url() {
      return null;
    },
  },
}));

jest.mock('react-native-toast-message', () => {
  const MockToast = () => null;
  MockToast.show = jest.fn();
  return MockToast;
});

jest.mock('./src/lib/rxdb', () => require('./src/lib/__mocks__/rxdb'));

jest.mock('./src/lib/rxdb-replication', () => ({
  startReplication: jest.fn().mockResolvedValue(undefined),
  stopReplication: jest.fn().mockResolvedValue(undefined),
  getReplicationState: jest.fn().mockReturnValue(undefined),
}));

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (object) => JSON.parse(JSON.stringify(object));
}
