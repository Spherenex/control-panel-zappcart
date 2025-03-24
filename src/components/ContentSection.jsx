import React from 'react';
import './ContentSection.css';
import ImageCard from './ImageCard';

const ContentSection = ({ title, description, images, onUpload, onPublish }) => {
  return (
    <div className="content-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-description">{description}</p>
        </div>
        <button className="upload-button" onClick={onUpload}>
          Upload New {title.slice(0, -1)}
        </button>
      </div>
      
      {images.length === 0 ? (
        <div className="empty-section">
          <p>No {title.toLowerCase()} uploaded yet</p>
          <button className="upload-button small" onClick={onUpload}>
            Upload {title}
          </button>
        </div>
      ) : (
        <div className="images-grid">
          {images.map(image => (
            <ImageCard 
              key={image.id}
              image={image}
              onPublish={() => onPublish(image.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentSection;
