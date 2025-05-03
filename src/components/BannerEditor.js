
// import React, { useState, useEffect } from 'react';
// import {
//   ref as dbRef,
//   get,
//   set,
//   update,
//   remove,
//     onValue,
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

// // We'll keep track of all banner IDs, including ones dynamically added
// const initialBannerCategories = [
//     'chicken-curry-cut',
//     'mutton-special',
//     'seafood-combo'
//   ];
  
//   const BannerEditor = () => {
//     // Banner form state
//     const [formData, setBannerData] = useState({
//       title: '',
//       subtitle: '',
//       productName: '',
//       originalPrice: '',
//       currentPrice: '',
//       link: '',
//       isActive: true,
//       startDate: '',
//       endDate: ''
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
//     const [schedulingEnabled, setSchedulingEnabled] = useState(false);
//     const [isAddingNewBanner, setIsAddingNewBanner] = useState(false);
//     const [newBannerKey, setNewBannerKey] = useState('');
//     const [bannerCategories, setBannerCategories] = useState(initialBannerCategories);
  
//     // Fetch all banner data when component mounts
//     useEffect(() => {
//       // Set up real-time listener for banners
//       const bannersRef = dbRef(db, 'banners');
//       const unsubscribe = onValue(bannersRef, (snapshot) => {
//         if (snapshot.exists()) {
//           const bannersData = snapshot.val();
//           setBanners(bannersData);
          
//           // Extract all banner keys and update our categories list
//           const allBannerKeys = Object.keys(bannersData);
//           const newCategories = [...initialBannerCategories];
          
//           // Add any keys that aren't in our initial list
//           allBannerKeys.forEach(key => {
//             if (!newCategories.includes(key)) {
//               newCategories.push(key);
//             }
//           });
          
//           setBannerCategories(newCategories);
//         } else {
//           setBanners({});
//         }
//       }, (error) => {
//         console.error("Error fetching banners:", error);
//         setError("Failed to load banner data from database");
//       });
      
//       // Fetch banner images
//       fetchBannerImages();
      
//       // Clean up listener when component unmounts
//       return () => unsubscribe();
//     }, []);
  
//     // Fetch banner images from Storage
//     const fetchBannerImages = async () => {
//       try {
//         // First get all banner folders
//         const bannersRef = storageRef(storage, 'banners');
//         const foldersList = await listAll(bannersRef);
        
//         // Get banner IDs from folder names
//         const folderNames = foldersList.prefixes.map(folder => {
//           // Extract the last segment of the full path
//           const pathSegments = folder.fullPath.split('/');
//           return pathSegments[pathSegments.length - 1];
//         });
        
//         // Add any folder names to our banner categories
//         const updatedCategories = [...bannerCategories];
//         folderNames.forEach(name => {
//           if (!updatedCategories.includes(name)) {
//             updatedCategories.push(name);
//           }
//         });
//         setBannerCategories(updatedCategories);
        
//         // Fetch images for all banner categories
//         const imagesData = {};
//         const allCategories = [...new Set([...bannerCategories, ...folderNames])];
        
//         for (const bannerKey of allCategories) {
//           try {
//             const folderRef = storageRef(storage, `banners/${bannerKey}`);
//             const fileList = await listAll(folderRef);
  
//             if (fileList.items.length > 0) {
//               // Sort by timestamp to get the newest image
//               const sortedItems = [...fileList.items].sort((a, b) => {
//                 const getTimestamp = (name) => {
//                   const match = name.match(/image_(\d+)/);
//                   return match ? parseInt(match[1]) : 0;
//                 };
                
//                 return getTimestamp(b.name) - getTimestamp(a.name);
//               });
              
//               const imageURL = await getDownloadURL(sortedItems[0]);
//               imagesData[bannerKey] = imageURL;
//             } else {
//               imagesData[bannerKey] = null;
//             }
//           } catch (error) {
//             console.error(`Error fetching image for ${bannerKey}:`, error);
//             imagesData[bannerKey] = null;
//           }
//         }
  
