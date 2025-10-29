// frontend/src/services/api.js

// 1. Ambil URL backend dari file .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("Base URL:", import.meta.env.VITE_API_BASE_URL);

// 2. Helper untuk mengambil token dari localStorage (yang disimpan oleh AuthContext)
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Fungsi inti untuk semua panggilan API.
 * Fungsi ini akan otomatis menambahkan token JWT ke header jika ada.
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();

  // Siapkan headers default
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers, // Timpa dengan header kustom jika ada
  };

  // Jika token ada, tambahkan ke header Authorization
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // (Catatan: Backend Python Anda mungkin perlu diupdate untuk membaca header ini)
  }

  // Gabungkan semua opsi
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
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