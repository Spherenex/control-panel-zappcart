// import React, { useState, useEffect } from 'react';
// import {
//     ref as dbRef,
//     get,
//     set,
//     update,
//     remove,
//     child
// } from 'firebase/database';
// import { database, storage } from '../../firebase';
// import {
//     ref as storageRef,
//     uploadBytesResumable,
//     getDownloadURL,
//     listAll,
//     deleteObject
// } from 'firebase/storage';
// import './BannerManagement.css';

// // Banner subcategories - can be dynamically managed
// const BANNER_SUBCATEGORIES = [
//     'Premium Chicken Cuts',
//     'Fresh Fish Collection',
//     'Premium Mutton Selection'
// ];

// const BannerManagement = () => {
//     // Banner form state
//     const [bannerData, setBannerData] = useState({
//         title: '',
//         subtitle: '',
//         description: '',
//         cta: 'Shop Now',
//         link: '/shop',
//         discount: '',
//         originalPrice: 0,
//         discountedPrice: 0,
//         startDate: '', // New field for scheduling start time
//         endDate: '',   // New field for scheduling end time
//         isActive: true // Flag to manually enable/disable regardless of dates
//     });

//     // UI state
//     const [selectedBanner, setSelectedBanner] = useState('');
//     const [banners, setBanners] = useState({});
//     const [bannerImages, setBannerImages] = useState({});
//     const [uploadFile, setUploadFile] = useState(null);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [isUploading, setIsUploading] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [error, setError] = useState('');
//     const [successMessage, setSuccessMessage] = useState('');
//     const [isEditing, setIsEditing] = useState(false);
//     const [isAddingNewBanner, setIsAddingNewBanner] = useState(false);
//     const [newBannerCategory, setNewBannerCategory] = useState('');
//     const [schedulingEnabled, setSchedulingEnabled] = useState(false);

//     // Fetch all banner data when component mounts
//     useEffect(() => {
//         fetchAllBanners();
//         fetchAllBannerImages();
//     }, []);

//     // Fetch banner details from Realtime Database
//     const fetchAllBanners = async () => {
//         try {
//             const bannersRef = dbRef(database, 'banners');
//             const snapshot = await get(bannersRef);

//             if (snapshot.exists()) {
//                 setBanners(snapshot.val());
//             } else {
//                 setBanners({});
//             }
//         } catch (error) {
//             console.error("Error fetching banners:", error);
//             setError("Failed to load banner data from database");
//         }
//     };

//     // Fetch banner images from Storage
//     const fetchAllBannerImages = async () => {
//         try {
//             const imagesData = {};

//             for (const category of BANNER_SUBCATEGORIES) {
//                 try {
//                     const folderRef = storageRef(storage, `banners/${category}`);
//                     const fileList = await listAll(folderRef);

//                     // Sort by timestamp to get newest first
//                     const sortedItems = [...fileList.items].sort((a, b) => {
//                         const getTimestamp = (name) => {
//                             const match = name.match(/image_(\d+)/);
//                             return match ? parseInt(match[1]) : 0;
//                         };

//                         const timestampA = getTimestamp(a.name);
//                         const timestampB = getTimestamp(b.name);

//                         return timestampB - timestampA;
//                     });

//                     if (sortedItems.length > 0) {
//                         try {
//                             const imageURL = await getDownloadURL(sortedItems[0]);
//                             imagesData[category] = {
//                                 url: imageURL,
//                                 path: sortedItems[0].fullPath,
//                                 name: sortedItems[0].name
//                             };
//                         } catch (error) {
//                             console.error(`Error getting image URL for ${category}:`, error);
//                             imagesData[category] = {
//                                 url: `https://via.placeholder.com/800x400?text=${category.replace(/\s+/g, '+')}`,
//                                 path: null,
//                                 name: null
//                             };
//                         }
//                     } else {
//                         imagesData[category] = {
//                             url: `https://via.placeholder.com/800x400?text=No+Image+For+${category.replace(/\s+/g, '+')}`,
//                             path: null,
//                             name: null
//                         };
//                     }
//                 } catch (error) {
//                     console.error(`Error fetching images for ${category}:`, error);
//                     imagesData[category] = {
//                         url: `https://via.placeholder.com/800x400?text=Error+Loading+${category.replace(/\s+/g, '+')}`,
//                         path: null,
//                         name: null
//                     };
//                 }
//             }

//             setBannerImages(imagesData);
//         } catch (error) {
//             console.error("Error fetching banner images:", error);
//             setError("Failed to load banner images");
//         }
//     };

//     // Handle banner selection
//     const handleBannerSelect = (bannerName) => {
//         setSelectedBanner(bannerName);
//         clearMessages();
//         setIsAddingNewBanner(false);

//         // If we have data for this banner, load it
//         if (banners[bannerName]) {
//             const bannerDataFromDB = banners[bannerName];
            
//             // Check if scheduling data exists in the banner
//             const hasScheduling = bannerDataFromDB.startDate || bannerDataFromDB.endDate;
//             setSchedulingEnabled(hasScheduling);
            
//             setBannerData(bannerDataFromDB);
//             setIsEditing(true);
//         } else {
//             // Reset form for a new banner
//             setBannerData({
//                 title: '',
//                 subtitle: '',
//                 description: '',
//                 cta: 'Shop Now',
//                 link: `/shop?category=${bannerName.toLowerCase().includes('chicken') ? 'chicken' : (bannerName.toLowerCase().includes('fish') ? 'fish' : 'mutton')}`,
//                 discount: '',
//                 originalPrice: 0,
//                 discountedPrice: 0,
//                 startDate: '',
//                 endDate: '',
//                 isActive: true
//             });
//             setSchedulingEnabled(false);
//             setIsEditing(false);
//         }

//         setUploadFile(null);
//     };

//     // Handle adding a new banner category
//     const handleAddNewBanner = () => {
//         setIsAddingNewBanner(true);
//         setSelectedBanner('');
//         setNewBannerCategory('');
//         clearMessages();

//         // Reset banner data
//         setBannerData({
//             title: '',
//             subtitle: '',
//             description: '',
//             cta: 'Shop Now',
//             link: '/shop',
//             discount: '',
//             originalPrice: 0,
//             discountedPrice: 0,
//             startDate: '',
//             endDate: '',
//             isActive: true
//         });

//         setSchedulingEnabled(false);
//         setUploadFile(null);
//         setIsEditing(false);
//     };

//     // Handle input changes for new banner category
//     const handleNewBannerCategoryChange = (e) => {
//         setNewBannerCategory(e.target.value);
//     };

//     // Validate and save new banner category
//     const saveNewBannerCategory = async () => {
//         if (!newBannerCategory.trim()) {
//             setError("Please enter a banner category name");
//             return;
//         }

//         // Check if category already exists
//         if (BANNER_SUBCATEGORIES.includes(newBannerCategory.trim())) {
//             setError("This banner category already exists");
//             return;
//         }

//         // Trim and capitalize the new category name
//         const newCategory = newBannerCategory.trim();

//         // Reset state and prepare for new banner creation
//         setSelectedBanner(newCategory);
//         setIsAddingNewBanner(false);
//         clearMessages();

//         // Reset banner data with new category
//         setBannerData({
//             title: '',
//             subtitle: '',
//             description: '',
//             cta: 'Shop Now',
//             link: `/shop?category=${newCategory.toLowerCase()}`,
//             discount: '',
//             originalPrice: 0,
//             discountedPrice: 0,
//             startDate: '',
//             endDate: '',
//             isActive: true
//         });

//         setSchedulingEnabled(false);
//         setIsEditing(false);
//     };

//     // Handle scheduling toggle
//     const handleSchedulingToggle = () => {
//         setSchedulingEnabled(!schedulingEnabled);
        
//         // If disabling scheduling, clear the date fields
//         if (schedulingEnabled) {
//             setBannerData(prev => ({
//                 ...prev,
//                 startDate: '',
//                 endDate: ''
//             }));
//         }
//     };

//     // Format date for input field (YYYY-MM-DDTHH:MM)
//     const formatDateForInput = (dateString) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         return date.toISOString().slice(0, 16);
//     };

//     // Handle input changes
//     const handleInputChange = (e) => {
//         const { name, value, type } = e.target;

//         if (type === 'number') {
//             setBannerData(prev => ({
//                 ...prev,
//                 [name]: value === '' ? '' : Number(value)
//             }));
//         } else if (type === 'checkbox') {
//             setBannerData(prev => ({
//                 ...prev,
//                 [name]: e.target.checked
//             }));
//         } else if (name === 'startDate' || name === 'endDate') {
//             setBannerData(prev => ({
//                 ...prev,
//                 [name]: value
//             }));
//         } else {
//             setBannerData(prev => ({
//                 ...prev,
//                 [name]: value
//             }));
//         }
//     };

//     // Handle file selection for image upload
//     const handleFileChange = (e) => {
//         if (e.target.files[0]) {
//             setUploadFile(e.target.files[0]);
//             clearMessages();
//         }
//     };

//     // Clear error and success messages
//     const clearMessages = () => {
//         setError('');
//         setSuccessMessage('');
//     };

//     // Handle image upload
//     const handleImageUpload = async () => {
//         if (!selectedBanner) {
//             setError("Please select a banner first");
//             return;
//         }

//         if (!uploadFile) {
//             setError("Please select an image to upload");
//             return;
//         }

//         setIsUploading(true);
//         setUploadProgress(0);
//         clearMessages();

//         try {
//             // Generate a timestamp to ensure uniqueness and enable sorting by recency
//             const timestamp = new Date().getTime();
//             const fileExt = uploadFile.name.split('.').pop();

//             // Create storage path
//             const storagePath = `banners/${selectedBanner}/image_${timestamp}.${fileExt}`;

//             // If there's an existing image, delete it
//             if (bannerImages[selectedBanner] && bannerImages[selectedBanner].path) {
//                 try {
//                     const fileRef = storageRef(storage, bannerImages[selectedBanner].path);
//                     await deleteObject(fileRef);
//                 } catch (deleteError) {
//                     console.error('Error deleting existing image:', deleteError);
//                     // Continue with upload even if delete fails
//                 }
//             }

//             // Upload new image
//             const imageRef = storageRef(storage, storagePath);
//             const uploadTask = uploadBytesResumable(imageRef, uploadFile);

//             // Monitor upload progress
//             uploadTask.on(
//                 'state_changed',
//                 (snapshot) => {
//                     const progress = Math.round(
//                         (snapshot.bytesTransferred / snapshot.totalBytes) * 100
//                     );
//                     setUploadProgress(progress);
//                 },
//                 (error) => {
//                     console.error('Upload error:', error);
//                     setError(`Image upload failed: ${error.message}`);
//                     setIsUploading(false);
//                 },
//                 async () => {
//                     try {
//                         // Upload completed successfully
//                         const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

//                         // Update the bannerImages state
//                         setBannerImages(prev => ({
//                             ...prev,
//                             [selectedBanner]: {
//                                 url: downloadURL,
//                                 path: storagePath,
//                                 name: `image_${timestamp}.${fileExt}`
//                             }
//                         }));

//                         setIsUploading(false);
//                         setUploadFile(null);

//                         // Reset the file input
//                         const fileInput = document.getElementById('banner-image-input');
//                         if (fileInput) fileInput.value = '';

//                         setSuccessMessage("Banner image uploaded successfully!");
//                     } catch (error) {
//                         console.error('Error getting download URL:', error);
//                         setError(`Upload succeeded but couldn't get download URL: ${error.message}`);
//                         setIsUploading(false);
//                     }
//                 }
//             );
//         } catch (error) {
//             console.error('Error starting upload:', error);
//             setError(`Failed to start upload: ${error.message}`);
//             setIsUploading(false);
//         }
//     };

//     // Save banner data to Realtime Database
//     const saveBannerData = async () => {
//         if (!selectedBanner) {
//             setError("Please select a banner first");
//             return;
//         }

//         // Basic validation
//         if (!bannerData.title || !bannerData.subtitle || !bannerData.description) {
//             setError("Please fill in all required fields: title, subtitle, and description");
//             return;
//         }