//         setBannerImages(imagesData);
//       } catch (error) {
//         console.error("Error fetching banner images:", error);
//         setError("Failed to load banner images");
//       }
//     };
  
//     // Handle banner selection
//     const handleBannerSelect = (bannerKey) => {
//       setSelectedBanner(bannerKey);
//       clearMessages();
//       setIsAddingNewBanner(false);
  
//       // If we have data for this banner, load it
//       if (banners[bannerKey]) {
//         const bannerData = banners[bannerKey];
        
//         // Check if scheduling data exists in the banner
//         const hasScheduling = bannerData.startDate || bannerData.endDate;
//         setSchedulingEnabled(hasScheduling);
        
//         // Convert prices to strings for form inputs
//         setBannerData({
//           ...bannerData,
//           originalPrice: bannerData.originalPrice?.toString() || '',
//           currentPrice: bannerData.currentPrice?.toString() || ''
//         });
//       } else {
//         // Reset form for a new banner
//         setBannerData({
//           title: '',
//           subtitle: '',
//           productName: bannerKey === 'chicken-curry-cut' ? 'Chicken Curry Cut & more' :
//                        bannerKey === 'mutton-special' ? 'Mutton Curry Cut' :
//                        bannerKey === 'seafood-combo' ? 'Premium Seafood Combo' : '',
//           originalPrice: '',
//           currentPrice: '',
//           link: `/product/${bannerKey}`,
//           isActive: true,
//           startDate: '',
//           endDate: ''
//         });
//         setSchedulingEnabled(false);
//       }
  
//       setUploadFile(null);
//     };
  
//     // Handle adding a new banner
//     const handleAddNewBanner = () => {
//       setIsAddingNewBanner(true);
//       setSelectedBanner('');
//       setNewBannerKey('');
//       clearMessages();
  
//       // Reset banner data
//       setBannerData({
//         title: '',
//         subtitle: '',
//         productName: '',
//         originalPrice: '',
//         currentPrice: '',
//         link: '',
//         isActive: true,
//         startDate: '',
//         endDate: ''
//       });
  
//       setSchedulingEnabled(false);
//       setUploadFile(null);
//     };
  
//     // Handle new banner key change
//     const handleNewBannerKeyChange = (e) => {
//       setNewBannerKey(e.target.value.trim().toLowerCase().replace(/\s+/g, '-'));
//     };
  
//     // Create new banner
//     const createNewBanner = () => {
//       if (!newBannerKey) {
//         setError("Please enter a banner ID");
//         return;
//       }
  
//       if (bannerCategories.includes(newBannerKey) || banners[newBannerKey]) {
//         setError("This banner ID already exists");
//         return;
//       }
  
//       // Add to categories
//       setBannerCategories(prev => [...prev, newBannerKey]);
      
//       // Select the new banner
//       handleBannerSelect(newBannerKey);
//       setIsAddingNewBanner(false);
//     };
  
//     // Handle scheduling toggle
//     const handleSchedulingToggle = () => {
//       setSchedulingEnabled(!schedulingEnabled);
      
//       // If disabling scheduling, clear the date fields
//       if (schedulingEnabled) {
//         setBannerData(prev => ({
//           ...prev,
//           startDate: '',
//           endDate: ''
//         }));
//       }
//     };
  
//     // Handle input changes
//     const handleInputChange = (e) => {
//       const { name, value, type, checked } = e.target;
      
//       setBannerData(prev => ({
//         ...prev,
//         [name]: type === 'checkbox' ? checked : value
//       }));
//     };
  
//     // Handle file selection for image upload
//     const handleFileChange = (e) => {
//       if (e.target.files[0]) {
//         setUploadFile(e.target.files[0]);
//         clearMessages();
//       }
//     };
  
//     // Clear error and success messages
//     const clearMessages = () => {
//       setError('');
//       setSuccessMessage('');
//     };
  
//     // Handle image upload
//     const handleImageUpload = async () => {
//       if (!selectedBanner) {
//         setError("Please select a banner first");
//         return;
//       }
  
//       if (!uploadFile) {
//         setError("Please select an image to upload");
//         return;
//       }
  
