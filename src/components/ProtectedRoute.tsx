import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children} : {children: React.ReactNode}) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // 若未登入，重定向至 /login，並將當前 location 存在 state.from 中

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  return <>{children}</>;
}