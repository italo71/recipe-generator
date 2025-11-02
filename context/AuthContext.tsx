import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

// Definir um tipo para o objeto do usuário
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
}

// 1. Defina os tipos para o estado de autenticação
interface AuthStateType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null; //Adicionar o usuário ao estado
}

// 2. Defina os tipos para o valor completo do Contexto
interface AuthContextType extends AuthStateType {
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, full_name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// 3. Inicie o contexto com o tipo correto OU null
const AuthContext = createContext<AuthContextType | null>(null);

// 4. Este é o hook que suas telas vão usar.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// 5. O Provedor (Provider)
export const AuthProvider = ({ children }: PropsWithChildren) => {
  
  // 6. Use o tipo no seu useState
  const [authState, setAuthState] = useState<AuthStateType>({
    token: null,
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync('token');

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await api.get('/auth/me'); 
          
          setAuthState({
            token: token,
            isAuthenticated: true,
            isLoading: false,
            user: response.data,
          });

        } catch (e) {
          // Se o token for inválido (ex: expirado), limpe tudo
          console.error("Token inválido ou expirado, limpando...", e);
          await SecureStore.deleteItemAsync('token');
          setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } else {
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    loadToken();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // 1. Fazer login para pegar o token
      const response = await api.post('/auth/login', { username, password });
      const { access_token } = response.data;

      // 2. Configurar o token para futuras requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      await SecureStore.setItemAsync('token', access_token);

      // 3. Buscar os dados do usuário com /auth/me
      const userResponse = await api.get('/auth/me');

      // 4. Salvar tudo no estado
      setAuthState({
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        user: userResponse.data,
      });
      return true;

    } catch (e) {
      console.error('Erro no login ou ao buscar /auth/me:', e);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string, full_name: string) => {
    try {
      await api.post('/auth/register', { username, email, password, full_name });
      return await login(username, password); 
    } catch (e) {
      console.error('Erro no registro:', e);
      return false;
    }
  };

  const logout = async () => {
    delete api.defaults.headers.common['Authorization'];
    await SecureStore.deleteItemAsync('token');

    setAuthState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};