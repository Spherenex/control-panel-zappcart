// import React, { useState, useEffect } from 'react';
// import {
//     storage
// } from '../../firebase';
// import {
//     ref,
//     uploadBytesResumable,
//     getDownloadURL,
//     listAll,
//     deleteObject
// } from 'firebase/storage';
// import './ImageUploader.css';

// // Structured folder options - matches the paths used in Banner component
// const FOLDER_OPTIONS = {
//     // Original banner folders
//     banners: {
//         subcategories: ['chicken', 'fish', 'mutton']
//     },
//     // Category images
//     categories: {
//         subcategories: ['chicken', 'mutton', 'fish']
//     },
//     // Special collections
//     collections: {
//         subcategories: ['chicken-specials', 'mutton-selection', 'fresh-fish']
//     },
//     // Premium selections for homepage
//     premium: {
//         subcategories: ['chicken-breast', 'norwegian-salmon', 'mutton-cuts']
//     },
//     // Combo packs for homepage
//     combos: {
//         subcategories: ['meat-lovers', 'seafood-pack']
//     },
//     // Individual product images
//     products: {
//         subcategories: ['chicken', 'mutton', 'fish']
//     },
//     // Promotional images
//     promotions: {
//         subcategories: ['special-offers', 'app-download', 'subscription']
//     },
//     // Testimonial customer images
//     testimonials: {
//         subcategories: ['customers']
//     }
// };

// const ImageUploader = () => {
//     const [selectedMainFolder, setSelectedMainFolder] = useState('');
//     const [selectedSubcategory, setSelectedSubcategory] = useState('');
//     const [folderFiles, setFolderFiles] = useState([]);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [uploadFile, setUploadFile] = useState(null);
//     const [isUploading, setIsUploading] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [error, setError] = useState('');
//     const [uploadMode, setUploadMode] = useState('replace'); // 'replace' or 'add'
//     const [successMessage, setSuccessMessage] = useState('');

//     // Fetch files when a subcategory is selected
//     useEffect(() => {
//         const fetchFolderFiles = async () => {
//             if (!selectedMainFolder || !selectedSubcategory) {
//                 setFolderFiles([]);
//                 return;
//             }

//             try {
//                 const folderPath = `${selectedMainFolder}/${selectedSubcategory}`;
//                 const folderRef = ref(storage, folderPath);
//                 const fileList = await listAll(folderRef);

//                 const filesWithUrls = await Promise.all(
//                     fileList.items.map(async (item) => {
//                         try {
//                             const url = await getDownloadURL(item);
//                             return {
//                                 name: item.name,
//                                 path: item.fullPath,
//                                 url,
//                                 timestamp: getTimestampFromFilename(item.name)
//                             };
//                         } catch (itemError) {
//                             console.error(`Error getting URL for ${item.name}:`, itemError);
//                             return {
//                                 name: item.name,
//                                 path: item.fullPath,
//                                 url: 'https://via.placeholder.com/400x300?text=Error+Loading+Image',
//                                 error: true,
//                                 timestamp: 0
//                             };
//                         }
//                     })
//                 );

//                 // Sort files by timestamp (newest first)
//                 const sortedFiles = filesWithUrls.sort((a, b) => b.timestamp - a.timestamp);
//                 setFolderFiles(sortedFiles);

//                 // Reset file selection when folder changes
//                 setSelectedFile(null);
//             } catch (error) {
//                 console.error('Error fetching folder files:', error);
//                 setError(`Failed to fetch files: ${error.message}`);
//             }
//         };

//         fetchFolderFiles();
//     }, [selectedMainFolder, selectedSubcategory]);

//     // Extract timestamp from filename (e.g., image_1648293647123.jpg)
//     const getTimestampFromFilename = (filename) => {
//         const match = filename.match(/image_(\d+)/);
//         return match ? parseInt(match[1]) : 0;
//     };

//     const handleMainFolderChange = (e) => {
//         const selectedFolder = e.target.value;
//         setSelectedMainFolder(selectedFolder);
//         // Reset dependent states
//         setSelectedSubcategory('');
//         setFolderFiles([]);
//         setSelectedFile(null);
//         setUploadFile(null);
//         setUploadMode('replace');
//         setSuccessMessage('');
//     };