//         // Validate scheduling dates if enabled
//         if (schedulingEnabled) {
//             if (!bannerData.startDate && !bannerData.endDate) {
//                 setError("Please set at least one of start date or end date for scheduling");
//                 return;
//             }

//             if (bannerData.startDate && bannerData.endDate && new Date(bannerData.startDate) > new Date(bannerData.endDate)) {
//                 setError("End date must be after start date");
//                 return;
//             }
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             const bannerRef = dbRef(database, `banners/${selectedBanner}`);
            
//             // Prepare data to save
//             const dataToSave = { ...bannerData };
            
//             // Only include scheduling fields if scheduling is enabled
//             if (!schedulingEnabled) {
//                 delete dataToSave.startDate;
//                 delete dataToSave.endDate;
//             }

//             // Save banner data to database
//             await set(bannerRef, dataToSave);

//             // Update local state
//             setBanners(prev => ({
//                 ...prev,
//                 [selectedBanner]: dataToSave
//             }));

//             // If this was a new banner category, add it to the subcategories
//             if (!BANNER_SUBCATEGORIES.includes(selectedBanner)) {
//                 BANNER_SUBCATEGORIES.push(selectedBanner);
//             }

//             setSuccessMessage("Banner details saved successfully!");
//             setIsEditing(true);

//             // Ensure the newly added banner remains selected
//             setSelectedBanner(selectedBanner);
//         } catch (error) {
//             console.error("Error saving banner data:", error);
//             setError(`Failed to save banner details: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Complete save of banner (both image and details)
//     const saveCompleteBanner = async () => {
//         // First save the banner data
//         await saveBannerData();

//         // Then upload the image if there's a new one
//         if (uploadFile) {
//             await handleImageUpload();
//         }
//     };

//     // Delete banner (both image and data)
//     const deleteBanner = async () => {
//         if (!selectedBanner) {
//             setError("Please select a banner first");
//             return;
//         }

//         if (!window.confirm(`Are you sure you want to delete the "${selectedBanner}" banner?`)) {
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             // Delete banner data from database
//             await remove(dbRef(database, `banners/${selectedBanner}`));

//             // Delete banner image from storage if it exists
//             if (bannerImages[selectedBanner] && bannerImages[selectedBanner].path) {
//                 try {
//                     const fileRef = storageRef(storage, bannerImages[selectedBanner].path);
//                     await deleteObject(fileRef);
//                 } catch (deleteError) {
//                     console.error('Error deleting banner image:', deleteError);
//                     // Continue even if image delete fails
//                 }
//             }

//             // Update local state
//             setBanners(prev => {
//                 const newBanners = { ...prev };
//                 delete newBanners[selectedBanner];
//                 return newBanners;
//             });

//             setBannerImages(prev => ({
//                 ...prev,
//                 [selectedBanner]: {
//                     url: `https://via.placeholder.com/800x400?text=No+Image+For+${selectedBanner.replace(/\s+/g, '+')}`,
//                     path: null,
//                     name: null
//                 }
//             }));

//             // Reset form
//             setBannerData({
//                 title: '',
//                 subtitle: '',
//                 description: '',
//                 cta: 'Shop Now',
//                 link: `/shop?category=${selectedBanner.toLowerCase().includes('chicken') ? 'chicken' : (selectedBanner.toLowerCase().includes('fish') ? 'fish' : 'mutton')}`,
//                 discount: '',
//                 originalPrice: 0,
//                 discountedPrice: 0,
//                 startDate: '',
//                 endDate: '',
//                 isActive: true
//             });

//             setIsEditing(false);
//             setSuccessMessage(`"${selectedBanner}" banner deleted successfully!`);
//         } catch (error) {
//             console.error("Error deleting banner:", error);
//             setError(`Failed to delete banner: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Calculate and display banner status
//     const getBannerStatusDisplay = () => {
//         if (!selectedBanner || !banners[selectedBanner]) {
//             return <span>Not saved yet</span>;
//         }

//         const banner = banners[selectedBanner];
//         const now = new Date();
        
//         // Check if banner has scheduling
//         if (banner.startDate || banner.endDate) {
//             const startDate = banner.startDate ? new Date(banner.startDate) : null;
//             const endDate = banner.endDate ? new Date(banner.endDate) : null;
            
//             // Banner hasn't started yet
//             if (startDate && now < startDate) {
//                 return (
//                     <span className="status-scheduled">
//                         Scheduled (starts on {new Date(startDate).toLocaleString()})
//                     </span>
//                 );
//             }
            
//             // Banner has ended
//             if (endDate && now > endDate) {
//                 return <span className="status-expired">Expired</span>;
//             }
            
//             // Banner is currently active within schedule
//             if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
//                 return <span className="status-active">Active (Scheduled)</span>;
//             }
//         }
        
//         // No scheduling, just check isActive flag
//         return banner.isActive ? 
//             <span className="status-active">Active</span> : 
//             <span className="status-inactive">Inactive</span>;
//     };

//     return (
//         <div className="banner-management">
//             <h2>Banner Management</h2>

//             {error && <div className="error-message">{error}</div>}
//             {successMessage && <div className="success-message">{successMessage}</div>}

//             <div className="banner-actions-top">
//                 <div className="banner-select">
//                     <label htmlFor="banner-selector">Select Banner:</label>
//                     <select
//                         id="banner-selector"
//                         value={selectedBanner}
//                         onChange={(e) => handleBannerSelect(e.target.value)}
//                         disabled={isUploading || isSaving}
//                     >
//                         <option value="">Select a Banner</option>
//                         {BANNER_SUBCATEGORIES.map(banner => (
//                             <option key={banner} value={banner}>{banner}</option>
//                         ))}
//                     </select>
//                 </div>

//                 <button
//                     className="add-banner-button"
//                     onClick={handleAddNewBanner}
//                     disabled={isUploading || isSaving}
//                 >
//                     + Add New Banner
//                 </button>
//             </div>

//             {isAddingNewBanner && (
//                 <div className="new-banner-category">
//                     <div className="form-group">
//                         <label htmlFor="new-banner-category">New Banner Category:</label>
//                         <input
//                             id="new-banner-category"
//                             type="text"
//                             value={newBannerCategory}
//                             onChange={handleNewBannerCategoryChange}
//                             placeholder="Enter new banner category"
//                             disabled={isSaving}
//                         />
//                     </div>
//                     <button
//                         className="save-new-category-button"
//                         onClick={saveNewBannerCategory}
//                         disabled={isSaving}
//                     >
//                         Save New Category
//                     </button>
//                 </div>
//             )}

//             {(selectedBanner || isAddingNewBanner) && (
//                 <div className="banner-editor">
//                     <div className="banner-preview">
//                         <h3>Banner Preview</h3>
//                         <div className="preview-container">
//                             <img
//                                 src={bannerImages[selectedBanner]?.url}
//                                 alt={`${selectedBanner} preview`}
//                                 className="banner-image-preview"
//                             />
//                             <div className="preview-overlay">
//                                 <div className="banner-preview-content">
//                                     <div className="preview-subtitle">{bannerData.subtitle}</div>
//                                     <div className="preview-title">{bannerData.title}</div>
//                                     <div className="preview-description">{bannerData.description}</div>

//                                     <div className="preview-price">
//                                         {bannerData.discount && (
//                                             <span className="preview-discount">{bannerData.discount}</span>
//                                         )}
//                                         {bannerData.originalPrice > 0 && (
//                                             <div className="price-values">
//                                                 <span className="original-price">₹{bannerData.originalPrice}</span>
//                                                 <span className="current-price">₹{bannerData.discountedPrice}</span>
//                                             </div>
//                                         )}
//                                     </div>

//                                     <div className="preview-cta">
//                                         {bannerData.cta}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         {/* Banner Status */}
//                         {isEditing && (
//                             <div className="banner-status">
//                                 <strong>Status:</strong> {getBannerStatusDisplay()}
//                             </div>
//                         )}
//                     </div>

//                     <div className="banner-form">
//                         <div className="form-section">
//                             <h3>Image Upload</h3>
//                             <div className="form-group">
//                                 <label htmlFor="banner-image-input">Select Banner Image:</label>
//                                 <input
//                                     id="banner-image-input"
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={handleFileChange}
//                                     disabled={isUploading || isSaving}
//                                 />
//                             </div>

//                             {uploadFile && (
//                                 <button
//                                     className="upload-button"
//                                     onClick={handleImageUpload}
//                                     disabled={isUploading || isSaving}
//                                 >
//                                     {isUploading ? 'Uploading...' : 'Upload Image'}
//                                 </button>
//                             )}

//                             {isUploading && (
//                                 <div className="progress-container">
//                                     <div
//                                         className="progress-bar"
//                                         style={{ width: `${uploadProgress}%` }}
//                                     />
//                                     <span className="progress-text">{uploadProgress}%</span>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="form-section">
//                             <h3>Banner Details</h3>

//                             <div className="form-group">
//                                 <label htmlFor="title">Title: <span className="required">*</span></label>
//                                 <input
//                                     id="title"
//                                     name="title"
//                                     type="text"
//                                     value={bannerData.title}
//                                     onChange={handleInputChange}
//                                     placeholder="e.g., Premium Chicken Cuts"
//                                     disabled={isSaving}
//                                     required
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label htmlFor="subtitle">Subtitle: <span className="required">*</span></label>
//                                 <input
//                                     id="subtitle"
//                                     name="subtitle"
//                                     type="text"
//                                     value={bannerData.subtitle}
//                                     onChange={handleInputChange}
//                                     placeholder="e.g., Farm Fresh Everyday"
//                                     disabled={isSaving}
//                                     required
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label htmlFor="description">Description: <span className="required">*</span></label>
//                                 <textarea
//                                     id="description"
//                                     name="description"
//                                     value={bannerData.description}
//                                     onChange={handleInputChange}
//                                     placeholder="e.g., Antibiotic-free chicken raised in certified farms"
//                                     rows={4}
//                                     disabled={isSaving}
//                                     required
//                                 />
//                             </div>

//                             <div className="form-row">
//                                 <div className="form-group">
//                                     <label htmlFor="cta">Call to Action:</label>
//                                     <input
//                                         id="cta"
//                                         name="cta"
//                                         type="text"
//                                         value={bannerData.cta}
//                                         onChange={handleInputChange}
//                                         placeholder="e.g., Shop Now"
//                                         disabled={isSaving}
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="link">Link URL:</label>
//                                     <input
//                                         id="link"
//                                         name="link"
//                                         type="text"
//                                         value={bannerData.link}
//                                         onChange={handleInputChange}
//                                         placeholder="e.g., /shop?category=chicken"
//                                         disabled={isSaving}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="form-group">
//                                 <label htmlFor="discount">Discount Text:</label>
//                                 <input
//                                     id="discount"
//                                     name="discount"
//                                     type="text"
//                                     value={bannerData.discount}
//                                     onChange={handleInputChange}
//                                     placeholder="e.g., 20% OFF"
//                                     disabled={isSaving}
//                                 />
//                             </div>

//                             <div className="form-row">
//                                 <div className="form-group">
//                                     <label htmlFor="originalPrice">Original Price (₹):</label>
//                                     <input
//                                         id="originalPrice"
//                                         name="originalPrice"
//                                         type="number"
//                                         value={bannerData.originalPrice}
//                                         onChange={handleInputChange}
//                                         min="0"
//                                         placeholder="e.g., 299"
//                                         disabled={isSaving}
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="discountedPrice">Discounted Price (₹):</label>
//                                     <input
//                                         id="discountedPrice"
//                                         name="discountedPrice"
//                                         type="number"
//                                         value={bannerData.discountedPrice}
//                                         onChange={handleInputChange}
//                                         min="0"
//                                         placeholder="e.g., 249"
//                                         disabled={isSaving}
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Banner Scheduling Section */}
//                         <div className="form-section">
//                             <div className="section-header">
//                                 <h3>Banner Scheduling</h3>
//                                 <div className="scheduling-toggle">
//                                     <input
//                                         type="checkbox"
//                                         id="scheduling-toggle"
//                                         checked={schedulingEnabled}
//                                         onChange={handleSchedulingToggle}
//                                         disabled={isSaving}
//                                     />
//                                     <label htmlFor="scheduling-toggle">Enable Scheduling</label>
//                                 </div>
//                             </div>

