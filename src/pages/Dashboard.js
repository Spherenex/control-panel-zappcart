

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref as dbRef, onValue, update, remove } from 'firebase/database';
import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import '../styles/pages/Dashboard.css';
import BannerList from '../components/BannerList';

const Dashboard = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerImages, setBannerImages] = useState({});

  useEffect(() => {
    const bannersRef = dbRef(db, 'banners');
    const unsubscribe = onValue(bannersRef, async (snapshot) => {
      setLoading(true);
      try {
        if (snapshot.exists()) {
          const bannersData = [];
          snapshot.forEach((childSnapshot) => {
            bannersData.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          setBanners(bannersData);

          const imagesData = {};
          for (const banner of bannersData) {
            const folderRef = storageRef(storage, `banners/${banner.id}`);
            try {
              const fileList = await listAll(folderRef);
              if (fileList.items.length > 0) {
                const sortedItems = [...fileList.items].sort((a, b) => {
                  const getTimestamp = (name) => {
                    const match = name.match(/image_(\d+)/);
                    return match ? parseInt(match[1]) : 0;
                  };
                  return getTimestamp(b.name) - getTimestamp(a.name);
                });
                const imageURL = await getDownloadURL(sortedItems[0]);
                imagesData[banner.id] = imageURL;
              } else {
                imagesData[banner.id] = null;
              }
            } catch (error) {
              console.error(`Error fetching image for ${banner.id}:`, error);
              imagesData[banner.id] = null;
            }
          }
          setBannerImages(imagesData);
        } else {
          setBanners([]);
          setBannerImages({});
        }
      } catch (err) {
        console.error('Error processing banners data:', err);
        setError('Failed to load banners. Please try again later.');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Error fetching banners:', err);
      setError('Failed to load banners. Please try again later.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleBannerStatus = async (id, currentActive) => {
    try {
      const bannerRef = dbRef(db, `banners/${id}`);
      await update(bannerRef, { isActive: !currentActive });
    } catch (err) {
      console.error('Error toggling banner status:', err);
      setError('Failed to update banner status. Please try again.');
    }
  };

  const deleteBanner = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const bannerRef = dbRef(db, `banners/${id}`);
        await remove(bannerRef);
      } catch (err) {
        console.error('Error deleting banner:', err);
        setError('Failed to delete banner. Please try again.');
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Manage Banners</h1>
        <Link to="/create" className="create-button">
          Create New Banner
        </Link>
      </div>
      
      {error && <div className="alert error">{error}</div>}
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading banners...</p>
        </div>
      ) : (
        <BannerList 
          banners={banners} 
          bannerImages={bannerImages}
          onToggleStatus={toggleBannerStatus} 
          onDelete={deleteBanner} 
        />
      )}
    </div>
  );
};

export default Dashboard;