//     const handleSubcategoryChange = (e) => {
//         const selectedSub = e.target.value;
//         setSelectedSubcategory(selectedSub);
//         // Reset dependent states
//         setFolderFiles([]);
//         setSelectedFile(null);
//         setUploadFile(null);
//         setUploadMode('replace');
//         setSuccessMessage('');
//     };

//     const handleFileSelection = (file) => {
//         setSelectedFile(file);
//         // Reset upload file
//         setUploadFile(null);
//         setUploadMode('replace');
//         setSuccessMessage('');
//     };

//     const handleUploadFileChange = (e) => {
//         if (e.target.files[0]) {
//             setUploadFile(e.target.files[0]);
//             setError('');
//             setSuccessMessage('');
//         }
//     };

//     const handleDeleteFile = async (filePath) => {
//         try {
//             setSuccessMessage('');
//             setError('');

//             const fileRef = ref(storage, filePath);
//             await deleteObject(fileRef);

//             // Update the list after deletion
//             setFolderFiles((prev) => prev.filter((file) => file.path !== filePath));
//             setSelectedFile(null);

//             setSuccessMessage(`File deleted successfully. Banner will update automatically.`);
//         } catch (error) {
//             console.error('Delete error:', error);
//             setError(`Failed to delete file: ${error.message}`);
//         }
//     };

//     const handleUpload = async () => {
//         if (!selectedMainFolder) {
//             setError('Please select a main folder');
//             return;
//         }

//         if (!selectedSubcategory) {
//             setError('Please select a subcategory');
//             return;
//         }

//         if (!uploadFile) {
//             setError('Please choose a file to upload');
//             return;
//         }

//         setIsUploading(true);
//         setUploadProgress(0);
//         setError('');
//         setSuccessMessage('');

//         try {
//             // Generate a timestamp to ensure uniqueness and enable sorting by recency
//             const timestamp = new Date().getTime();
//             const fileExt = uploadFile.name.split('.').pop();

//             let storagePath;
//             if (uploadMode === 'replace' && selectedFile) {
//                 // Delete the existing file first
//                 try {
//                     const fileRef = ref(storage, selectedFile.path);
//                     await deleteObject(fileRef);
//                 } catch (deleteError) {
//                     console.error('Error deleting existing file:', deleteError);
//                     // Continue with upload even if delete fails
//                 }

//                 // Use timestamp-based naming even for replacements 
//                 // to ensure the banner component picks up the latest image
//                 storagePath = `${selectedMainFolder}/${selectedSubcategory}/image_${timestamp}.${fileExt}`;
//             } else {
//                 // Add new file with timestamp-based naming
//                 storagePath = `${selectedMainFolder}/${selectedSubcategory}/image_${timestamp}.${fileExt}`;
//             }

//             const storageRef = ref(storage, storagePath);

//             // Create the upload task
//             const uploadTask = uploadBytesResumable(storageRef, uploadFile);

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
//                     setError(`Upload failed: ${error.message}`);
//                     setIsUploading(false);
//                 },
//                 async () => {
//                     try {
//                         // Upload completed successfully
//                         const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

//                         // Update the list of folder files
//                         const newFile = {
//                             name: storagePath.split('/').pop(),
//                             path: storagePath,
//                             url: downloadURL,
//                             timestamp: timestamp
//                         };

//                         setFolderFiles((prev) => {
//                             const updatedFiles = [...prev, newFile].sort((a, b) => b.timestamp - a.timestamp);
//                             return updatedFiles;
//                         });

//                         setIsUploading(false);
//                         setUploadFile(null);
//                         setSelectedFile(null);

//                         // Reset the file input
//                         const fileInput = document.getElementById('file-input');
//                         if (fileInput) fileInput.value = '';

//                         setSuccessMessage(
//                             `File uploaded successfully! The Banner component will automatically use this image.`
//                         );
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

//     return (
//         <div className="image-uploader-container">
//             <h1> Zappcart Control Panel</h1>

//             {error && <div className="error-message">{error}</div>}
//             {successMessage && <div className="success-message">{successMessage}</div>}

