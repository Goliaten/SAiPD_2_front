import axios from 'axios';
import * as CryptoJS from 'crypto-js';

const API_BASE = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to hash password with MD5
export const hashPassword = (password: string): string => {
  return CryptoJS.MD5(password).toString();
};

// API endpoints
export const authAPI = {
  login: (login: string, password: string) =>
    // send credentials as query params on POST (no request body)
    api.post<{ id: number }>('/auth', null, {
      params: { login, password: hashPassword(password) },
    }),
  getUser: (id: number) => api.get(`/user/get/${id}`),
};

export const userAPI = {
  list: (skip = 0, limit = 100, filters = {}) =>
    api.get('/user/list', { params: { skip, limit, ...filters } }),
  get: (id: number) => api.get(`/user/get/${id}`),
  add: (data: any) => api.post('/user/add', data),
  update: (id: number, data: any) => api.post(`/user/update/${id}`, data),
  addRole: (userId: number, roleId: number) =>
    api.post(`/user/add_role/${userId}?role_id=${roleId}`),
  removeRole: (userId: number, roleId: number) =>
    api.post(`/user/remove_role/${userId}?role_id=${roleId}`),
};

export const roleAPI = {
  list: (skip = 0, limit = 100) =>
    api.get('/role/list', { params: { skip, limit } }),
  get: (id: number) => api.get(`/role/get/${id}`),
};

export const classAPI = {
  list: (skip = 0, limit = 100, filters = {}) =>
    api.get('/class/list', { params: { skip, limit, ...filters } }),
  get: (id: number) => api.get(`/class/get/${id}`),
  create: (data: any) => api.post('/class/add', data),
  update: (id: number, data: any) => api.post(`/class/update/${id}`, data),
  remove: (id: number) => api.post(`/class/remove/${id}`),
  addUser: (classId: number, userId: number) =>
    api.post(`/class/add_user/${classId}?user_id=${userId}`),
  removeUser: (classId: number, userId: number) =>
    api.post(`/class/remove_user/${classId}?user_id=${userId}`),
  addExercise: (classId: number, exerciseId: number, data: any) =>
    api.post(`/class/add_exercise/${classId}?exercise_id=${exerciseId}`, data),
  removeExercise: (classId: number, exerciseId: number) =>
    api.post(`/class/remove_exercise/${classId}?exercise_id=${exerciseId}`),
};

export const exerciseAPI = {
  list: (skip = 0, limit = 100) =>
    api.get('/exercise/list', { params: { skip, limit } }),
  get: (id: number) => api.get(`/exercise/get/${id}`),
  create: (data: any) => api.post('/exercise/add', data),
  update: (id: number, data: any) => api.post(`/exercise/update/${id}`, data),
  delete: (id: number) => api.post(`/exercise/delete/${id}`),
};
