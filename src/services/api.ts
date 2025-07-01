import axios from 'axios';
import { SignupData } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  signup: (userData: FormData) =>
    api.post('/auth/signup', userData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getCurrentUser: () =>
    api.get('/auth/me'),

  sendOTP: (mobile: string) =>
    api.post('/auth/send-otp', { mobile }),

  verifyOTP: (mobile: string, otp: string) =>
    api.post('/auth/verify-otp', { mobile, otp })
};

export const resumeAPI = {
  getResume: () =>
    api.get('/resume'),
  
  createResume: (resumeData: any) =>
    api.post('/resume', resumeData),
  
  updateResume: (resumeData: any) =>
    api.put('/resume', resumeData),
  
  deleteResume: () =>
    api.delete('/resume')
};

export default api;