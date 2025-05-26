
// import React, { useState, useEffect } from 'react';
// import {
//   ref as dbRef,
//   get,
//   set,
//   update,
//   remove,
//   onValue,
// } from 'firebase/database';
// import {
//   ref as storageRef,
//   uploadBytesResumable,
//   getDownloadURL,
//   listAll,
//   deleteObject,
// } from 'firebase/storage';
// import { db, storage } from '../firebase/config';
// import '../styles/components/BannerEditor.css';

// // Initial banner categories
// const initialBannerCategories = [
//   'chicken-curry-cut',
//   'mutton-special',
//   'seafood-combo'
// ];

// // Navigation type options
// const navigationOptions = [
//   { value: 'bestsellers', label: 'Bestsellers Section' },
//   { value: 'categories', label: 'Categories Page' },
//   { value: 'matchday-essentials', label: 'MatchDay Essentials' },
//   { value: 'premium-selections', label: 'Premium Selections' },
//   { value: 'dynamic-section', label: 'Dynamic Section' },
//   { value: 'custom-link', label: 'Custom Link' }
// ];

// const BannerEditor = () => {
//   const [formData, setBannerData] = useState({
//     title: '',
//     subtitle: '',
//     productName: '',
//     originalPrice: '',
//     currentPrice: '',
//     link: '',
//     isActive: true,
//     startDate: '',
//     endDate: '',
//     navigationType: 'bestsellers',
//     navigationText: '',
//     customLink: '',
//     order: 0,
//     backgroundColor: '#ffcdd2'
//   });

//   const [selectedBanner, setSelectedBanner] = useState('');
//   const [banners, setBanners] = useState({});
//   const [bannerImages, setBannerImages] = useState({});
//   const [uploadFile, setUploadFile] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [schedulingEnabled, setSchedulingEnabled] = useState(false);
//   const [isAddingNewBanner, setIsAddingNewBanner] = useState(false);
//   const [newBannerKey, setNewBannerKey] = useState('');
//   const [bannerCategories, setBannerCategories] = useState(initialBannerCategories);
  
//   // Modal states
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingBanner, setEditingBanner] = useState(null);

//   // Fetch banner data and images on mount
//   useEffect(() => {
//     const bannersRef = dbRef(db, 'banners');
//     const unsubscribe = onValue(bannersRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const bannersData = snapshot.val();
//         setBanners(bannersData);
//         const allBannerKeys = Object.keys(bannersData);
//         const newCategories = [...initialBannerCategories];
//         allBannerKeys.forEach(key => {
//           if (!newCategories.includes(key)) {
//             newCategories.push(key);
//           }
//         });
//         setBannerCategories(newCategories);
//       } else {
//         setBanners({});
//       }
//     }, (error) => {
//       console.error("Error fetching banners:", error);
//       setError("Failed to load banner data from database");
//     });

//     fetchBannerImages();
//     return () => unsubscribe();
//   }, []);

//   // Fetch banner images from Firebase Storage
//   const fetchBannerImages = async () => {
//     try {
//       const bannersRef = storageRef(storage, 'banners');
//       const foldersList = await listAll(bannersRef);
//       const folderNames = foldersList.prefixes.map(folder => {
//         const pathSegments = folder.fullPath.split('/');
//         return pathSegments[pathSegments.length - 1];
//       });

//       const updatedCategories = [...bannerCategories];
//       folderNames.forEach(name => {
//         if (!updatedCategories.includes(name)) {
//           updatedCategories.push(name);
//         }
//       });
//       setBannerCategories(updatedCategories);

//       const imagesData = {};
//       const allCategories = [...new Set([...bannerCategories, ...folderNames])];

//       for (const bannerKey of allCategories) {
//         try {
//           const folderRef = storageRef(storage, `banners/${bannerKey}`);
//           const fileList = await listAll(folderRef);

//           if (fileList.items.length > 0) {
//             const sortedItems = [...fileList.items].sort((a, b) => {
//               const getTimestamp = (name) => {
//                 const match = name.match(/image_(\d+)/);
//                 return match ? parseInt(match[1]) : 0;
//               };
//               return getTimestamp(b.name) - getTimestamp(a.name);
//             });

//             const imageURL = await getDownloadURL(sortedItems[0]);
//             imagesData[bannerKey] = imageURL;
//           } else {
//             imagesData[bannerKey] = null;
//           }
//         } catch (error) {
//           console.error(`Error fetching image for ${bannerKey}:`, error);
//           imagesData[bannerKey] = null;
//         }
//       }

//       setBannerImages(imagesData);
//     } catch (error) {
//       console.error("Error fetching banner images:", error);
//       setError("Failed to load banner images");
//     }
//   };

//   const handleEditBanner = (bannerKey) => {
//     setEditingBanner(bannerKey);
//     setSelectedBanner(bannerKey);
//     clearMessages();
    
