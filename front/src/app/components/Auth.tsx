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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage on initial render
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setToken(token);
    }
  }, []);

  const signin = (token: string) => {
    setToken(token);
    localStorage.setItem('authToken', token);
  };

  const signout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
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