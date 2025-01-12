import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' }); // וודא שהפורט הוא זה של השרת שלך

// רישום משתמש
export const registerUser = (userData) => API.post('/api/register', userData);

// התחברות משתמש
export const loginUser = (userData) => API.post('/api/login', userData);

// קבלת פרטי משתמש
export const getUserProfile = (token) =>
  API.get('/api/profile', {
    headers: { Authorization: `Bearer ${token}` }, // שולח את הטוקן
  });

// עדכון פרטי משתמש
export const updateUserProfile = (token, updatedData) =>
  API.put('/api/update-profile', updatedData, {
    headers: { Authorization: `Bearer ${token}` }, // שולח את הטוקן
  });

// עדכון סיסמת משתמש
export const changeUserPassword = (token, newPassword) =>
  API.put(
    '/api/change-password',
    { newPassword },
    {
      headers: { Authorization: `Bearer ${token}` }, // שולח את הטוקן
    }
  );
