import React, { createContext, useContext, useEffect, useState } from "react";
import { setToken as setModuleToken } from "../auth";

interface AuthContextType {
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  // 登入：同步更新 React State 與 Module 變數
  const login = (newToken: string) => {
    setTokenState(newToken);
    setModuleToken(newToken); // 👈 關鍵：同步給 Interceptor 使用
  };
  // 登出：同時清空
  const logout = () => {
    setTokenState(null);
    setModuleToken(null); // 👈 關鍵：清空 Interceptor 的 Token
  };
  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
  useEffect(() => {
    const handleUnauthorizedEvent = () => {
      logout();
    };
    window.addEventListener("unauthorized", handleUnauthorizedEvent);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorizedEvent);
    }
  },[]);
}
// 供其他元件呼叫的 Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必須在 AuthProvider 內部使用");
  }
  return context;
}


