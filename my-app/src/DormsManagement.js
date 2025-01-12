import React, { useState, useEffect } from 'react';

function DormsManagement() {
  const [dorms, setDorms] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [editingDorm, setEditingDorm] = useState(null);

  useEffect(() => {
    // Fetching dorms from the server
    fetch('http://localhost:5000/api/dorms')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch dorms');
        }
        return res.json();
      })
      .then((data) => setDorms(data))
      .catch((err) => console.error('Error fetching dorms:', err));
  }, []);

  const handleSubmit = async () => {
    try {
      // Fetch coordinates for the address
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          form.address
        )}&format=json`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.length) {
        alert('Failed to find coordinates for the address.');
        return;
      }

      const { lat, lon } = geocodeData[0];

      if (editingDorm) {
        // Update existing dorm
        const response = await fetch(`http://localhost:5000/api/dorms/${editingDorm._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            address: form.address,
            coordinates: {
              lat: parseFloat(lat),
              lng: parseFloat(lon),
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update dorm');
        }

        alert('Dorm updated successfully');
        setDorms(
          dorms.map((dorm) =>
            dorm._id === editingDorm._id
              ? { ...dorm, name: form.name, phone: form.phone, address: form.address }
              : dorm
          )
        );
        setEditingDorm(null);
      } else {
        // Add new dorm
        const response = await fetch('http://localhost:5000/api/dorms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            address: form.address,
            coordinates: {
              lat: parseFloat(lat),
              lng: parseFloat(lon),
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add dorm');
        }

        const newDorm = await response.json();
        setDorms([...dorms, newDorm]);
        alert('Dorm added successfully');
      }

      setForm({ name: '', phone: '', address: '' });
    } catch (error) {
      console.error('Error adding/updating dorm:', error.message);
      alert('Error adding/updating dorm: ' + error.message);
    }
  };

  const handleEdit = (dorm) => {
    setForm({ name: dorm.name, phone: dorm.phone, address: dorm.address });
    setEditingDorm(dorm);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Manage Dorms</h2>
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={{ margin: '10px', width: '300px' }}
      />
      <input
        type="text"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        style={{ margin: '10px', width: '300px' }}
      />
      <input
        type="text"
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        style={{ margin: '10px', width: '300px' }}
      />
      <button onClick={handleSubmit} style={{ marginTop: '20px' }}>
        {editingDorm ? 'Update Dorm' : 'Add Dorm'}
      </button>
      <h3 style={{ marginTop: '30px' }}>Dorms List</h3>
      <ul>
        {dorms.length > 0 ? (
          dorms.map((dorm) => (
            <li key={dorm._id}>
              <strong>{dorm.name}</strong> - {dorm.address} - {dorm.phone}
              <button onClick={() => handleEdit(dorm)} style={{ marginLeft: '10px' }}>
                Edit
              </button>
            </li>
          ))
        ) : (
          <li>No dorms available</li>
        )}
      </ul>
    </div>
  );
}

export default DormsManagement;