//                             {schedulingEnabled && (
//                                 <div className="scheduling-options">
//                                     <div className="form-row">
//                                         <div className="form-group">
//                                             <label htmlFor="startDate">Start Date & Time:</label>
//                                             <input
//                                                 id="startDate"
//                                                 name="startDate"
//                                                 type="datetime-local"
//                                                 value={bannerData.startDate}
//                                                 onChange={handleInputChange}
//                                                 disabled={isSaving}
//                                             />
//                                             <small>Leave blank for immediate start</small>
//                                         </div>

//                                         <div className="form-group">
//                                             <label htmlFor="endDate">End Date & Time:</label>
//                                             <input
//                                                 id="endDate"
//                                                 name="endDate"
//                                                 type="datetime-local"
//                                                 value={bannerData.endDate}
//                                                 onChange={handleInputChange}
//                                                 disabled={isSaving}
//                                             />
//                                             <small>Leave blank for no end date</small>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="form-group">
//                                 <div className="checkbox-container">
//                                     <input
//                                         type="checkbox"
//                                         id="isActive"
//                                         name="isActive"
//                                         checked={bannerData.isActive}
//                                         onChange={handleInputChange}
//                                         disabled={isSaving}
//                                     />
//                                     <label htmlFor="isActive">
//                                         Active
//                                         <small> (manually enable/disable regardless of scheduling)</small>
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="banner-actions">
//                             <button
//                                 className="save-button"
//                                 onClick={saveCompleteBanner}
//                                 disabled={isUploading || isSaving}
//                             >
//                                 {isSaving ? 'Saving...' : (isEditing ? 'Update Banner' : 'Save Banner')}
//                             </button>

//                             {isEditing && (
//                                 <button
//                                     className="delete-button"
//                                     onClick={deleteBanner}
//                                     disabled={isUploading || isSaving}
//                                 >
//                                     Delete Banner
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default BannerManagement;


// import React, { useState, useEffect } from 'react';
// import {
//     ref as dbRef,
//     get,
//     set,
//     update,
//     remove,
//     child
// } from 'firebase/database';
// import { database, storage } from '../../firebase';
// import {
//     ref as storageRef,
//     uploadBytesResumable,
//     getDownloadURL,
//     listAll,
//     deleteObject
// } from 'firebase/storage';
// import './BannerManagement.css';

// // Banner subcategories - can be dynamically managed
// const BANNER_SUBCATEGORIES = [
//     'Premium Chicken Cuts',
//     'Fresh Fish Collection',
//     'Premium Mutton Selection'
// ];

// const BannerManagement = () => {
//     // Banner form state
//     const [bannerData, setBannerData] = useState({
//         title: '',
//         subtitle: '',
//         description: '',
//         cta: 'Shop Now',
//         link: '/shop',
//         discount: '',
//         originalPrice: 0,
//         discountedPrice: 0,
//         startDate: '', // For banner scheduling
//         endDate: '',   // For banner scheduling
//         isActive: true, // Flag to manually enable/disable regardless of dates
//         // Price promotion timing
//         pricePromotion: {
//             isEnabled: false,      // Enable/disable price promotion timing
//             startDate: '',         // When the discounted price begins
//             endDate: '',           // When the discounted price ends
//             regularPrice: 0,       // Regular price after promotion ends
//             promotionalPrice: 0    // Promotional price during the promo period
//         }
//     });

//     // UI state
//     const [selectedBanner, setSelectedBanner] = useState('');
//     const [banners, setBanners] = useState({});
//     const [bannerImages, setBannerImages] = useState({});
//     const [uploadFile, setUploadFile] = useState(null);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [isUploading, setIsUploading] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [error, setError] = useState('');
//     const [successMessage, setSuccessMessage] = useState('');
//     const [isEditing, setIsEditing] = useState(false);
//     const [isAddingNewBanner, setIsAddingNewBanner] = useState(false);
//     const [newBannerCategory, setNewBannerCategory] = useState('');
//     const [schedulingEnabled, setSchedulingEnabled] = useState(false);

//     // Fetch all banner data when component mounts
//     useEffect(() => {
//         fetchAllBanners();
//         fetchAllBannerImages();
//     }, []);

//     // Fetch banner details from Realtime Database
//     const fetchAllBanners = async () => {
//         try {
//             const bannersRef = dbRef(database, 'banners');
//             const snapshot = await get(bannersRef);

//             if (snapshot.exists()) {
//                 setBanners(snapshot.val());
//             } else {
//                 setBanners({});
//             }
//         } catch (error) {
//             console.error("Error fetching banners:", error);
//             setError("Failed to load banner data from database");
//         }
//     };

//     // Fetch banner images from Storage
//     const fetchAllBannerImages = async () => {
//         try {
//             const imagesData = {};

//             for (const category of BANNER_SUBCATEGORIES) {
//                 try {
//                     const folderRef = storageRef(storage, `banners/${category}`);
//                     const fileList = await listAll(folderRef);

//                     // Sort by timestamp to get newest first
//                     const sortedItems = [...fileList.items].sort((a, b) => {
//                         const getTimestamp = (name) => {
//                             const match = name.match(/image_(\d+)/);
//                             return match ? parseInt(match[1]) : 0;
//                         };

//                         const timestampA = getTimestamp(a.name);
//                         const timestampB = getTimestamp(b.name);

//                         return timestampB - timestampA;
//                     });

//                     if (sortedItems.length > 0) {
//                         try {
//                             const imageURL = await getDownloadURL(sortedItems[0]);
//                             imagesData[category] = {
//                                 url: imageURL,
//                                 path: sortedItems[0].fullPath,
//                                 name: sortedItems[0].name
//                             };
//                         } catch (error) {
//                             console.error(`Error getting image URL for ${category}:`, error);
//                             imagesData[category] = {
//                                 url: `https://via.placeholder.com/800x400?text=${category.replace(/\s+/g, '+')}`,
//                                 path: null,
//                                 name: null
//                             };
//                         }
//                     } else {
//                         imagesData[category] = {
//                             url: `https://via.placeholder.com/800x400?text=No+Image+For+${category.replace(/\s+/g, '+')}`,
//                             path: null,
//                             name: null
//                         };
//                     }
//                 } catch (error) {
//                     console.error(`Error fetching images for ${category}:`, error);
//                     imagesData[category] = {
//                         url: `https://via.placeholder.com/800x400?text=Error+Loading+${category.replace(/\s+/g, '+')}`,
//                         path: null,
//                         name: null
//                     };
//                 }
//             }

//             setBannerImages(imagesData);
//         } catch (error) {
//             console.error("Error fetching banner images:", error);
//             setError("Failed to load banner images");
//         }
//     };

//     // Handle banner selection
//     const handleBannerSelect = (bannerName) => {
//         setSelectedBanner(bannerName);
//         clearMessages();
//         setIsAddingNewBanner(false);

//         // If we have data for this banner, load it
//         if (banners[bannerName]) {
//             const bannerDataFromDB = banners[bannerName];
            
//             // Check if scheduling data exists in the banner
//             const hasScheduling = bannerDataFromDB.startDate || bannerDataFromDB.endDate;
//             setSchedulingEnabled(hasScheduling);
            
//             // Handle price promotion data - ensure the structure exists
//             if (!bannerDataFromDB.pricePromotion) {
//                 bannerDataFromDB.pricePromotion = {
//                     isEnabled: false,
//                     startDate: '',
//                     endDate: '',
//                     regularPrice: bannerDataFromDB.originalPrice || 0,
//                     promotionalPrice: bannerDataFromDB.discountedPrice || 0
//                 };
//             }
            
//             setBannerData(bannerDataFromDB);
//             setIsEditing(true);
//         } else {
//             // Reset form for a new banner
//             setBannerData({
//                 title: '',
//                 subtitle: '',
//                 description: '',
//                 cta: 'Shop Now',
//                 link: `/shop?category=${bannerName.toLowerCase().includes('chicken') ? 'chicken' : (bannerName.toLowerCase().includes('fish') ? 'fish' : 'mutton')}`,
//                 discount: '',
//                 originalPrice: 0,
//                 discountedPrice: 0,
//                 startDate: '',
//                 endDate: '',
//                 isActive: true,
//                 pricePromotion: {
//                     isEnabled: false,
//                     startDate: '',
//                     endDate: '',
//                     regularPrice: 0,
//                     promotionalPrice: 0
//                 }
//             });
//             setSchedulingEnabled(false);
//             setIsEditing(false);
//         }

//         setUploadFile(null);
//     };

//     // Handle adding a new banner category
//     const handleAddNewBanner = () => {
//         setIsAddingNewBanner(true);
//         setSelectedBanner('');
//         setNewBannerCategory('');
//         clearMessages();

//         // Reset banner data
//         setBannerData({
//             title: '',
//             subtitle: '',
//             description: '',
//             cta: 'Shop Now',
//             link: '/shop',
//             discount: '',
//             originalPrice: 0,
//             discountedPrice: 0,
//             startDate: '',
//             endDate: '',
//             isActive: true,
//             pricePromotion: {
//                 isEnabled: false,
//                 startDate: '',
//                 endDate: '',
//                 regularPrice: 0,
//                 promotionalPrice: 0
//             }
//         });

//         setSchedulingEnabled(false);
//         setUploadFile(null);
//         setIsEditing(false);
//     };

//     // Handle input changes for new banner category
//     const handleNewBannerCategoryChange = (e) => {
//         setNewBannerCategory(e.target.value);
//     };

//     // Validate and save new banner category
//     const saveNewBannerCategory = async () => {
//         if (!newBannerCategory.trim()) {
//             setError("Please enter a banner category name");
//             return;
//         }

//         // Check if category already exists
//         if (BANNER_SUBCATEGORIES.includes(newBannerCategory.trim())) {
//             setError("This banner category already exists");
//             return;
//         }

//         // Trim and capitalize the new category name
//         const newCategory = newBannerCategory.trim();

//         // Reset state and prepare for new banner creation
//         setSelectedBanner(newCategory);
//         setIsAddingNewBanner(false);
//         clearMessages();

//         // Reset banner data with new category
//         setBannerData({
//             title: '',
//             subtitle: '',
//             description: '',
//             cta: 'Shop Now',
//             link: `/shop?category=${newCategory.toLowerCase()}`,
//             discount: '',
//             originalPrice: 0,
//             discountedPrice: 0,
//             startDate: '',
//             endDate: '',
//             isActive: true
//         });

//         setSchedulingEnabled(false);
//         setIsEditing(false);
//     };

//     // Handle scheduling toggle
//     const handleSchedulingToggle = () => {
//         setSchedulingEnabled(!schedulingEnabled);
        
//         // If disabling scheduling, clear the date fields
//         if (schedulingEnabled) {
//             setBannerData(prev => ({
//                 ...prev,
//                 startDate: '',
//                 endDate: ''
//             }));
//         }
//     };

//     // Format date for input field (YYYY-MM-DDTHH:MM)
//     const formatDateForInput = (dateString) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         return date.toISOString().slice(0, 16);
//     };

//     // Handle input changes
//     const handleInputChange = (e) => {
//         const { name, value, type } = e.target;

//         if (type === 'number') {
//             setBannerData(prev => ({
//                 ...prev,
//                 [name]: value === '' ? '' : Number(value)
//             }));
//         } else if (type === 'checkbox') {
//             setBannerData(prev => ({
//                 ...prev,
//                 [name]: e.target.checked
//             }));
//         } else if (name === 'startDate' || name === 'endDate') {
//             setBannerData(prev => ({
//                 ...prev,
//                 [name]: value
//             }));
//         } else {
//             setBannerData(prev => ({
//                 ...prev,
//                 [name]: value
//             }));
//         }
//     };

//     // Handle file selection for image upload
//     const handleFileChange = (e) => {
//         if (e.target.files[0]) {
//             setUploadFile(e.target.files[0]);
//             clearMessages();
//         }
//     };

