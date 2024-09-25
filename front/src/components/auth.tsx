import React, { useRef, useState, useCallback, useMemo, createContext, useContext, ReactNode } from "react";

export type TokenFunction = () => string | null;

interface AuthContextType {
  signin: (token: string) => void;
  signout: () => void;
  getToken: TokenFunction;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] =  useState<string | null>(null);

  const signin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const signout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

 const getToken = () => {
    // read it from the localStorage as well
    return token;
  };

 const value = { getToken, signin, signout };

  return (
    <AuthContext.Provider value={value}>
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
