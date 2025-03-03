import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addToFavorites, getFavorites, removeFromFavorites } from './api'; // API ניהול מועדפים
import { useAuth } from './AuthContext';


// יצירת אייקון מותאם אישית למעונות
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png',
  iconSize: [40, 40],
});

function MapScreen() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState([32.016081, 34.774826]); // HIT - Holon Institute of Technology
  const [dorms, setDorms] = useState([]); // נתוני המעונות מהשרת
  const [favorites, setFavorites] = useState([]); // שמירת המועדפים של המשתמש
  const { user } = useAuth(); // ✅ קבלת המשתמש המחובר

  const ChangeMapView = ({ coords }) => {
    const map = useMap();
    map.setView(coords, 15);
    return null;
  };

  useEffect(() => {
    const fetchDorms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dorms');
        if (!response.ok) {
          throw new Error('Failed to fetch dorms');
        }
        const data = await response.json();
        setDorms(data.filter(dorm => dorm.coordinates && dorm.coordinates.lat && dorm.coordinates.lng));
      } catch (error) {
        console.error('Error fetching dorms:', error);
        alert('Error fetching dorms. Please try again later.');
      }
    };

    const fetchFavorites = async () => {
      try {
          if (!user || !user._id) {
              console.error("⚠️ User is missing, cannot fetch favorites.");
              return;
          }
  
          console.log(`📌 Fetching favorites for user: ${user._id}`);
          const response = await getFavorites(user._id);
          
          if (!response || !Array.isArray(response.data)) {
              console.error("❌ Favorites response is invalid:", response);
              setFavorites([]); // אם אין נתונים, להגדיר מערך ריק
          } else {
              setFavorites(response.data);
          }
      } catch (error) {
          console.error("🚨 Error fetching favorites:", error);
          setFavorites([]); // במקרה של שגיאה, לוודא שהערך נשאר מערך ריק
      }
  };
  

    fetchDorms();
    fetchFavorites();
  }, []);

  // פונקציה להוספת מעון למועדפים
  const handleAddToFavorites = async (dormId) => {
    if (!user || !user._id) { // וידוא שהמשתמש נטען
        console.error("❌ User ID is missing in MapScreen.js!", user);
        alert("User ID is missing. Please log in.");
        return;
    }

    try {
        console.log(`📌 Adding dorm ${dormId} to favorites for user ID: ${user._id}...`);

        const response = await addToFavorites(user._id, dormId);
        if (response.status === 200) {
            setFavorites([...favorites, dormId]);
            setFavorites(prevFavorites => [...prevFavorites, dormId]);
            alert('Dorm added to favorites!');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        alert('Failed to add dorm to favorites. Please try again.');
    }
};


  // פונקציה להסרת מעון מהמועדפים
  const handleRemoveFromFavorites = async (dormId) => {
    if (!window.confirm('Are you sure you want to remove this dorm from favorites?')) {
        return; // עצירת הפעולה אם המשתמש ביטל
    }

    try {
        console.log(`Removing dorm ${dormId} from favorites...`);

        const response = await removeFromFavorites(user._id, dormId);
        if (response.status === 200) {
            setFavorites(prevFavorites => prevFavorites.filter(id => id !== dormId)); // עדכון הרשימה
            alert('Dorm removed from favorites!');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        alert('Failed to remove dorm from favorites.');
    }
};

  // חיפוש כתובת במפה
  const handleSearch = async () => {
    if (!address) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert('Address not found!');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      alert('Failed to fetch address. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>Find Dorms Near You</h2>
      <div style={{ margin: '20px auto', width: '80%' }}>
        <input
          type="text"
          placeholder="Enter your work address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ margin: '10px', width: '300px', padding: '5px' }}
        />
        <button
          onClick={handleSearch}
          style={{
            margin: '10px',
            padding: '5px 15px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>
      <MapContainer center={coordinates} zoom={15} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ChangeMapView coords={coordinates} />
        {dorms.map((dorm) => (
          <Marker
            key={dorm._id}
            position={[dorm.coordinates.lat, dorm.coordinates.lng]}
            icon={customIcon}
          >
            <Popup>
              <strong>{dorm.name}</strong>
              <br />
              Phone: {dorm.phone}
              <br />
              Address: {dorm.address}
              <br />
              <a href={`/dorm/${dorm._id}`} target="_blank" rel="noopener noreferrer">
                View Details
              </a>
              <br />
              {Array.isArray(favorites) && favorites.includes(dorm._id && favorites.some(fav => fav === dorm._id)) ? (
                <button
                onClick={() => handleRemoveFromFavorites(dorm._id)}
                  style={{
                    marginTop: '10px',
                    padding: '5px',
                    backgroundColor: 'red',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ★ Remove from Favorites
                </button>
              ) : (
                <button
                  onClick={() => handleAddToFavorites(dorm._id)}
                  style={{
                    marginTop: '10px',
                    padding: '5px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ☆ Add to Favorites
                </button>
              )}
            </Popup>
          </Marker>
        ))}
        <Marker position={coordinates}>
          <Popup>Location: {address || 'HIT - Holon Institute of Technology'}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default MapScreen;
