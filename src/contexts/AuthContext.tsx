import React, { createContext, useContext, useEffect, useState } from "react";
import { setToken as setModuleToken } from "../auth";
import type { UserResponse } from "../types";
import api from "../api";

interface AuthContextType {
  token: string | null;
  user: UserResponse | null;
  login: (newToken: string) => void;
  isAdmin : boolean;
  logout: () => void;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  // 🟢 1. 記錄使用者資訊
  const [user, setUser] = useState<UserResponse | null>(null);

  // 🟢 2. 登入函式改為 async：存 token 並打 /auth/me
  const login = async (newToken: string) => {
    setTokenState(newToken);
    setModuleToken(newToken); // 👈 關鍵：同步給 Interceptor 使用

    try {
      const res = await api.get<UserResponse>("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("無法取得使用者資訊:", err);
      logout();
    }
  };

  // 登出：同時清空
  const logout = () => {
    setTokenState(null);
    setModuleToken(null); // 👈 關鍵：清空 Interceptor 的 Token
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorizedEvent = () => {
      logout();
    };
    window.addEventListener("unauthorized", handleUnauthorizedEvent);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorizedEvent);
    }
  },[]);
  
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAdmin: user?.role === "admin", // 🟢 3. 方便的 boolean 判斷
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
// 供其他元件呼叫的 Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必須在 AuthProvider 內部使用");
  }
  return context;
}