//     // Clear error and success messages
//     const clearMessages = () => {
//         setError('');
//         setSuccessMessage('');
//     };

//     // Handle image upload
//     const handleImageUpload = async () => {
//         if (!selectedBanner) {
//             setError("Please select a banner first");
//             return;
//         }

//         if (!uploadFile) {
//             setError("Please select an image to upload");
//             return;
//         }

//         setIsUploading(true);
//         setUploadProgress(0);
//         clearMessages();

//         try {
//             // Generate a timestamp to ensure uniqueness and enable sorting by recency
//             const timestamp = new Date().getTime();
//             const fileExt = uploadFile.name.split('.').pop();

//             // Create storage path
//             const storagePath = `banners/${selectedBanner}/image_${timestamp}.${fileExt}`;

//             // If there's an existing image, delete it
//             if (bannerImages[selectedBanner] && bannerImages[selectedBanner].path) {
//                 try {
//                     const fileRef = storageRef(storage, bannerImages[selectedBanner].path);
//                     await deleteObject(fileRef);
//                 } catch (deleteError) {
//                     console.error('Error deleting existing image:', deleteError);
//                     // Continue with upload even if delete fails
//                 }
//             }

//             // Upload new image
//             const imageRef = storageRef(storage, storagePath);
//             const uploadTask = uploadBytesResumable(imageRef, uploadFile);

//             // Monitor upload progress
//             uploadTask.on(
//                 'state_changed',
//                 (snapshot) => {
//                     const progress = Math.round(
//                         (snapshot.bytesTransferred / snapshot.totalBytes) * 100
//                     );
//                     setUploadProgress(progress);
//                 },
//                 (error) => {
//                     console.error('Upload error:', error);
//                     setError(`Image upload failed: ${error.message}`);
//                     setIsUploading(false);
//                 },
//                 async () => {
//                     try {
//                         // Upload completed successfully
//                         const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

//                         // Update the bannerImages state
//                         setBannerImages(prev => ({
//                             ...prev,
//                             [selectedBanner]: {
//                                 url: downloadURL,
//                                 path: storagePath,
//                                 name: `image_${timestamp}.${fileExt}`
//                             }
//                         }));

//                         setIsUploading(false);
//                         setUploadFile(null);

//                         // Reset the file input
//                         const fileInput = document.getElementById('banner-image-input');
//                         if (fileInput) fileInput.value = '';

//                         setSuccessMessage("Banner image uploaded successfully!");
//                     } catch (error) {
//                         console.error('Error getting download URL:', error);
//                         setError(`Upload succeeded but couldn't get download URL: ${error.message}`);
//                         setIsUploading(false);
//                     }
//                 }
//             );
//         } catch (error) {
//             console.error('Error starting upload:', error);
//             setError(`Failed to start upload: ${error.message}`);
//             setIsUploading(false);
//         }
//     };

//     // Save banner data to Realtime Database
//     const saveBannerData = async () => {
//         if (!selectedBanner) {
//             setError("Please select a banner first");
//             return;
//         }

//         // Basic validation
//         if (!bannerData.title || !bannerData.subtitle || !bannerData.description) {
//             setError("Please fill in all required fields: title, subtitle, and description");
//             return;
//         }

//         // Validate scheduling dates if enabled
//         if (schedulingEnabled) {
//             if (!bannerData.startDate && !bannerData.endDate) {
//                 setError("Please set at least one of start date or end date for scheduling");
//                 return;
//             }

//             if (bannerData.startDate && bannerData.endDate && new Date(bannerData.startDate) > new Date(bannerData.endDate)) {
//                 setError("End date must be after start date");
//                 return;
//             }
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             const bannerRef = dbRef(database, `banners/${selectedBanner}`);
            
//             // Prepare data to save
//             const dataToSave = { ...bannerData };
            
//             // Only include scheduling fields if scheduling is enabled
//             if (!schedulingEnabled) {
//                 delete dataToSave.startDate;
//                 delete dataToSave.endDate;
//             }

//             // Save banner data to database
//             await set(bannerRef, dataToSave);

//             // Update local state
//             setBanners(prev => ({
//                 ...prev,
//                 [selectedBanner]: dataToSave
//             }));

//             // If this was a new banner category, add it to the subcategories
//             if (!BANNER_SUBCATEGORIES.includes(selectedBanner)) {
//                 BANNER_SUBCATEGORIES.push(selectedBanner);
//             }

//             setSuccessMessage("Banner details saved successfully!");
//             setIsEditing(true);

//             // Ensure the newly added banner remains selected
//             setSelectedBanner(selectedBanner);
//         } catch (error) {
//             console.error("Error saving banner data:", error);
//             setError(`Failed to save banner details: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Complete save of banner (both image and details)
//     const saveCompleteBanner = async () => {
//         // First save the banner data
//         await saveBannerData();

//         // Then upload the image if there's a new one
//         if (uploadFile) {
//             await handleImageUpload();
//         }
//     };

//     // Delete banner (both image and data)
//     const deleteBanner = async () => {
//         if (!selectedBanner) {
//             setError("Please select a banner first");
//             return;
//         }

//         if (!window.confirm(`Are you sure you want to delete the "${selectedBanner}" banner?`)) {
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             // Delete banner data from database
//             await remove(dbRef(database, `banners/${selectedBanner}`));

//             // Delete banner image from storage if it exists
//             if (bannerImages[selectedBanner] && bannerImages[selectedBanner].path) {
//                 try {
//                     const fileRef = storageRef(storage, bannerImages[selectedBanner].path);
//                     await deleteObject(fileRef);
//                 } catch (deleteError) {
//                     console.error('Error deleting banner image:', deleteError);
//                     // Continue even if image delete fails
//                 }
//             }

//             // Update local state
//             setBanners(prev => {
//                 const newBanners = { ...prev };
//                 delete newBanners[selectedBanner];
//                 return newBanners;
//             });

//             setBannerImages(prev => ({
//                 ...prev,
//                 [selectedBanner]: {
//                     url: `https://via.placeholder.com/800x400?text=No+Image+For+${selectedBanner.replace(/\s+/g, '+')}`,
//                     path: null,
//                     name: null
//                 }
//             }));

//             // Reset form
//             setBannerData({
//                 title: '',
//                 subtitle: '',
//                 description: '',
//                 cta: 'Shop Now',
//                 link: `/shop?category=${selectedBanner.toLowerCase().includes('chicken') ? 'chicken' : (selectedBanner.toLowerCase().includes('fish') ? 'fish' : 'mutton')}`,
//                 discount: '',
//                 originalPrice: 0,
//                 discountedPrice: 0,
//                 startDate: '',
//                 endDate: '',
//                 isActive: true
//             });

//             setIsEditing(false);
//             setSuccessMessage(`"${selectedBanner}" banner deleted successfully!`);
//         } catch (error) {
//             console.error("Error deleting banner:", error);
//             setError(`Failed to delete banner: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Calculate and display banner status
//     const getBannerStatusDisplay = () => {
//         if (!selectedBanner || !banners[selectedBanner]) {
//             return <span>Not saved yet</span>;
//         }

//         const banner = banners[selectedBanner];
//         const now = new Date();
        
//         // Check if banner has scheduling
//         if (banner.startDate || banner.endDate) {
//             const startDate = banner.startDate ? new Date(banner.startDate) : null;
//             const endDate = banner.endDate ? new Date(banner.endDate) : null;
            
//             // Banner hasn't started yet
//             if (startDate && now < startDate) {
//                 return (
//                     <span className="status-scheduled">
//                         Scheduled (starts on {new Date(startDate).toLocaleString()})
//                     </span>
//                 );
//             }
            
//             // Banner has ended
//             if (endDate && now > endDate) {
//                 return <span className="status-expired">Expired</span>;
//             }
            
//             // Banner is currently active within schedule
//             if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
//                 return <span className="status-active">Active (Scheduled)</span>;
//             }
//         }
        
//         // No scheduling, just check isActive flag
//         return banner.isActive ? 
//             <span className="status-active">Active</span> : 
//             <span className="status-inactive">Inactive</span>;
//     };

//     // Calculate and display price promotion status
//     const getPromotionStatus = () => {
//         if (!bannerData.pricePromotion || !bannerData.pricePromotion.isEnabled) {
//             return <span className="status-inactive">Disabled</span>;
//         }

//         const now = new Date();
//         const startDate = bannerData.pricePromotion.startDate ? new Date(bannerData.pricePromotion.startDate) : null;
//         const endDate = bannerData.pricePromotion.endDate ? new Date(bannerData.pricePromotion.endDate) : null;
        
//         // Promotion hasn't started yet
//         if (startDate && now < startDate) {
//             return (
//                 <span className="status-scheduled">
//                     Scheduled (starts on {startDate.toLocaleString()})
//                 </span>
//             );
//         }
        
//         // Promotion has ended
//         if (endDate && now > endDate) {
//             return <span className="status-expired">Expired</span>;
//         }
        
//         // Promotion is currently active
//         if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
//             const timeRemaining = endDate ? formatTimeRemaining(now, endDate) : "";
//             return (
//                 <span className="status-active">
//                     Active {timeRemaining ? `(${timeRemaining} remaining)` : "(No end date)"}
//                 </span>
//             );
//         }
        
//         return <span className="status-inactive">Status Unknown</span>;
//     };
    
//     // Format time remaining for active promotions
//     const formatTimeRemaining = (now, endDate) => {
//         const diffMs = endDate - now;
//         if (diffMs <= 0) return "";
        
//         const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//         const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//         const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
//         if (diffDays > 0) {
//             return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHrs} hr${diffHrs > 1 ? 's' : ''}`;
//         } else if (diffHrs > 0) {
//             return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ${diffMins} min${diffMins > 1 ? 's' : ''}`;
//         } else {
//             return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
//         }
//     };

//     return (
//         <div className="banner-management">
//             <h2>Banner Management</h2>

//             {error && <div className="error-message">{error}</div>}
//             {successMessage && <div className="success-message">{successMessage}</div>}

//             <div className="banner-actions-top">
//                 <div className="banner-select">
//                     <label htmlFor="banner-selector">Select Banner:</label>
//                     <select
//                         id="banner-selector"
//                         value={selectedBanner}
//                         onChange={(e) => handleBannerSelect(e.target.value)}
//                         disabled={isUploading || isSaving}
//                     >
//                         <option value="">Select a Banner</option>
//                         {BANNER_SUBCATEGORIES.map(banner => (
//                             <option key={banner} value={banner}>{banner}</option>
//                         ))}
//                     </select>
//                 </div>

//                 <button
//                     className="add-banner-button"
//                     onClick={handleAddNewBanner}
//                     disabled={isUploading || isSaving}
//                 >
//                     + Add New Banner
//                 </button>
//             </div>

//             {isAddingNewBanner && (
//                 <div className="new-banner-category">
//                     <div className="form-group">
//                         <label htmlFor="new-banner-category">New Banner Category:</label>
//                         <input
//                             id="new-banner-category"
//                             type="text"
//                             value={newBannerCategory}
//                             onChange={handleNewBannerCategoryChange}
//                             placeholder="Enter new banner category"
//                             disabled={isSaving}
//                         />
//                     </div>
//                     <button
//                         className="save-new-category-button"
//                         onClick={saveNewBannerCategory}
//                         disabled={isSaving}
//                     >
//                         Save New Category
//                     </button>
//                 </div>
//             )}

//             {(selectedBanner || isAddingNewBanner) && (
//                 <div className="banner-editor">
//                     <div className="banner-preview">
//                         <h3>Banner Preview</h3>
//                         <div className="preview-container">
//                             <img
//                                 src={bannerImages[selectedBanner]?.url}
//                                 alt={`${selectedBanner} preview`}
//                                 className="banner-image-preview"
//                             />
//                             <div className="preview-overlay">
//                                 <div className="banner-preview-content">
//                                     <div className="preview-subtitle">{bannerData.subtitle}</div>
//                                     <div className="preview-title">{bannerData.title}</div>
//                                     <div className="preview-description">{bannerData.description}</div>

