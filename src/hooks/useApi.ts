import { useAuth } from '../contexts/AuthContext';

export function useApi() {
  const { token, logout } = useAuth();

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const base = import.meta.env.VITE_API_URL || '/api';
    const url = `${base}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  };

  return { apiRequest };
}