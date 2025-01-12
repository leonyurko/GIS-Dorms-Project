import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function ProfileScreen() {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        setName(data.name);
        setEmail(data.email);
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
        throw new Error(errorData.message || 'Failed to save profile details');
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

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Edit Profile</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        style={{ margin: '10px', width: '300px' }}
      />
      <br />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ margin: '10px', width: '300px' }}
      />
      <br />
      <button onClick={handleSaveDetails} style={{ marginTop: '20px' }}>
        Save Details
      </button>
      <h3 style={{ marginTop: '30px' }}>Change Password</h3>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ margin: '10px', width: '300px' }}
      />
      <br />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ margin: '10px', width: '300px' }}
      />
      <br />
      <button onClick={handlePasswordChange} style={{ marginTop: '20px' }}>
        Change Password
      </button>
    </div>
  );
}

export default ProfileScreen;
