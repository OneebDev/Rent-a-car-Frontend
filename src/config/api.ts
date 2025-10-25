// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rent-a-car-backend-t3c9.vercel.app';

export const API_ENDPOINTS = {
  SEND_BOOKING_EMAIL: `${API_BASE_URL}/api/send-booking-email`,
  TEST_EMAIL: `${API_BASE_URL}/api/test-email`,
};

export default API_BASE_URL;

