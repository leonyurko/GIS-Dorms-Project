import React, { useState, useEffect } from 'react';

function DormsManagement() {
  const [dorms, setDorms] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [editingDorm, setEditingDorm] = useState(null);

  useEffect(() => {
    const fetchDorms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dorms');

        if (!response.ok) {
          throw new Error('Failed to fetch dorms');
        }

        const data = await response.json();
        setDorms(data);
      } catch (error) {
        console.error('Error fetching dorms:', error);
        alert('Error fetching dorms: ' + error.message);
      }
    };

    fetchDorms();
  }, []);

  const handleSubmit = async () => {
    try {
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
          throw new Error('Failed to update dorm');
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
          throw new Error('Failed to add dorm');
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

  const handleDelete = async (dormId) => {
    if (window.confirm('Are you sure you want to delete this dorm?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/dorms/${dormId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to delete dorm');
        }

        alert('Dorm deleted successfully');
        setDorms((prevDorms) => prevDorms.filter((dorm) => dorm._id !== dormId));
      } catch (error) {
        console.error('Error deleting dorm:', error.message);
        alert('Error deleting dorm: ' + error.message);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Manage Dorms</h2>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ margin: '10px', width: '250px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={{ margin: '10px', width: '250px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          style={{ margin: '10px', width: '250px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          onClick={handleSubmit}
          style={{
            margin: '10px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {editingDorm ? 'Update Dorm' : 'Add Dorm'}
        </button>
      </div>

      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Dorms List</h3>
      <ul style={{ listStyleType: 'none', padding: 0, width: '80%', margin: '0 auto' }}>
        {dorms.length > 0 ? (
          dorms.map((dorm) => (
            <li
              key={dorm._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #ccc',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '10px',
                backgroundColor: '#fff',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <span>
                <strong>{dorm.name}</strong> - {dorm.address} - {dorm.phone}
              </span>
              <div>
                <button
                  onClick={() => handleEdit(dorm)}
                  style={{
                    marginRight: '10px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(dorm._id)}
                  style={{
                    backgroundColor: 'red',
                    color: '#fff',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <li style={{ fontSize: '18px', fontWeight: 'bold', color: 'gray' }}>No dorms available</li>
        )}
      </ul>
    </div>
  );
}

export default DormsManagement;
