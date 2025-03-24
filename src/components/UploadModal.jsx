import React, { useState } from 'react';
import './UploadModal.css';

const UploadModal = ({ contentType, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [additionalField, setAdditionalField] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Determine if we need additional fields based on content type
  const getAdditionalFieldLabel = () => {
    switch(contentType.id) {
      case 'products':
        return 'Price';
      case 'team':
        return 'Name';
      default:
        return null;
    }
  };

  const additionalFieldLabel = getAdditionalFieldLabel();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && (file || previewUrl)) {
      // Simulate uploading process
      setIsUploading(true);
      
      // Prepare the image data
      const imageData = {
        title,
        url: previewUrl || '/api/placeholder/400/400',
      };
      
      // Add additional fields based on content type
      if (additionalFieldLabel === 'Price') {
        imageData.price = additionalField;
      } else if (additionalFieldLabel === 'Name') {
        imageData.name = additionalField;
      }
      
      // Simulate network request
      setTimeout(() => {
        onUpload(imageData);
        setIsUploading(false);
      }, 1500);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Upload New {contentType.name.slice(0, -1)}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${contentType.name.slice(0, -1).toLowerCase()} title`}
              required
            />
          </div>
          
          {additionalFieldLabel && (
            <div className="form-group">
              <label htmlFor="additionalField">{additionalFieldLabel}</label>
              <input
                type="text"
                id="additionalField"
                value={additionalField}
                onChange={(e) => setAdditionalField(e.target.value)}
                placeholder={`Enter ${additionalFieldLabel.toLowerCase()}`}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              required={!previewUrl}
            />
          </div>
          
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isUploading}>
              {isUploading ? (
                <span>Uploading... <span className="loading-spinner"></span></span>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;