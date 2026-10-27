import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "bookhaven_auth";

function readStoredAuth() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  function login(username, password) {
    const normalizedUsername = username.trim();

    const nextAuth = {
      email: normalizedUsername,
      role:
        normalizedUsername.toLowerCase() === "admin"
          ? "ADMIN"
          : "CUSTOMER",
      basicToken: btoa(`${normalizedUsername}:${password}`),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }

  const value = useMemo(
    () => ({
      user: auth
        ? {
            email: auth.email,
            role: auth.role,
          }
        : null,
      basicToken: auth?.basicToken ?? null,
      login,
      logout,
    }),
    [auth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}