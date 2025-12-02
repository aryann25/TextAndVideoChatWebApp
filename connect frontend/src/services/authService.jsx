// src/services/authService.js
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const LOCAL_STORAGE_USER_KEY = 'connect_user';
const LOCAL_STORAGE_MOBILE_KEY = 'connect_mobile';

const authService = {
  // Save mobile number during OTP process
  saveMobile: (mobile) => localStorage.setItem(LOCAL_STORAGE_MOBILE_KEY, mobile),
  getMobile: () => localStorage.getItem(LOCAL_STORAGE_MOBILE_KEY),

  // Save full user after successful login/OTP verification
  saveUser: (user) => localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user)),
  getCurrentUser: () => {
    const user = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isAuthenticated: () => !!localStorage.getItem(LOCAL_STORAGE_USER_KEY),

  logout: () => {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_MOBILE_KEY);
  },

  // API calls
  requestOTP: (mobile) => axios.post(API_ENDPOINTS.REQUEST_OTP, { mobile }),
  verifyOTP: (mobile, otp) => axios.post(API_ENDPOINTS.VERIFY_OTP, { mobile, otp })
    .then(res => {
      // Save user info returned from backend
      authService.saveUser(res.data);
      return res.data;
    }),
  register: (userData) => axios.post(API_ENDPOINTS.REGISTER, userData)
};

export default authService;