//             <div className="upload-section">
//                 <div className="form-group">
//                     <label htmlFor="main-folder-select">Select Main Folder:</label>
//                     <select
//                         id="main-folder-select"
//                         value={selectedMainFolder}
//                         onChange={handleMainFolderChange}
//                         disabled={isUploading}
//                     >
//                         <option value="">Select a Folder</option>
//                         {Object.keys(FOLDER_OPTIONS).map((folder) => (
//                             <option key={folder} value={folder}>
//                                 {folder}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {selectedMainFolder && (
//                     <div className="form-group">
//                         <label htmlFor="subcategory-select">Select Subcategory:</label>
//                         <select
//                             id="subcategory-select"
//                             value={selectedSubcategory}
//                             onChange={handleSubcategoryChange}
//                             disabled={isUploading}
//                         >
//                             <option value="">Select a Subcategory</option>
//                             {FOLDER_OPTIONS[selectedMainFolder].subcategories.map((sub) => (
//                                 <option key={sub} value={sub}>
//                                     {sub}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 )}

//                 {selectedSubcategory && (
//                     <div className="upload-mode-selector form-group">
//                         <label>Upload Mode:</label>
//                         <div className="radio-group">
//                             <label>
//                                 <input
//                                     type="radio"
//                                     name="uploadMode"
//                                     value="replace"
//                                     checked={uploadMode === 'replace'}
//                                     onChange={() => setUploadMode('replace')}
//                                     disabled={isUploading}
//                                 />
//                                 Replace Existing Image
//                             </label>
//                             <label>
//                                 <input
//                                     type="radio"
//                                     name="uploadMode"
//                                     value="add"
//                                     checked={uploadMode === 'add'}
//                                     onChange={() => setUploadMode('add')}
//                                     disabled={isUploading}
//                                 />
//                                 Add New Image
//                             </label>
//                         </div>
//                     </div>
//                 )}

//                 {selectedSubcategory && (
//                     <>
//                         <div className="form-group">
//                             <label htmlFor="file-input">Select Image:</label>
//                             <input
//                                 id="file-input"
//                                 type="file"
//                                 onChange={handleUploadFileChange}
//                                 accept="image/*"
//                                 disabled={isUploading}
//                             />
//                         </div>

//                         {uploadFile && (
//                             <button
//                                 className="upload-button"
//                                 onClick={handleUpload}
//                                 disabled={isUploading}
//                             >
//                                 {isUploading ? 'Uploading...' :
//                                     (uploadMode === 'replace' && selectedFile ? 'Replace Image' : 'Add New Image')}
//                             </button>
//                         )}
//                     </>
//                 )}

//                 {isUploading && (
//                     <div className="progress-container">
//                         <div
//                             className="progress-bar"
//                             style={{ width: `${uploadProgress}%` }}
//                         ></div>
//                         <span className="progress-text">{uploadProgress}%</span>
//                     </div>
//                 )}
//             </div>

//             {selectedSubcategory && (
//                 <div className="form-group file-selection-container">
//                     <label>Existing Files:</label>
//                     {folderFiles.length === 0 ? (
//                         <div className="no-files-message">No files found in this folder</div>
//                     ) : (
//                         <>
//                             <div className="file-info-header">
//                                 <p>Most recent image will be used in the banner automatically</p>
//                             </div>
//                             <div className="file-selection-grid">
//                                 {folderFiles.map((file) => (
//                                     <div
//                                         key={file.path}
//                                         className={`file-select-card ${selectedFile?.path === file.path ? 'selected' : ''}`}
//                                         onClick={() => handleFileSelection(file)}
//                                     >
//                                         <img src={file.url} alt={file.name} />
//                                         <span className="file-name">{file.name}</span>
//                                         <div className="file-actions">
//                                             <button
//                                                 className="delete-button"
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleDeleteFile(file.path);
//                                                 }}
//                                                 title="Delete file"
//                                             >
//                                                 Delete
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </>
//                     )}
//                 </div>
//             )}

//         </div>
//     );
// };

// export default ImageUploader;

import React, { useState, useEffect } from 'react';
import {
    storage
} from '../../firebase';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    deleteObject
} from 'firebase/storage';
import './ImageUploader.css';

