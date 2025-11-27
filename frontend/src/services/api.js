// frontend/src/services/api.js

// 1. Ambil URL backend dari file .env
// Hapus trailing slash jika ada agar konsisten
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

console.log("API Base URL:", BASE_URL); // Debugging

// 2. Helper untuk mengambil token dari localStorage (yang disimpan oleh AuthContext)
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Fungsi inti untuk semua panggilan API.
 * Fungsi ini akan otomatis menambahkan token JWT ke header jika ada.
 */
const apiFetch = async (endpoint, options = {}) => {
  // Pastikan endpoint selalu diawali dengan slash '/'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const token = getAuthToken();

  // Siapkan headers default
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers, // Timpa dengan header kustom jika ada
  };

  // Jika token ada, tambahkan ke header Authorization
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Gabungkan semua opsi
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Cek jika response bukan JSON (misal error 404/500 html page dari Flask)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       // Jika bukan JSON, lempar error teks (misal "404 Not Found")
       const text = await response.text();
       throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      // Lemparkan error agar bisa ditangkap oleh .catch() di komponen
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Fetch Error (${endpoint}):`, err.message);
    throw err; // Lemparkan lagi agar komponen tahu ada error
  }
};

// --- Ekspor fungsi-fungsi spesifik untuk komponen ---

/**
 * Melakukan login user.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} Data (termasuk token dan user)
 */
export const loginUser = (username, password) => {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

/**
 * Mendaftarkan user baru.
 * @param {object} signupData - { username, email, password }
 * @returns {Promise<object>} Pesan sukses
 */
export const registerUser = (signupData) => {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(signupData),
  });
};

/**
 * Mengambil data Smart Box terbaru (permintaan aman).
 * @param {string} boxId
 * @param {number} limit
 * @returns {Promise<array>} Array berisi data log
 */
export const getSmartBoxData = (boxId, limit = 6) => {
  // apiFetch akan otomatis menambahkan token ke permintaan ini
  return apiFetch(`/api/data/${boxId}?limit=${limit}`, {
    method: 'GET',
  });
};