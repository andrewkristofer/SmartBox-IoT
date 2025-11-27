// frontend/src/services/api.js

// 1. Ambil URL backend dari file .env
// Hapus trailing slash jika ada agar konsisten
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

// 2. Helper untuk mengambil token dari localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Fungsi inti untuk semua panggilan API.
 */
const apiFetch = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       const text = await response.text();
       throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Fetch Error (${endpoint}):`, err.message);
    throw err;
  }
};

// --- FUNGSI AUTH ---

export const loginUser = (username, password) => {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const registerUser = (signupData) => {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(signupData), // Mengirim data lengkap (termasuk profil mitra)
  });
};

// --- FUNGSI DATA ---

export const getSmartBoxData = (boxId, limit = 6) => {
  return apiFetch(`/api/data/${boxId}?limit=${limit}`, {
    method: 'GET',
  });
};

// --- FUNGSI SUPER ADMIN (WAJIB ADA UNTUK ADMIN PAGE) ---

export const getPendingUsers = () => {
  return apiFetch('/api/admin/users', { method: 'GET' });
};

export const approveUser = (userId) => {
  return apiFetch(`/api/admin/approve/${userId}`, { method: 'POST' });
};