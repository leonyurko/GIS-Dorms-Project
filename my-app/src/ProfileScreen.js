import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { deleteUserAccount } from './api';

function ProfileScreen() {
  const { token, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState(''); // הוספת userId
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user profile');
        }

        const data = await response.json();
        console.log('Fetched user profile:', data); // לוג לנתוני המשתמש
        setName(data.name);
        setEmail(data.email);
        setUserId(data._id); // שמירת userId מהשרת
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error.message);
        alert(error.message || 'Error fetching profile. Please try again later.');
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleSaveDetails = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => {
          throw new Error('Unexpected response format from server');
        });
  
        // בדיקת שגיאה במקרה של שם משתמש "admin"
        if (errorData.message === 'Cannot use "admin" as a username') {
          alert('Cannot use "admin" as a username. Please choose a different name.');
        } else {
          throw new Error(errorData.message || 'Failed to save profile details');
        }
        return; // יציאה מוקדמת אם הייתה שגיאה
      }
  
      const data = await response.json();
      alert(data.message || 'Profile details updated successfully!');
    } catch (error) {
      console.error('Error saving profile details:', error.message);
      alert(error.message || 'Error saving profile details. Please try again later.');
    }
  };
  

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      alert('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error.message);
      alert(error.message || 'Error changing password. Please try again later.');
    }
  };

  console.log('Attempting to delete account with userId:', userId);
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        console.log('Attempting to delete account...');
        const response = await deleteUserAccount(token); // העברת הטוקן בלבד
        console.log('Response from server:', response.data);
  
        alert('Your account has been deleted.');
        logout(); // התנתקות מהאפליקציה לאחר המחיקה
      } catch (error) {
        console.error('Error deleting account:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Error deleting account. Please try again later.');
      }
    }
  };
  


  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Edit Profile</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        style={{ margin: '10px', width: '300px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <br />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ margin: '10px', width: '300px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <br />
      <button onClick={handleSaveDetails} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
        Save Details
      </button>
      <h3 style={{ marginTop: '30px', fontSize: '24px', fontWeight: 'bold' }}>Change Password</h3>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ margin: '10px', width: '300px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <br />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ margin: '10px', width: '300px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <br />
      <button onClick={handlePasswordChange} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
        Change Password
      </button>
      <br />
      <button
        onClick={handleDeleteAccount}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: 'red',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Delete Account
      </button>
    </div>
  );
}

export default ProfileScreen;
