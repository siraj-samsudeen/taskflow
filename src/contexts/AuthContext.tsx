import { createContext, type ReactNode, useContext } from 'react';
import { db } from '../lib/instant';

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  isLoading: boolean;
  user: User | null;
  error: { message: string } | null;
  sendMagicCode: (email: string) => Promise<void>;
  verifyMagicCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading, user, error } = db.useAuth();

  const sendMagicCode = async (email: string) => {
    await db.auth.sendMagicCode({ email });
  };

  const verifyMagicCode = async (email: string, code: string) => {
    await db.auth.signInWithMagicCode({ email, code });
  };

  const logout = async () => {
    await db.auth.signOut();
  };

  const contextUser = user && user.email ? { id: user.id, email: user.email } : null;

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user: contextUser,
        error: error ? { message: error.message } : null,
        sendMagicCode,
        verifyMagicCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
