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
  deactivate: (userId: number) => api.post(`/user/deactivate/${userId}`),
  activate: (userId: number) => api.post(`/user/activate/${userId}`),
};

export const roleAPI = {
  list: (skip = 0, limit = 100) =>
    api.get('/role/list', { params: { skip, limit } }),
  get: (id: number) => api.get(`/role/get/${id}`),
};

export const classAPI = {
  list: (skip = 0, limit = 100, filters = {}) =>
    api.get('/class/list', { params: { skip, limit, ...filters } }),
  get: (id: number) => api.get(`/class/${id}`),
  create: (data: any) => api.post('/class/add', data),
  update: (id: number, data: any) => api.post(`/class/update/${id}`, data),
  remove: (id: number) => api.post(`/class/remove/${id}`),
  addUser: (classId: number, userId: number) =>
    api.post(`/class/add_user/${classId}?user_id=${userId}`),
  removeUser: (classId: number, userId: number) =>
    api.post(`/class/remove_user/${classId}?user_id=${userId}`),
  addExercise: (classId: number, exerciseId: number, data: any) =>
    api.post(`/class/add_exercise/${classId}?exercise_id=${exerciseId}&teacher_id=${data['teacher_id']}&day_of_week=${data['day_of_week']}&time_of_exercise=${data['time_of_exercise']}`),
  removeExercise: (classExerciseId: number) => api.post(`/class/remove_exercise/${classExerciseId}`),
  deactivate: (classId: number) => api.post(`/class/deactivate/${classId}`),
  activate: (classId: number) => api.post(`/class/activate/${classId}`),
};

export const exerciseAPI = {
  list: (skip = 0, limit = 100) =>
    api.get('/exercise/list', { params: { skip, limit } }),
  get: (id: number) => api.get(`/exercise/get/${id}`),
  create: (data: any) => api.post('/exercise/add', data),
  update: (id: number, data: any) => api.post(`/exercise/update/${id}`, data),
};

export const exerciseHistoryAPI = {
  generate: (classId: number) => api.post(`/history/generate/${classId}`),
  list: (skip = 0, limit = 100, filters = {}) =>
    api.get('/history/list', { params: { skip, limit, ...filters } }),
  update: (id: number, data: any) => api.post(`/history/update/${id}`, data),
  get: (id: number) => api.get(`/history/get/${id}`),
};

export const attendanceAPI = {
  mark: (exerciseHistoryId: number, data: any) =>
    api.post(`/attend/mark/${exerciseHistoryId}`, data),
  list: (skip = 0, limit = 100, filters = {}) =>
    api.get('/attend/list', { params: { skip, limit, ...filters } }),
  get: (id: number) => api.get(`/attend/get/${id}`),
  update: (id: number, data: any) => api.post(`/attend/update/${id}`, data),
  // Generate attendance rows for a given exercise_history_id. Returns integer count.
  generate: (exerciseHistoryId: number, force = false) =>
    api.get(`/attend/${exerciseHistoryId}/generate`, { params: { force } }),
  // Convenience endpoints to set status for a single user/session.
  // They follow: GET /attend/{exercise_history_id}/{user_id}/{present|absent|late}?force={bool}
  present: (exerciseHistoryId: number, userId: number, force = false) =>
    api.get(`/attend/${exerciseHistoryId}/${userId}/present`, { params: { force } }),
  absent: (exerciseHistoryId: number, userId: number, force = false) =>
    api.get(`/attend/${exerciseHistoryId}/${userId}/absent`, { params: { force } }),
  late: (exerciseHistoryId: number, userId: number, force = false) =>
    api.get(`/attend/${exerciseHistoryId}/${userId}/late`, { params: { force } }),
  // Generic helper to call one of the convenience endpoints based on status.
  setStatusForUser: (exerciseHistoryId: number, userId: number, status: string, force = false) => {
    switch (status) {
      case 'present':
        return api.get(`/attend/${exerciseHistoryId}/${userId}/present`, { params: { force } });
      case 'absent':
        return api.get(`/attend/${exerciseHistoryId}/${userId}/absent`, { params: { force } });
      case 'late':
        return api.get(`/attend/${exerciseHistoryId}/${userId}/late`, { params: { force } });
      default:
        // For statuses not covered by convenience endpoints (e.g. 'excused') fall back to update by id.
        // Caller should use `update` in that case; here we throw to make intent explicit.
        throw new Error('Unsupported convenience status');
    }
  },
};

export const gradeAPI = {
  // Create or upsert a grade: POST /grade/
  create: (data: any) => api.post('/grade/', data),
  // List grades with pagination and optional filters: GET /grade/
  list: (skip = 0, limit = 100, filters = {}) =>
    api.get('/grade/', { params: { skip, limit, ...filters } }),
  // Retrieve single grade: GET /grade/{id}
  get: (id: number) => api.get(`/grade/${id}`),
  // Update grade: PUT /grade/{id}
  update: (id: number, data: any) => api.put(`/grade/${id}`, data),
  // Delete grade: DELETE /grade/{id}
  delete: (id: number) => api.delete(`/grade/${id}`),
};

export const taskAPI = {
  list: (skip = 0, limit = 100, filters = {}) =>
    api.get('/task/', { params: { skip, limit, ...filters } }),
  get: (id: number) => api.get(`/task/${id}`),
  create: (data: any) => api.post('/task/', data),
  update: (id: number, data: any) => api.put(`/task/${id}`, data),
  updateStatus: (id: number, newStatus: string) =>
    api.put(`/task/${id}/status/${newStatus}`),
  delete: (id: number) => api.delete(`/task/${id}`),
};

export const messageAPI = {
  list: (skip = 0, limit = 100, filters = {}) =>
    api.get('/msg/', { params: { skip, limit, ...filters } }),
  get: (id: number) => api.get(`/msg/${id}`),
  create: (data: any) => api.post('/msg/', data),
  delete: (id: number) => api.delete(`/msg/${id}`),
};