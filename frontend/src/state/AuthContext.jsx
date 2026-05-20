import { createContext, useContext, useState } from "react";

import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login/", credentials);
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    await api.post("/auth/register/", payload);
    return login({ username: payload.username, password: payload.password });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
