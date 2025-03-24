// src/components/SimpleUploader.jsx - Fixed to avoid URI malformed errors
import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase';
import '../styles/SimpleUploader.css';

const SimpleUploader = ({ section }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Map section names to Firebase paths
  const sectionPaths = {
    categories: 'categories',
    products: 'products',
    banners: 'banners',
    collections: 'collections'
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Check if the file is an image
      if (!selectedFile.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      
      setFile(selectedFile);
      setError('');
    }
  };

  // Handle form submission
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Create a unique filename - avoiding special characters that could cause URI issues
      const timestamp = new Date().getTime();
      // Make sure to sanitize the filename to avoid URI encoding issues
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${timestamp}_${safeFileName}`;
      const storagePath = sectionPaths[section];
      
      const storageRef = ref(storage, `${storagePath}/${fileName}`);
      
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const uploadProgress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(uploadProgress);
        },
        (error) => {
          // Handle upload error
          setError('Error uploading file: ' + error.message);
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          try {
            // Get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Create a document in Firestore
            const docData = {
              name,
              description,
              imagePath: downloadURL,
              fileName,
              storagePath: `${storagePath}/${fileName}`,
              section: section,
              createdAt: serverTimestamp(),
            };
            
            // Add document to Firestore
            await addDoc(collection(db, storagePath), docData);
            
            // Reset form
            setFile(null);
            setPreview(null);
            setName('');
            setDescription('');
            setProgress(0);
            setSuccessMessage(`Image successfully uploaded to ${section}!`);
          } catch (err) {
            setError('Error saving to database: ' + err.message);
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (err) {
      setError('Error initializing upload: ' + err.message);
      setUploading(false);
    }
  };

  const getSectionTitle = () => {
    switch(section) {
      case 'categories':
        return 'Category';
      case 'products':
        return 'Product';
      case 'banners':
        return 'Banner';
      case 'collections':
        return 'Collection';
      default:
        return 'Image';
    }
  };

  return (
    <div className={`simple-uploader ${section}-uploader`}>
      <h2>Upload {getSectionTitle()} Image</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="name">{getSectionTitle()} Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${getSectionTitle().toLowerCase()} name`}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor={`file-${section}`}>Select Image</label>
          <input
            type="file"
            id={`file-${section}`}
            onChange={handleFileChange}
            accept="image/*"
            className="file-input"
          />
        </div>
        
        {preview && (
          <div className="image-preview">
            <h4>Preview:</h4>
            <img src={preview} alt="Preview" />
          </div>
        )}
        
        {uploading && (
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            />
            <span className="progress-text">{progress}%</span>
          </div>
        )}
        
        <button 
          type="submit" 
          className="upload-button" 
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : `Upload to ${section}`}
        </button>
      </form>
    </div>
  );
};

export default SimpleUploader;