//                                     <div className="preview-price">
//                                         {bannerData.discount && (
//                                             <span className="preview-discount">{bannerData.discount}</span>
//                                         )}
//                                         {bannerData.originalPrice > 0 && (
//                                             <div className="price-values">
//                                                 <span className="original-price">₹{bannerData.originalPrice}</span>
//                                                 <span className="current-price">₹{bannerData.discountedPrice}</span>
//                                             </div>
//                                         )}
//                                     </div>

//                                     <div className="preview-cta">
//                                         {bannerData.cta}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         {/* Banner Status */}
//                         {isEditing && (
//                             <div className="banner-status">
//                                 <strong>Status:</strong> {getBannerStatusDisplay()}
//                             </div>
//                         )}
//                     </div>

//                     <div className="banner-form">
//                         <div className="form-section">
//                             <h3>Image Upload</h3>
//                             <div className="form-group">
//                                 <label htmlFor="banner-image-input">Select Banner Image:</label>
//                                 <input
//                                     id="banner-image-input"
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={handleFileChange}
//                                     disabled={isUploading || isSaving}
//                                 />
//                             </div>

//                             {uploadFile && (
//                                 <button
//                                     className="upload-button"
//                                     onClick={handleImageUpload}
//                                     disabled={isUploading || isSaving}
//                                 >
//                                     {isUploading ? 'Uploading...' : 'Upload Image'}
//                                 </button>
//                             )}

//                             {isUploading && (
//                                 <div className="progress-container">
//                                     <div
//                                         className="progress-bar"
//                                         style={{ width: `${uploadProgress}%` }}
//                                     />
//                                     <span className="progress-text">{uploadProgress}%</span>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="form-section">
//                             <h3>Banner Details</h3>

//                             <div className="form-group">
//                                 <label htmlFor="title">Title: <span className="required">*</span></label>
//                                 <input
//                                     id="title"
//                                     name="title"
//                                     type="text"
//                                     value={bannerData.title}
//                                     onChange={handleInputChange}
//                                     placeholder="e.g., Premium Chicken Cuts"
//                                     disabled={isSaving}
//                                     required
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label htmlFor="subtitle">Subtitle: <span className="required">*</span></label>
//                                 <input
//                                     id="subtitle"
//                                     name="subtitle"
//                                     type="text"
//                                     value={bannerData.subtitle}
//                                     onChange={handleInputChange}
//                                     placeholder="e.g., Farm Fresh Everyday"
//                                     disabled={isSaving}
//                                     required
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label htmlFor="description">Description: <span className="required">*</span></label>
//                                 <textarea
//                                     id="description"
//                                     name="description"
//                                     value={bannerData.description}
//                                     onChange={handleInputChange}
//                                     placeholder="e.g., Antibiotic-free chicken raised in certified farms"
//                                     rows={4}
//                                     disabled={isSaving}
//                                     required
//                                 />
//                             </div>

//                             <div className="form-row">
//                                 <div className="form-group">
//                                     <label htmlFor="cta">Call to Action:</label>
//                                     <input
//                                         id="cta"
//                                         name="cta"
//                                         type="text"
//                                         value={bannerData.cta}
//                                         onChange={handleInputChange}
//                                         placeholder="e.g., Shop Now"
//                                         disabled={isSaving}
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="link">Link URL:</label>
//                                     <input
//                                         id="link"
//                                         name="link"
//                                         type="text"
//                                         value={bannerData.link}
//                                         onChange={handleInputChange}
//                                         placeholder="e.g., /shop?category=chicken"
//                                         disabled={isSaving}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="form-group">
//                                 <label htmlFor="discount">Discount Text:</label>
//                                 <input
//                                     id="discount"
//                                     name="discount"
//                                     type="text"
//                                     value={bannerData.discount}
//                                     onChange={handleInputChange}
//                                     placeholder="e.g., 20% OFF"
//                                     disabled={isSaving}
//                                 />
//                             </div>

//                             {/* Price Promotion Section */}
//                             <div className="form-section">
//                                 <div className="section-header">
//                                     <h4>Price Promotion</h4>
//                                     <div className="scheduling-toggle">
//                                         <input
//                                             type="checkbox"
//                                             id="price-promo-toggle"
//                                             checked={bannerData.pricePromotion?.isEnabled || false}
//                                             onChange={() => {
//                                                 setBannerData(prev => {
//                                                     // Ensure pricePromotion exists
//                                                     const currentPromo = prev.pricePromotion || {
//                                                         isEnabled: false,
//                                                         startDate: '',
//                                                         endDate: '',
//                                                         regularPrice: prev.originalPrice || 0,
//                                                         promotionalPrice: prev.discountedPrice || 0
//                                                     };
                                                    
//                                                     return {
//                                                         ...prev,
//                                                         pricePromotion: {
//                                                             ...currentPromo,
//                                                             isEnabled: !currentPromo.isEnabled
//                                                         }
//                                                     };
//                                                 });
//                                             }}
//                                             disabled={isSaving}
//                                         />
//                                         <label htmlFor="price-promo-toggle">Enable Timed Pricing</label>
//                                     </div>
//                                 </div>

//                                 {!bannerData.pricePromotion?.isEnabled ? (
//                                     // Simple Price Section (when timed pricing is disabled)
//                                     <div className="form-row">
//                                         <div className="form-group">
//                                             <label htmlFor="originalPrice">Original Price (₹):</label>
//                                             <input
//                                                 id="originalPrice"
//                                                 name="originalPrice"
//                                                 type="number"
//                                                 value={bannerData.originalPrice}
//                                                 onChange={handleInputChange}
//                                                 min="0"
//                                                 placeholder="e.g., 299"
//                                                 disabled={isSaving}
//                                             />
//                                         </div>

//                                         <div className="form-group">
//                                             <label htmlFor="discountedPrice">Discounted Price (₹):</label>
//                                             <input
//                                                 id="discountedPrice"
//                                                 name="discountedPrice"
//                                                 type="number"
//                                                 value={bannerData.discountedPrice}
//                                                 onChange={handleInputChange}
//                                                 min="0"
//                                                 placeholder="e.g., 249"
//                                                 disabled={isSaving}
//                                             />
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     // Timed Price Section (when timed pricing is enabled)
//                                     <div className="price-promo-section">
//                                         <div className="form-row">
//                                             <div className="form-group">
//                                                 <label htmlFor="promo-regular-price">Regular Price (₹):</label>
//                                                 <input
//                                                     id="promo-regular-price"
//                                                     type="number"
//                                                     value={bannerData.pricePromotion.regularPrice}
//                                                     onChange={(e) => {
//                                                         const value = e.target.value === '' ? '' : Number(e.target.value);
//                                                         setBannerData(prev => ({
//                                                             ...prev,
//                                                             pricePromotion: {
//                                                                 ...prev.pricePromotion,
//                                                                 regularPrice: value
//                                                             }
//                                                         }));
//                                                     }}
//                                                     min="0"
//                                                     placeholder="Regular price outside promotion period"
//                                                     disabled={isSaving}
//                                                 />
//                                                 <small>Price shown outside the promotion period</small>
//                                             </div>

//                                             <div className="form-group">
//                                                 <label htmlFor="promo-price">Promotional Price (₹):</label>
//                                                 <input
//                                                     id="promo-price"
//                                                     type="number"
//                                                     value={bannerData.pricePromotion.promotionalPrice}
//                                                     onChange={(e) => {
//                                                         const value = e.target.value === '' ? '' : Number(e.target.value);
//                                                         setBannerData(prev => ({
//                                                             ...prev,
//                                                             pricePromotion: {
//                                                                 ...prev.pricePromotion,
//                                                                 promotionalPrice: value
//                                                             }
//                                                         }));
//                                                     }}
//                                                     min="0"
//                                                     placeholder="Special price during promotion"
//                                                     disabled={isSaving}
//                                                 />
//                                                 <small>Discounted price shown during promotion period</small>
//                                             </div>
//                                         </div>

//                                         <div className="form-row">
//                                             <div className="form-group">
//                                                 <label htmlFor="promo-start-date">Promotion Start:</label>
//                                                 <input
//                                                     id="promo-start-date"
//                                                     type="datetime-local"
//                                                     value={bannerData.pricePromotion.startDate}
//                                                     onChange={(e) => {
//                                                         setBannerData(prev => ({
//                                                             ...prev,
//                                                             pricePromotion: {
//                                                                 ...prev.pricePromotion,
//                                                                 startDate: e.target.value
//                                                             }
//                                                         }));
//                                                     }}
//                                                     disabled={isSaving}
//                                                 />
//                                                 <small>When the promotional price begins</small>
//                                             </div>

//                                             <div className="form-group">
//                                                 <label htmlFor="promo-end-date">Promotion End:</label>
//                                                 <input
//                                                     id="promo-end-date"
//                                                     type="datetime-local"
//                                                     value={bannerData.pricePromotion.endDate}
//                                                     onChange={(e) => {
//                                                         setBannerData(prev => ({
//                                                             ...prev,
//                                                             pricePromotion: {
//                                                                 ...prev.pricePromotion,
//                                                                 endDate: e.target.value
//                                                             }
//                                                         }));
//                                                     }}
//                                                     disabled={isSaving}
//                                                 />
//                                                 <small>When the promotional price ends</small>
//                                             </div>
//                                         </div>

//                                         <div className="promotion-status">
//                                             <strong>Current Status:</strong> {getPromotionStatus()}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Banner Scheduling Section */}
//                         <div className="form-section">
//                             <div className="section-header">
//                                 <h3>Banner Scheduling</h3>
//                                 <div className="scheduling-toggle">
//                                     <input
//                                         type="checkbox"
//                                         id="scheduling-toggle"
//                                         checked={schedulingEnabled}
//                                         onChange={handleSchedulingToggle}
//                                         disabled={isSaving}
//                                     />
//                                     <label htmlFor="scheduling-toggle">Enable Scheduling</label>
//                                 </div>
//                             </div>

//                             {schedulingEnabled && (
//                                 <div className="scheduling-options">
//                                     <div className="form-row">
//                                         <div className="form-group">
//                                             <label htmlFor="startDate">Start Date & Time:</label>
//                                             <input
//                                                 id="startDate"
//                                                 name="startDate"
//                                                 type="datetime-local"
//                                                 value={bannerData.startDate}
//                                                 onChange={handleInputChange}
//                                                 disabled={isSaving}
//                                             />
//                                             <small>Leave blank for immediate start</small>
//                                         </div>

//                                         <div className="form-group">
//                                             <label htmlFor="endDate">End Date & Time:</label>
//                                             <input
//                                                 id="endDate"
//                                                 name="endDate"
//                                                 type="datetime-local"
//                                                 value={bannerData.endDate}
//                                                 onChange={handleInputChange}
//                                                 disabled={isSaving}
//                                             />
//                                             <small>Leave blank for no end date</small>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="form-group">
//                                 <div className="checkbox-container">
//                                     <input
//                                         type="checkbox"
//                                         id="isActive"
//                                         name="isActive"
//                                         checked={bannerData.isActive}
//                                         onChange={handleInputChange}
//                                         disabled={isSaving}
//                                     />
//                                     <label htmlFor="isActive">
//                                         Active
//                                         <small> (manually enable/disable regardless of scheduling)</small>
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="banner-actions">
//                             <button
//                                 className="save-button"
//                                 onClick={saveCompleteBanner}
//                                 disabled={isUploading || isSaving}
//                             >
//                                 {isSaving ? 'Saving...' : (isEditing ? 'Update Banner' : 'Save Banner')}
//                             </button>

//                             {isEditing && (
//                                 <button
//                                     className="delete-button"
//                                     onClick={deleteBanner}
//                                     disabled={isUploading || isSaving}
//                                 >
//                                     Delete Banner
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default BannerManagement;

import React, { useState, useEffect } from 'react';
import {
    ref as dbRef,
    get,
    set,
    update,
    remove,
    child
} from 'firebase/database';
import { database, storage } from '../../firebase';
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    deleteObject
} from 'firebase/storage';
import './BannerManagement.css';

