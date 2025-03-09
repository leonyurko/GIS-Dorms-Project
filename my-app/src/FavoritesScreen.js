import React, { useState, useEffect } from 'react';
import { getFavorites, removeFromFavorites } from './api';
import { useAuth } from './AuthContext';

function FavoritesScreen() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                if (!user || !user._id) {
                    console.error("User not found or invalid");
                    return;
                }

                console.log(`Fetching favorites for user: ${user.name}`);
                const response = await getFavorites(user.name);
                setFavorites(response);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };

        fetchFavorites();
    }, [user]);

    // פונקציה להסרת מעון מהמועדפים
    const handleRemoveFromFavorites = async (dormId) => {
        if (!window.confirm("Are you sure you want to remove this dorm from favorites?")) {
            return; // ביטול הפעולה אם המשתמש לחץ "ביטול"
        }

        try {
            console.log(`Removing dorm ${dormId} from favorites for user: ${user.name}`);

            await removeFromFavorites(user._id, dormId);
            setFavorites(prevFavorites => prevFavorites.filter(dorm => dorm._id !== dormId)); // עדכון הסטייט מידית
            alert("Dorm removed from favorites!");
        } catch (error) {
            console.error("Error removing from favorites:", error);
            alert("Failed to remove dorm from favorites.");
        }
    };

    return (
        <div style={{
            textAlign: 'center',
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'Arial, sans-serif',
            color: '#333',
        }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>My Favorite Dorms</h2>
            <ul style={{
                listStyleType: 'none',
                padding: 0,
                width: '60%',
                maxWidth: '800px'
            }}>
                {favorites.length > 0 ? (
                    favorites.map(dorm => (
                        <li key={dorm._id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            marginBottom: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                            <span style={{
                                flex: '1',
                                textAlign: 'center', 
                                fontSize: '16px', 
                                fontWeight: 'bold'
                            }}>
                                {dorm.name} - {dorm.address}
                            </span>
                            <button
                                onClick={() => handleRemoveFromFavorites(dorm._id)}
                                style={{
                                    backgroundColor: 'red',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    marginLeft: '15px'
                                }}
                            >
                                🗑 Remove
                            </button>
                        </li>
                    ))
                ) : (
                    <li style={{ fontSize: '18px', fontWeight: 'bold', color: 'gray' }}>No favorite dorms added yet.</li>
                )}
            </ul>
        </div>
    );
}

export default FavoritesScreen;
