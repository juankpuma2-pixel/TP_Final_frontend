import { createContext, useContext, useState, useEffect } from "react";
import { loginCliente as loginClienteApi, loginAdminApi, registrarCliente as registrarClienteApi } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user_info");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("access_token") || null);

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem("is_admin") === "true";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user_info", JSON.stringify(user));
    } else {
      localStorage.removeItem("user_info");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("is_admin", isAdmin ? "true" : "false");
  }, [isAdmin]);

  const loginCliente = async (credentials) => {
    const data = await loginClienteApi(credentials);
    const tokenVal = data.token || data.access_token || localStorage.getItem("access_token");
    const userInfo = data.usuario || { email: credentials.email, nombre: credentials.email.split('@')[0], is_admin: false };
    
    setToken(tokenVal);
    setUser(userInfo);
    setIsAdmin(false);
    return data;
  };

  const loginAdmin = async (credentials) => {
    try {
      const data = await loginAdminApi(credentials);
      const tokenVal = data.token || data.access_token || localStorage.getItem("access_token");
      const userInfo = data.usuario || { email: credentials.email, nombre: "Administrador", is_admin: true };
      
      setToken(tokenVal);
      setUser(userInfo);
      setIsAdmin(true);
      return data;
    } catch (error) {
      // Si no tiene permisos de administrador, limpia todo el estado y token
      setToken(null);
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
      localStorage.removeItem("is_admin");
      throw error;
    }
  };

  const registrarCliente = async (datos) => {
    return await registrarClienteApi(datos);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    localStorage.removeItem("is_admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        loginCliente,
        loginAdmin,
        registrarCliente,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
