
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { disconnectSocket } from '@/api/chatApi';

// API URL
const API_URL = 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  token: null,
  loading: true,
  isLoggedIn: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wfc_token'));
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('wfc_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });

      if (response.data.success) {
        setCurrentUser(response.data.user);
        setToken(storedToken);
      } else {
        // Token inválido
        localStorage.removeItem('wfc_token');
        setCurrentUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      // Token expirado o inválido
      localStorage.removeItem('wfc_token');
      setCurrentUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success) {
        setCurrentUser(response.data.user);
        
        // Guardar token
        const userToken = response.data.token;
        setToken(userToken);
        localStorage.setItem('wfc_token', userToken);
        
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${response.data.user.name}`,
        });
      }
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error);
      
      // Mostrar mensaje de error
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      
      if (response.data.success) {
        setCurrentUser(response.data.user);
        
        // Guardar token
        const userToken = response.data.token;
        setToken(userToken);
        localStorage.setItem('wfc_token', userToken);
        
        toast({
          title: "Registro exitoso",
          description: `Bienvenido a WorkFlow Connect, ${response.data.user.name}`,
        });
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      // Mostrar mensaje de error
      const errorMessage = error.response?.data?.message || 'Error al registrar usuario. Inténtalo nuevamente.';
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error al cerrar sesión en el servidor:', error);
        // Continuar con el cierre de sesión local incluso si hay error en el servidor
      }
    }
    
    // Desconectar socket
    disconnectSocket();
    
    // Limpiar estado local
    localStorage.removeItem('wfc_token');
    setCurrentUser(null);
    setToken(null);
    
    toast({
      title: "Cierre de sesión",
      description: "Has cerrado sesión correctamente",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        isLoggedIn: !!currentUser,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
