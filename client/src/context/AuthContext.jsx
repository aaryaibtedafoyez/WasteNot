import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("wastenot_token");
    const cachedUser = localStorage.getItem("wastenot_user");

    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser));
      // Revalidate in the background; logs out silently if token is stale.
      authApi
        .me()
        .then(({ data }) => {
          setUser(data.user);
          localStorage.setItem("wastenot_user", JSON.stringify(data.user));
        })
        .catch(() => {
          localStorage.removeItem("wastenot_token");
          localStorage.removeItem("wastenot_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem("wastenot_token", data.token);
    localStorage.setItem("wastenot_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await authApi.signup(payload);
    localStorage.setItem("wastenot_token", data.token);
    localStorage.setItem("wastenot_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("wastenot_token");
    localStorage.removeItem("wastenot_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
