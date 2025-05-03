// src/components/ImageUploader.js
import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import '../styles/components/ImageUploader.css';
import { FaUpload, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

const ImageUploader = ({ initialImage, onImageUploaded }) => {
  const [image, setImage] = useState(initialImage || '');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Create storage reference
      const storageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`);
      
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      
      // Listen for upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Failed to upload image. Please try again.');
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImage(downloadURL);
          onImageUploaded(downloadURL);
          setUploading(false);
        }
      );
    } catch (err) {
      console.error('Error starting upload:', err);
      setError('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImage('');
    setImageFile(null);
    setError('');
    onImageUploaded('');
  };

  return (
    <div className="image-uploader">
      {error && <div className="upload-error">{error}</div>}
      
      <div className="image-preview-container">
        {image ? (
          <div className="image-preview">
            <img src={image} alt="Banner preview" />
            <button 
              type="button" 
              className="clear-image-btn"
              onClick={clearImage}
              title="Remove image"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <div className="image-placeholder">
            <FaUpload />
            <p>Select an image or drag it here</p>
          </div>
        )}
      </div>
      
      <div className="image-upload-controls">
        <input
          type="file"
          id="banner-image"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleImageChange}
          className="file-input"
        />
        <label htmlFor="banner-image" className="file-input-label">
          Select Image
        </label>
        
        {imageFile && !image.startsWith('http') && (
          <button
            type="button"
            className="upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <FaSpinner className="spinner" /> 
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <FaUpload /> Upload Image
              </>
            )}
          </button>
        )}
        
        {image && image.startsWith('http') && (
          <div className="upload-success">
            <FaCheck /> Image uploaded successfully
          </div>
        )}
      </div>
      
      <p className="image-info">
        Recommended size: 1200 x 600 pixels. Max size: 5MB.
        Supported formats: JPG, PNG, WEBP
      </p>
    </div>
  );
};

export default ImageUploader;