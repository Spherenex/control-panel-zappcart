import React from 'react';
import './ImageCard.css';

const ImageCard = ({ image, onPublish }) => {
  return (
    <div className="image-card">
      <div className="image-container">
        <img src={image.url} alt={image.title} />
        <div className={`image-status ${image.published ? 'published' : 'unpublished'}`}>
          {image.published ? 'Published' : 'Unpublished'}
        </div>
      </div>
      
      <div className="image-info">
        <h3 className="image-title">{image.title}</h3>
        {image.price && <span className="image-price">{image.price}</span>}
        {image.name && <span className="image-name">{image.name}</span>}
        
        {!image.published && (
          <button className="publish-button" onClick={onPublish}>
            Publish
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageCard;