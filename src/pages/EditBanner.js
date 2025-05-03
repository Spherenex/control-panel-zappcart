// src/pages/EditBanner.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import BannerEditor from '../components/BannerEditor';
import '../styles/pages/EditBanner.css';

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bannerRef = ref(db, `banners/${id}`);
    
    const unsubscribe = onValue(bannerRef, (snapshot) => {
      setLoading(true);
      
      try {
        if (snapshot.exists()) {
          setBanner({
            id: snapshot.key,
            ...snapshot.val()
          });
        } else {
          setError('Banner not found');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } catch (err) {
        console.error('Error fetching banner:', err);
        setError('Failed to load banner data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Error fetching banner:', err);
      setError('Failed to load banner data. Please try again later.');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [id, navigate]);

  if (loading) {
    return <div className="loading-indicator">Loading banner data...</div>;
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
    <div className="edit-banner-page">
      <div className="page-header">
        <h1>Edit Banner</h1>
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
      
      {banner && <BannerEditor bannerId={id} initialData={banner} />}
    </div>
  );
};

export default EditBanner;