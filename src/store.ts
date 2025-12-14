import { create } from 'zustand';

interface User {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null,
  token: localStorage.getItem('token'),
  isLoggedIn: !!localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token, isLoggedIn: true });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isLoggedIn: false });
  },
}));