//       setIsUploading(true);
//       setUploadProgress(0);
//       clearMessages();
  
//       try {
//         // Generate timestamp for the filename
//         const timestamp = Date.now();
//         const fileName = `image_${timestamp}`;
//         const fileExtension = uploadFile.name.split('.').pop();
        
//         // Create storage reference
//         const fileRef = storageRef(storage, `banners/${selectedBanner}/${fileName}.${fileExtension}`);
        
//         // Start upload
//         const uploadTask = uploadBytesResumable(fileRef, uploadFile);
        
//         // Monitor upload progress
//         uploadTask.on(
//           'state_changed',
//           (snapshot) => {
//             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//             setUploadProgress(progress);
//           },
//           (error) => {
//             console.error('Upload error:', error);
//             setError('Failed to upload image. Please try again.');
//             setIsUploading(false);
//           },
//           async () => {
//             // Upload completed successfully
//             const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
//             // Update banner images state
//             setBannerImages(prev => ({
//               ...prev,
//               [selectedBanner]: downloadURL
//             }));
            
//             setSuccessMessage('Image uploaded successfully!');
//             setIsUploading(false);
//             setUploadFile(null);
            
//             // Reset file input
//             const fileInput = document.getElementById('banner-image');
//             if (fileInput) fileInput.value = '';
//           }
//         );
//       } catch (error) {
//         console.error('Error starting upload:', error);
//         setError('Failed to start upload. Please try again.');
//         setIsUploading(false);
//       }
//     };
  
//     // Save banner data to Realtime Database
//     const saveBannerData = async () => {
//       if (!selectedBanner) {
//         setError("Please select a banner first");
//         return;
//       }
  
//       // Basic validation
//       if (!formData.title.trim() || !formData.subtitle.trim() || !formData.productName.trim()) {
//         setError("Please fill in all required fields");
//         return;
//       }
      
//       if (!formData.originalPrice || !formData.currentPrice) {
//         setError("Please enter both original and current prices");
//         return;
//       }
  
//       // Validate scheduling dates if enabled
//       if (schedulingEnabled) {
//         if (!formData.startDate && !formData.endDate) {
//           setError("Please set at least one of start date or end date for scheduling");
//           return;
//         }
  
//         if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
//           setError("End date must be after start date");
//           return;
//         }
//       }
  
//       setIsSaving(true);
//       clearMessages();
  
//       try {
//         const bannerRef = dbRef(db, `banners/${selectedBanner}`);
        
//         // Prepare data to save
//         const dataToSave = { ...formData };
        
//         // Convert prices to numbers
//         dataToSave.originalPrice = parseFloat(dataToSave.originalPrice);
//         dataToSave.currentPrice = parseFloat(dataToSave.currentPrice);
        
//         // Only include scheduling fields if scheduling is enabled
//         if (!schedulingEnabled) {
//           delete dataToSave.startDate;
//           delete dataToSave.endDate;
//         }
  
//         // Save to Firebase using update instead of set to preserve any fields we don't modify
//         await update(bannerRef, dataToSave);
        
//         // Update local state (preserving other banners)
//         setBanners(prev => ({
//           ...prev,
//           [selectedBanner]: {
//             ...prev[selectedBanner],
//             ...dataToSave
//           }
//         }));
  
//         setSuccessMessage('Banner data saved successfully!');
//       } catch (error) {
//         console.error('Error saving banner data:', error);
//         setError('Failed to save banner data. Please try again.');
//       } finally {
//         setIsSaving(false);
//       }
//     };
  
//     // Delete banner
//     const deleteBanner = async () => {
//       if (!selectedBanner) {
//         setError("Please select a banner first");
//         return;
//       }
  
//       if (!window.confirm(`Are you sure you want to delete the ${selectedBanner} banner?`)) {
//         return;
//       }
  
//       setIsSaving(true);
//       clearMessages();
  
//       try {
//         // Delete banner data
//         const bannerRef = dbRef(db, `banners/${selectedBanner}`);
//         await remove(bannerRef);
        
