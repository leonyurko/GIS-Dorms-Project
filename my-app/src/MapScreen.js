import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// יצירת אייקון מותאם אישית (לדוגמה, קונוס)
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png', // קישור לאייקון של קונוס
  iconSize: [40, 40], // גודל האייקון
});

function MapScreen() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState([32.016081, 34.774826]); // HIT as default location
  const [dorms, setDorms] = useState([]); // נתונים של מעונות

  // פונקציה לשינוי מיקום המפה
  function ChangeMapView({ coords }) {
    const map = useMap();
    map.setView(coords, 15);
    return null;
  }

  // שליפת נתוני המעונות מהשרת
  useEffect(() => {
    const fetchDorms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dorms');
        if (!response.ok) {
          throw new Error('Failed to fetch dorms');
        }
        const data = await response.json();
        console.log('Dorms fetched from server:', data); // הדפסת נתונים
        setDorms(data.filter(dorm => dorm.coordinates && dorm.coordinates.lat && dorm.coordinates.lng));
      } catch (error) {
        console.error('Error fetching dorms:', error);
        alert('Error fetching dorms. Please try again later.');
      }
    };

    fetchDorms();
  }, []);

  // פונקציה לטיפול בלחיצה על כפתור "Search"
  const handleSearch = async () => {
    if (!address) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json`
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
      <table
        style={{
          margin: '20px auto',
          borderCollapse: 'collapse',
          width: '80%',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <thead>
          <tr>
            <th
              colSpan="2"
              style={{
                padding: '10px',
                backgroundColor: '#f4f4f4',
                borderBottom: '2px solid #ddd',
                fontSize: '20px',
              }}
            >
              Dorm Finder Map
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              colSpan="2"
              style={{
                padding: '10px',
                textAlign: 'center',
                backgroundColor: '#fff',
              }}
            >
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
            </td>
          </tr>
          <tr>
            <td colSpan="2" style={{ padding: '10px', backgroundColor: '#fff' }}>
              <MapContainer
                center={coordinates}
                zoom={15}
                style={{ height: '500px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <ChangeMapView coords={coordinates} />
                {dorms.map((dorm) => (
                  <Marker
                    key={dorm._id}
                    position={[dorm.coordinates.lat, dorm.coordinates.lng]}
                    icon={customIcon} // שימוש באייקון מותאם אישית
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
                    </Popup>
                  </Marker>
                ))}
                <Marker position={coordinates}>
                  <Popup>
                    Location: {address || 'HIT - Holon Institute of Technology'}
                  </Popup>
                </Marker>
              </MapContainer>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default MapScreen;