// Extended folder options - matching paths used in all components
const FOLDER_OPTIONS = {
    // Banner images from original implementation
    banners: {
        subcategories: ['Premium Chicken Cuts', 'Fresh Fish Collection', 'Premium Mutton Selection']
    },
    // Categories page images
    categories: {
        subcategories: ['chicken', 'mutton', 'fishSeafood']
    },
    // Special collections from Categories page
    collections: {
        subcategories: ['chickenSpecials', 'muttonSelection', 'freshFish']
    },
    // Home page categories
    homeCategories: {
        subcategories: ['chicken', 'mutton', 'fishSeafood']
    },
    // Premium selections from Home page
    premiumSelections: {
        subcategories: ['chickenBreast', 'norwegianSalmon', 'premiumMutton']
    },
    // Combo packs from Home page
    comboPacks: {
        subcategories: ['meatLovers', 'premiumSeafood']
    },
    // Product images by category - requires product ID
    products: {
        subcategories: ['chicken', 'mutton', 'fishseafood'],
        requiresId: true,
        idLabel: 'Product ID',
        idPlaceholder: 'Enter product ID (e.g., 1, 2, 3)'
    },
    // Promotional content
    promotions: {
        subcategories: ['subscription', 'specialOffer', 'appPreview']
    },
    // Customer testimonials
    testimonials: {
        subcategories: ['customers'],
        requiresId: true,
        idLabel: 'Customer Name',
        idPlaceholder: 'Enter customer name (e.g., priya, rajesh)'
    }
};