// Banner subcategories - can be dynamically managed
const BANNER_SUBCATEGORIES = [
    'Premium Chicken Cuts',
    'Fresh Fish Collection',
    'Premium Mutton Selection'
];

const BannerManagement = () => {
    // Banner form state
    const [bannerData, setBannerData] = useState({
        title: '',
        subtitle: '',
        description: '',
        cta: 'Shop Now',
        link: '/shop',
        discount: '',
        originalPrice: 0,
        discountedPrice: 0,
        startDate: '', // For banner scheduling
        endDate: '',   // For banner scheduling
        isActive: true, // Flag to manually enable/disable regardless of dates
        // Price promotion timing
        pricePromotion: {
            isEnabled: false,      // Enable/disable price promotion timing
            startDate: '',         // When the discounted price begins
            endDate: '',           // When the discounted price ends
            regularPrice: 0,       // Regular price after promotion ends
            promotionalPrice: 0    // Promotional price during the promo period
        },
        // Discount text timing
        discountPromotion: {
            isEnabled: false,      // Enable/disable discount text timing
            startDate: '',         // When the discount text becomes visible
            endDate: '',           // When the discount text disappears
            discountText: ''       // The discount text to display during the promo period
        }
    });

    // UI state
    const [selectedBanner, setSelectedBanner] = useState('');
    const [banners, setBanners] = useState({});
    const [bannerImages, setBannerImages] = useState({});
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingNewBanner, setIsAddingNewBanner] = useState(false);
    const [newBannerCategory, setNewBannerCategory] = useState('');
    const [schedulingEnabled, setSchedulingEnabled] = useState(false);

    // Fetch all banner data when component mounts
    useEffect(() => {
        fetchAllBanners();
        fetchAllBannerImages();
    }, []);

    // Fetch banner details from Realtime Database
    const fetchAllBanners = async () => {
        try {
            const bannersRef = dbRef(database, 'banners');
            const snapshot = await get(bannersRef);

            if (snapshot.exists()) {
                setBanners(snapshot.val());
            } else {
                setBanners({});
            }
        } catch (error) {
            console.error("Error fetching banners:", error);
            setError("Failed to load banner data from database");
        }
    };

    // Fetch banner images from Storage
    const fetchAllBannerImages = async () => {
        try {
            const imagesData = {};

            for (const category of BANNER_SUBCATEGORIES) {
                try {
                    const folderRef = storageRef(storage, `banners/${category}`);
                    const fileList = await listAll(folderRef);

                    // Sort by timestamp to get newest first
                    const sortedItems = [...fileList.items].sort((a, b) => {
                        const getTimestamp = (name) => {
                            const match = name.match(/image_(\d+)/);
                            return match ? parseInt(match[1]) : 0;
                        };

                        const timestampA = getTimestamp(a.name);
                        const timestampB = getTimestamp(b.name);

                        return timestampB - timestampA;
                    });

                    if (sortedItems.length > 0) {
                        try {
                            const imageURL = await getDownloadURL(sortedItems[0]);
                            imagesData[category] = {
                                url: imageURL,
                                path: sortedItems[0].fullPath,
                                name: sortedItems[0].name
                            };
                        } catch (error) {
                            console.error(`Error getting image URL for ${category}:`, error);
                            imagesData[category] = {
                                url: `https://via.placeholder.com/800x400?text=${category.replace(/\s+/g, '+')}`,
                                path: null,
                                name: null
                            };
                        }
                    } else {
                        imagesData[category] = {
                            url: `https://via.placeholder.com/800x400?text=No+Image+For+${category.replace(/\s+/g, '+')}`,
                            path: null,
                            name: null
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching images for ${category}:`, error);
                    imagesData[category] = {
                        url: `https://via.placeholder.com/800x400?text=Error+Loading+${category.replace(/\s+/g, '+')}`,
                        path: null,
                        name: null
                    };
                }
            }

            setBannerImages(imagesData);
        } catch (error) {
            console.error("Error fetching banner images:", error);
            setError("Failed to load banner images");
        }
    };

    // Handle banner selection
    const handleBannerSelect = (bannerName) => {
        setSelectedBanner(bannerName);
        clearMessages();
        setIsAddingNewBanner(false);

        // If we have data for this banner, load it
        if (banners[bannerName]) {
            const bannerDataFromDB = banners[bannerName];
            
            // Check if scheduling data exists in the banner
            const hasScheduling = bannerDataFromDB.startDate || bannerDataFromDB.endDate;
            setSchedulingEnabled(hasScheduling);
            
            // Handle price promotion data - ensure the structure exists
            if (!bannerDataFromDB.pricePromotion) {
                bannerDataFromDB.pricePromotion = {
                    isEnabled: false,
                    startDate: '',
                    endDate: '',
                    regularPrice: bannerDataFromDB.originalPrice || 0,
                    promotionalPrice: bannerDataFromDB.discountedPrice || 0
                };
            }
            
            // Handle discount promotion data - ensure the structure exists
            if (!bannerDataFromDB.discountPromotion) {
                bannerDataFromDB.discountPromotion = {
                    isEnabled: false,
                    startDate: '',
                    endDate: '',
                    discountText: bannerDataFromDB.discount || ''
                };
            }
            
            setBannerData(bannerDataFromDB);
            setIsEditing(true);
        } else {
            // Reset form for a new banner
            setBannerData({
                title: '',
                subtitle: '',
                description: '',
                cta: 'Shop Now',
                link: `/shop?category=${bannerName.toLowerCase().includes('chicken') ? 'chicken' : (bannerName.toLowerCase().includes('fish') ? 'fish' : 'mutton')}`,
                discount: '',
                originalPrice: 0,
                discountedPrice: 0,
                startDate: '',
                endDate: '',
                isActive: true,
                pricePromotion: {
                    isEnabled: false,
                    startDate: '',
                    endDate: '',
                    regularPrice: 0,
                    promotionalPrice: 0
                },
                discountPromotion: {
                    isEnabled: false,
                    startDate: '',
                    endDate: '',
                    discountText: ''
                }
            });
            setSchedulingEnabled(false);
            setIsEditing(false);
        }

        setUploadFile(null);
    };

    // Handle adding a new banner category
    const handleAddNewBanner = () => {
        setIsAddingNewBanner(true);
        setSelectedBanner('');
        setNewBannerCategory('');
        clearMessages();

        // Reset banner data
        setBannerData({
            title: '',
            subtitle: '',
            description: '',
            cta: 'Shop Now',
            link: '/shop',
            discount: '',
            originalPrice: 0,
            discountedPrice: 0,
            startDate: '',
            endDate: '',
            isActive: true,
            pricePromotion: {
                isEnabled: false,
                startDate: '',
                endDate: '',
                regularPrice: 0,
                promotionalPrice: 0
            },
            discountPromotion: {
                isEnabled: false,
                startDate: '',
                endDate: '',
                discountText: ''
            }
        });

        setSchedulingEnabled(false);
        setUploadFile(null);
        setIsEditing(false);
    };

    // Handle input changes for new banner category
    const handleNewBannerCategoryChange = (e) => {
        setNewBannerCategory(e.target.value);
    };

    // Validate and save new banner category
    const saveNewBannerCategory = async () => {
        if (!newBannerCategory.trim()) {
            setError("Please enter a banner category name");
            return;
        }

        // Check if category already exists
        if (BANNER_SUBCATEGORIES.includes(newBannerCategory.trim())) {
            setError("This banner category already exists");
            return;
        }

        // Trim and capitalize the new category name
        const newCategory = newBannerCategory.trim();

        // Reset state and prepare for new banner creation
        setSelectedBanner(newCategory);
        setIsAddingNewBanner(false);
        clearMessages();

        // Reset banner data with new category
        setBannerData({
            title: '',
            subtitle: '',
            description: '',
            cta: 'Shop Now',
            link: `/shop?category=${newCategory.toLowerCase()}`,
            discount: '',
            originalPrice: 0,
            discountedPrice: 0,
            startDate: '',
            endDate: '',
            isActive: true,
            pricePromotion: {
                isEnabled: false,
                startDate: '',
                endDate: '',
                regularPrice: 0,
                promotionalPrice: 0
            },
            discountPromotion: {
                isEnabled: false,
                startDate: '',
                endDate: '',
                discountText: ''
            }
        });

        setSchedulingEnabled(false);
        setIsEditing(false);
    };

    // Handle scheduling toggle
    const handleSchedulingToggle = () => {
        setSchedulingEnabled(!schedulingEnabled);
        
        // If disabling scheduling, clear the date fields
        if (schedulingEnabled) {
            setBannerData(prev => ({
                ...prev,
                startDate: '',
                endDate: ''
            }));
        }
    };

    // Format date for input field (YYYY-MM-DDTHH:MM)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
            setBannerData(prev => ({
                ...prev,
                [name]: value === '' ? '' : Number(value)
            }));
        } else if (type === 'checkbox') {
            setBannerData(prev => ({
                ...prev,
                [name]: e.target.checked
            }));
        } else if (name === 'startDate' || name === 'endDate') {
            setBannerData(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setBannerData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle file selection for image upload
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setUploadFile(e.target.files[0]);
            clearMessages();
        }
    };

    // Clear error and success messages
    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    // Handle image upload
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
            // Generate a timestamp to ensure uniqueness and enable sorting by recency
            const timestamp = new Date().getTime();
            const fileExt = uploadFile.name.split('.').pop();

            // Create storage path
            const storagePath = `banners/${selectedBanner}/image_${timestamp}.${fileExt}`;

            // If there's an existing image, delete it
            if (bannerImages[selectedBanner] && bannerImages[selectedBanner].path) {
                try {
                    const fileRef = storageRef(storage, bannerImages[selectedBanner].path);
                    await deleteObject(fileRef);
                } catch (deleteError) {
                    console.error('Error deleting existing image:', deleteError);
                    // Continue with upload even if delete fails
                }
            }

            // Upload new image
            const imageRef = storageRef(storage, storagePath);
            const uploadTask = uploadBytesResumable(imageRef, uploadFile);

            // Monitor upload progress
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error('Upload error:', error);
                    setError(`Image upload failed: ${error.message}`);
                    setIsUploading(false);
                },
                async () => {
                    try {
                        // Upload completed successfully
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        // Update the bannerImages state
                        setBannerImages(prev => ({
                            ...prev,
                            [selectedBanner]: {
                                url: downloadURL,
                                path: storagePath,
                                name: `image_${timestamp}.${fileExt}`
                            }
                        }));

                        setIsUploading(false);
                        setUploadFile(null);

                        // Reset the file input
                        const fileInput = document.getElementById('banner-image-input');
                        if (fileInput) fileInput.value = '';

                        setSuccessMessage("Banner image uploaded successfully!");
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        setError(`Upload succeeded but couldn't get download URL: ${error.message}`);
                        setIsUploading(false);
                    }
                }
            );
        } catch (error) {
            console.error('Error starting upload:', error);
            setError(`Failed to start upload: ${error.message}`);
            setIsUploading(false);
        }
    };

    // Save banner data to Realtime Database
    const saveBannerData = async () => {
        if (!selectedBanner) {
            setError("Please select a banner first");
            return;
        }

        // Basic validation
        if (!bannerData.title || !bannerData.subtitle || !bannerData.description) {
            setError("Please fill in all required fields: title, subtitle, and description");
            return;
        }

        // Validate scheduling dates if enabled
        if (schedulingEnabled) {
            if (!bannerData.startDate && !bannerData.endDate) {
                setError("Please set at least one of start date or end date for scheduling");
                return;
            }

            if (bannerData.startDate && bannerData.endDate && new Date(bannerData.startDate) > new Date(bannerData.endDate)) {
                setError("End date must be after start date");
                return;
            }
        }

        // Validate price promotion dates if enabled
        if (bannerData.pricePromotion && bannerData.pricePromotion.isEnabled) {
            if (bannerData.pricePromotion.startDate && bannerData.pricePromotion.endDate && 
                new Date(bannerData.pricePromotion.startDate) > new Date(bannerData.pricePromotion.endDate)) {
                setError("Price promotion end date must be after start date");
                return;
            }
        }

        // Validate discount text promotion dates if enabled
        if (bannerData.discountPromotion && bannerData.discountPromotion.isEnabled) {
            if (bannerData.discountPromotion.startDate && bannerData.discountPromotion.endDate && 
                new Date(bannerData.discountPromotion.startDate) > new Date(bannerData.discountPromotion.endDate)) {
                setError("Discount text promotion end date must be after start date");
                return;
            }
        }

        setIsSaving(true);
        clearMessages();

        try {
            const bannerRef = dbRef(database, `banners/${selectedBanner}`);
            
            // Prepare data to save
            const dataToSave = { ...bannerData };
            
            // Only include scheduling fields if scheduling is enabled
            if (!schedulingEnabled) {
                delete dataToSave.startDate;
                delete dataToSave.endDate;
            }

            // Save banner data to database
            await set(bannerRef, dataToSave);

            // Update local state
            setBanners(prev => ({
                ...prev,
                [selectedBanner]: dataToSave
            }));

            // If this was a new banner category, add it to the subcategories
            if (!BANNER_SUBCATEGORIES.includes(selectedBanner)) {
                BANNER_SUBCATEGORIES.push(selectedBanner);
            }

            setSuccessMessage("Banner details saved successfully!");
            setIsEditing(true);

            // Ensure the newly added banner remains selected
            setSelectedBanner(selectedBanner);
        } catch (error) {
            console.error("Error saving banner data:", error);
            setError(`Failed to save banner details: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Complete save of banner (both image and details)
    const saveCompleteBanner = async () => {
        // First save the banner data
        await saveBannerData();

        // Then upload the image if there's a new one
        if (uploadFile) {
            await handleImageUpload();
        }
    };

    // Delete banner (both image and data)
    const deleteBanner = async () => {
        if (!selectedBanner) {
            setError("Please select a banner first");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete the "${selectedBanner}" banner?`)) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        try {
            // Delete banner data from database
            await remove(dbRef(database, `banners/${selectedBanner}`));

            // Delete banner image from storage if it exists
            if (bannerImages[selectedBanner] && bannerImages[selectedBanner].path) {
                try {
                    const fileRef = storageRef(storage, bannerImages[selectedBanner].path);
                    await deleteObject(fileRef);
                } catch (deleteError) {
                    console.error('Error deleting banner image:', deleteError);
                    // Continue even if image delete fails
                }
            }

            // Update local state
            setBanners(prev => {
                const newBanners = { ...prev };
                delete newBanners[selectedBanner];
                return newBanners;
            });

            setBannerImages(prev => ({
                ...prev,
                [selectedBanner]: {
                    url: `https://via.placeholder.com/800x400?text=No+Image+For+${selectedBanner.replace(/\s+/g, '+')}`,
                    path: null,
                    name: null
                }
            }));

            // Reset form
            setBannerData({
                title: '',
                subtitle: '',
                description: '',
                cta: 'Shop Now',
                link: `/shop?category=${selectedBanner.toLowerCase().includes('chicken') ? 'chicken' : (selectedBanner.toLowerCase().includes('fish') ? 'fish' : 'mutton')}`,
                discount: '',
                originalPrice: 0,
                discountedPrice: 0,
                startDate: '',
                endDate: '',
                isActive: true,
                pricePromotion: {
                    isEnabled: false,
                    startDate: '',
                    endDate: '',
                    regularPrice: 0,
                    promotionalPrice: 0
                },
                discountPromotion: {
                    isEnabled: false,
                    startDate: '',
                    endDate: '',
                    discountText: ''
                }
            });

            setIsEditing(false);
            setSuccessMessage(`"${selectedBanner}" banner deleted successfully!`);
        } catch (error) {
            console.error("Error deleting banner:", error);
            setError(`Failed to delete banner: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate and display banner status
    const getBannerStatusDisplay = () => {
        if (!selectedBanner || !banners[selectedBanner]) {
            return <span>Not saved yet</span>;
        }

        const banner = banners[selectedBanner];
        const now = new Date();
        
        // Check if banner has scheduling
        if (banner.startDate || banner.endDate) {
            const startDate = banner.startDate ? new Date(banner.startDate) : null;
            const endDate = banner.endDate ? new Date(banner.endDate) : null;
            
            // Banner hasn't started yet
            if (startDate && now < startDate) {
                return (
                    <span className="status-scheduled">
                        Scheduled (starts on {new Date(startDate).toLocaleString()})
                    </span>
                );
            }
            
            // Banner has ended
            if (endDate && now > endDate) {
                return <span className="status-expired">Expired</span>;
            }
            
            // Banner is currently active within schedule
            if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
                return <span className="status-active">Active (Scheduled)</span>;
            }
        }
        
        // No scheduling, just check isActive flag
        return banner.isActive ? 
            <span className="status-active">Active</span> : 
            <span className="status-inactive">Inactive</span>;
    };

    // Calculate and display price promotion status
    const getPromotionStatus = () => {
        if (!bannerData || !bannerData.pricePromotion || !bannerData.pricePromotion.isEnabled) {
            return <span className="status-inactive">Disabled</span>;
        }

        const now = new Date();
        const startDate = bannerData.pricePromotion.startDate ? new Date(bannerData.pricePromotion.startDate) : null;
        const endDate = bannerData.pricePromotion.endDate ? new Date(bannerData.pricePromotion.endDate) : null;
        
        // Promotion hasn't started yet
        if (startDate && now < startDate) {
            return (
                <span className="status-scheduled">
                    Scheduled (starts on {startDate.toLocaleString()})
                </span>
            );
        }
        
        // Promotion has ended
        if (endDate && now > endDate) {
            return <span className="status-expired">Expired</span>;
        }
        
        // Promotion is currently active
        if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
            const timeRemaining = endDate ? formatTimeRemaining(now, endDate) : "";
            return (
                <span className="status-active">
                    Active {timeRemaining ? `(${timeRemaining} remaining)` : "(No end date)"}
                </span>
            );
        }
        
        return <span className="status-inactive">Status Unknown</span>;
    };

    // Calculate and display discount promotion status
    const getDiscountPromotionStatus = () => {
        // Check if the banner data exists and has the necessary structure
        if (!bannerData || !bannerData.discountPromotion || !bannerData.discountPromotion.isEnabled) {
            return <span className="status-inactive">Disabled</span>;
        }

        const now = new Date();
        const startDate = bannerData.discountPromotion.startDate ? new Date(bannerData.discountPromotion.startDate) : null;
        const endDate = bannerData.discountPromotion.endDate ? new Date(bannerData.discountPromotion.endDate) : null;
        
        // Promotion hasn't started yet
        if (startDate && now < startDate) {
            return (
                <span className="status-scheduled">
                    Scheduled (starts on {startDate.toLocaleString()})
                </span>
            );
        }
        
        // Promotion has ended
        if (endDate && now > endDate) {
            return <span className="status-expired">Expired</span>;
        }
        
        // Promotion is currently active
        if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
            const timeRemaining = endDate ? formatTimeRemaining(now, endDate) : "";
            return (
                <span className="status-active">
                    Active {timeRemaining ? `(${timeRemaining} remaining)` : "(No end date)"}
                </span>
            );
        }
        
        return <span className="status-inactive">Status Unknown</span>;
    };
    
    // Format time remaining for active promotions
    const formatTimeRemaining = (now, endDate) => {
        const diffMs = endDate - now;
        if (diffMs <= 0) return "";
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHrs} hr${diffHrs > 1 ? 's' : ''}`;
        } else if (diffHrs > 0) {
            return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ${diffMins} min${diffMins > 1 ? 's' : ''}`;
        } else {
            return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
        }
    };

    return (
        <div className="banner-management">
            <h2>Banner Management</h2>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="banner-actions-top">
                <div className="banner-select">
                    <label htmlFor="banner-selector">Select Banner:</label>
                    <select
                        id="banner-selector"
                        value={selectedBanner}
                        onChange={(e) => handleBannerSelect(e.target.value)}
                        disabled={isUploading || isSaving}
                    >
                        <option value="">Select a Banner</option>
                        {BANNER_SUBCATEGORIES.map(banner => (
                            <option key={banner} value={banner}>{banner}</option>
                        ))}
                    </select>
                </div>

                <button
                    className="add-banner-button"
                    onClick={handleAddNewBanner}
                    disabled={isUploading || isSaving}
                >
                    + Add New Banner
                </button>
            </div>

            {isAddingNewBanner && (
                <div className="new-banner-category">
                    <div className="form-group">
                        <label htmlFor="new-banner-category">New Banner Category:</label>
                        <input
                            id="new-banner-category"
                            type="text"
                            value={newBannerCategory}
                            onChange={handleNewBannerCategoryChange}
                            placeholder="Enter new banner category"
                            disabled={isSaving}
                        />
                    </div>
                    <button
                        className="save-new-category-button"
                        onClick={saveNewBannerCategory}
                        disabled={isSaving}
                    >
                        Save New Category
                    </button>
                </div>
            )}

            {(selectedBanner || isAddingNewBanner) && (
                <div className="banner-editor">
                    <div className="banner-preview">
                        <h3>Banner Preview</h3>
                        <div className="preview-container">
                            <img
                                src={bannerImages[selectedBanner]?.url}
                                alt={`${selectedBanner} preview`}
                                className="banner-image-preview"
                            />
                            <div className="preview-overlay">
                                <div className="banner-preview-content">
                                    <div className="preview-subtitle">{bannerData.subtitle}</div>
                                    <div className="preview-title">{bannerData.title}</div>
                                    <div className="preview-description">{bannerData.description}</div>

                                    <div className="preview-price">
                                        {(() => {
                                            // Show discount text based on promotion status
                                            const showDiscountText = bannerData.discountPromotion?.isEnabled
                                                ? (bannerData.discountPromotion.discountText || '')
                                                : bannerData.discount;
                                            
                                            if (showDiscountText) {
                                                return <span className="preview-discount">{showDiscountText}</span>;
                                            }
                                            return null;
                                        })()}
                                        
                                        {(() => {
                                            // Show prices based on promotion status
                                            if (bannerData.pricePromotion?.isEnabled) {
                                                return (
                                                    <div className="price-values">
                                                        <span className="original-price">₹{bannerData.pricePromotion.regularPrice}</span>
                                                        <span className="current-price">₹{bannerData.pricePromotion.promotionalPrice}</span>
                                                    </div>
                                                );
                                            } else if (bannerData.originalPrice > 0) {
                                                return (
                                                    <div className="price-values">
                                                        <span className="original-price">₹{bannerData.originalPrice}</span>
                                                        <span className="current-price">₹{bannerData.discountedPrice}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>

                                    <div className="preview-cta">
                                        {bannerData.cta}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Banner Status */}
                        {isEditing && (
                            <div className="banner-status">
                                <strong>Status:</strong> {getBannerStatusDisplay()}
                            </div>
                        )}
                    </div>

                    <div className="banner-form">
                        <div className="form-section">
                            <h3>Image Upload</h3>
                            <div className="form-group">
                                <label htmlFor="banner-image-input">Select Banner Image:</label>
                                <input
                                    id="banner-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={isUploading || isSaving}
                                />
                            </div>

                            {uploadFile && (
                                <button
                                    className="upload-button"
                                    onClick={handleImageUpload}
                                    disabled={isUploading || isSaving}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                            )}

                            {isUploading && (
                                <div className="progress-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                    <span className="progress-text">{uploadProgress}%</span>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Banner Details</h3>

                            <div className="form-group">
                                <label htmlFor="title">Title: <span className="required">*</span></label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={bannerData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Premium Chicken Cuts"
                                    disabled={isSaving}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subtitle">Subtitle: <span className="required">*</span></label>
                                <input
                                    id="subtitle"
                                    name="subtitle"
                                    type="text"
                                    value={bannerData.subtitle}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Farm Fresh Everyday"
                                    disabled={isSaving}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description: <span className="required">*</span></label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={bannerData.description}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Antibiotic-free chicken raised in certified farms"
                                    rows={4}
                                    disabled={isSaving}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="cta">Call to Action:</label>
                                    <input
                                        id="cta"
                                        name="cta"
                                        type="text"
                                        value={bannerData.cta}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Shop Now"
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="link">Link URL:</label>
                                    <input
                                        id="link"
                                        name="link"
                                        type="text"
                                        value={bannerData.link}
                                        onChange={handleInputChange}
                                        placeholder="e.g., /shop?category=chicken"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                            {/* <div className="timing-toggle">
            
                                </div> */}
                                    <label htmlFor="price-promo-toggle">Enable Timed discount</label>
                                
                                <label htmlFor="discount">Discount Text:
                                <input
                                        type="checkbox"
                                        id="discount-timing-toggle"
                                        checked={bannerData.discountPromotion?.isEnabled || false}
                                        onChange={() => {
                                            setBannerData(prev => {
                                                // Ensure discountPromotion exists
                                                const currentPromo = prev.discountPromotion || {
                                                    isEnabled: false,
                                                    startDate: '',
                                                    endDate: '',
                                                    discountText: prev.discount || ''
                                                };
                                                
                                                return {
                                                    ...prev,
                                                    discountPromotion: {
                                                        ...currentPromo,
                                                        isEnabled: !currentPromo.isEnabled,
                                                        discountText: currentPromo.isEnabled ? currentPromo.discountText : prev.discount
                                                    }
                                                };
                                            });
                                        }}
                                        disabled={isSaving}
                                        
                                    />
                                </label>
                                
                                {!bannerData.discountPromotion?.isEnabled ? (
                                    // Simple discount text input when timing is disabled
                                    <input
                                        id="discount"
                                        name="discount"
                                        type="text"
                                        value={bannerData.discount}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 20% OFF"
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <div className="scheduled-discount-note">
                                        <em>Discount text is configured in the Discount Scheduling section below</em>
                                    </div>
                                )}

                                
                            </div>

                            {/* Discount Promotion Scheduling Section - only visible if enabled */}
                            {bannerData.discountPromotion?.isEnabled && (
                                <div className="discount-promo-section">
                                    <h4>Discount Text Scheduling</h4>
                                    
                                    <div className="form-group">
                                        <label htmlFor="discount-text">Promotional Discount Text:</label>
                                        <input
                                            id="discount-text"
                                            type="text"
                                            value={bannerData.discountPromotion?.discountText || ''}
                                            onChange={(e) => {
                                                setBannerData(prev => {
                                                    const currentPromo = prev.discountPromotion || {
                                                        isEnabled: true,
                                                        startDate: '',
                                                        endDate: '',
                                                        discountText: ''
                                                    };
                                                    
                                                    return {
                                                        ...prev,
                                                        discountPromotion: {
                                                            ...currentPromo,
                                                            discountText: e.target.value
                                                        }
                                                    };
                                                });
                                            }}
                                            placeholder="e.g., LIMITED TIME: 30% OFF"
                                            disabled={isSaving}
                                        />
                                        <small>Text shown only during the scheduled period</small>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="discount-start-date">Start Showing:</label>
                                            <input
                                                id="discount-start-date"
                                                type="datetime-local"
                                                value={bannerData.discountPromotion?.startDate || ''}
                                                onChange={(e) => {
                                                    setBannerData(prev => {
                                                        const currentPromo = prev.discountPromotion || {
                                                            isEnabled: true,
                                                            startDate: '',
                                                            endDate: '',
                                                            discountText: prev.discount || ''
                                                        };
                                                        
                                                        return {
                                                            ...prev,
                                                            discountPromotion: {
                                                                ...currentPromo,
                                                                startDate: e.target.value
                                                            }
                                                        };
                                                    });
                                                }}
                                                disabled={isSaving}
                                            />
                                            <small>When to start showing the discount text</small>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="discount-end-date">Stop Showing:</label>
                                            <input
                                                id="discount-end-date"
                                                type="datetime-local"
                                                value={bannerData.discountPromotion?.endDate || ''}
                                                onChange={(e) => {
                                                    setBannerData(prev => {
                                                        const currentPromo = prev.discountPromotion || {
                                                            isEnabled: true,
                                                            startDate: '',
                                                            endDate: '',
                                                            discountText: prev.discount || ''
                                                        };
                                                        
                                                        return {
                                                            ...prev,
                                                            discountPromotion: {
                                                                ...currentPromo,
                                                                endDate: e.target.value
                                                            }
                                                        };
                                                    });
                                                }}
                                                disabled={isSaving}
                                            />
                                            <small>When to stop showing the discount text</small>
                                        </div>
                                    </div>

                                    <div className="promotion-status">
                                        <strong>Discount Status:</strong> {getDiscountPromotionStatus()}
                                    </div>
                                </div>
                            )}

                            {/* Price Promotion Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <h4>Price Promotion</h4>
                                    <div className="scheduling-toggle">
                                        <input
                                            type="checkbox"
                                            id="price-promo-toggle"
                                            checked={bannerData.pricePromotion?.isEnabled || false}
                                            onChange={() => {
                                                setBannerData(prev => {
                                                    // Ensure pricePromotion exists
                                                    const currentPromo = prev.pricePromotion || {
                                                        isEnabled: false,
                                                        startDate: '',
                                                        endDate: '',
                                                        regularPrice: prev.originalPrice || 0,
                                                        promotionalPrice: prev.discountedPrice || 0
                                                    };
                                                    
                                                    return {
                                                        ...prev,
                                                        pricePromotion: {
                                                            ...currentPromo,
                                                            isEnabled: !currentPromo.isEnabled
                                                        }
                                                    };
                                                });
                                            }}
                                            disabled={isSaving}
                                        />
                                        <label htmlFor="price-promo-toggle">Enable Timed Pricing</label>
                                    </div>
                                </div>

                                {!bannerData.pricePromotion?.isEnabled ? (
                                    // Simple Price Section (when timed pricing is disabled)
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="originalPrice">Original Price (₹):</label>
                                            <input
                                                id="originalPrice"
                                                name="originalPrice"
                                                type="number"
                                                value={bannerData.originalPrice}
                                                onChange={handleInputChange}
                                                min="0"
                                                placeholder="e.g., 299"
                                                disabled={isSaving}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="discountedPrice">Discounted Price (₹):</label>
                                            <input
                                                id="discountedPrice"
                                                name="discountedPrice"
                                                type="number"
                                                value={bannerData.discountedPrice}
                                                onChange={handleInputChange}
                                                min="0"
                                                placeholder="e.g., 249"
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    // Timed Price Section (when timed pricing is enabled)
                                    <div className="price-promo-section">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="promo-regular-price">Regular Price (₹):</label>
                                                <input
                                                    id="promo-regular-price"
                                                    type="number"
                                                    value={bannerData.pricePromotion?.regularPrice || 0}
                                                    onChange={(e) => {
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setBannerData(prev => {
                                                            // Ensure pricePromotion exists
                                                            const currentPromo = prev.pricePromotion || {
                                                                isEnabled: true,
                                                                startDate: '',
                                                                endDate: '',
                                                                regularPrice: prev.originalPrice || 0,
                                                                promotionalPrice: prev.discountedPrice || 0
                                                            };
                                                            
                                                            return {
                                                                ...prev,
                                                                pricePromotion: {
                                                                    ...currentPromo,
                                                                    regularPrice: value
                                                                }
                                                            };
                                                        });
                                                    }}
                                                    min="0"
                                                    placeholder="Regular price outside promotion period"
                                                    disabled={isSaving}
                                                />
                                                <small>Price shown outside the promotion period</small>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="promo-price">Promotional Price (₹):</label>
                                                <input
                                                    id="promo-price"
                                                    type="number"
                                                    value={bannerData.pricePromotion?.promotionalPrice || 0}
                                                    onChange={(e) => {
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setBannerData(prev => {
                                                            // Ensure pricePromotion exists
                                                            const currentPromo = prev.pricePromotion || {
                                                                isEnabled: true,
                                                                startDate: '',
                                                                endDate: '',
                                                                regularPrice: prev.originalPrice || 0,
                                                                promotionalPrice: prev.discountedPrice || 0
                                                            };
                                                            
                                                            return {
                                                                ...prev,
                                                                pricePromotion: {
                                                                    ...currentPromo,
                                                                    promotionalPrice: value
                                                                }
                                                            };
                                                        });
                                                    }}
                                                    min="0"
                                                    placeholder="Special price during promotion"
                                                    disabled={isSaving}
                                                />
                                                <small>Discounted price shown during promotion period</small>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="promo-start-date">Promotion Start:</label>
                                                <input
                                                    id="promo-start-date"
                                                    type="datetime-local"
                                                    value={bannerData.pricePromotion?.startDate || ''}
                                                    onChange={(e) => {
                                                        setBannerData(prev => {
                                                            // Ensure pricePromotion exists
                                                            const currentPromo = prev.pricePromotion || {
                                                                isEnabled: true,
                                                                startDate: '',
                                                                endDate: '',
                                                                regularPrice: prev.originalPrice || 0,
                                                                promotionalPrice: prev.discountedPrice || 0
                                                            };
                                                            
                                                            return {
                                                                ...prev,
                                                                pricePromotion: {
                                                                    ...currentPromo,
                                                                    startDate: e.target.value
                                                                }
                                                            };
                                                        });
                                                    }}
                                                    disabled={isSaving}
                                                />
                                                <small>When the promotional price begins</small>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="promo-end-date">Promotion End:</label>
                                                <input
                                                    id="promo-end-date"
                                                    type="datetime-local"
                                                    value={bannerData.pricePromotion?.endDate || ''}
                                                    onChange={(e) => {
                                                        setBannerData(prev => {
                                                            // Ensure pricePromotion exists
                                                            const currentPromo = prev.pricePromotion || {
                                                                isEnabled: true,
                                                                startDate: '',
                                                                endDate: '',
                                                                regularPrice: prev.originalPrice || 0,
                                                                promotionalPrice: prev.discountedPrice || 0
                                                            };
                                                            
                                                            return {
                                                                ...prev,
                                                                pricePromotion: {
                                                                    ...currentPromo,
                                                                    endDate: e.target.value
                                                                }
                                                            };
                                                        });
                                                    }}
                                                    disabled={isSaving}
                                                />
                                                <small>When the promotional price ends</small>
                                            </div>
                                        </div>

                                        <div className="promotion-status">
                                            <strong>Current Status:</strong> {getPromotionStatus()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Banner Scheduling Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <h3>Banner Scheduling</h3>
                                <div className="scheduling-toggle">
                                    <input
                                        type="checkbox"
                                        id="scheduling-toggle"
                                        checked={schedulingEnabled}
                                        onChange={handleSchedulingToggle}
                                        disabled={isSaving}
                                    />
                                    <label htmlFor="scheduling-toggle">Enable Scheduling</label>
                                </div>
                            </div>

                            {schedulingEnabled && (
                                <div className="scheduling-options">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="startDate">Start Date & Time:</label>
                                            <input
                                                id="startDate"
                                                name="startDate"
                                                type="datetime-local"
                                                value={bannerData.startDate}
                                                onChange={handleInputChange}
                                                disabled={isSaving}
                                            />
                                            <small>Leave blank for immediate start</small>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="endDate">End Date & Time:</label>
                                            <input
                                                id="endDate"
                                                name="endDate"
                                                type="datetime-local"
                                                value={bannerData.endDate}
                                                onChange={handleInputChange}
                                                disabled={isSaving}
                                            />
                                            <small>Leave blank for no end date</small>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <div className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={bannerData.isActive}
                                        onChange={handleInputChange}
                                        disabled={isSaving}
                                    />
                                    <label htmlFor="isActive">
                                        Active
                                        <small> (manually enable/disable regardless of scheduling)</small>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="banner-actions">
                            <button
                                className="save-button"
                                onClick={saveCompleteBanner}
                                disabled={isUploading || isSaving}
                            >
                                {isSaving ? 'Saving...' : (isEditing ? 'Update Banner' : 'Save Banner')}
                            </button>

                            {isEditing && (
                                <button
                                    className="delete-button"
                                    onClick={deleteBanner}
                                    disabled={isUploading || isSaving}
                                >
                                    Delete Banner
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerManagement;