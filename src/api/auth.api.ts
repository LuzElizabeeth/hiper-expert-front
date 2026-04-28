import { http } from './http';

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  data: {
    user: User;
    access_token: string;
  };
  message: string;
}

export async function login(payload: {
  email: string;
  password: string;
}) {
  const response = await http.post<AuthResponse>('/auth/login', payload);
  return response.data;
}

export async function register(payload: {
  email: string;
  password: string;
  full_name: string;
}) {
  const response = await http.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function getMe() {
  const response = await http.get<{ data: User; message: string }>('/users/me');
  return response.data;
}