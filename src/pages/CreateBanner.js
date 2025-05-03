// src/pages/CreateBanner.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BannerEditor from '../components/BannerEditor';
import '../styles/pages/CreateBanner.css';

const CreateBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="create-banner-page">
      <div className="page-header">
        <h1>Create New Banner</h1>
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
      
      <BannerEditor />
    </div>
  );
};

export default CreateBanner;