//         // Delete banner images
//         try {
//           const imagesRef = storageRef(storage, `banners/${selectedBanner}`);
//           const files = await listAll(imagesRef);
          
//           // Delete each file
//           await Promise.all(files.items.map(fileRef => deleteObject(fileRef)));
//         } catch (storageError) {
//           console.error('Error deleting banner images:', storageError);
//           // Continue even if image deletion fails
//         }
        
//         // Update local state
//         setBanners(prev => {
//           const updatedBanners = { ...prev };
//           delete updatedBanners[selectedBanner];
//           return updatedBanners;
//         });
        
//         setBannerImages(prev => {
//           const updatedImages = { ...prev };
//           delete updatedImages[selectedBanner];
//           return updatedImages;
//         });
        
//         // Remove from categories if it's not one of the initial categories
//         if (!initialBannerCategories.includes(selectedBanner)) {
//           setBannerCategories(prev => prev.filter(cat => cat !== selectedBanner));
//         }
        
//         // Reset form
//         setBannerData({
//           title: '',
//           subtitle: '',
//           productName: '',
//           originalPrice: '',
//           currentPrice: '',
//           link: '',
//           isActive: true,
//           startDate: '',
//           endDate: ''
//         });
        
//         setSelectedBanner('');
//         setSchedulingEnabled(false);
//         setSuccessMessage(`Banner "${selectedBanner}" deleted successfully!`);
//       } catch (error) {
//         console.error('Error deleting banner:', error);
//         setError('Failed to delete banner. Please try again.');
//       } finally {
//         setIsSaving(false);
//       }
//     };
  
//     return (
//       <div className="banner-management">
//         <h2>Banner Management</h2>
        
//         {error && <div className="error-message">{error}</div>}
//         {successMessage && <div className="success-message">{successMessage}</div>}
        
//         <div className="banner-controls">
//           <div className="select-banner">
//             <label htmlFor="banner-select">Select Banner:</label>
//             <select
//               id="banner-select"
//               value={selectedBanner}
//               onChange={(e) => handleBannerSelect(e.target.value)}
//               disabled={isUploading || isSaving}
//             >
//               <option value="">Select a banner</option>
//               {bannerCategories.map(bannerKey => (
//                 <option key={bannerKey} value={bannerKey}>
//                   {bannerKey}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <button
//             className="add-button"
//             onClick={handleAddNewBanner}
//             disabled={isUploading || isSaving}
//           >
//             Add New Banner
//           </button>
//         </div>
        
//         {isAddingNewBanner && (
//           <div className="new-banner-form">
//             <div className="form-group">
//               <label htmlFor="new-banner-key">New Banner ID:</label>
//               <input
//                 type="text"
//                 id="new-banner-key"
//                 value={newBannerKey}
//                 onChange={handleNewBannerKeyChange}
//                 placeholder="Enter banner ID (e.g., premium-chicken)"
//                 disabled={isSaving}
//               />
//             </div>
            
//             <button
//               className="create-button"
//               onClick={createNewBanner}
//               disabled={isSaving || !newBannerKey}
//             >
//               Create Banner
//             </button>
//           </div>
//         )}
        
//         {selectedBanner && (
//           <div className="banner-editor">
//             <div className="banner-form">
//               <div className="form-section">
//                 <h3>Banner Image</h3>
                
//                 <div className="image-preview">
//                   {bannerImages[selectedBanner] ? (
//                     <img src={bannerImages[selectedBanner]} alt={`Banner ${selectedBanner}`} />
//                   ) : (
//                     <div className="no-image">No image uploaded</div>
//                   )}
//                 </div>
                
//                 <div className="image-upload">
//                   <input
//                     type="file"
//                     id="banner-image"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                     disabled={isUploading || isSaving}
//                   />
                  
//                   {uploadFile && (
//                     <button
//                       className="upload-button"
//                       onClick={handleImageUpload}
//                       disabled={isUploading || isSaving}
//                     >
//                       {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Image'}
//                     </button>
//                   )}
                  