//     if (banners[bannerKey]) {
//       const bannerData = banners[bannerKey];
//       const hasScheduling = bannerData.startDate || bannerData.endDate;
//       setSchedulingEnabled(hasScheduling);
//       setBannerData({
//         ...bannerData,
//         originalPrice: bannerData.originalPrice?.toString() || '',
//         currentPrice: bannerData.currentPrice?.toString() || '',
//         navigationType: bannerData.navigationType || 'bestsellers',
//         navigationText: bannerData.navigationText || '',
//         customLink: bannerData.customLink || '',
//         order: bannerData.order || 0,
//         backgroundColor: bannerData.backgroundColor || '#ffcdd2'
//       });
//     } else {
//       setBannerData({
//         title: '',
//         subtitle: '',
//         productName: bannerKey === 'chicken-curry-cut' ? 'Chicken Curry Cut & more' :
//                      bannerKey === 'mutton-special' ? 'Mutton Curry Cut' :
//                      bannerKey === 'seafood-combo' ? 'Premium Seafood Combo' : '',
//         originalPrice: '',
//         currentPrice: '',
//         link: `/product/${bannerKey}`,
//         isActive: true,
//         startDate: '',
//         endDate: '',
//         navigationType: 'bestsellers',
//         navigationText: '',
//         customLink: '',
//         order: 0,
//         backgroundColor: '#ffcdd2'
//       });
//       setSchedulingEnabled(false);
//     }

//     setUploadFile(null);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setEditingBanner(null);
//     setSelectedBanner('');
//     setUploadFile(null);
//     clearMessages();
//   };

//   const handleAddNewBanner = () => {
//     setIsAddingNewBanner(true);
//     setSelectedBanner('');
//     setNewBannerKey('');
//     clearMessages();
//     setBannerData({
//       title: '',
//       subtitle: '',
//       productName: '',
//       originalPrice: '',
//       currentPrice: '',
//       link: '',
//       isActive: true,
//       startDate: '',
//       endDate: '',
//       navigationType: 'bestsellers',
//       navigationText: '',
//       customLink: '',
//       order: 0,
//       backgroundColor: '#ffcdd2'
//     });
//     setSchedulingEnabled(false);
//     setUploadFile(null);
//   };

//   const handleNewBannerKeyChange = (e) => {
//     setNewBannerKey(e.target.value.trim().toLowerCase().replace(/\s+/g, '-'));
//   };

//   const createNewBanner = () => {
//     if (!newBannerKey) {
//       setError("Please enter a banner ID");
//       return;
//     }

//     if (bannerCategories.includes(newBannerKey) || banners[newBannerKey]) {
//       setError("This banner ID already exists");
//       return;
//     }

//     setBannerCategories(prev => [...prev, newBannerKey]);
//     handleEditBanner(newBannerKey);
//     setIsAddingNewBanner(false);
//   };

//   const handleSchedulingToggle = () => {
//     setSchedulingEnabled(!schedulingEnabled);
//     if (schedulingEnabled) {
//       setBannerData(prev => ({
//         ...prev,
//         startDate: '',
//         endDate: ''
//       }));
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setBannerData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleFileChange = (e) => {
//     if (e.target.files[0]) {
//       setUploadFile(e.target.files[0]);
//       clearMessages();
//     }
//   };

//   const clearMessages = () => {
//     setError('');
//     setSuccessMessage('');
//   };

//   const handleImageUpload = async () => {
//     if (!selectedBanner) {
//       setError("Please select a banner first");
//       return;
//     }

//     if (!uploadFile) {
//       setError("Please select an image to upload");
//       return;
//     }

//     setIsUploading(true);
//     setUploadProgress(0);
//     clearMessages();

//     try {
//       const timestamp = Date.now();
//       const fileName = `image_${timestamp}`;
//       const fileExtension = uploadFile.name.split('.').pop();
//       const fileRef = storageRef(storage, `banners/${selectedBanner}/${fileName}.${fileExtension}`);
//       const uploadTask = uploadBytesResumable(fileRef, uploadFile);

//       uploadTask.on(
//         'state_changed',
//         (snapshot) => {
//           const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//           setUploadProgress(progress);
//         },
//         (error) => {
//           console.error('Upload error:', error);
//           setError('Failed to upload image. Please try again.');
//           setIsUploading(false);
//         },
//         async () => {
//           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//           setBannerImages(prev => ({
//             ...prev,
//             [selectedBanner]: downloadURL
//           }));
//           setSuccessMessage('Image uploaded successfully!');
//           setIsUploading(false);
//           setUploadFile(null);
//           const fileInput = document.getElementById('banner-image');
//           if (fileInput) fileInput.value = '';
//         }
//       );
//     } catch (error) {
//       console.error('Error starting upload:', error);
//       setError('Failed to start upload. Please try again.');
//       setIsUploading(false);
//     }
//   };

//   const saveBannerData = async () => {
//     if (!selectedBanner) {
//       setError("Please select a banner first");
//       return;
//     }

//     if (!formData.title.trim() || !formData.subtitle.trim() || !formData.productName.trim()) {
//       setError("Please fill in all required fields");
//       return;
//     }

//     if (!formData.originalPrice || !formData.currentPrice) {
//       setError("Please enter both original and current prices");
//       return;
//     }

//     if (schedulingEnabled) {
//       if (!formData.startDate && !formData.endDate) {
//         setError("Please set at least one of start date or end date for scheduling");
//         return;
//       }

//       if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
//         setError("End date must be after start date");
//         return;
//       }
//     }

//     // Validate navigation settings
//     if (formData.navigationType === 'dynamic-section' && !formData.customLink) {
//       setError("Please specify the section ID for dynamic section navigation");
//       return;
//     }

//     if (formData.navigationType === 'custom-link' && !formData.customLink) {
//       setError("Please specify the custom link URL");
//       return;
//     }

//     setIsSaving(true);
//     clearMessages();

//     try {
//       const bannerRef = dbRef(db, `banners/${selectedBanner}`);
//       const dataToSave = { ...formData };
//       dataToSave.originalPrice = parseFloat(dataToSave.originalPrice);
//       dataToSave.currentPrice = parseFloat(dataToSave.currentPrice);
//       dataToSave.order = parseInt(dataToSave.order) || 0;

//       if (!schedulingEnabled) {
//         delete dataToSave.startDate;
//         delete dataToSave.endDate;
//       }

//       await update(bannerRef, dataToSave);
//       setBanners(prev => ({
//         ...prev,
//         [selectedBanner]: {
//           ...prev[selectedBanner],
//           ...dataToSave
//         }
//       }));

//       setSuccessMessage('Banner data saved successfully!');
//       setTimeout(() => {
//         handleCloseModal();
//       }, 1500);
//     } catch (error) {
//       console.error('Error saving banner data:', error);
//       setError('Failed to save banner data. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const deleteBanner = async (bannerKey) => {
//     if (!window.confirm(`Are you sure you want to delete the ${bannerKey} banner?`)) {
//       return;
//     }

//     setIsSaving(true);
//     clearMessages();

//     try {
//       const bannerRef = dbRef(db, `banners/${bannerKey}`);
//       await remove(bannerRef);

//       try {
//         const imagesRef = storageRef(storage, `banners/${bannerKey}`);
//         const files = await listAll(imagesRef);
//         await Promise.all(files.items.map(fileRef => deleteObject(fileRef)));
//       } catch (storageError) {
//         console.error('Error deleting banner images:', storageError);
//       }

//       setBanners(prev => {
//         const updatedBanners = { ...prev };
//         delete updatedBanners[bannerKey];
//         return updatedBanners;
//       });

//       setBannerImages(prev => {
//         const updatedImages = { ...prev };
//         delete updatedImages[bannerKey];
//         return updatedImages;
//       });

//       if (!initialBannerCategories.includes(bannerKey)) {
//         setBannerCategories(prev => prev.filter(cat => cat !== bannerKey));
//       }

//       setSuccessMessage(`Banner "${bannerKey}" deleted successfully!`);
//     } catch (error) {
//       console.error('Error deleting banner:', error);
//       setError('Failed to delete banner. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Get sorted banners for display
//   const getSortedBanners = () => {
//     const bannersArray = Object.entries(banners).map(([key, data]) => ({
//       key,
//       ...data
//     }));
//     return bannersArray.sort((a, b) => (a.order || 0) - (b.order || 0));
//   };

//   return (
//     <div className="banner-management">
//       <h2>Banner Management</h2>
      
//       {error && <div className="error-message">{error}</div>}
//       {successMessage && <div className="success-message">{successMessage}</div>}
      
//       <div className="banner-controls">
//         <button
//           className="add-button"
//           onClick={handleAddNewBanner}
//           disabled={isUploading || isSaving}
//         >
//           Add New Banner
//         </button>
//       </div>
      
//       {isAddingNewBanner && (
//         <div className="new-banner-form">
//           <div className="form-group">
//             <label htmlFor="new-banner-key">New Banner ID:</label>
//             <input
//               type="text"
//               id="new-banner-key"
//               value={newBannerKey}
//               onChange={handleNewBannerKeyChange}
//               placeholder="Enter banner ID (e.g., premium-chicken)"
//               disabled={isSaving}
//             />
//           </div>
          
//           <div className="form-actions">
//             <button
//               className="create-button"
//               onClick={createNewBanner}
//               disabled={isSaving || !newBannerKey}
//             >
//               Create Banner
//             </button>
//             <button
//               className="cancel-button"
//               onClick={() => setIsAddingNewBanner(false)}
//               disabled={isSaving}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Banner Cards Grid */}
//       <div className="banners-grid">
//         {getSortedBanners().map((banner) => (
//           <div key={banner.key} className="banner-preview-card">
//             <div className="banner-preview-header">
//               <h3>{banner.key}</h3>
//               <div className="banner-status">
//                 <span className={`status-indicator ${banner.isActive ? 'active' : 'inactive'}`}>
//                   {banner.isActive ? 'Active' : 'Inactive'}
//                 </span>
//                 <span className="order-badge">Order: {banner.order || 0}</span>
//               </div>
//             </div>
            
//             <div className="banner-preview-image">
//               {bannerImages[banner.key] ? (
//                 <img src={bannerImages[banner.key]} alt={banner.productName} />
//               ) : (
//                 <div className="no-image-placeholder">No Image</div>
//               )}
//             </div>
            
//             <div className="banner-preview-content">
//               <h4>{banner.title || 'No Title'}</h4>
//               <p>{banner.subtitle || 'No Subtitle'}</p>
//               <div className="banner-preview-details">
//                 <span className="product-name">{banner.productName}</span>
//                 <div className="price-info">
//                   <span className="original-price">₹{banner.originalPrice}</span>
//                   <span className="current-price">₹{banner.currentPrice}</span>
//                 </div>
//               </div>
//               <div className="navigation-info">
//                 <span className="nav-type">Nav: {banner.navigationType}</span>
//                 {banner.navigationText && (
//                   <span className="nav-text">"{banner.navigationText}"</span>
//                 )}
//               </div>
//             </div>
            
//             <div className="banner-preview-actions">
//               <button
//                 className="edit-button"
//                 onClick={() => handleEditBanner(banner.key)}
//                 disabled={isUploading || isSaving}
//               >
//                 Edit
//               </button>
//               <button
//                 className="delete-button"
//                 onClick={() => deleteBanner(banner.key)}
//                 disabled={isUploading || isSaving}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Edit Modal */}
//       {isModalOpen && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Edit Banner: {editingBanner}</h3>
//               <button className="modal-close" onClick={handleCloseModal}>×</button>
//             </div>
            
//             <div className="modal-body">
//               <div className="banner-editor">
//                 <div className="banner-form">
//                   <div className="form-section">
//                     <h4>Banner Image</h4>
                    
//                     <div className="image-preview">
//                       {bannerImages[selectedBanner] ? (
//                         <img src={bannerImages[selectedBanner]} alt={`Banner ${selectedBanner}`} />
//                       ) : (
//                         <div className="no-image">No image uploaded</div>
//                       )}
//                     </div>
                    
//                     <div className="image-upload">
//                       <input
//                         type="file"
//                         id="banner-image"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         disabled={isUploading || isSaving}
//                       />
                      
//                       {uploadFile && (
//                         <button
//                           className="upload-button"
//                           onClick={handleImageUpload}
//                           disabled={isUploading || isSaving}
//                         >
//                           {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Image'}
//                         </button>
//                       )}
                      
//                       {isUploading && (
//                         <div className="progress-bar-container">
//                           <div
//                             className="progress-bar"
//                             style={{ width: `${uploadProgress}%` }}
//                           ></div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="form-section">
//                     <h4>Banner Content</h4>
                    
//                     <div className="form-group">
//                       <label htmlFor="title">Title:</label>
//                       <input
//                         type="text"
//                         id="title"
//                         name="title"
//                         value={formData.title}
//                         onChange={handleInputChange}
//                         placeholder="e.g., Day Special"
//                         disabled={isSaving}
//                         required
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label htmlFor="subtitle">Subtitle:</label>
//                       <input
//                         type="text"
//                         id="subtitle"
//                         name="subtitle"
//                         value={formData.subtitle}
//                         onChange={handleInputChange}
//                         placeholder="e.g., Available up to 12 am"
//                         disabled={isSaving}
//                         required
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label htmlFor="productName">Product Name:</label>
//                       <input
//                         type="text"
//                         id="productName"
//                         name="productName"
//                         value={formData.productName}
//                         onChange={handleInputChange}
//                         placeholder="e.g., Chicken Curry Cut & more"
//                         disabled={isSaving}
//                         required
//                       />
//                     </div>
                    
//                     <div className="form-row">
//                       <div className="form-group">
//                         <label htmlFor="originalPrice">Original Price (₹):</label>
//                         <input
//                           type="number"
//                           id="originalPrice"
//                           name="originalPrice"
//                           value={formData.originalPrice}
//                           onChange={handleInputChange}
//                           placeholder="e.g., 200"
//                           disabled={isSaving}
//                           required
//                         />
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="currentPrice">Current Price (₹):</label>
//                         <input
//                           type="number"
//                           id="currentPrice"
//                           name="currentPrice"
//                           value={formData.currentPrice}
//                           onChange={handleInputChange}
//                           placeholder="e.g., 180"
//                           disabled={isSaving}
//                           required
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="form-group">
//                       <label htmlFor="link">Link:</label>
//                       <input
//                         type="text"
//                         id="link"
//                         name="link"
//                         value={formData.link}
//                         onChange={handleInputChange}
//                         placeholder="e.g., /product/chicken-curry-cut"
//                         disabled={isSaving}
//                       />
//                     </div>

//                     <div className="form-group">
//                       <label htmlFor="backgroundColor">Background Color:</label>
//                       <input
//                         type="color"
//                         id="backgroundColor"
//                         name="backgroundColor"
//                         value={formData.backgroundColor}
//                         onChange={handleInputChange}
//                         disabled={isSaving}
//                       />
//                     </div>
//                   </div>

//                   <div className="form-section">
//                     <h4>Navigation Button Settings</h4>
                    
//                     <div className="form-group">
//                       <label htmlFor="navigationType">Navigation Type:</label>
//                       <select
//                         id="navigationType"
//                         name="navigationType"
//                         value={formData.navigationType}
//                         onChange={handleInputChange}
//                         disabled={isSaving}
//                       >
//                         {navigationOptions.map(option => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="form-group">
//                       <label htmlFor="navigationText">Custom Button Text (optional):</label>
//                       <input
//                         type="text"
//                         id="navigationText"
//                         name="navigationText"
//                         value={formData.navigationText}
//                         onChange={handleInputChange}
//                         placeholder="Leave empty to use default text"
//                         disabled={isSaving}
//                       />
//                     </div>

//                     {(formData.navigationType === 'dynamic-section' || formData.navigationType === 'custom-link') && (
//                       <div className="form-group">
//                         <label htmlFor="customLink">
//                           {formData.navigationType === 'dynamic-section' ? 'Section ID:' : 'Custom Link URL:'}
//                         </label>
//                         <input
//                           type="text"
//                           id="customLink"
//                           name="customLink"
//                           value={formData.customLink}
//                           onChange={handleInputChange}
//                           placeholder={
//                             formData.navigationType === 'dynamic-section' 
//                               ? "e.g., premium-chicken" 
//                               : "e.g., /special-offers or https://example.com"
//                           }
//                           disabled={isSaving}
//                           required
//                         />
//                       </div>
//                     )}

//                     <div className="form-group">
//                       <label htmlFor="order">Display Order:</label>
//                       <input
//                         type="number"
//                         id="order"
//                         name="order"
//                         value={formData.order}
//                         onChange={handleInputChange}
//                         placeholder="0 = first, 1 = second, etc."
//                         disabled={isSaving}
//                         min="0"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="form-section">
//                     <h4>Banner Settings</h4>
                    
//                     <div className="form-group checkbox">
//                       <input
//                         type="checkbox"
//                         id="isActive"
//                         name="isActive"
//                         checked={formData.isActive}
//                         onChange={handleInputChange}
//                         disabled={isSaving}
//                       />
//                       <label htmlFor="isActive">Active (visible on website)</label>
//                     </div>
                    
//                     <div className="form-group checkbox">
//                       <input
//                         type="checkbox"
//                         id="enable-scheduling"
//                         checked={schedulingEnabled}
//                         onChange={handleSchedulingToggle}
//                         disabled={isSaving}
//                       />
//                       <label htmlFor="enable-scheduling">Enable Scheduling</label>
//                     </div>
                    
//                     {schedulingEnabled && (
//                       <div className="scheduling-options">
//                         <div className="form-row">
//                           <div className="form-group">
//                             <label htmlFor="startDate">Start Date & Time:</label>
//                             <input
//                               type="datetime-local"
//                               id="startDate"
//                               name="startDate"
//                               value={formData.startDate}
//                               onChange={handleInputChange}
//                               disabled={isSaving}
//                             />
//                           </div>
                          
//                           <div className="form-group">
//                             <label htmlFor="endDate">End Date & Time:</label>
//                             <input
//                               type="datetime-local"
//                               id="endDate"
//                               name="endDate"
//                               value={formData.endDate}
//                               onChange={handleInputChange}
//                               disabled={isSaving}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="modal-footer">
//               <button
//                 className="save-button"
//                 onClick={saveBannerData}
//                 disabled={isUploading || isSaving}
//               >
//                 {isSaving ? 'Saving...' : 'Save Banner'}
//               </button>
//               <button
//                 className="cancel-button"
//                 onClick={handleCloseModal}
//                 disabled={isUploading || isSaving}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BannerEditor;






import React, { useState, useEffect } from 'react';
import {
  ref as dbRef,
  get,
  set,
  update,
  remove,
  onValue,
} from 'firebase/database';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase/config';
import '../styles/components/BannerEditor.css';

// Initial banner categories
const initialBannerCategories = [
  'chicken-curry-cut',
  'mutton-special',
  'seafood-combo'
];

// Navigation type options
const navigationOptions = [
  { value: 'bestsellers', label: 'Bestsellers Section' },
  { value: 'categories', label: 'Categories Page' },
  { value: 'matchday-essentials', label: 'MatchDay Essentials' },
  { value: 'premium-selections', label: 'Premium Selections' },
  { value: 'dynamic-section', label: 'Dynamic Section' },
  { value: 'custom-link', label: 'Custom Link' }
];

const BannerEditor = () => {
  const [formData, setBannerData] = useState({
    title: '',
    subtitle: '',
    productName: '',
    originalPrice: '',
    currentPrice: '',
    link: '',
    isActive: true,
    startDate: '',
    endDate: '',
    navigationType: 'bestsellers',
    navigationText: '',
    customLink: '',
    order: 0,
    backgroundColor: '#ffcdd2'
  });

  const [selectedBanner, setSelectedBanner] = useState('');
  const [banners, setBanners] = useState({});
  const [bannerImages, setBannerImages] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [schedulingEnabled, setSchedulingEnabled] = useState(false);
  const [isAddingNewBanner, setIsAddingNewBanner] = useState(false);
  const [newBannerKey, setNewBannerKey] = useState('');
  const [bannerCategories, setBannerCategories] = useState(initialBannerCategories);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Fetch banner data and images on mount
  useEffect(() => {
    const bannersRef = dbRef(db, 'banners');
    const unsubscribe = onValue(bannersRef, (snapshot) => {
      if (snapshot.exists()) {
        const bannersData = snapshot.val();
        setBanners(bannersData);
        const allBannerKeys = Object.keys(bannersData);
        const newCategories = [...initialBannerCategories];
        allBannerKeys.forEach(key => {
          if (!newCategories.includes(key)) {
            newCategories.push(key);
          }
        });
        setBannerCategories(newCategories);
      } else {
        setBanners({});
      }
    }, (error) => {
      console.error("Error fetching banners:", error);
      setError("Failed to load banner data from database");
    });

    fetchBannerImages();
    return () => unsubscribe();
  }, []);

  // Fetch banner images from Firebase Storage
  const fetchBannerImages = async () => {
    try {
      const bannersRef = storageRef(storage, 'banners');
      const foldersList = await listAll(bannersRef);
      const folderNames = foldersList.prefixes.map(folder => {
        const pathSegments = folder.fullPath.split('/');
        return pathSegments[pathSegments.length - 1];
      });

      const updatedCategories = [...bannerCategories];
      folderNames.forEach(name => {
        if (!updatedCategories.includes(name)) {
          updatedCategories.push(name);
        }
      });
      setBannerCategories(updatedCategories);

      const imagesData = {};
      const allCategories = [...new Set([...bannerCategories, ...folderNames])];

      for (const bannerKey of allCategories) {
        try {
          const folderRef = storageRef(storage, `banners/${bannerKey}`);
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
            imagesData[bannerKey] = imageURL;
          } else {
            imagesData[bannerKey] = null;
          }
        } catch (error) {
          console.error(`Error fetching image for ${bannerKey}:`, error);
          imagesData[bannerKey] = null;
        }
      }

      setBannerImages(imagesData);
    } catch (error) {
      console.error("Error fetching banner images:", error);
      setError("Failed to load banner images");
    }
  };

  const handleEditBanner = (bannerKey) => {
    setEditingBanner(bannerKey);
    setSelectedBanner(bannerKey);
    clearMessages();
    
    if (banners[bannerKey]) {
      const bannerData = banners[bannerKey];
      const hasScheduling = bannerData.startDate || bannerData.endDate;
      setSchedulingEnabled(hasScheduling);
      setBannerData({
        ...bannerData,
        originalPrice: bannerData.originalPrice?.toString() || '',
        currentPrice: bannerData.currentPrice?.toString() || '',
        navigationType: bannerData.navigationType || 'bestsellers',
        navigationText: bannerData.navigationText || '',
        customLink: bannerData.customLink || '',
        order: bannerData.order || 0,
        backgroundColor: bannerData.backgroundColor || '#ffcdd2'
      });
    } else {
      setBannerData({
        title: '',
        subtitle: '',
        productName: bannerKey === 'chicken-curry-cut' ? 'Chicken Curry Cut & more' :
                     bannerKey === 'mutton-special' ? 'Mutton Curry Cut' :
                     bannerKey === 'seafood-combo' ? 'Premium Seafood Combo' : '',
        originalPrice: '',
        currentPrice: '',
        link: `/product/${bannerKey}`,
        isActive: true,
        startDate: '',
        endDate: '',
        navigationType: 'bestsellers',
        navigationText: '',
        customLink: '',
        order: 0,
        backgroundColor: '#ffcdd2'
      });
      setSchedulingEnabled(false);
    }

    setUploadFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setSelectedBanner('');
    setUploadFile(null);
    clearMessages();
  };

  const handleAddNewBanner = () => {
    setIsAddingNewBanner(true);
    setSelectedBanner('');
    setNewBannerKey('');
    clearMessages();
    setBannerData({
      title: '',
      subtitle: '',
      productName: '',
      originalPrice: '',
      currentPrice: '',
      link: '',
      isActive: true,
      startDate: '',
      endDate: '',
      navigationType: 'bestsellers',
      navigationText: '',
      customLink: '',
      order: 0,
      backgroundColor: '#ffcdd2'
    });
    setSchedulingEnabled(false);
    setUploadFile(null);
  };

  const handleNewBannerKeyChange = (e) => {
    setNewBannerKey(e.target.value.trim().toLowerCase().replace(/\s+/g, '-'));
  };

  const createNewBanner = () => {
    if (!newBannerKey) {
      setError("Please enter a banner ID");
      return;
    }

    if (bannerCategories.includes(newBannerKey) || banners[newBannerKey]) {
      setError("This banner ID already exists");
      return;
    }

    setBannerCategories(prev => [...prev, newBannerKey]);
    handleEditBanner(newBannerKey);
    setIsAddingNewBanner(false);
  };

  const handleSchedulingToggle = () => {
    setSchedulingEnabled(!schedulingEnabled);
    if (schedulingEnabled) {
      setBannerData(prev => ({
        ...prev,
        startDate: '',
        endDate: ''
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBannerData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      clearMessages();
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleImageUpload = async () => {
    if (!selectedBanner) {
      setError("Please select a banner first");
      return;
    }

    if (!uploadFile) {
      setError("Please select an image to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    clearMessages();

    try {
      const timestamp = Date.now();
      const fileName = `image_${timestamp}`;
      const fileExtension = uploadFile.name.split('.').pop();
      const fileRef = storageRef(storage, `banners/${selectedBanner}/${fileName}.${fileExtension}`);
      const uploadTask = uploadBytesResumable(fileRef, uploadFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Failed to upload image. Please try again.');
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setBannerImages(prev => ({
            ...prev,
            [selectedBanner]: downloadURL
          }));
          setSuccessMessage('Image uploaded successfully!');
          setIsUploading(false);
          setUploadFile(null);
          const fileInput = document.getElementById('banner-image');
          if (fileInput) fileInput.value = '';
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      setError('Failed to start upload. Please try again.');
      setIsUploading(false);
    }
  };

  const saveBannerData = async () => {
    if (!selectedBanner) {
      setError("Please select a banner first");
      return;
    }

    if (!formData.title.trim() || !formData.subtitle.trim() || !formData.productName.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!formData.originalPrice || !formData.currentPrice) {
      setError("Please enter both original and current prices");
      return;
    }

    if (schedulingEnabled) {
      if (!formData.startDate && !formData.endDate) {
        setError("Please set at least one of start date or end date for scheduling");
        return;
      }

      if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        setError("End date must be after start date");
        return;
      }
    }

    // Validate navigation settings
    if (formData.navigationType === 'dynamic-section' && !formData.customLink) {
      setError("Please specify the section ID for dynamic section navigation");
      return;
    }

    if (formData.navigationType === 'custom-link' && !formData.customLink) {
      setError("Please specify the custom link URL");
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      const bannerRef = dbRef(db, `banners/${selectedBanner}`);
      const dataToSave = { ...formData };
      dataToSave.originalPrice = parseFloat(dataToSave.originalPrice);
      dataToSave.currentPrice = parseFloat(dataToSave.currentPrice);
      dataToSave.order = parseInt(dataToSave.order) || 0;

      if (!schedulingEnabled) {
        delete dataToSave.startDate;
        delete dataToSave.endDate;
      }

      await update(bannerRef, dataToSave);
      setBanners(prev => ({
        ...prev,
        [selectedBanner]: {
          ...prev[selectedBanner],
          ...dataToSave
        }
      }));

      setSuccessMessage('Banner data saved successfully!');
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error) {
      console.error('Error saving banner data:', error);
      setError('Failed to save banner data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBanner = async (bannerKey) => {
    if (!window.confirm(`Are you sure you want to delete the ${bannerKey} banner?`)) {
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      const bannerRef = dbRef(db, `banners/${bannerKey}`);
      await remove(bannerRef);

      try {
        const imagesRef = storageRef(storage, `banners/${bannerKey}`);
        const files = await listAll(imagesRef);
        await Promise.all(files.items.map(fileRef => deleteObject(fileRef)));
      } catch (storageError) {
        console.error('Error deleting banner images:', storageError);
      }

      setBanners(prev => {
        const updatedBanners = { ...prev };
        delete updatedBanners[bannerKey];
        return updatedBanners;
      });

      setBannerImages(prev => {
        const updatedImages = { ...prev };
        delete updatedImages[bannerKey];
        return updatedImages;
      });

      if (!initialBannerCategories.includes(bannerKey)) {
        setBannerCategories(prev => prev.filter(cat => cat !== bannerKey));
      }

      setSuccessMessage(`Banner "${bannerKey}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting banner:', error);
      setError('Failed to delete banner. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get sorted banners for display
  const getSortedBanners = () => {
    const bannersArray = Object.entries(banners).map(([key, data]) => ({
      key,
      ...data
    }));
    return bannersArray.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  return (
    <div className="banner-management">
      <h2>Banner Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="banner-controls">
        <button
          className="add-button"
          onClick={handleAddNewBanner}
          disabled={isUploading || isSaving}
        >
          Add New Banner
        </button>
      </div>
      
      {isAddingNewBanner && (
        <div className="new-banner-form">
          <div className="form-group">
            <label htmlFor="new-banner-key">New Banner ID:</label>
            <input
              type="text"
              id="new-banner-key"
              value={newBannerKey}
              onChange={handleNewBannerKeyChange}
              placeholder="Enter banner ID (e.g., premium-chicken)"
              disabled={isSaving}
            />
          </div>
          
          <div className="form-actions">
            <button
              className="create-button"
              onClick={createNewBanner}
              disabled={isSaving || !newBannerKey}
            >
              Create Banner
            </button>
            <button
              className="cancel-button"
              onClick={() => setIsAddingNewBanner(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Banner Cards Grid */}
      <div className="banners-grid">
        {getSortedBanners().map((banner) => (
          <div key={banner.key} className="banner-preview-card">
            <div className="banner-preview-header">
              <h3>{banner.key}</h3>
              <div className="banner-status">
                <span className={`status-indicator ${banner.isActive ? 'active' : 'inactive'}`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="order-badge">Order: {banner.order || 0}</span>
              </div>
            </div>
            
            <div className="banner-preview-image">
              {bannerImages[banner.key] ? (
                <img src={bannerImages[banner.key]} alt={banner.productName} />
              ) : (
                <div className="no-image-placeholder">No Image</div>
              )}
            </div>
            
            <div className="banner-preview-content">
              <h4>{banner.title || 'No Title'}</h4>
              <p>{banner.subtitle || 'No Subtitle'}</p>
              <div className="banner-preview-details">
                <span className="product-name">{banner.productName}</span>
                <div className="price-info">
                  <span className="original-price">₹{banner.originalPrice}</span>
                  <span className="current-price">₹{banner.currentPrice}</span>
                </div>
              </div>
              <div className="navigation-info">
                <span className="nav-type">Nav: {banner.navigationType}</span>
                {banner.navigationText && (
                  <span className="nav-text">"{banner.navigationText}"</span>
                )}
              </div>
            </div>
            
            <div className="banner-preview-actions">
              <button
                className="edit-button"
                onClick={() => handleEditBanner(banner.key)}
                disabled={isUploading || isSaving}
              >
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => deleteBanner(banner.key)}
                disabled={isUploading || isSaving}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Banner: {editingBanner}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="banner-editor">
                <div className="banner-form">
                  <div className="form-section">
                    <h4>Banner Image</h4>
                    
                    <div className="image-preview">
                      {bannerImages[selectedBanner] ? (
                        <img src={bannerImages[selectedBanner]} alt={`Banner ${selectedBanner}`} />
                      ) : (
                        <div className="no-image">No image uploaded</div>
                      )}
                    </div>
                    
                    <div className="image-upload">
                      <input
                        type="file"
                        id="banner-image"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading || isSaving}
                      />
                      
                      {uploadFile && (
                        <button
                          className="upload-button"
                          onClick={handleImageUpload}
                          disabled={isUploading || isSaving}
                        >
                          {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Image'}
                        </button>
                      )}
                      
                      {isUploading && (
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h4>Banner Content</h4>
                    
                    <div className="form-group">
                      <label htmlFor="title">Title:</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Day Special"
                        disabled={isSaving}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="subtitle">Subtitle:</label>
                      <input
                        type="text"
                        id="subtitle"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleInputChange}
                        placeholder="e.g., Available up to 12 am"
                        disabled={isSaving}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="productName">Product Name:</label>
                      <input
                        type="text"
                        id="productName"
                        name="productName"
                        value={formData.productName}
                        onChange={handleInputChange}
                        placeholder="e.g., Chicken Curry Cut & more"
                        disabled={isSaving}
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="originalPrice">Original Price (₹):</label>
                        <input
                          type="number"
                          id="originalPrice"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleInputChange}
                          placeholder="e.g., 200"
                          disabled={isSaving}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="currentPrice">Current Price (₹):</label>
                        <input
                          type="number"
                          id="currentPrice"
                          name="currentPrice"
                          value={formData.currentPrice}
                          onChange={handleInputChange}
                          placeholder="e.g., 180"
                          disabled={isSaving}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="link">Link:</label>
                      <input
                        type="text"
                        id="link"
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        placeholder="e.g., /product/chicken-curry-cut"
                        disabled={isSaving}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="backgroundColor">Background Color:</label>
                      <input
                        type="color"
                        id="backgroundColor"
                        name="backgroundColor"
                        value={formData.backgroundColor}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Navigation Button Settings</h4>
                    
                    <div className="form-group">
                      <label htmlFor="navigationType">Navigation Type:</label>
                      <select
                        id="navigationType"
                        name="navigationType"
                        value={formData.navigationType}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      >
                        {navigationOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="navigationText">Custom Button Text (optional):</label>
                      <input
                        type="text"
                        id="navigationText"
                        name="navigationText"
                        value={formData.navigationText}
                        onChange={handleInputChange}
                        placeholder="Leave empty to use default text"
                        disabled={isSaving}
                      />
                    </div>

                    {(formData.navigationType === 'dynamic-section' || formData.navigationType === 'custom-link') && (
                      <div className="form-group">
                        <label htmlFor="customLink">
                          {formData.navigationType === 'dynamic-section' ? 'Section ID:' : 'Custom Link URL:'}
                        </label>
                        <input
                          type="text"
                          id="customLink"
                          name="customLink"
                          value={formData.customLink}
                          onChange={handleInputChange}
                          placeholder={
                            formData.navigationType === 'dynamic-section' 
                              ? "e.g., premium-chicken" 
                              : "e.g., /special-offers or https://example.com"
                          }
                          disabled={isSaving}
                          required
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="order">Display Order:</label>
                      <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        placeholder="0 = first, 1 = second, etc."
                        disabled={isSaving}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h4>Banner Settings</h4>
                    
                    <div className="form-group checkbox">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        disabled={isSaving}
                      />
                      <label htmlFor="isActive">Active (visible on website)</label>
                    </div>
                    
                    <div className="form-group checkbox">
                      <input
                        type="checkbox"
                        id="enable-scheduling"
                        checked={schedulingEnabled}
                        onChange={handleSchedulingToggle}
                        disabled={isSaving}
                      />
                      <label htmlFor="enable-scheduling">Enable Scheduling</label>
                    </div>
                    
                    {schedulingEnabled && (
                      <div className="scheduling-options">
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="startDate">Start Date & Time:</label>
                            <input
                              type="datetime-local"
                              id="startDate"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleInputChange}
                              disabled={isSaving}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="endDate">End Date & Time:</label>
                            <input
                              type="datetime-local"
                              id="endDate"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleInputChange}
                              disabled={isSaving}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="save-button"
                onClick={saveBannerData}
                disabled={isUploading || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Banner'}
              </button>
              <button
                className="cancel-button"
                onClick={handleCloseModal}
                disabled={isUploading || isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerEditor;