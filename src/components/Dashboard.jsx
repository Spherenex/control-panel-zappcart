import React from 'react';
import './Dashboard.css';
import ContentSection from './ContentSection';

const Dashboard = ({ contentTypes, images, onUpload, onPublish }) => {
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Content Management Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-value">{Object.values(images).flat().length}</span>
          <span className="stat-label">Total Images</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Object.values(images).flat().filter(img => img.published).length}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Object.values(images).flat().filter(img => !img.published).length}</span>
          <span className="stat-label">Unpublished</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{contentTypes.length}</span>
          <span className="stat-label">Categories</span>
        </div>
      </div>
      
      <div className="content-sections">
        {contentTypes.map(type => (
          <ContentSection 
            key={type.id}
            title={type.name}
            description={type.description}
            images={images[type.id] || []}
            onUpload={() => onUpload(type.id)}
            onPublish={(imageId) => onPublish(imageId, type.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
