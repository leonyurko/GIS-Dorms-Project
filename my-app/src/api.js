import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' }); // ודא שהפורט נכון

// רישום משתמש
export const registerUser = (userData) => API.post('/api/register', userData);

// התחברות משתמש
export const loginUser = (userData) => API.post('/api/login', userData);

// קבלת פרטי משתמש
export const getUserProfile = (token) =>
  API.get('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

// עדכון פרטי משתמש
export const updateUserProfile = (token, updatedData) =>
  API.put('/api/update-profile', updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  });

// עדכון סיסמת משתמש
export const changeUserPassword = (token, newPassword) =>
  API.put(
    '/api/change-password',
    { newPassword },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

// מחיקת משתמש
export const deleteUserAccount = (token) =>
  API.delete('/api/delete-account', {
    headers: { Authorization: `Bearer ${token}` },
  });

// === פונקציות למועדפים ===

// הוספת מעון למועדפים
// הוספת מעון למועדפים ללא שימוש בטוקן
// הוספת מעון למועדפים
export const addToFavorites = async (userId, dormId) => {
  try {
      const response = await fetch('http://localhost:5000/api/favorites/add', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, dormId }), // שליחת userId במקום username
      });

      if (!response.ok) {
          throw new Error('Failed to add to favorites');
      }

      return response.json();
  } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
  }
};

// הסרת מעון מהמועדפים
export const removeFromFavorites = async (userId, dormId) => {
  if (!userId || !dormId) {
    console.error("Error: Missing userId or dormId");
    return;
  }
  try {
    return await API.delete('/api/favorites/remove', {
      data: { userId, dormId }
    });
  } catch (error) {
    console.error("API error while removing from favorites:", error.response?.data || error);
    throw error;
  }
};

// שליפת רשימת המועדפים
export const getFavorites = async (userName) => {
  try {
      const response = await fetch(`http://localhost:5000/api/favorites/${userName}`);

      if (!response.ok) {
          throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
          console.error("API returned invalid data:", data);
          return [];
      }

      return data;
  } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
  }
};




