import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const api = axios.create({
  baseURL: '/api', // Use relative URL to work with Vite proxy
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return { token, user };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return { token, user };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed';
    throw new Error(message);
  }
};

export const googleLogin = async (credential: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/google', { credential });
    const { token, user } = response.data;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return { token, user };
  } catch (error: any) {
    const message = error.response?.data?.message || 'Google login failed';
    throw new Error(message);
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    const response = await api.get('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.valid;
  } catch {
    return false;
  }
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};