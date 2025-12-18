/* const API_BASE_URL = "http://localhost:8081/api/auth"; */
/* const API_BASE_URL = "http://localhost:8081/auth";


export const API_ENDPOINTS = {
  REQUEST_OTP: `${API_BASE_URL}/request-otp`,
  VERIFY_OTP: `${API_BASE_URL}/verify-otp`,
  REGISTER: `${API_BASE_URL}/register`,
  LOGIN: `${API_BASE_URL}/login`,   
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL; */

const API_BASE_URL = "/api/auth";

export const API_ENDPOINTS = {
  REQUEST_OTP: `${API_BASE_URL}/request-otp`,
  VERIFY_OTP: `${API_BASE_URL}/verify-otp`,
  REGISTER: `${API_BASE_URL}/register`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;