const ImageUploader = () => {
    const [selectedMainFolder, setSelectedMainFolder] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [folderFiles, setFolderFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [uploadMode, setUploadMode] = useState('replace'); // 'replace' or 'add'
    const [successMessage, setSuccessMessage] = useState('');
    
    // For items that require an ID (like products)
    const [itemId, setItemId] = useState('');
    const [requiresId, setRequiresId] = useState(false);
    const [idLabel, setIdLabel] = useState('ID');
    const [idPlaceholder, setIdPlaceholder] = useState('Enter ID');

    // Fetch files when a subcategory is selected
    useEffect(() => {
        const fetchFolderFiles = async () => {
            if (!selectedMainFolder || !selectedSubcategory) {
                setFolderFiles([]);
                return;
            }
            
            // Skip fetch if ID is required but not provided
            if (requiresId && (!itemId || itemId.trim() === '')) {
                setFolderFiles([]);
                return;
            }
            
            let folderPath = `${selectedMainFolder}/${selectedSubcategory}`;
            
            // Add ID to path if required
            if (requiresId && itemId) {
                folderPath = `${folderPath}/${itemId.trim()}`;
            }

            try {
                const folderRef = ref(storage, folderPath);
                const fileList = await listAll(folderRef);

                const filesWithUrls = await Promise.all(
                    fileList.items.map(async (item) => {
                        try {
                            const url = await getDownloadURL(item);
                            return {
                                name: item.name,
                                path: item.fullPath,
                                url,
                                timestamp: getTimestampFromFilename(item.name)
                            };
                        } catch (itemError) {
                            console.error(`Error getting URL for ${item.name}:`, itemError);
                            return {
                                name: item.name,
                                path: item.fullPath,
                                url: 'https://via.placeholder.com/400x300?text=Error+Loading+Image',
                                error: true,
                                timestamp: 0
                            };
                        }
                    })
                );

                // Sort files by timestamp (newest first)
                const sortedFiles = filesWithUrls.sort((a, b) => b.timestamp - a.timestamp);
                setFolderFiles(sortedFiles);

                // Reset file selection when folder changes
                setSelectedFile(null);
            } catch (error) {
                console.error('Error fetching folder files:', error);
                setError(`Failed to fetch files: ${error.message}`);
            }
        };

        fetchFolderFiles();
    }, [selectedMainFolder, selectedSubcategory, itemId, requiresId]);

    // Extract timestamp from filename (e.g., image_1648293647123.jpg)
    const getTimestampFromFilename = (filename) => {
        const match = filename.match(/image_(\d+)/);
        return match ? parseInt(match[1]) : 0;
    };

    const handleMainFolderChange = (e) => {
        const selectedFolder = e.target.value;
        setSelectedMainFolder(selectedFolder);
        
        // Check if selected folder requires an ID
        const folderConfig = FOLDER_OPTIONS[selectedFolder];
        const needsId = folderConfig && folderConfig.requiresId === true;
        setRequiresId(needsId);
        
        // Set ID label and placeholder if provided
        if (needsId) {
            setIdLabel(folderConfig.idLabel || 'ID');
            setIdPlaceholder(folderConfig.idPlaceholder || 'Enter ID');
        }
        
        // Reset dependent states
        setSelectedSubcategory('');
        setFolderFiles([]);
        setSelectedFile(null);
        setUploadFile(null);
        setUploadMode('replace');
        setSuccessMessage('');
        setItemId('');
    };

    const handleSubcategoryChange = (e) => {
        const selectedSub = e.target.value;
        setSelectedSubcategory(selectedSub);
        
        // Reset dependent states
        setFolderFiles([]);
        setSelectedFile(null);
        setUploadFile(null);
        setUploadMode('replace');
        setSuccessMessage('');
        setItemId('');
    };

    const handleItemIdChange = (e) => {
        setItemId(e.target.value);
        // Reset file selection when ID changes
        setSelectedFile(null);
        setFolderFiles([]);
    };

    const handleFileSelection = (file) => {
        setSelectedFile(file);
        // Reset upload file
        setUploadFile(null);
        setUploadMode('replace');
        setSuccessMessage('');
    };

    const handleUploadFileChange = (e) => {
        if (e.target.files[0]) {
            setUploadFile(e.target.files[0]);
            setError('');
            setSuccessMessage('');
        }
    };

    const handleDeleteFile = async (filePath) => {
        try {
            setSuccessMessage('');
            setError('');

            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);

            // Update the list after deletion
            setFolderFiles((prev) => prev.filter((file) => file.path !== filePath));
            setSelectedFile(null);

            setSuccessMessage(`File deleted successfully. Content will update automatically.`);
        } catch (error) {
            console.error('Delete error:', error);
            setError(`Failed to delete file: ${error.message}`);
        }
    };

    const handleUpload = async () => {
        if (!selectedMainFolder) {
            setError('Please select a content type');
            return;
        }

        if (!selectedSubcategory) {
            setError('Please select a subcategory');
            return;
        }
        
        // Validate ID if required
        if (requiresId && (!itemId || itemId.trim() === '')) {
            setError(`Please enter a valid ${idLabel}`);
            return;
        }

        if (!uploadFile) {
            setError('Please choose a file to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError('');
        setSuccessMessage('');

        try {
            // Generate a timestamp to ensure uniqueness and enable sorting by recency
            const timestamp = new Date().getTime();
            const fileExt = uploadFile.name.split('.').pop();

            // Determine the storage path based on the content type
            let storagePath = `${selectedMainFolder}/${selectedSubcategory}`;
            
            // Add ID to path if required
            if (requiresId) {
                storagePath = `${storagePath}/${itemId.trim()}`;
            }
            
            // Add filename with timestamp
            storagePath = `${storagePath}/image_${timestamp}.${fileExt}`;
            
            // If replacing, delete the existing file first
            if (uploadMode === 'replace' && selectedFile) {
                try {
                    const fileRef = ref(storage, selectedFile.path);
                    await deleteObject(fileRef);
                } catch (deleteError) {
                    console.error('Error deleting existing file:', deleteError);
                    // Continue with upload even if delete fails
                }
            }

            const storageRef = ref(storage, storagePath);

            // Create the upload task
            const uploadTask = uploadBytesResumable(storageRef, uploadFile);

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
                    setError(`Upload failed: ${error.message}`);
                    setIsUploading(false);
                },
                async () => {
                    try {
                        // Upload completed successfully
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        // Update the list of folder files
                        const newFile = {
                            name: storagePath.split('/').pop(),
                            path: storagePath,
                            url: downloadURL,
                            timestamp: timestamp
                        };

                        setFolderFiles((prev) => {
                            const updatedFiles = [...prev, newFile].sort((a, b) => b.timestamp - a.timestamp);
                            return updatedFiles;
                        });

                        setIsUploading(false);
                        setUploadFile(null);
                        setSelectedFile(null);

                        // Reset the file input
                        const fileInput = document.getElementById('file-input');
                        if (fileInput) fileInput.value = '';

                        setSuccessMessage(
                            `File uploaded successfully! The component will automatically use this image.`
                        );
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

    return (
        <div className="image-uploader-container">

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="upload-section">
                <div className="form-group">
                    <label htmlFor="main-folder-select">Select Content Type:</label>
                    <select
                        id="main-folder-select"
                        value={selectedMainFolder}
                        onChange={handleMainFolderChange}
                        disabled={isUploading}
                    >
                        <option value="">Select a Content Type</option>
                        {Object.keys(FOLDER_OPTIONS).map((folder) => (
                            <option key={folder} value={folder}>
                                {folder}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedMainFolder && (
                    <div className="form-group">
                        <label htmlFor="subcategory-select">Select Subcategory:</label>
                        <select
                            id="subcategory-select"
                            value={selectedSubcategory}
                            onChange={handleSubcategoryChange}
                            disabled={isUploading}
                        >
                            <option value="">Select a Subcategory</option>
                            {FOLDER_OPTIONS[selectedMainFolder].subcategories.map((sub) => (
                                <option key={sub} value={sub}>
                                    {sub}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* ID input field for products or other items requiring ID */}
                {selectedSubcategory && requiresId && (
                    <div className="form-group">
                        <label htmlFor="item-id-input">{idLabel}:</label>
                        <input
                            id="item-id-input"
                            type="text"
                            value={itemId}
                            onChange={handleItemIdChange}
                            placeholder={idPlaceholder}
                            disabled={isUploading}
                        />
                    </div>
                )}

                {selectedSubcategory && (!requiresId || (requiresId && itemId.trim() !== '')) && (
                    <div className="upload-mode-selector form-group">
                        <label>Upload Mode:</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="uploadMode"
                                    value="replace"
                                    checked={uploadMode === 'replace'}
                                    onChange={() => setUploadMode('replace')}
                                    disabled={isUploading}
                                />
                                Replace Existing Image
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="uploadMode"
                                    value="add"
                                    checked={uploadMode === 'add'}
                                    onChange={() => setUploadMode('add')}
                                    disabled={isUploading}
                                />
                                Add New Image
                            </label>
                        </div>
                    </div>
                )}

                {selectedSubcategory && (!requiresId || (requiresId && itemId.trim() !== '')) && (
                    <>
                        <div className="form-group">
                            <label htmlFor="file-input">Select Image:</label>
                            <input
                                id="file-input"
                                type="file"
                                onChange={handleUploadFileChange}
                                accept="image/*"
                                disabled={isUploading}
                            />
                        </div>

                        {uploadFile && (
                            <button
                                className="upload-button"
                                onClick={handleUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Uploading...' :
                                    (uploadMode === 'replace' && selectedFile ? 'Replace Image' : 'Add New Image')}
                            </button>
                        )}
                    </>
                )}

                {isUploading && (
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <span className="progress-text">{uploadProgress}%</span>
                    </div>
                )}
            </div>

            {selectedSubcategory && (!requiresId || (requiresId && itemId.trim() !== '')) && (
                <div className="form-group file-selection-container">
                    <label>Existing Files:</label>
                    {folderFiles.length === 0 ? (
                        <div className="no-files-message">No files found in this folder</div>
                    ) : (
                        <>
                            <div className="file-info-header">
                                <p>Most recent image will be used automatically</p>
                            </div>
                            <div className="file-selection-grid">
                                {folderFiles.map((file) => (
                                    <div
                                        key={file.path}
                                        className={`file-select-card ${selectedFile?.path === file.path ? 'selected' : ''}`}
                                        onClick={() => handleFileSelection(file)}
                                    >
                                        <img src={file.url} alt={file.name} />
                                        <span className="file-name">{file.name}</span>
                                        <div className="file-actions">
                                            <button
                                                className="delete-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFile(file.path);
                                                }}
                                                title="Delete file"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;