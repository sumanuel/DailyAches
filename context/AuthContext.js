import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../utils/authService";
import HttpService from "../utils/httpService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Session only: token + isAuthenticated. User data lives in UserContext, which
// reacts to these flags.
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const isAuth = await AuthService.isAuthenticated();
        if (active) setIsAuthenticated(isAuth);
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        if (active) setAuthLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await AuthService.login(email, password);
    if (response.success) setIsAuthenticated(true);
    return response;
  };

  const register = async (email, password, name) => {
    const response = await AuthService.register(email, password, name);
    if (response.success) setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    const response = await AuthService.logout();
    if (response.success) setIsAuthenticated(false);
    return response;
  };

  // Expired or revoked token: drop the session so the navigator shows login.
  // logout only uses a state setter, so the closure from the first render is safe.
  useEffect(() => {
    HttpService.setUnauthorizedHandler(() => {
      logout();
    });
    return () => HttpService.setUnauthorizedHandler(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, authLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
