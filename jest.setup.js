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

jest.mock('./src/lib/instant', () => ({
  db: {
    useAuth: jest.fn().mockReturnValue({ isLoading: false, user: null, error: null }),
    useQuery: jest.fn().mockReturnValue({ isLoading: false, data: null }),
    transact: jest.fn(),
    tx: new Proxy(
      {},
      {
        get: () =>
          new Proxy(
            {},
            {
              get: () =>
                new Proxy(
                  {},
                  {
                    get: (target, prop) => {
                      if (prop === 'update' || prop === 'delete') {
                        return jest.fn().mockReturnValue({});
                      }
                      return new Proxy({}, { get: () => jest.fn().mockReturnValue({}) });
                    },
                  }
                ),
            }
          ),
      }
    ),
    auth: {
      sendMagicCode: jest.fn().mockResolvedValue(undefined),
      signInWithMagicCode: jest.fn().mockResolvedValue(undefined),
      signOut: jest.fn().mockResolvedValue(undefined),
    },
  },
  id: jest.fn().mockReturnValue('mock-id'),
}));

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (object) => JSON.parse(JSON.stringify(object));
}

// Add react-native-testing-library matchers
import '@testing-library/react-native/matchers';