//                   {isUploading && (
//                     <div className="progress-bar-container">
//                       <div
//                         className="progress-bar"
//                         style={{ width: `${uploadProgress}%` }}
//                       ></div>
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               <div className="form-section">
//                 <h3>Banner Content</h3>
                
//                 <div className="form-group">
//                   <label htmlFor="title">Title:</label>
//                   <input
//                     type="text"
//                     id="title"
//                     name="title"
//                     value={formData.title}
//                     onChange={handleInputChange}
//                     placeholder="e.g., Day Special"
//                     disabled={isSaving}
//                     required
//                   />
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="subtitle">Subtitle:</label>
//                   <input
//                     type="text"
//                     id="subtitle"
//                     name="subtitle"
//                     value={formData.subtitle}
//                     onChange={handleInputChange}
//                     placeholder="e.g., Availale upto 12 am"
//                     disabled={isSaving}
//                     required
//                   />
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="productName">Product Name:</label>
//                   <input
//                     type="text"
//                     id="productName"
//                     name="productName"
//                     value={formData.productName}
//                     onChange={handleInputChange}
//                     placeholder="e.g., Chicken Curry Cut & more"
//                     disabled={isSaving}
//                     required
//                   />
//                 </div>
                
//                 <div className="form-row">
//                   <div className="form-group">
//                     <label htmlFor="originalPrice">Original Price (₹):</label>
//                     <input
//                       type="number"
//                       id="originalPrice"
//                       name="originalPrice"
//                       value={formData.originalPrice}
//                       onChange={handleInputChange}
//                       placeholder="e.g., 200"
//                       disabled={isSaving}
//                       required
//                     />
//                   </div>
                  
//                   <div className="form-group">
//                     <label htmlFor="currentPrice">Current Price (₹):</label>
//                     <input
//                       type="number"
//                       id="currentPrice"
//                       name="currentPrice"
//                       value={formData.currentPrice}
//                       onChange={handleInputChange}
//                       placeholder="e.g., 180"
//                       disabled={isSaving}
//                       required
//                     />
//                   </div>
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="link">Link:</label>
//                   <input
//                     type="text"
//                     id="link"
//                     name="link"
//                     value={formData.link}
//                     onChange={handleInputChange}
//                     placeholder="e.g., /product/chicken-curry-cut"
//                     disabled={isSaving}
//                   />
//                 </div>
//               </div>
              
//               <div className="form-section">
//                 <h3>Banner Settings</h3>
                
//                 <div className="form-group checkbox">
//                   <input
//                     type="checkbox"
//                     id="isActive"
//                     name="isActive"
//                     checked={formData.isActive}
//                     onChange={handleInputChange}
//                     disabled={isSaving}
//                   />
//                   <label htmlFor="isActive">Active (visible on website)</label>
//                 </div>
                
//                 <div className="form-group checkbox">
//                   <input
//                     type="checkbox"
//                     id="enable-scheduling"
//                     checked={schedulingEnabled}
//                     onChange={handleSchedulingToggle}
//                     disabled={isSaving}
//                   />
//                   <label htmlFor="enable-scheduling">Enable Scheduling</label>
//                 </div>
                
//                 {schedulingEnabled && (
//                   <div className="scheduling-options">
//                     <div className="form-row">
//                       <div className="form-group">
//                         <label htmlFor="startDate">Start Date & Time:</label>
//                         <input
//                           type="datetime-local"
//                           id="startDate"
//                           name="startDate"
//                           value={formData.startDate}
//                           onChange={handleInputChange}
//                           disabled={isSaving}
//                         />
//                       </div>
                      
//                       <div className="form-group">
//                         <label htmlFor="endDate">End Date & Time:</label>
//                         <input
//                           type="datetime-local"
//                           id="endDate"
//                           name="endDate"
//                           value={formData.endDate}
//                           onChange={handleInputChange}
//                           disabled={isSaving}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               <div className="form-actions">
//                 <button
//                   className="save-button"
//                   onClick={saveBannerData}
//                   disabled={isUploading || isSaving}
//                 >
//                   {isSaving ? 'Saving...' : 'Save Banner'}
//                 </button>
                
//                 <button
//                   className="delete-button"
//                   onClick={deleteBanner}
//                   disabled={isUploading || isSaving}
//                 >
//                   Delete Banner
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };
  
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
    endDate: ''
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

  const handleBannerSelect = (bannerKey) => {
    setSelectedBanner(bannerKey);
    clearMessages();
    setIsAddingNewBanner(false);

    if (banners[bannerKey]) {
      const bannerData = banners[bannerKey];
      const hasScheduling = bannerData.startDate || bannerData.endDate;
      setSchedulingEnabled(hasScheduling);
      setBannerData({
        ...bannerData,
        originalPrice: bannerData.originalPrice?.toString() || '',
        currentPrice: bannerData.currentPrice?.toString() || ''
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
        endDate: ''
      });
      setSchedulingEnabled(false);
    }

    setUploadFile(null);
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
      endDate: ''
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
    handleBannerSelect(newBannerKey);
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

    setIsSaving(true);
    clearMessages();

    try {
      const bannerRef = dbRef(db, `banners/${selectedBanner}`);
      const dataToSave = { ...formData };
      dataToSave.originalPrice = parseFloat(dataToSave.originalPrice);
      dataToSave.currentPrice = parseFloat(dataToSave.currentPrice);

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
    } catch (error) {
      console.error('Error saving banner data:', error);
      setError('Failed to save banner data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBanner = async () => {
    if (!selectedBanner) {
      setError("Please select a banner first");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the ${selectedBanner} banner?`)) {
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      const bannerRef = dbRef(db, `banners/${selectedBanner}`);
      await remove(bannerRef);

      try {
        const imagesRef = storageRef(storage, `banners/${selectedBanner}`);
        const files = await listAll(imagesRef);
        await Promise.all(files.items.map(fileRef => deleteObject(fileRef)));
      } catch (storageError) {
        console.error('Error deleting banner images:', storageError);
      }

      setBanners(prev => {
        const updatedBanners = { ...prev };
        delete updatedBanners[selectedBanner];
        return updatedBanners;
      });

      setBannerImages(prev => {
        const updatedImages = { ...prev };
        delete updatedImages[selectedBanner];
        return updatedImages;
      });

      if (!initialBannerCategories.includes(selectedBanner)) {
        setBannerCategories(prev => prev.filter(cat => cat !== selectedBanner));
      }

      setBannerData({
        title: '',
        subtitle: '',
        productName: '',
        originalPrice: '',
        currentPrice: '',
        link: '',
        isActive: true,
        startDate: '',
        endDate: ''
      });

      setSelectedBanner('');
      setSchedulingEnabled(false);
      setSuccessMessage(`Banner "${selectedBanner}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting banner:', error);
      setError('Failed to delete banner. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="banner-management">
      <h2>Banner Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="banner-controls">
        <div className="select-banner">
          <label htmlFor="banner-select">Select Banner:</label>
          <select
            id="banner-select"
            value={selectedBanner}
            onChange={(e) => handleBannerSelect(e.target.value)}
            disabled={isUploading || isSaving}
          >
            <option value="">Select a banner</option>
            {bannerCategories.map(bannerKey => (
              <option key={bannerKey} value={bannerKey}>
                {bannerKey}
              </option>
            ))}
          </select>
        </div>
        
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
          
          <button
            className="create-button"
            onClick={createNewBanner}
            disabled={isSaving || !newBannerKey}
          >
            Create Banner
          </button>
        </div>
      )}
      
      {selectedBanner && (
        <div className="banner-editor">
          <div className="banner-form">
            <div className="form-section">
              <h3>Banner Image</h3>
              
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
              <h3>Banner Content</h3>
              
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
            </div>
            
            <div className="form-section">
              <h3>Banner Settings</h3>
              
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
            
            <div className="form-actions">
              <button
                className="save-button"
                onClick={saveBannerData}
                disabled={isUploading || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Banner'}
              </button>
              
              <button
                className="delete-button"
                onClick={deleteBanner}
                disabled={isUploading || isSaving}
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerEditor;