import { useState, createContext, useContext, ReactNode, useEffect } from "react";

interface AuthContextType {
  signin: (token: string) => void;
  signout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Safely interact with localStorage
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage on initial render
  useEffect(() => {
    const storedToken = safeGetItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const signin = (newToken: string) => {
    setToken(newToken);
    safeSetItem('authToken', newToken);
  };

  const signout = () => {
    setToken(null);
    safeRemoveItem('authToken');
  };

  const getToken = () => token;

  return (
    <AuthContext.Provider value={{ getToken, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};