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
// import './HomePageManagement.css';
// import { FaCheckCircle, FaTrash, FaPlus, FaEdit, FaArrowUp, FaArrowDown } from 'react-icons/fa';

// const HomePageManagement = () => {
//     // Section to edit
//     const [activeSection, setActiveSection] = useState('categories');

//     // Loading and error states
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
//     const [isUploading, setIsUploading] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [error, setError] = useState('');
//     const [successMessage, setSuccessMessage] = useState('');

//     // Data states for each section
//     const [categories, setCategories] = useState([]);
//     const [premiumSelections, setPremiumSelections] = useState([]);
//     const [comboPacks, setComboPacks] = useState([]);
//     const [testimonials, setTestimonials] = useState([]);
//     const [promoContent, setPromoContent] = useState({
//         title: 'Limited Time Offer',
//         subtitle: 'First Order Discount',
//         description: 'Get 20% off on your first order with code:',
//         promoCode: 'FRESH20',
//         features: [
//             'Free delivery on orders above ₹500',
//             'Premium quality guaranteed',
//             'Easy returns within 24 hours'
//         ],
//         buttonText: 'Shop Now',
//         buttonLink: '/shop'
//     });

//     // Selected item states
//     const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
//     const [selectedPremiumIndex, setSelectedPremiumIndex] = useState(-1);
//     const [selectedComboIndex, setSelectedComboIndex] = useState(-1);
//     const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState(-1);

//     // Temp states for adding new items
//     const [newCategoryName, setNewCategoryName] = useState('');
//     const [newCategoryItem, setNewCategoryItem] = useState('');

//     // Upload states
//     const [uploadFile, setUploadFile] = useState(null);
//     const [uploadSection, setUploadSection] = useState('');
//     const [uploadItemId, setUploadItemId] = useState('');

//     // Fetch all data when component mounts
//     useEffect(() => {
//         fetchAllData();
//     }, []);

//     // Fetch all data from Firebase
//     const fetchAllData = async () => {
//         setIsLoading(true);
//         try {
//             await Promise.all([
//                 fetchCategories(),
//                 fetchPremiumSelections(),
//                 fetchComboPacks(),
//                 fetchTestimonials(),
//                 fetchPromoContent()
//             ]);
//         } catch (error) {
//             console.error("Error fetching homepage data:", error);
//             setError("Failed to load homepage data from database");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Fetch categories
//     const fetchCategories = async () => {
//         try {
//             const categoriesRef = dbRef(database, 'homeCategories');
//             const snapshot = await get(categoriesRef);

//             if (snapshot.exists()) {
//                 const categoriesData = snapshot.val();
//                 // Convert from object to array if needed
//                 const categoriesArray = Array.isArray(categoriesData) 
//                     ? categoriesData 
//                     : Object.values(categoriesData);

//                 // Fetch images for each category
//                 const categoriesWithImages = await Promise.all(
//                     categoriesArray.map(async (category) => {
//                         try {
//                             const imageURL = await getMostRecentImage(`homeCategories/${category.title.toLowerCase()}`);
//                             return { ...category, image: imageURL };
//                         } catch (error) {
//                             console.error(`Error fetching image for ${category.title}:`, error);
//                             return {
//                                 ...category,
//                                 image: `https://via.placeholder.com/800x600?text=${category.title}`
//                             };
//                         }
//                     })
//                 );

//                 setCategories(categoriesWithImages);
//             } else {
//                 // Set default categories
//                 setCategories([
//                     {
//                         id: 1,
//                         title: "Chicken",
//                         imageFolderPath: "homeCategories/chicken",
//                         items: ["Whole Chicken", "Boneless", "Curry Cut", "Wings", "Leg Piece"]
//                     },
//                     {
//                         id: 2,
//                         title: "Mutton",
//                         imageFolderPath: "homeCategories/mutton",
//                         items: ["Curry Cut", "Boneless", "Chops", "Biryani Cut", "Keema"]
//                     },
//                     {
//                         id: 3,
//                         title: "Fish & Seafood",
//                         imageFolderPath: "homeCategories/fishSeafood",
//                         items: ["Fish", "Prawns", "Crab", "Tuna", "Salmon"]
//                     }
//                 ]);
//             }
//         } catch (error) {
//             console.error("Error fetching categories:", error);
//             throw error;
//         }
//     };

//     // Fetch premium selections
//     const fetchPremiumSelections = async () => {
//         try {
//             const premiumRef = dbRef(database, 'premiumSelections');
//             const snapshot = await get(premiumRef);

//             if (snapshot.exists()) {
//                 const premiumData = snapshot.val();
//                 // Convert from object to array if needed
//                 const premiumArray = Array.isArray(premiumData) 
//                     ? premiumData 
//                     : Object.values(premiumData);

//                 // Fetch images for each premium selection
//                 const premiumWithImages = await Promise.all(
//                     premiumArray.map(async (item) => {
//                         try {
//                             const folderPath = `premiumSelections/${item.name.replace(/\s+/g, '').toLowerCase()}`;
//                             const imageURL = await getMostRecentImage(folderPath);
//                             return { ...item, image: imageURL };
//                         } catch (error) {
//                             console.error(`Error fetching image for ${item.name}:`, error);
//                             return {
//                                 ...item,
//                                 image: `https://via.placeholder.com/800x600?text=${item.name}`
//                             };
//                         }
//                     })
//                 );

//                 setPremiumSelections(premiumWithImages);
//             } else {
//                 // Set default premium selections
//                 setPremiumSelections([
//                     {
//                         id: 1,
//                         name: "Premium Chicken Breast",
//                         price: 399,
//                         imageFolderPath: "premiumSelections/chickenBreast",
//                         description: "Farm-raised antibiotic-free premium chicken breast",
//                         origin: "Local Farms"
//                     },
//                     {
//                         id: 2,
//                         name: "Norwegian Salmon",
//                         price: 1299,
//                         imageFolderPath: "premiumSelections/norwegianSalmon",
//                         description: "Wild caught Atlantic salmon, rich in Omega-3",
//                         origin: "Norway"
//                     },
//                     {
//                         id: 3,
//                         name: "Premium Mutton Cuts",
//                         price: 999,
//                         imageFolderPath: "premiumSelections/premiumMutton",
//                         description: "Grass-fed, free-range mutton with a rich flavor",
//                         origin: "Local Farms"
//                     }
//                 ]);
//             }
//         } catch (error) {
//             console.error("Error fetching premium selections:", error);
//             throw error;
//         }
//     };

//     // Fetch combo packs
//     const fetchComboPacks = async () => {
//         try {
//             const comboRef = dbRef(database, 'comboPacks');
//             const snapshot = await get(comboRef);

//             if (snapshot.exists()) {
//                 const comboData = snapshot.val();
//                 // Convert from object to array if needed
//                 const comboArray = Array.isArray(comboData) 
//                     ? comboData 
//                     : Object.values(comboData);

//                 // Fetch images for each combo pack
//                 const combosWithImages = await Promise.all(
//                     comboArray.map(async (combo) => {
//                         try {
//                             const folderPath = `comboPacks/${combo.name.replace(/\s+/g, '').toLowerCase()}`;
//                             const imageURL = await getMostRecentImage(folderPath);
//                             return { ...combo, image: imageURL };
//                         } catch (error) {
//                             console.error(`Error fetching image for ${combo.name}:`, error);
//                             return {
//                                 ...combo,
//                                 image: `https://via.placeholder.com/800x600?text=${combo.name}`
//                             };
//                         }
//                     })
//                 );

//                 setComboPacks(combosWithImages);
//             } else {
//                 // Set default combo packs
//                 setComboPacks([
//                     {
//                         id: 1,
//                         name: "Meat Lover's Pack",
//                         items: "Chicken Drumsticks + Mutton Curry Cut + Fish Fillets",
//                         price: 999,
//                         originalPrice: 1299,
//                         imageFolderPath: "comboPacks/meatLovers",
//                         savings: "Save ₹300"
//                     },
//                     {
//                         id: 2,
//                         name: "Premium Seafood Pack",
//                         items: "Norwegian Salmon + Prawns + Fish Curry Cut",
//                         price: 1499,
//                         originalPrice: 1999,
//                         imageFolderPath: "comboPacks/premiumSeafood",
//                         savings: "Save ₹500"
//                     }
//                 ]);
//             }
//         } catch (error) {
//             console.error("Error fetching combo packs:", error);
//             throw error;
//         }
//     };

//     // Fetch testimonials
//     const fetchTestimonials = async () => {
//         try {
//             const testimonialsRef = dbRef(database, 'testimonials');
//             const snapshot = await get(testimonialsRef);

//             if (snapshot.exists()) {
//                 const testimonialsData = snapshot.val();
//                 // Convert from object to array if needed
//                 const testimonialsArray = Array.isArray(testimonialsData) 
//                     ? testimonialsData 
//                     : Object.values(testimonialsData);

//                 // Fetch images for each testimonial
//                 const testimonialsWithImages = await Promise.all(
//                     testimonialsArray.map(async (testimonial) => {
//                         try {
//                             const folderPath = `testimonials/customers/${testimonial.name.split(' ')[0].toLowerCase()}`;
//                             const imageURL = await getMostRecentImage(folderPath);
//                             return { ...testimonial, image: imageURL };
//                         } catch (error) {
//                             console.error(`Error fetching image for ${testimonial.name}:`, error);
//                             return {
//                                 ...testimonial,
//                                 image: `https://via.placeholder.com/200x200?text=${testimonial.name.split(' ')[0]}`
//                             };
//                         }
//                     })
//                 );

//                 setTestimonials(testimonialsWithImages);
//             } else {
//                 // Set default testimonials
//                 setTestimonials([
//                     {
//                         id: 1,
//                         name: "Priya S.",
//                         rating: 5,
//                         text: "The quality of chicken is exceptional! I've been ordering for 6 months now and have never been disappointed. The chicken is always fresh and the delivery is prompt.",
//                         imageFolderPath: "testimonials/customers/priya",
//                         date: "3 weeks ago"
//                     },
//                     {
//                         id: 2,
//                         name: "Rajesh K.",
//                         rating: 5,
//                         text: "Best seafood in town. Their fish is always fresh and perfectly cleaned. The packaging is excellent and the delivery is always on time.",
//                         imageFolderPath: "testimonials/customers/rajesh",
//                         date: "1 month ago"
//                     },
//                     {
//                         id: 3,
//                         name: "Ananya M.",
//                         rating: 4,
//                         text: "Great variety of mutton cuts and excellent customer service. The quality is superior to what I get from local markets. Highly recommend!",
//                         imageFolderPath: "testimonials/customers/ananya",
//                         date: "2 months ago"
//                     }
//                 ]);
//             }
//         } catch (error) {
//             console.error("Error fetching testimonials:", error);
//             throw error;
//         }
//     };

//     // Fetch promo content
//     const fetchPromoContent = async () => {
//         try {
//             const promoRef = dbRef(database, 'promoContent');
//             const snapshot = await get(promoRef);

//             if (snapshot.exists()) {
//                 setPromoContent(snapshot.val());
//             }

//             // Also get promo images
//             try {
//                 const promoImageURL = await getMostRecentImage("promotions/specialOffer");
//                 const appPreviewImageURL = await getMostRecentImage("promotions/appPreview");

//                 setPromoContent(prev => ({
//                     ...prev,
//                     promoImage: promoImageURL,
//                     appPreviewImage: appPreviewImageURL
//                 }));
//             } catch (error) {
//                 console.error("Error fetching promo images:", error);
//             }
//         } catch (error) {
//             console.error("Error fetching promo content:", error);
//             throw error;
//         }
//     };

//     // Function to get the most recent image from a folder
//     const getMostRecentImage = async (folderPath) => {
//         try {
//             const folderRef = storageRef(storage, folderPath);
//             const fileList = await listAll(folderRef);

//             if (fileList.items.length === 0) {
//                 console.warn(`No images found in ${folderPath}`);
//                 return `https://via.placeholder.com/800x600?text=No+Images+In+${folderPath.replace(/\//g, '+')}`;
//             }

//             // Sort files by name to get the most recent one (timestamp-based naming)
//             const sortedItems = [...fileList.items].sort((a, b) => {
//                 // Extract timestamps if present in the filename (e.g., image_1648293647123.jpg)
//                 const getTimestamp = (name) => {
//                     const match = name.match(/image_(\d+)/);
//                     return match ? parseInt(match[1]) : 0;
//                 };

//                 const timestampA = getTimestamp(a.name);
//                 const timestampB = getTimestamp(b.name);

//                 // Return newest first
//                 return timestampB - timestampA;
//             });

//             // Get the URL of the most recent image
//             const imageURL = await getDownloadURL(sortedItems[0]);
//             return imageURL;
//         } catch (error) {
//             console.error(`Error fetching images from ${folderPath}:`, error);
//             return `https://via.placeholder.com/800x600?text=Error+Loading+Images+From+${folderPath.replace(/\//g, '+')}`;
//         }
//     };

//     // Handle file selection for image upload
//     const handleFileChange = (e, section, itemId) => {
//         if (e.target.files[0]) {
//             setUploadFile(e.target.files[0]);
//             setUploadSection(section);
//             setUploadItemId(itemId);
//             clearMessages();
//         }
//     };

//     // Handle image upload
//     const handleImageUpload = async () => {
//         if (!uploadFile || !uploadSection) {
//             setError("No file selected or upload destination specified");
//             return;
//         }

//         setIsUploading(true);
//         setUploadProgress(0);
//         clearMessages();

//         try {
//             // Generate a timestamp to ensure uniqueness and enable sorting by recency
//             const timestamp = new Date().getTime();
//             const fileExt = uploadFile.name.split('.').pop();

//             // Determine the storage path based on section and item
//             let storagePath = '';

//             if (uploadSection === 'category') {
//                 const category = categories.find(c => c.id.toString() === uploadItemId);
//                 if (!category) {
//                     throw new Error("Category not found");
//                 }
//                 storagePath = `homeCategories/${category.title.toLowerCase()}/image_${timestamp}.${fileExt}`;
//             } else if (uploadSection === 'premium') {
//                 const premium = premiumSelections.find(p => p.id.toString() === uploadItemId);
//                 if (!premium) {
//                     throw new Error("Premium selection not found");
//                 }
//                 storagePath = `premiumSelections/${premium.name.replace(/\s+/g, '').toLowerCase()}/image_${timestamp}.${fileExt}`;
//             } else if (uploadSection === 'combo') {
//                 const combo = comboPacks.find(c => c.id.toString() === uploadItemId);
//                 if (!combo) {
//                     throw new Error("Combo pack not found");
//                 }
//                 storagePath = `comboPacks/${combo.name.replace(/\s+/g, '').toLowerCase()}/image_${timestamp}.${fileExt}`;
//             } else if (uploadSection === 'testimonial') {
//                 const testimonial = testimonials.find(t => t.id.toString() === uploadItemId);
//                 if (!testimonial) {
//                     throw new Error("Testimonial not found");
//                 }
//                 const firstName = testimonial.name.split(' ')[0].toLowerCase();
//                 storagePath = `testimonials/customers/${firstName}/image_${timestamp}.${fileExt}`;
//             } else if (uploadSection === 'promo') {
//                 storagePath = `promotions/specialOffer/image_${timestamp}.${fileExt}`;
//             } else if (uploadSection === 'appPreview') {
//                 storagePath = `promotions/appPreview/image_${timestamp}.${fileExt}`;
//             } else {
//                 throw new Error("Invalid upload section");
//             }

//             // Upload the image
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

//                         // Update the appropriate state based on section
//                         if (uploadSection === 'category') {
//                             setCategories(prev => 
//                                 prev.map(cat => 
//                                     cat.id.toString() === uploadItemId 
//                                         ? { ...cat, image: downloadURL } 
//                                         : cat
//                                 )
//                             );
//                         } else if (uploadSection === 'premium') {
//                             setPremiumSelections(prev => 
//                                 prev.map(item => 
//                                     item.id.toString() === uploadItemId 
//                                         ? { ...item, image: downloadURL } 
//                                         : item
//                                 )
//                             );
//                         } else if (uploadSection === 'combo') {
//                             setComboPacks(prev => 
//                                 prev.map(combo => 
//                                     combo.id.toString() === uploadItemId 
//                                         ? { ...combo, image: downloadURL } 
//                                         : combo
//                                 )
//                             );
//                         } else if (uploadSection === 'testimonial') {
//                             setTestimonials(prev => 
//                                 prev.map(testimonial => 
//                                     testimonial.id.toString() === uploadItemId 
//                                         ? { ...testimonial, image: downloadURL } 
//                                         : testimonial
//                                 )
//                             );
//                         } else if (uploadSection === 'promo') {
//                             setPromoContent(prev => ({
//                                 ...prev,
//                                 promoImage: downloadURL
//                             }));
//                         } else if (uploadSection === 'appPreview') {
//                             setPromoContent(prev => ({
//                                 ...prev,
//                                 appPreviewImage: downloadURL
//                             }));
//                         }

//                         setIsUploading(false);
//                         setUploadFile(null);
//                         setUploadSection('');
//                         setUploadItemId('');

//                         // Reset the file input
//                         const fileInput = document.getElementById('image-upload-input');
//                         if (fileInput) fileInput.value = '';

//                         setSuccessMessage("Image uploaded successfully!");
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

//     // Save category data
//     const saveCategory = async (index) => {
//         if (index < 0 || index >= categories.length) {
//             setError("Invalid category index");
//             return;
//         }

//         const category = categories[index];

//         // Validate
//         if (!category.title || category.items.length === 0) {
//             setError("Category title and items are required");
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             const categoryRef = dbRef(database, `homeCategories/${index}`);
//             await set(categoryRef, category);
//             setSuccessMessage("Category saved successfully!");
//         } catch (error) {
//             console.error("Error saving category:", error);
//             setError(`Failed to save category: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Save premium selection data
//     const savePremiumSelection = async (index) => {
//         if (index < 0 || index >= premiumSelections.length) {
//             setError("Invalid premium selection index");
//             return;
//         }

//         const premium = premiumSelections[index];

//         // Validate
//         if (!premium.name || !premium.description || !premium.price) {
//             setError("Name, description, and price are required");
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             const premiumRef = dbRef(database, `premiumSelections/${index}`);
//             await set(premiumRef, premium);
//             setSuccessMessage("Premium selection saved successfully!");
//         } catch (error) {
//             console.error("Error saving premium selection:", error);
//             setError(`Failed to save premium selection: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Save combo pack data
//     const saveCombopack = async (index) => {
//         if (index < 0 || index >= comboPacks.length) {
//             setError("Invalid combo pack index");
//             return;
//         }

//         const combo = comboPacks[index];

//         // Validate
//         if (!combo.name || !combo.items || !combo.price || !combo.originalPrice) {
//             setError("Name, items, price, and original price are required");
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             const comboRef = dbRef(database, `comboPacks/${index}`);
//             await set(comboRef, combo);
//             setSuccessMessage("Combo pack saved successfully!");
//         } catch (error) {
//             console.error("Error saving combo pack:", error);
//             setError(`Failed to save combo pack: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Save testimonial data
//     const saveTestimonial = async (index) => {
//         if (index < 0 || index >= testimonials.length) {
//             setError("Invalid testimonial index");
//             return;
//         }

//         const testimonial = testimonials[index];

//         // Validate
//         if (!testimonial.name || !testimonial.text || !testimonial.rating) {
//             setError("Name, text, and rating are required");
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             const testimonialRef = dbRef(database, `testimonials/${index}`);
//             await set(testimonialRef, testimonial);
//             setSuccessMessage("Testimonial saved successfully!");
//         } catch (error) {
//             console.error("Error saving testimonial:", error);
//             setError(`Failed to save testimonial: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Save promo content
//     const savePromoContent = async () => {
//         // Validate
//         if (!promoContent.title || !promoContent.description) {
//             setError("Title and description are required");
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             const promoRef = dbRef(database, 'promoContent');
//             await set(promoRef, promoContent);
//             setSuccessMessage("Promotional content saved successfully!");
//         } catch (error) {
//             console.error("Error saving promotional content:", error);
//             setError(`Failed to save promotional content: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Add new category
//     const addNewCategory = () => {
//         if (!newCategoryName.trim()) {
//             setError("Category name is required");
//             return;
//         }

//         const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
//         const newCategory = {
//             id: newId,
//             title: newCategoryName.trim(),
//             imageFolderPath: `homeCategories/${newCategoryName.trim().toLowerCase()}`,
//             items: []
//         };

//         setCategories(prev => [...prev, newCategory]);
//         setNewCategoryName('');
//         setSelectedCategoryIndex(categories.length); // Select the new category
//     };

//     // Add new premium selection
//     const addNewPremiumSelection = () => {
//         const newId = Math.max(0, ...premiumSelections.map(p => p.id)) + 1;
//         const newPremium = {
//             id: newId,
//             name: "New Premium Product",
//             price: 0,
//             imageFolderPath: "premiumSelections/newProduct",
//             description: "Description of the new product",
//             origin: "Local"
//         };

//         setPremiumSelections(prev => [...prev, newPremium]);
//         setSelectedPremiumIndex(premiumSelections.length); // Select the new premium selection
//     };

//     // Add new combo pack
//     const addNewComboPack = () => {
//         const newId = Math.max(0, ...comboPacks.map(c => c.id)) + 1;
//         const newCombo = {
//             id: newId,
//             name: "New Combo Pack",
//             items: "Item 1 + Item 2 + Item 3",
//             price: 0,
//             originalPrice: 0,
//             imageFolderPath: "comboPacks/newCombo",
//             savings: "Save ₹0"
//         };

//         setComboPacks(prev => [...prev, newCombo]);
//         setSelectedComboIndex(comboPacks.length); // Select the new combo pack
//     };

//     // Add new testimonial
//     const addNewTestimonial = () => {
//         const newId = Math.max(0, ...testimonials.map(t => t.id)) + 1;
//         const newTestimonial = {
//             id: newId,
//             name: "New Customer",
//             rating: 5,
//             text: "This customer's review text goes here.",
//             imageFolderPath: "testimonials/customers/newcustomer",
//             date: "Today"
//         };

//         setTestimonials(prev => [...prev, newTestimonial]);
//         setSelectedTestimonialIndex(testimonials.length); // Select the new testimonial
//     };

//     // Add new category item
//     const addCategoryItem = (categoryIndex) => {
//         if (!newCategoryItem.trim()) {
//             setError("Item name is required");
//             return;
//         }

//         setCategories(prev => {
//             const updatedCategories = [...prev];
//             if (!updatedCategories[categoryIndex].items) {
//                 updatedCategories[categoryIndex].items = [];
//             }
//             updatedCategories[categoryIndex].items.push(newCategoryItem.trim());
//             return updatedCategories;
//         });

//         setNewCategoryItem('');
//     };

//     // Remove category item
//     const removeCategoryItem = (categoryIndex, itemIndex) => {
//         setCategories(prev => {
//             const updatedCategories = [...prev];
//             updatedCategories[categoryIndex].items.splice(itemIndex, 1);
//             return updatedCategories;
//         });
//     };

//     // Update promo feature
//     const updatePromoFeature = (index, value) => {
//         setPromoContent(prev => {
//             const updatedFeatures = [...prev.features];
//             updatedFeatures[index] = value;
//             return {
//                 ...prev,
//                 features: updatedFeatures
//             };
//         });
//     };

//     // Add promo feature
//     const addPromoFeature = () => {
//         setPromoContent(prev => ({
//             ...prev,
//             features: [...prev.features, "New feature"]
//         }));
//     };

//     // Remove promo feature
//     const removePromoFeature = (index) => {
//         setPromoContent(prev => {
//             const updatedFeatures = [...prev.features];
//             updatedFeatures.splice(index, 1);
//             return {
//                 ...prev,
//                 features: updatedFeatures
//             };
//         });
//     };

//     // Delete category
//     const deleteCategory = async (index) => {
//         if (!window.confirm("Are you sure you want to delete this category?")) {
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             // Delete from database
//             await remove(dbRef(database, `homeCategories/${index}`));

//             // Delete from state
//             setCategories(prev => prev.filter((_, i) => i !== index));
//             setSelectedCategoryIndex(-1);

//             setSuccessMessage("Category deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting category:", error);
//             setError(`Failed to delete category: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Delete premium selection
//     const deletePremiumSelection = async (index) => {
//         if (!window.confirm("Are you sure you want to delete this premium selection?")) {
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             // Delete from database
//             await remove(dbRef(database, `premiumSelections/${index}`));

//             // Delete from state
//             setPremiumSelections(prev => prev.filter((_, i) => i !== index));
//             setSelectedPremiumIndex(-1);

//             setSuccessMessage("Premium selection deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting premium selection:", error);
//             setError(`Failed to delete premium selection: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Delete combo pack
//     const deleteComboPack = async (index) => {
//         if (!window.confirm("Are you sure you want to delete this combo pack?")) {
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             // Delete from database
//             await remove(dbRef(database, `comboPacks/${index}`));

//             // Delete from state
//             setComboPacks(prev => prev.filter((_, i) => i !== index));
//             setSelectedComboIndex(-1);

//             setSuccessMessage("Combo pack deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting combo pack:", error);
//             setError(`Failed to delete combo pack: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Delete testimonial
//     const deleteTestimonial = async (index) => {
//         if (!window.confirm("Are you sure you want to delete this testimonial?")) {
//             return;
//         }

//         setIsSaving(true);
//         clearMessages();

//         try {
//             // Delete from database
//             await remove(dbRef(database, `testimonials/${index}`));

//             // Delete from state
//             setTestimonials(prev => prev.filter((_, i) => i !== index));
//             setSelectedTestimonialIndex(-1);

//             setSuccessMessage("Testimonial deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting testimonial:", error);
//             setError(`Failed to delete testimonial: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Handle input change for category data
//     const handleCategoryInputChange = (index, field, value) => {
//         setCategories(prev => {
//             const updatedCategories = [...prev];
//             updatedCategories[index][field] = value;
//             return updatedCategories;
//         });
//     };

//     // Handle input change for premium selection data
//     const handlePremiumInputChange = (index, field, value) => {
//         setPremiumSelections(prev => {
//             const updatedPremium = [...prev];
//             updatedPremium[index][field] = field === 'price' ? Number(value) : value;
//             return updatedPremium;
//         });
//     };

//     // Handle input change for combo pack data
//     const handleComboInputChange = (index, field, value) => {
//         setComboPacks(prev => {
//             const updatedCombos = [...prev];
//             updatedCombos[index][field] = (field === 'price' || field === 'originalPrice') 
//                 ? Number(value) 
//                 : value;

//             // Auto-calculate savings
//             if (field === 'price' || field === 'originalPrice') {
//                 const savings = updatedCombos[index].originalPrice - updatedCombos[index].price;
//                 if (savings > 0) {
//                     updatedCombos[index].savings = `Save ₹${savings}`;
//                 }
//             }

//             return updatedCombos;
//         });
//     };

//     // Handle input change for testimonial data
//     const handleTestimonialInputChange = (index, field, value) => {
//         setTestimonials(prev => {
//             const updatedTestimonials = [...prev];
//             updatedTestimonials[index][field] = field === 'rating' 
//                 ? Math.min(5, Math.max(1, Number(value))) 
//                 : value;
//             return updatedTestimonials;
//         });
//     };

//     // Handle input change for promo content
//     const handlePromoInputChange = (field, value) => {
//         setPromoContent(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     // Clear error and success messages
//     const clearMessages = () => {
//         setError('');
//         setSuccessMessage('');
//     };

//     // Move category up or down in the list
//     const moveCategoryPosition = (index, direction) => {
//         if (direction === 'up' && index > 0) {
//             setCategories(prev => {
//                 const updated = [...prev];
//                 [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
//                 return updated;
//             });
//             setSelectedCategoryIndex(index - 1);
//         } else if (direction === 'down' && index < categories.length - 1) {
//             setCategories(prev => {
//                 const updated = [...prev];
//                 [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
//                 return updated;
//             });
//             setSelectedCategoryIndex(index + 1);
//         }
//     };

//     // Move premium selection up or down in the list
//     const movePremiumPosition = (index, direction) => {
//         if (direction === 'up' && index > 0) {
//             setPremiumSelections(prev => {
//                 const updated = [...prev];
//                 [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
//                 return updated;
//             });
//             setSelectedPremiumIndex(index - 1);
//         } else if (direction === 'down' && index < premiumSelections.length - 1) {
//             setPremiumSelections(prev => {
//                 const updated = [...prev];
//                 [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
//                 return updated;
//             });
//             setSelectedPremiumIndex(index + 1);
//         }
//     };

//     // Save all homepage data
//     const saveAllHomepageData = async () => {
//         setIsSaving(true);
//         clearMessages();

//         try {
//             const updates = {};

//             // Prepare all data for batch update
//             categories.forEach((category, index) => {
//                 updates[`homeCategories/${index}`] = category;
//             });

//             premiumSelections.forEach((premium, index) => {
//                 updates[`premiumSelections/${index}`] = premium;
//             });

//             comboPacks.forEach((combo, index) => {
//                 updates[`comboPacks/${index}`] = combo;
//             });

//             testimonials.forEach((testimonial, index) => {
//                 updates[`testimonials/${index}`] = testimonial;
//             });

//             updates['promoContent'] = promoContent;

//             // Execute batch update
//             await update(dbRef(database), updates);

//             setSuccessMessage("All homepage data saved successfully!");
//         } catch (error) {
//             console.error("Error saving all homepage data:", error);
//             setError(`Failed to save homepage data: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Show loading state
//     if (isLoading) {
//         return (
//             <div className="homepage-management loading">
//                 <h2>Homepage Management</h2>
//                 <div className="loading-spinner"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="homepage-management">
//             <h2>Homepage Management</h2>

//             {error && <div className="error-message">{error}</div>}
//             {successMessage && <div className="success-message">{successMessage}</div>}

//             {/* Section Tabs */}
//             <div className="section-tabs">
//                 <button 
//                     className={activeSection === 'categories' ? 'active' : ''}
//                     onClick={() => setActiveSection('categories')}
//                 >
//                     Categories
//                 </button>
//                 <button 
//                     className={activeSection === 'premium' ? 'active' : ''}
//                     onClick={() => setActiveSection('premium')}
//                 >
//                     Premium Selections
//                 </button>
//                 <button 
//                     className={activeSection === 'combos' ? 'active' : ''}
//                     onClick={() => setActiveSection('combos')}
//                 >
//                     Combo Packs
//                 </button>
//                 <button 
//                     className={activeSection === 'testimonials' ? 'active' : ''}
//                     onClick={() => setActiveSection('testimonials')}
//                 >
//                     Testimonials
//                 </button>
//                 <button 
//                     className={activeSection === 'promo' ? 'active' : ''}
//                     onClick={() => setActiveSection('promo')}
//                 >
//                     Promotional Content
//                 </button>
//             </div>

//             {/* Save All Button */}
//             <div className="save-all-container">
//                 <button 
//                     className="save-all-button"
//                     onClick={saveAllHomepageData}
//                     disabled={isSaving}
//                 >
//                     {isSaving ? 'Saving All Data...' : 'Save All Homepage Data'}
//                 </button>
//             </div>

//             {/* Categories Section */}
//             {activeSection === 'categories' && (
//                 <div className="section-container categories-section">
//                     <div className="section-header">
//                         <h3>Manage Categories</h3>
//                         <div className="category-actions">
//                             <input
//                                 type="text"
//                                 placeholder="New category name"
//                                 value={newCategoryName}
//                                 onChange={(e) => setNewCategoryName(e.target.value)}
//                                 disabled={isSaving}
//                             />
//                             <button 
//                                 onClick={addNewCategory}
//                                 disabled={isSaving || !newCategoryName.trim()}
//                             >
//                                 Add Category
//                             </button>
//                         </div>
//                     </div>

//                     <div className="section-content">
//                         <div className="categories-list">
//                             {categories.map((category, index) => (
//                                 <div 
//                                     key={category.id} 
//                                     className={`category-item ${selectedCategoryIndex === index ? 'selected' : ''}`}
//                                     onClick={() => setSelectedCategoryIndex(index)}
//                                 >
//                                     <div className="category-item-title">{category.title}</div>
//                                     <div className="category-item-actions">
//                                         <button 
//                                             className="position-button up"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 moveCategoryPosition(index, 'up');
//                                             }}
//                                             disabled={index === 0}
//                                         >
//                                             <FaArrowUp />
//                                         </button>
//                                         <button 
//                                             className="position-button down"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 moveCategoryPosition(index, 'down');
//                                             }}
//                                             disabled={index === categories.length - 1}
//                                         >
//                                             <FaArrowDown />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {selectedCategoryIndex !== -1 && (
//                             <div className="category-editor">
//                                 <div className="category-preview">
//                                     <img 
//                                         src={categories[selectedCategoryIndex].image || `https://via.placeholder.com/800x600?text=${categories[selectedCategoryIndex].title}`} 
//                                         alt={categories[selectedCategoryIndex].title}
//                                         className="category-image-preview"
//                                     />
//                                     <div className="upload-container">
//                                         <input
//                                             id="image-upload-input"
//                                             type="file"
//                                             accept="image/*"
//                                             onChange={(e) => handleFileChange(e, 'category', categories[selectedCategoryIndex].id.toString())}
//                                             disabled={isUploading || isSaving}
//                                         />
//                                         {uploadFile && uploadSection === 'category' && (
//                                             <button
//                                                 className="upload-button"
//                                                 onClick={handleImageUpload}
//                                                 disabled={isUploading || isSaving}
//                                             >
//                                                 {isUploading ? 'Uploading...' : 'Upload Image'}
//                                             </button>
//                                         )}

//                                         {isUploading && uploadSection === 'category' && (
//                                             <div className="progress-container">
//                                                 <div
//                                                     className="progress-bar"
//                                                     style={{ width: `${uploadProgress}%` }}
//                                                 />
//                                                 <span className="progress-text">{uploadProgress}%</span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="category-form">
//                                     <div className="form-group">
//                                         <label>Category Title:</label>
//                                         <input
//                                             type="text"
//                                             value={categories[selectedCategoryIndex].title}
//                                             onChange={(e) => handleCategoryInputChange(selectedCategoryIndex, 'title', e.target.value)}
//                                             disabled={isSaving}
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Category Items:</label>
//                                         <div className="category-items-container">
//                                             {categories[selectedCategoryIndex].items && categories[selectedCategoryIndex].items.map((item, itemIndex) => (
//                                                 <div key={itemIndex} className="category-item-row">
//                                                     <div className="item-text">
//                                                         <FaCheckCircle className="check-icon" />
//                                                         {item}
//                                                     </div>
//                                                     <button
//                                                         className="remove-item-button"
//                                                         onClick={() => removeCategoryItem(selectedCategoryIndex, itemIndex)}
//                                                         disabled={isSaving}
//                                                     >
//                                                         <FaTrash />
//                                                     </button>
//                                                 </div>
//                                             ))}

//                                             <div className="add-item-container">
//                                                 <input
//                                                     type="text"
//                                                     placeholder="New item"
//                                                     value={newCategoryItem}
//                                                     onChange={(e) => setNewCategoryItem(e.target.value)}
//                                                     disabled={isSaving}
//                                                 />
//                                                 <button
//                                                     onClick={() => addCategoryItem(selectedCategoryIndex)}
//                                                     disabled={isSaving || !newCategoryItem.trim()}
//                                                 >
//                                                     <FaPlus /> Add Item
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="form-actions">
//                                         <button
//                                             className="save-button"
//                                             onClick={() => saveCategory(selectedCategoryIndex)}
//                                             disabled={isSaving}
//                                         >
//                                             {isSaving ? 'Saving...' : 'Save Category'}
//                                         </button>

//                                         <button
//                                             className="delete-button"
//                                             onClick={() => deleteCategory(selectedCategoryIndex)}
//                                             disabled={isSaving}
//                                         >
//                                             Delete Category
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Premium Selections Section */}
//             {activeSection === 'premium' && (
//                 <div className="section-container premium-section">
//                     <div className="section-header">
//                         <h3>Manage Premium Selections</h3>
//                         <button 
//                             onClick={addNewPremiumSelection}
//                             disabled={isSaving}
//                         >
//                             Add New Premium Product
//                         </button>
//                     </div>

//                     <div className="section-content">
//                         <div className="premium-list">
//                             {premiumSelections.map((premium, index) => (
//                                 <div 
//                                     key={premium.id} 
//                                     className={`premium-item ${selectedPremiumIndex === index ? 'selected' : ''}`}
//                                     onClick={() => setSelectedPremiumIndex(index)}
//                                 >
//                                     <div className="premium-item-title">{premium.name}</div>
//                                     <div className="premium-item-price">₹{premium.price}</div>
//                                     <div className="premium-item-actions">
//                                         <button 
//                                             className="position-button up"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 movePremiumPosition(index, 'up');
//                                             }}
//                                             disabled={index === 0}
//                                         >
//                                             <FaArrowUp />
//                                         </button>
//                                         <button 
//                                             className="position-button down"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 movePremiumPosition(index, 'down');
//                                             }}
//                                             disabled={index === premiumSelections.length - 1}
//                                         >
//                                             <FaArrowDown />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {selectedPremiumIndex !== -1 && (
//                             <div className="premium-editor">
//                                 <div className="premium-preview">
//                                     <img 
//                                         src={premiumSelections[selectedPremiumIndex].image || `https://via.placeholder.com/800x600?text=${premiumSelections[selectedPremiumIndex].name}`} 
//                                         alt={premiumSelections[selectedPremiumIndex].name}
//                                         className="premium-image-preview"
//                                     />
//                                     <div className="upload-container">
//                                         <input
//                                             type="file"
//                                             accept="image/*"
//                                             onChange={(e) => handleFileChange(e, 'premium', premiumSelections[selectedPremiumIndex].id.toString())}
//                                             disabled={isUploading || isSaving}
//                                         />
//                                         {uploadFile && uploadSection === 'premium' && (
//                                             <button
//                                                 className="upload-button"
//                                                 onClick={handleImageUpload}
//                                                 disabled={isUploading || isSaving}
//                                             >
//                                                 {isUploading ? 'Uploading...' : 'Upload Image'}
//                                             </button>
//                                         )}

//                                         {isUploading && uploadSection === 'premium' && (
//                                             <div className="progress-container">
//                                                 <div
//                                                     className="progress-bar"
//                                                     style={{ width: `${uploadProgress}%` }}
//                                                 />
//                                                 <span className="progress-text">{uploadProgress}%</span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="premium-form">
//                                     <div className="form-group">
//                                         <label>Product Name:</label>
//                                         <input
//                                             type="text"
//                                             value={premiumSelections[selectedPremiumIndex].name}
//                                             onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'name', e.target.value)}
//                                             disabled={isSaving}
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Description:</label>
//                                         <textarea
//                                             value={premiumSelections[selectedPremiumIndex].description}
//                                             onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'description', e.target.value)}
//                                             disabled={isSaving}
//                                             rows={3}
//                                         />
//                                     </div>

//                                     <div className="form-row">
//                                         <div className="form-group">
//                                             <label>Price (₹):</label>
//                                             <input
//                                                 type="number"
//                                                 value={premiumSelections[selectedPremiumIndex].price}
//                                                 onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'price', e.target.value)}
//                                                 disabled={isSaving}
//                                                 min={0}
//                                             />
//                                         </div>

//                                         <div className="form-group">
//                                             <label>Origin:</label>
//                                             <input
//                                                 type="text"
//                                                 value={premiumSelections[selectedPremiumIndex].origin}
//                                                 onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'origin', e.target.value)}
//                                                 disabled={isSaving}
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="form-actions">
//                                         <button
//                                             className="save-button"
//                                             onClick={() => savePremiumSelection(selectedPremiumIndex)}
//                                             disabled={isSaving}
//                                         >
//                                             {isSaving ? 'Saving...' : 'Save Premium Selection'}
//                                         </button>

//                                         <button
//                                             className="delete-button"
//                                             onClick={() => deletePremiumSelection(selectedPremiumIndex)}
//                                             disabled={isSaving}
//                                         >
//                                             Delete Premium Selection
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Combo Packs Section */}
//             {activeSection === 'combos' && (
//                 <div className="section-container combos-section">
//                     <div className="section-header">
//                         <h3>Manage Combo Packs</h3>
//                         <button 
//                             onClick={addNewComboPack}
//                             disabled={isSaving}
//                         >
//                             Add New Combo Pack
//                         </button>
//                     </div>

//                     <div className="section-content">
//                         <div className="combos-list">
//                             {comboPacks.map((combo, index) => (
//                                 <div 
//                                     key={combo.id} 
//                                     className={`combo-item ${selectedComboIndex === index ? 'selected' : ''}`}
//                                     onClick={() => setSelectedComboIndex(index)}
//                                 >
//                                     <div className="combo-item-title">{combo.name}</div>
//                                     <div className="combo-item-price">
//                                         <span className="combo-current-price">₹{combo.price}</span>
//                                         <span className="combo-original-price">₹{combo.originalPrice}</span>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {selectedComboIndex !== -1 && (
//                             <div className="combo-editor">
//                                 <div className="combo-preview">
//                                     <img 
//                                         src={comboPacks[selectedComboIndex].image || `https://via.placeholder.com/800x600?text=${comboPacks[selectedComboIndex].name}`} 
//                                         alt={comboPacks[selectedComboIndex].name}
//                                         className="combo-image-preview"
//                                     />
//                                     <div className="upload-container">
//                                         <input
//                                             type="file"
//                                             accept="image/*"
//                                             onChange={(e) => handleFileChange(e, 'combo', comboPacks[selectedComboIndex].id.toString())}
//                                             disabled={isUploading || isSaving}
//                                         />
//                                         {uploadFile && uploadSection === 'combo' && (
//                                             <button
//                                                 className="upload-button"
//                                                 onClick={handleImageUpload}
//                                                 disabled={isUploading || isSaving}
//                                             >
//                                                 {isUploading ? 'Uploading...' : 'Upload Image'}
//                                             </button>
//                                         )}

//                                         {isUploading && uploadSection === 'combo' && (
//                                             <div className="progress-container">
//                                                 <div
//                                                     className="progress-bar"
//                                                     style={{ width: `${uploadProgress}%` }}
//                                                 />
//                                                 <span className="progress-text">{uploadProgress}%</span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="combo-form">
//                                     <div className="form-group">
//                                         <label>Combo Name:</label>
//                                         <input
//                                             type="text"
//                                             value={comboPacks[selectedComboIndex].name}
//                                             onChange={(e) => handleComboInputChange(selectedComboIndex, 'name', e.target.value)}
//                                             disabled={isSaving}
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Items (separated by +):</label>
//                                         <textarea
//                                             value={comboPacks[selectedComboIndex].items}
//                                             onChange={(e) => handleComboInputChange(selectedComboIndex, 'items', e.target.value)}
//                                             disabled={isSaving}
//                                             rows={2}
//                                             placeholder="Item 1 + Item 2 + Item 3"
//                                         />
//                                     </div>

//                                     <div className="form-row">
//                                         <div className="form-group">
//                                             <label>Original Price (₹):</label>
//                                             <input
//                                                 type="number"
//                                                 value={comboPacks[selectedComboIndex].originalPrice}
//                                                 onChange={(e) => handleComboInputChange(selectedComboIndex, 'originalPrice', e.target.value)}
//                                                 disabled={isSaving}
//                                                 min={0}
//                                             />
//                                         </div>

//                                         <div className="form-group">
//                                             <label>Sale Price (₹):</label>
//                                             <input
//                                                 type="number"
//                                                 value={comboPacks[selectedComboIndex].price}
//                                                 onChange={(e) => handleComboInputChange(selectedComboIndex, 'price', e.target.value)}
//                                                 disabled={isSaving}
//                                                 min={0}
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Savings Text:</label>
//                                         <input
//                                             type="text"
//                                             value={comboPacks[selectedComboIndex].savings}
//                                             onChange={(e) => handleComboInputChange(selectedComboIndex, 'savings', e.target.value)}
//                                             disabled={isSaving}
//                                             placeholder="Save ₹X"
//                                         />
//                                     </div>

//                                     <div className="form-actions">
//                                         <button
//                                             className="save-button"
//                                             onClick={() => saveCombopack(selectedComboIndex)}
//                                             disabled={isSaving}
//                                         >
//                                             {isSaving ? 'Saving...' : 'Save Combo Pack'}
//                                         </button>

//                                         <button
//                                             className="delete-button"
//                                             onClick={() => deleteComboPack(selectedComboIndex)}
//                                             disabled={isSaving}
//                                         >
//                                             Delete Combo Pack
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Testimonials Section */}
//             {activeSection === 'testimonials' && (
//                 <div className="section-container testimonials-section">
//                     <div className="section-header">
//                         <h3>Manage Testimonials</h3>
//                         <button 
//                             onClick={addNewTestimonial}
//                             disabled={isSaving}
//                         >
//                             Add New Testimonial
//                         </button>
//                     </div>

//                     <div className="section-content">
//                         <div className="testimonials-list">
//                             {testimonials.map((testimonial, index) => (
//                                 <div 
//                                     key={testimonial.id} 
//                                     className={`testimonial-item ${selectedTestimonialIndex === index ? 'selected' : ''}`}
//                                     onClick={() => setSelectedTestimonialIndex(index)}
//                                 >
//                                     <div className="testimonial-item-name">{testimonial.name}</div>
//                                     <div className="testimonial-item-rating">
//                                         {Array.from({ length: testimonial.rating }, (_, i) => (
//                                             <span key={i} className="star">★</span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {selectedTestimonialIndex !== -1 && (
//                             <div className="testimonial-editor">
//                                 <div className="testimonial-preview">
//                                     <img 
//                                         src={testimonials[selectedTestimonialIndex].image || `https://via.placeholder.com/200x200?text=${testimonials[selectedTestimonialIndex].name.split(' ')[0]}`} 
//                                         alt={testimonials[selectedTestimonialIndex].name}
//                                         className="testimonial-image-preview"
//                                     />
//                                     <div className="upload-container">
//                                         <input
//                                             type="file"
//                                             accept="image/*"
//                                             onChange={(e) => handleFileChange(e, 'testimonial', testimonials[selectedTestimonialIndex].id.toString())}
//                                             disabled={isUploading || isSaving}
//                                         />
//                                         {uploadFile && uploadSection === 'testimonial' && (
//                                             <button
//                                                 className="upload-button"
//                                                 onClick={handleImageUpload}
//                                                 disabled={isUploading || isSaving}
//                                             >
//                                                 {isUploading ? 'Uploading...' : 'Upload Image'}
//                                             </button>
//                                         )}

//                                         {isUploading && uploadSection === 'testimonial' && (
//                                             <div className="progress-container">
//                                                 <div
//                                                     className="progress-bar"
//                                                     style={{ width: `${uploadProgress}%` }}
//                                                 />
//                                                 <span className="progress-text">{uploadProgress}%</span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="testimonial-form">
//                                     <div className="form-group">
//                                         <label>Customer Name:</label>
//                                         <input
//                                             type="text"
//                                             value={testimonials[selectedTestimonialIndex].name}
//                                             onChange={(e) => handleTestimonialInputChange(selectedTestimonialIndex, 'name', e.target.value)}
//                                             disabled={isSaving}
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Review Text:</label>
//                                         <textarea
//                                             value={testimonials[selectedTestimonialIndex].text}
//                                             onChange={(e) => handleTestimonialInputChange(selectedTestimonialIndex, 'text', e.target.value)}
//                                             disabled={isSaving}
//                                             rows={4}
//                                         />
//                                     </div>

//                                     <div className="form-row">
//                                         <div className="form-group">
//                                             <label>Rating (1-5):</label>
//                                             <input
//                                                 type="number"
//                                                 value={testimonials[selectedTestimonialIndex].rating}
//                                                 onChange={(e) => handleTestimonialInputChange(selectedTestimonialIndex, 'rating', e.target.value)}
//                                                 disabled={isSaving}
//                                                 min={1}
//                                                 max={5}
//                                             />
//                                         </div>

//                                         <div className="form-group">
//                                             <label>Date:</label>
//                                             <input
//                                                 type="text"
//                                                 value={testimonials[selectedTestimonialIndex].date}
//                                                 onChange={(e) => handleTestimonialInputChange(selectedTestimonialIndex, 'date', e.target.value)}
//                                                 disabled={isSaving}
//                                                 placeholder="e.g., 2 weeks ago"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="form-actions">
//                                         <button
//                                             className="save-button"
//                                             onClick={() => saveTestimonial(selectedTestimonialIndex)}
//                                             disabled={isSaving}
//                                         >
//                                             {isSaving ? 'Saving...' : 'Save Testimonial'}
//                                         </button>

//                                         <button
//                                             className="delete-button"
//                                             onClick={() => deleteTestimonial(selectedTestimonialIndex)}
//                                             disabled={isSaving}
//                                         >
//                                             Delete Testimonial
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Promotional Content Section */}
//             {activeSection === 'promo' && (
//                 <div className="section-container promo-section">
//                     <div className="section-header">
//                         <h3>Manage Promotional Content</h3>
//                     </div>

//                     <div className="section-content">
//                         <div className="promo-editor">
//                             <div className="promo-preview">
//                                 <h4>Promo Banner Image</h4>
//                                 <img 
//                                     src={promoContent.promoImage || `https://via.placeholder.com/800x600?text=Promo+Banner`} 
//                                     alt="Promotional Banner"
//                                     className="promo-image-preview"
//                                 />
//                                 <div className="upload-container">
//                                     <input
//                                         type="file"
//                                         accept="image/*"
//                                         onChange={(e) => handleFileChange(e, 'promo', 'promoImage')}
//                                         disabled={isUploading || isSaving}
//                                     />
//                                     {uploadFile && uploadSection === 'promo' && (
//                                         <button
//                                             className="upload-button"
//                                             onClick={handleImageUpload}
//                                             disabled={isUploading || isSaving}
//                                         >
//                                             {isUploading ? 'Uploading...' : 'Upload Image'}
//                                         </button>
//                                     )}

//                                     {isUploading && uploadSection === 'promo' && (
//                                         <div className="progress-container">
//                                             <div
//                                                 className="progress-bar"
//                                                 style={{ width: `${uploadProgress}%` }}
//                                             />
//                                             <span className="progress-text">{uploadProgress}%</span>
//                                         </div>
//                                     )}
//                                 </div>

//                                 <h4>App Preview Image</h4>
//                                 <img 
//                                     src={promoContent.appPreviewImage || `https://via.placeholder.com/300x600?text=App+Preview`} 
//                                     alt="App Preview"
//                                     className="app-image-preview"
//                                 />
//                                 <div className="upload-container">
//                                     <input
//                                         type="file"
//                                         accept="image/*"
//                                         onChange={(e) => handleFileChange(e, 'appPreview', 'appPreviewImage')}
//                                         disabled={isUploading || isSaving}
//                                     />
//                                     {uploadFile && uploadSection === 'appPreview' && (
//                                         <button
//                                             className="upload-button"
//                                             onClick={handleImageUpload}
//                                             disabled={isUploading || isSaving}
//                                         >
//                                             {isUploading ? 'Uploading...' : 'Upload Image'}
//                                         </button>
//                                     )}

//                                     {isUploading && uploadSection === 'appPreview' && (
//                                         <div className="progress-container">
//                                             <div
//                                                 className="progress-bar"
//                                                 style={{ width: `${uploadProgress}%` }}
//                                             />
//                                             <span className="progress-text">{uploadProgress}%</span>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="promo-form">
//                                 <div className="form-group">
//                                     <label>Promotion Tag:</label>
//                                     <input
//                                         type="text"
//                                         value={promoContent.title}
//                                         onChange={(e) => handlePromoInputChange('title', e.target.value)}
//                                         disabled={isSaving}
//                                         placeholder="e.g., Limited Time Offer"
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Promotion Title:</label>
//                                     <input
//                                         type="text"
//                                         value={promoContent.subtitle}
//                                         onChange={(e) => handlePromoInputChange('subtitle', e.target.value)}
//                                         disabled={isSaving}
//                                         placeholder="e.g., First Order Discount"
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Description:</label>
//                                     <textarea
//                                         value={promoContent.description}
//                                         onChange={(e) => handlePromoInputChange('description', e.target.value)}
//                                         disabled={isSaving}
//                                         rows={2}
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Promo Code:</label>
//                                     <input
//                                         type="text"
//                                         value={promoContent.promoCode}
//                                         onChange={(e) => handlePromoInputChange('promoCode', e.target.value)}
//                                         disabled={isSaving}
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Features:</label>
//                                     <div className="features-container">
//                                         {promoContent.features.map((feature, index) => (
//                                             <div key={index} className="feature-item">
//                                                 <input
//                                                     type="text"
//                                                     value={feature}
//                                                     onChange={(e) => updatePromoFeature(index, e.target.value)}
//                                                     disabled={isSaving}
//                                                 />
//                                                 <button
//                                                     className="remove-feature-button"
//                                                     onClick={() => removePromoFeature(index)}
//                                                     disabled={isSaving}
//                                                 >
//                                                     <FaTrash />
//                                                 </button>
//                                             </div>
//                                         ))}

//                                         <button
//                                             className="add-feature-button"
//                                             onClick={addPromoFeature}
//                                             disabled={isSaving}
//                                         >
//                                             <FaPlus /> Add Feature
//                                         </button>
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Button Text:</label>
//                                         <input
//                                             type="text"
//                                             value={promoContent.buttonText}
//                                             onChange={(e) => handlePromoInputChange('buttonText', e.target.value)}
//                                             disabled={isSaving}
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Button Link:</label>
//                                         <input
//                                             type="text"
//                                             value={promoContent.buttonLink}
//                                             onChange={(e) => handlePromoInputChange('buttonLink', e.target.value)}
//                                             disabled={isSaving}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-actions">
//                                     <button
//                                         className="save-button"
//                                         onClick={savePromoContent}
//                                         disabled={isSaving}
//                                     >
//                                         {isSaving ? 'Saving...' : 'Save Promotional Content'}
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default HomePageManagement;


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
import './HomePageManagement.css';
import { FaCheckCircle, FaTrash, FaPlus, FaEdit, FaArrowUp, FaArrowDown, FaClock } from 'react-icons/fa';

const HomePageManagement = () => {
    // Section to edit
    const [activeSection, setActiveSection] = useState('categories');

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Data states for each section
    const [categories, setCategories] = useState([]);
    const [premiumSelections, setPremiumSelections] = useState([]);
    const [comboPacks, setComboPacks] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [promoContent, setPromoContent] = useState({
        title: 'Limited Time Offer',
        subtitle: 'First Order Discount',
        description: 'Get 20% off on your first order with code:',
        promoCode: 'FRESH20',
        features: [
            'Free delivery on orders above ₹500',
            'Premium quality guaranteed',
            'Easy returns within 24 hours'
        ],
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        // Adding scheduling fields
        isActive: true,
        startDate: '',
        endDate: '',
        schedulingEnabled: false
    });

    // Selected item states
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
    const [selectedPremiumIndex, setSelectedPremiumIndex] = useState(-1);
    const [selectedComboIndex, setSelectedComboIndex] = useState(-1);
    const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState(-1);

    // Scheduling toggle states
    const [premiumSchedulingEnabled, setPremiumSchedulingEnabled] = useState(false);
    const [comboSchedulingEnabled, setComboSchedulingEnabled] = useState(false);
    const [promoSchedulingEnabled, setPromoSchedulingEnabled] = useState(false);

    // Temp states for adding new items
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryItem, setNewCategoryItem] = useState('');

    // Upload states
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadSection, setUploadSection] = useState('');
    const [uploadItemId, setUploadItemId] = useState('');

    // Fetch all data when component mounts
    useEffect(() => {
        fetchAllData();
    }, []);

    // Fetch all data from Firebase
    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchCategories(),
                fetchPremiumSelections(),
                fetchComboPacks(),
                fetchTestimonials(),
                fetchPromoContent()
            ]);
        } catch (error) {
            console.error("Error fetching homepage data:", error);
            setError("Failed to load homepage data from database");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const categoriesRef = dbRef(database, 'homeCategories');
            const snapshot = await get(categoriesRef);

            if (snapshot.exists()) {
                const categoriesData = snapshot.val();
                // Convert from object to array if needed
                const categoriesArray = Array.isArray(categoriesData)
                    ? categoriesData
                    : Object.values(categoriesData);

                // Fetch images for each category
                const categoriesWithImages = await Promise.all(
                    categoriesArray.map(async (category) => {
                        try {
                            const imageURL = await getMostRecentImage(`homeCategories/${category.title.toLowerCase()}`);
                            return { ...category, image: imageURL };
                        } catch (error) {
                            console.error(`Error fetching image for ${category.title}:`, error);
                            return {
                                ...category,
                                image: `https://via.placeholder.com/800x600?text=${category.title}`
                            };
                        }
                    })
                );

                setCategories(categoriesWithImages);
            } else {
                // Set default categories
                setCategories([
                    {
                        id: 1,
                        title: "Chicken",
                        imageFolderPath: "homeCategories/chicken",
                        items: ["Whole Chicken", "Boneless", "Curry Cut", "Wings", "Leg Piece"]
                    },
                    {
                        id: 2,
                        title: "Mutton",
                        imageFolderPath: "homeCategories/mutton",
                        items: ["Curry Cut", "Boneless", "Chops", "Biryani Cut", "Keema"]
                    },
                    {
                        id: 3,
                        title: "Fish & Seafood",
                        imageFolderPath: "homeCategories/fishSeafood",
                        items: ["Fish", "Prawns", "Crab", "Tuna", "Salmon"]
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    };

    // Fetch premium selections
    const fetchPremiumSelections = async () => {
        try {
            const premiumRef = dbRef(database, 'premiumSelections');
            const snapshot = await get(premiumRef);

            if (snapshot.exists()) {
                const premiumData = snapshot.val();
                // Convert from object to array if needed
                const premiumArray = Array.isArray(premiumData)
                    ? premiumData
                    : Object.values(premiumData);

                // Fetch images for each premium selection
                const premiumWithImages = await Promise.all(
                    premiumArray.map(async (item) => {
                        try {
                            const folderPath = `premiumSelections/${item.name.replace(/\s+/g, '').toLowerCase()}`;
                            const imageURL = await getMostRecentImage(folderPath);

                            // Add default timing fields if not present
                            if (!item.pricePromotion) {
                                item.pricePromotion = {
                                    isEnabled: false,
                                    startDate: '',
                                    endDate: '',
                                    regularPrice: item.price || 0,
                                    promotionalPrice: Math.round(item.price * 0.9) || 0 // 10% off default
                                };
                            }

                            // Add default scheduling fields if not present
                            if (item.startDate || item.endDate) {
                                item.schedulingEnabled = true;
                            } else {
                                item.schedulingEnabled = false;
                            }

                            // Add default isActive field if not present
                            if (item.isActive === undefined) {
                                item.isActive = true;
                            }

                            return { ...item, image: imageURL };
                        } catch (error) {
                            console.error(`Error fetching image for ${item.name}:`, error);
                            return {
                                ...item,
                                image: `https://via.placeholder.com/800x600?text=${item.name}`
                            };
                        }
                    })
                );

                setPremiumSelections(premiumWithImages);
            } else {
                // Set default premium selections
                setPremiumSelections([
                    {
                        id: 1,
                        name: "Premium Chicken Breast",
                        price: 399,
                        imageFolderPath: "premiumSelections/chickenBreast",
                        description: "Farm-raised antibiotic-free premium chicken breast",
                        origin: "Local Farms",
                        isActive: true,
                        schedulingEnabled: false,
                        startDate: '',
                        endDate: '',
                        pricePromotion: {
                            isEnabled: false,
                            startDate: '',
                            endDate: '',
                            regularPrice: 399,
                            promotionalPrice: 359
                        }
                    },
                    {
                        id: 2,
                        name: "Norwegian Salmon",
                        price: 1299,
                        imageFolderPath: "premiumSelections/norwegianSalmon",
                        description: "Wild caught Atlantic salmon, rich in Omega-3",
                        origin: "Norway",
                        isActive: true,
                        schedulingEnabled: false,
                        startDate: '',
                        endDate: '',
                        pricePromotion: {
                            isEnabled: false,
                            startDate: '',
                            endDate: '',
                            regularPrice: 1299,
                            promotionalPrice: 1099
                        }
                    },
                    {
                        id: 3,
                        name: "Premium Mutton Cuts",
                        price: 999,
                        imageFolderPath: "premiumSelections/premiumMutton",
                        description: "Grass-fed, free-range mutton with a rich flavor",
                        origin: "Local Farms",
                        isActive: true,
                        schedulingEnabled: false,
                        startDate: '',
                        endDate: '',
                        pricePromotion: {
                            isEnabled: false,
                            startDate: '',
                            endDate: '',
                            regularPrice: 999,
                            promotionalPrice: 899
                        }
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching premium selections:", error);
            throw error;
        }
    };

    // Fetch combo packs
    const fetchComboPacks = async () => {
        try {
            const comboRef = dbRef(database, 'comboPacks');
            const snapshot = await get(comboRef);

            if (snapshot.exists()) {
                const comboData = snapshot.val();
                // Convert from object to array if needed
                const comboArray = Array.isArray(comboData)
                    ? comboData
                    : Object.values(comboData);

                // Fetch images for each combo pack
                const combosWithImages = await Promise.all(
                    comboArray.map(async (combo) => {
                        try {
                            const folderPath = `comboPacks/${combo.name.replace(/\s+/g, '').toLowerCase()}`;
                            const imageURL = await getMostRecentImage(folderPath);

                            // Add default scheduling fields if not present
                            if (combo.startDate || combo.endDate) {
                                combo.schedulingEnabled = true;
                            } else {
                                combo.schedulingEnabled = false;
                            }

                            // Add default isActive field if not present
                            if (combo.isActive === undefined) {
                                combo.isActive = true;
                            }

                            // Add default discountPromotion if not present
                            if (!combo.discountPromotion) {
                                combo.discountPromotion = {
                                    isEnabled: false,
                                    startDate: '',
                                    endDate: '',
                                    discountText: combo.savings || ''
                                };
                            }

                            return { ...combo, image: imageURL };
                        } catch (error) {
                            console.error(`Error fetching image for ${combo.name}:`, error);
                            return {
                                ...combo,
                                image: `https://via.placeholder.com/800x600?text=${combo.name}`
                            };
                        }
                    })
                );

                setComboPacks(combosWithImages);
            } else {
                // Set default combo packs
                setComboPacks([
                    {
                        id: 1,
                        name: "Meat Lover's Pack",
                        items: "Chicken Drumsticks + Mutton Curry Cut + Fish Fillets",
                        price: 999,
                        originalPrice: 1299,
                        imageFolderPath: "comboPacks/meatLovers",
                        savings: "Save ₹300",
                        isActive: true,
                        schedulingEnabled: false,
                        startDate: '',
                        endDate: '',
                        discountPromotion: {
                            isEnabled: false,
                            startDate: '',
                            endDate: '',
                            discountText: "Save ₹300"
                        }
                    },
                    {
                        id: 2,
                        name: "Premium Seafood Pack",
                        items: "Norwegian Salmon + Prawns + Fish Curry Cut",
                        price: 1499,
                        originalPrice: 1999,
                        imageFolderPath: "comboPacks/premiumSeafood",
                        savings: "Save ₹500",
                        isActive: true,
                        schedulingEnabled: false,
                        startDate: '',
                        endDate: '',
                        discountPromotion: {
                            isEnabled: false,
                            startDate: '',
                            endDate: '',
                            discountText: "Save ₹500"
                        }
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching combo packs:", error);
            throw error;
        }
    };

    // Fetch testimonials
    const fetchTestimonials = async () => {
        try {
            const testimonialsRef = dbRef(database, 'testimonials');
            const snapshot = await get(testimonialsRef);

            if (snapshot.exists()) {
                const testimonialsData = snapshot.val();
                // Convert from object to array if needed
                const testimonialsArray = Array.isArray(testimonialsData)
                    ? testimonialsData
                    : Object.values(testimonialsData);

                // Fetch images for each testimonial
                const testimonialsWithImages = await Promise.all(
                    testimonialsArray.map(async (testimonial) => {
                        try {
                            const folderPath = `testimonials/customers/${testimonial.name.split(' ')[0].toLowerCase()}`;
                            const imageURL = await getMostRecentImage(folderPath);
                            return { ...testimonial, image: imageURL };
                        } catch (error) {
                            console.error(`Error fetching image for ${testimonial.name}:`, error);
                            return {
                                ...testimonial,
                                image: `https://via.placeholder.com/200x200?text=${testimonial.name.split(' ')[0]}`
                            };
                        }
                    })
                );

                setTestimonials(testimonialsWithImages);
            } else {
                // Set default testimonials
                setTestimonials([
                    {
                        id: 1,
                        name: "Priya S.",
                        rating: 5,
                        text: "The quality of chicken is exceptional! I've been ordering for 6 months now and have never been disappointed. The chicken is always fresh and the delivery is prompt.",
                        imageFolderPath: "testimonials/customers/priya",
                        date: "3 weeks ago"
                    },
                    {
                        id: 2,
                        name: "Rajesh K.",
                        rating: 5,
                        text: "Best seafood in town. Their fish is always fresh and perfectly cleaned. The packaging is excellent and the delivery is always on time.",
                        imageFolderPath: "testimonials/customers/rajesh",
                        date: "1 month ago"
                    },
                    {
                        id: 3,
                        name: "Ananya M.",
                        rating: 4,
                        text: "Great variety of mutton cuts and excellent customer service. The quality is superior to what I get from local markets. Highly recommend!",
                        imageFolderPath: "testimonials/customers/ananya",
                        date: "2 months ago"
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching testimonials:", error);
            throw error;
        }
    };

    // Fetch promo content
    const fetchPromoContent = async () => {
        try {
            const promoRef = dbRef(database, 'promoContent');
            const snapshot = await get(promoRef);

            if (snapshot.exists()) {
                const promoData = snapshot.val();

                // Check if scheduling data exists in the promo content
                const hasScheduling = promoData.startDate || promoData.endDate;
                const schedulingEnabled = hasScheduling || (promoData.schedulingEnabled === true);

                setPromoContent({
                    ...promoData,
                    schedulingEnabled: schedulingEnabled
                });

                setPromoSchedulingEnabled(schedulingEnabled);
            }

            // Also get promo images
            try {
                const promoImageURL = await getMostRecentImage("promotions/specialOffer");
                const appPreviewImageURL = await getMostRecentImage("promotions/appPreview");

                setPromoContent(prev => ({
                    ...prev,
                    promoImage: promoImageURL,
                    appPreviewImage: appPreviewImageURL
                }));
            } catch (error) {
                console.error("Error fetching promo images:", error);
            }
        } catch (error) {
            console.error("Error fetching promo content:", error);
            throw error;
        }
    };

    // Function to get the most recent image from a folder
    const getMostRecentImage = async (folderPath) => {
        try {
            const folderRef = storageRef(storage, folderPath);
            const fileList = await listAll(folderRef);

            if (fileList.items.length === 0) {
                console.warn(`No images found in ${folderPath}`);
                return `https://via.placeholder.com/800x600?text=No+Images+In+${folderPath.replace(/\//g, '+')}`;
            }

            // Sort files by name to get the most recent one (timestamp-based naming)
            const sortedItems = [...fileList.items].sort((a, b) => {
                // Extract timestamps if present in the filename (e.g., image_1648293647123.jpg)
                const getTimestamp = (name) => {
                    const match = name.match(/image_(\d+)/);
                    return match ? parseInt(match[1]) : 0;
                };

                const timestampA = getTimestamp(a.name);
                const timestampB = getTimestamp(b.name);

                // Return newest first
                return timestampB - timestampA;
            });

            // Get the URL of the most recent image
            const imageURL = await getDownloadURL(sortedItems[0]);
            return imageURL;
        } catch (error) {
            console.error(`Error fetching images from ${folderPath}:`, error);
            return `https://via.placeholder.com/800x600?text=Error+Loading+Images+From+${folderPath.replace(/\//g, '+')}`;
        }
    };

    // Handle file selection for image upload
    const handleFileChange = (e, section, itemId) => {
        if (e.target.files[0]) {
            setUploadFile(e.target.files[0]);
            setUploadSection(section);
            setUploadItemId(itemId);
            clearMessages();
        }
    };

    // Handle image upload
    const handleImageUpload = async () => {
        if (!uploadFile || !uploadSection) {
            setError("No file selected or upload destination specified");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        clearMessages();

        try {
            // Generate a timestamp to ensure uniqueness and enable sorting by recency
            const timestamp = new Date().getTime();
            const fileExt = uploadFile.name.split('.').pop();

            // Determine the storage path based on section and item
            let storagePath = '';

            if (uploadSection === 'category') {
                const category = categories.find(c => c.id.toString() === uploadItemId);
                if (!category) {
                    throw new Error("Category not found");
                }
                storagePath = `homeCategories/${category.title.toLowerCase()}/image_${timestamp}.${fileExt}`;
            } else if (uploadSection === 'premium') {
                const premium = premiumSelections.find(p => p.id.toString() === uploadItemId);
                if (!premium) {
                    throw new Error("Premium selection not found");
                }
                storagePath = `premiumSelections/${premium.name.replace(/\s+/g, '').toLowerCase()}/image_${timestamp}.${fileExt}`;
            } else if (uploadSection === 'combo') {
                const combo = comboPacks.find(c => c.id.toString() === uploadItemId);
                if (!combo) {
                    throw new Error("Combo pack not found");
                }
                storagePath = `comboPacks/${combo.name.replace(/\s+/g, '').toLowerCase()}/image_${timestamp}.${fileExt}`;
            } else if (uploadSection === 'testimonial') {
                const testimonial = testimonials.find(t => t.id.toString() === uploadItemId);
                if (!testimonial) {
                    throw new Error("Testimonial not found");
                }
                const firstName = testimonial.name.split(' ')[0].toLowerCase();
                storagePath = `testimonials/customers/${firstName}/image_${timestamp}.${fileExt}`;
            } else if (uploadSection === 'promo') {
                storagePath = `promotions/specialOffer/image_${timestamp}.${fileExt}`;
            } else if (uploadSection === 'appPreview') {
                storagePath = `promotions/appPreview/image_${timestamp}.${fileExt}`;
            } else {
                throw new Error("Invalid upload section");
            }

            // Upload the image
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

                        // Update the appropriate state based on section
                        if (uploadSection === 'category') {
                            setCategories(prev =>
                                prev.map(cat =>
                                    cat.id.toString() === uploadItemId
                                        ? { ...cat, image: downloadURL }
                                        : cat
                                )
                            );
                        } else if (uploadSection === 'premium') {
                            setPremiumSelections(prev =>
                                prev.map(item =>
                                    item.id.toString() === uploadItemId
                                        ? { ...item, image: downloadURL }
                                        : item
                                )
                            );
                        } else if (uploadSection === 'combo') {
                            setComboPacks(prev =>
                                prev.map(combo =>
                                    combo.id.toString() === uploadItemId
                                        ? { ...combo, image: downloadURL }
                                        : combo
                                )
                            );
                        } else if (uploadSection === 'testimonial') {
                            setTestimonials(prev =>
                                prev.map(testimonial =>
                                    testimonial.id.toString() === uploadItemId
                                        ? { ...testimonial, image: downloadURL }
                                        : testimonial
                                )
                            );
                        } else if (uploadSection === 'promo') {
                            setPromoContent(prev => ({
                                ...prev,
                                promoImage: downloadURL
                            }));
                        } else if (uploadSection === 'appPreview') {
                            setPromoContent(prev => ({
                                ...prev,
                                appPreviewImage: downloadURL
                            }));
                        }

                        setIsUploading(false);
                        setUploadFile(null);
                        setUploadSection('');
                        setUploadItemId('');

                        // Reset the file input
                        const fileInput = document.getElementById('image-upload-input');
                        if (fileInput) fileInput.value = '';

                        setSuccessMessage("Image uploaded successfully!");
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

    // Save category data
    const saveCategory = async (index) => {
        if (index < 0 || index >= categories.length) {
            setError("Invalid category index");
            return;
        }

        const category = categories[index];

        // Validate
        if (!category.title || category.items.length === 0) {
            setError("Category title and items are required");
            return;
        }

        setIsSaving(true);
        clearMessages();

        try {
            const categoryRef = dbRef(database, `homeCategories/${index}`);
            await set(categoryRef, category);
            setSuccessMessage("Category saved successfully!");
        } catch (error) {
            console.error("Error saving category:", error);
            setError(`Failed to save category: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Save premium selection data
    const savePremiumSelection = async (index) => {
        if (index < 0 || index >= premiumSelections.length) {
            setError("Invalid premium selection index");
            return;
        }

        const premium = premiumSelections[index];

        // Validate
        if (!premium.name || !premium.description || !premium.price) {
            setError("Name, description, and price are required");
            return;
        }

        // Validate scheduling dates if enabled
        if (premium.schedulingEnabled) {
            if (!premium.startDate && !premium.endDate) {
                setError("Please set at least one of start date or end date for scheduling");
                return;
            }

            if (premium.startDate && premium.endDate && new Date(premium.startDate) > new Date(premium.endDate)) {
                setError("End date must be after start date");
                return;
            }
        }

        // Validate price promotion dates if enabled
        if (premium.pricePromotion && premium.pricePromotion.isEnabled) {
            if (premium.pricePromotion.startDate && premium.pricePromotion.endDate &&
                new Date(premium.pricePromotion.startDate) > new Date(premium.pricePromotion.endDate)) {
                setError("Price promotion end date must be after start date");
                return;
            }
        }

        setIsSaving(true);
        clearMessages();

        try {
            // Prepare data to save - remove scheduling fields if not enabled
            const dataToSave = { ...premium };

            if (!dataToSave.schedulingEnabled) {
                delete dataToSave.startDate;
                delete dataToSave.endDate;
            }

            const premiumRef = dbRef(database, `premiumSelections/${index}`);
            await set(premiumRef, dataToSave);
            setSuccessMessage("Premium selection saved successfully!");
        } catch (error) {
            console.error("Error saving premium selection:", error);
            setError(`Failed to save premium selection: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Save combo pack data
    const saveCombopack = async (index) => {
        if (index < 0 || index >= comboPacks.length) {
            setError("Invalid combo pack index");
            return;
        }

        const combo = comboPacks[index];

        // Validate
        if (!combo.name || !combo.items || !combo.price || !combo.originalPrice) {
            setError("Name, items, price, and original price are required");
            return;
        }

        // Validate scheduling dates if enabled
        if (combo.schedulingEnabled) {
            if (!combo.startDate && !combo.endDate) {
                setError("Please set at least one of start date or end date for scheduling");
                return;
            }

            if (combo.startDate && combo.endDate && new Date(combo.startDate) > new Date(combo.endDate)) {
                setError("End date must be after start date");
                return;
            }
        }

        // Validate discount promotion dates if enabled
        if (combo.discountPromotion && combo.discountPromotion.isEnabled) {
            if (combo.discountPromotion.startDate && combo.discountPromotion.endDate &&
                new Date(combo.discountPromotion.startDate) > new Date(combo.discountPromotion.endDate)) {
                setError("Discount promotion end date must be after start date");
                return;
            }
        }

        setIsSaving(true);
        clearMessages();

        try {
            // Prepare data to save - remove scheduling fields if not enabled
            const dataToSave = { ...combo };

            if (!dataToSave.schedulingEnabled) {
                delete dataToSave.startDate;
                delete dataToSave.endDate;
            }

            const comboRef = dbRef(database, `comboPacks/${index}`);
            await set(comboRef, dataToSave);
            setSuccessMessage("Combo pack saved successfully!");
        } catch (error) {
            console.error("Error saving combo pack:", error);
            setError(`Failed to save combo pack: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Save testimonial data
    const saveTestimonial = async (index) => {
        if (index < 0 || index >= testimonials.length) {
            setError("Invalid testimonial index");
            return;
        }

        const testimonial = testimonials[index];

        // Validate
        if (!testimonial.name || !testimonial.text || !testimonial.rating) {
            setError("Name, text, and rating are required");
            return;
        }

        setIsSaving(true);
        clearMessages();

        try {
            const testimonialRef = dbRef(database, `testimonials/${index}`);
            await set(testimonialRef, testimonial);
            setSuccessMessage("Testimonial saved successfully!");
        } catch (error) {
            console.error("Error saving testimonial:", error);
            setError(`Failed to save testimonial: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Save promo content
    const savePromoContent = async () => {
        // Validate
        if (!promoContent.title || !promoContent.description) {
            setError("Title and description are required");
            return;
        }

        // Validate scheduling dates if enabled
        if (promoContent.schedulingEnabled) {
            if (!promoContent.startDate && !promoContent.endDate) {
                setError("Please set at least one of start date or end date for scheduling");
                return;
            }

            if (promoContent.startDate && promoContent.endDate &&
                new Date(promoContent.startDate) > new Date(promoContent.endDate)) {
                setError("End date must be after start date");
                return;
            }
        }

        setIsSaving(true);
        clearMessages();

        try {
            // Prepare data to save - remove scheduling fields if not enabled
            const dataToSave = { ...promoContent };

            if (!dataToSave.schedulingEnabled) {
                delete dataToSave.startDate;
                delete dataToSave.endDate;
            }

            const promoRef = dbRef(database, 'promoContent');
            await set(promoRef, dataToSave);
            setSuccessMessage("Promotional content saved successfully!");
        } catch (error) {
            console.error("Error saving promotional content:", error);
            setError(`Failed to save promotional content: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Add new category
    const addNewCategory = () => {
        if (!newCategoryName.trim()) {
            setError("Category name is required");
            return;
        }

        const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
        const newCategory = {
            id: newId,
            title: newCategoryName.trim(),
            imageFolderPath: `homeCategories/${newCategoryName.trim().toLowerCase()}`,
            items: []
        };

        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName('');
        setSelectedCategoryIndex(categories.length); // Select the new category
    };

    // Add new premium selection
    const addNewPremiumSelection = () => {
        const newId = Math.max(0, ...premiumSelections.map(p => p.id)) + 1;
        const newPremium = {
            id: newId,
            name: "New Premium Product",
            price: 0,
            imageFolderPath: "premiumSelections/newProduct",
            description: "Description of the new product",
            origin: "Local",
            isActive: true,
            schedulingEnabled: false,
            startDate: '',
            endDate: '',
            pricePromotion: {
                isEnabled: false,
                startDate: '',
                endDate: '',
                regularPrice: 0,
                promotionalPrice: 0
            }
        };

        setPremiumSelections(prev => [...prev, newPremium]);
        setSelectedPremiumIndex(premiumSelections.length); // Select the new premium selection
    };

    // Add new combo pack
    const addNewComboPack = () => {
        const newId = Math.max(0, ...comboPacks.map(c => c.id)) + 1;
        const newCombo = {
            id: newId,
            name: "New Combo Pack",
            items: "Item 1 + Item 2 + Item 3",
            price: 0,
            originalPrice: 0,
            imageFolderPath: "comboPacks/newCombo",
            savings: "Save ₹0",
            isActive: true,
            schedulingEnabled: false,
            startDate: '',
            endDate: '',
            discountPromotion: {
                isEnabled: false,
                startDate: '',
                endDate: '',
                discountText: "Save ₹0"
            }
        };

        setComboPacks(prev => [...prev, newCombo]);
        setSelectedComboIndex(comboPacks.length); // Select the new combo pack
    };

    // Add new testimonial
    const addNewTestimonial = () => {
        const newId = Math.max(0, ...testimonials.map(t => t.id)) + 1;
        const newTestimonial = {
            id: newId,
            name: "New Customer",
            rating: 5,
            text: "This customer's review text goes here.",
            imageFolderPath: "testimonials/customers/newcustomer",
            date: "Today"
        };

        setTestimonials(prev => [...prev, newTestimonial]);
        setSelectedTestimonialIndex(testimonials.length); // Select the new testimonial
    };

    // Add new category item
    const addCategoryItem = (categoryIndex) => {
        if (!newCategoryItem.trim()) {
            setError("Item name is required");
            return;
        }

        setCategories(prev => {
            const updatedCategories = [...prev];
            if (!updatedCategories[categoryIndex].items) {
                updatedCategories[categoryIndex].items = [];
            }
            updatedCategories[categoryIndex].items.push(newCategoryItem.trim());
            return updatedCategories;
        });

        setNewCategoryItem('');
    };

    // Remove category item
    const removeCategoryItem = (categoryIndex, itemIndex) => {
        setCategories(prev => {
            const updatedCategories = [...prev];
            updatedCategories[categoryIndex].items.splice(itemIndex, 1);
            return updatedCategories;
        });
    };

    // Update promo feature
    const updatePromoFeature = (index, value) => {
        setPromoContent(prev => {
            const updatedFeatures = [...prev.features];
            updatedFeatures[index] = value;
            return {
                ...prev,
                features: updatedFeatures
            };
        });
    };

    // Add promo feature
    const addPromoFeature = () => {
        setPromoContent(prev => ({
            ...prev,
            features: [...prev.features, "New feature"]
        }));
    };

    // Remove promo feature
    const removePromoFeature = (index) => {
        setPromoContent(prev => {
            const updatedFeatures = [...prev.features];
            updatedFeatures.splice(index, 1);
            return {
                ...prev,
                features: updatedFeatures
            };
        });
    };

    // Delete category
    const deleteCategory = async (index) => {
        if (!window.confirm("Are you sure you want to delete this category?")) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        try {
            // Delete from database
            await remove(dbRef(database, `homeCategories/${index}`));

            // Delete from state
            setCategories(prev => prev.filter((_, i) => i !== index));
            setSelectedCategoryIndex(-1);

            setSuccessMessage("Category deleted successfully!");
        } catch (error) {
            console.error("Error deleting category:", error);
            setError(`Failed to delete category: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete premium selection
    const deletePremiumSelection = async (index) => {
        if (!window.confirm("Are you sure you want to delete this premium selection?")) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        try {
            // Delete from database
            await remove(dbRef(database, `premiumSelections/${index}`));

            // Delete from state
            setPremiumSelections(prev => prev.filter((_, i) => i !== index));
            setSelectedPremiumIndex(-1);

            setSuccessMessage("Premium selection deleted successfully!");
        } catch (error) {
            console.error("Error deleting premium selection:", error);
            setError(`Failed to delete premium selection: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete combo pack
    const deleteComboPack = async (index) => {
        if (!window.confirm("Are you sure you want to delete this combo pack?")) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        try {
            // Delete from database
            await remove(dbRef(database, `comboPacks/${index}`));

            // Delete from state
            setComboPacks(prev => prev.filter((_, i) => i !== index));
            setSelectedComboIndex(-1);

            setSuccessMessage("Combo pack deleted successfully!");
        } catch (error) {
            console.error("Error deleting combo pack:", error);
            setError(`Failed to delete combo pack: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete testimonial
    const deleteTestimonial = async (index) => {
        if (!window.confirm("Are you sure you want to delete this testimonial?")) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        try {
            // Delete from database
            await remove(dbRef(database, `testimonials/${index}`));

            // Delete from state
            setTestimonials(prev => prev.filter((_, i) => i !== index));
            setSelectedTestimonialIndex(-1);

            setSuccessMessage("Testimonial deleted successfully!");
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            setError(`Failed to delete testimonial: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle input change for category data
    const handleCategoryInputChange = (index, field, value) => {
        setCategories(prev => {
            const updatedCategories = [...prev];
            updatedCategories[index][field] = value;
            return updatedCategories;
        });
    };

    // Handle input change for premium selection data
    const handlePremiumInputChange = (index, field, value) => {
        setPremiumSelections(prev => {
            const updatedPremium = [...prev];
            updatedPremium[index][field] = field === 'price' || field === 'isActive' ?
                (field === 'isActive' ? value : Number(value)) :
                value;
            return updatedPremium;
        });
    };

    // Handle premium selection scheduling toggle
    // const handlePremiumSchedulingToggle = (index) => {
    //     setPremiumSelections(prev => {
    //         const updatedPremium = [...prev];
    //         updatedPremium[index].schedulingEnabled = !updatedPremium[index].schedulingEnabled;

    //         // If disabling scheduling, clear the date fields
    //         if (!updatedPremium[index].schedulingEnabled) {
    //             updatedPremium[index].startDate = '';
    //             updatedPremium[index].endDate = '';
    //         }

    //         return updatedPremium;
    //     });
    // };
    const handlePremiumSchedulingToggle = (index) => {
        setPremiumSelections(prev => {
            const updatedPremium = prev.map((item, i) => {
                if (i === index) {
                    const newSchedulingEnabled = !item.schedulingEnabled;
                    return {
                        ...item,
                        schedulingEnabled: newSchedulingEnabled,
                        startDate: newSchedulingEnabled ? item.startDate : '',
                        endDate: newSchedulingEnabled ? item.endDate : ''
                    };
                }
                return item;
            });
            console.log('Updated Premium Selections (Scheduling Toggle):', updatedPremium);
            return updatedPremium;
        });
    };
    // Handle premium price promotion toggle
    // const handlePremiumPricePromotionToggle = (index) => {
    //     setPremiumSelections(prev => {
    //         const updatedPremium = [...prev];

    //         // Ensure pricePromotion exists
    //         if (!updatedPremium[index].pricePromotion) {
    //             updatedPremium[index].pricePromotion = {
    //                 isEnabled: false,
    //                 startDate: '',
    //                 endDate: '',
    //                 regularPrice: updatedPremium[index].price,
    //                 promotionalPrice: Math.round(updatedPremium[index].price * 0.9) // 10% off
    //             };
    //         }

    //         // Toggle the state
    //         updatedPremium[index].pricePromotion.isEnabled = !updatedPremium[index].pricePromotion.isEnabled;

    //         return updatedPremium;
    //     });
    // };
    const handlePremiumPricePromotionToggle = (index) => {
        setPremiumSelections(prev => {
            const updatedPremium = prev.map((i, idx) => {
                if (idx === index) {
                    const pricePromo = i.pricePromotion || {
                        isEnabled: false,
                        startDate: '',
                        endDate: '',
                        regularPrice: i.price || 0,
                        promotionalPrice: Math.round((i.price || 0) * 0.9)
                    };
                    return {
                        ...i,
                        pricePromotion: {
                            ...pricePromo,
                            isEnabled: !pricePromo.isEnabled
                        }
                    };
                }
                return i;
            });
            console.log('Updated Premium Selections (Price Promo Toggle):', updatedPremium);
            return updatedPremium;
        });
    };
    // Handle premium price promotion input change
    const handlePremiumPromotionInputChange = (index, field, value) => {
        setPremiumSelections(prev => {
            const updatedPremium = [...prev];

            // Ensure pricePromotion exists
            if (!updatedPremium[index].pricePromotion) {
                updatedPremium[index].pricePromotion = {
                    isEnabled: true,
                    startDate: '',
                    endDate: '',
                    regularPrice: updatedPremium[index].price,
                    promotionalPrice: Math.round(updatedPremium[index].price * 0.9) // 10% off
                };
            }

            // Update the specific field
            if (field === 'regularPrice' || field === 'promotionalPrice') {
                updatedPremium[index].pricePromotion[field] = Number(value);
            } else {
                updatedPremium[index].pricePromotion[field] = value;
            }

            return updatedPremium;
        });
    };

    // Handle input change for combo pack data
    const handleComboInputChange = (index, field, value) => {
        setComboPacks(prev => {
            const updatedCombos = [...prev];
            updatedCombos[index][field] = (field === 'price' || field === 'originalPrice' || field === 'isActive')
                ? (field === 'isActive' ? value : Number(value))
                : value;

            // Auto-calculate savings
            if (field === 'price' || field === 'originalPrice') {
                const savings = updatedCombos[index].originalPrice - updatedCombos[index].price;
                if (savings > 0) {
                    updatedCombos[index].savings = `Save ₹${savings}`;

                    // Update discount promotion text if it exists
                    if (updatedCombos[index].discountPromotion) {
                        updatedCombos[index].discountPromotion.discountText = `Save ₹${savings}`;
                    }
                }
            }

            return updatedCombos;
        });
    };

    // Handle combo scheduling toggle
    const handleComboSchedulingToggle = (index) => {
        setComboPacks(prev => {
            const updatedCombos = [...prev];
            updatedCombos[index].schedulingEnabled = !updatedCombos[index].schedulingEnabled;

            // If disabling scheduling, clear the date fields
            if (!updatedCombos[index].schedulingEnabled) {
                updatedCombos[index].startDate = '';
                updatedCombos[index].endDate = '';
            }

            return updatedCombos;
        });
    };

    // Handle combo discount promotion toggle
    const handleComboDiscountPromotionToggle = (index) => {
        setComboPacks(prev => {
            const updatedCombos = [...prev];

            // Ensure discountPromotion exists
            if (!updatedCombos[index].discountPromotion) {
                updatedCombos[index].discountPromotion = {
                    isEnabled: false,
                    startDate: '',
                    endDate: '',
                    discountText: updatedCombos[index].savings || `Save ₹${updatedCombos[index].originalPrice - updatedCombos[index].price}`
                };
            }

            // Toggle the state
            updatedCombos[index].discountPromotion.isEnabled = !updatedCombos[index].discountPromotion.isEnabled;

            return updatedCombos;
        });
    };

    // Handle combo discount promotion input change
    const handleComboPromotionInputChange = (index, field, value) => {
        setComboPacks(prev => {
            const updatedCombos = [...prev];

            // Ensure discountPromotion exists
            if (!updatedCombos[index].discountPromotion) {
                updatedCombos[index].discountPromotion = {
                    isEnabled: true,
                    startDate: '',
                    endDate: '',
                    discountText: updatedCombos[index].savings || ''
                };
            }

            // Update the specific field
            updatedCombos[index].discountPromotion[field] = value;

            return updatedCombos;
        });
    };

    // Handle input change for testimonial data
    const handleTestimonialInputChange = (index, field, value) => {
        setTestimonials(prev => {
            const updatedTestimonials = [...prev];
            updatedTestimonials[index][field] = field === 'rating'
                ? Math.min(5, Math.max(1, Number(value)))
                : value;
            return updatedTestimonials;
        });
    };

    // Handle input change for promo content
    const handlePromoInputChange = (field, value) => {
        setPromoContent(prev => ({
            ...prev,
            [field]: field === 'isActive' ? value : value
        }));
    };

    // Handle promo scheduling toggle
    const handlePromoSchedulingToggle = () => {
        setPromoContent(prev => {
            const updatedPromo = { ...prev };
            updatedPromo.schedulingEnabled = !updatedPromo.schedulingEnabled;

            // If disabling scheduling, clear the date fields
            if (!updatedPromo.schedulingEnabled) {
                updatedPromo.startDate = '';
                updatedPromo.endDate = '';
            }

            return updatedPromo;
        });

        setPromoSchedulingEnabled(!promoSchedulingEnabled);
    };

    // Clear error and success messages
    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    // Move category up or down in the list
    const moveCategoryPosition = (index, direction) => {
        if (direction === 'up' && index > 0) {
            setCategories(prev => {
                const updated = [...prev];
                [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
                return updated;
            });
            setSelectedCategoryIndex(index - 1);
        } else if (direction === 'down' && index < categories.length - 1) {
            setCategories(prev => {
                const updated = [...prev];
                [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                return updated;
            });
            setSelectedCategoryIndex(index + 1);
        }
    };

    // Move premium selection up or down in the list
    const movePremiumPosition = (index, direction) => {
        if (direction === 'up' && index > 0) {
            setPremiumSelections(prev => {
                const updated = [...prev];
                [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
                return updated;
            });
            setSelectedPremiumIndex(index - 1);
        } else if (direction === 'down' && index < premiumSelections.length - 1) {
            setPremiumSelections(prev => {
                const updated = [...prev];
                [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                return updated;
            });
            setSelectedPremiumIndex(index + 1);
        }
    };

    // Calculate and display premium status
    const getPremiumStatusDisplay = (premium) => {
        if (!premium) {
            return <span>Not available</span>;
        }

        const now = new Date();

        // Check if premium has scheduling
        if (premium.schedulingEnabled && (premium.startDate || premium.endDate)) {
            const startDate = premium.startDate ? new Date(premium.startDate) : null;
            const endDate = premium.endDate ? new Date(premium.endDate) : null;

            // Premium hasn't started yet
            if (startDate && now < startDate) {
                return (
                    <span className="status-scheduled">
                        Scheduled (starts on {startDate.toLocaleString()})
                    </span>
                );
            }

            // Premium has ended
            if (endDate && now > endDate) {
                return <span className="status-expired">Expired</span>;
            }

            // Premium is currently active within schedule
            if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
                return <span className="status-active">Active (Scheduled)</span>;
            }
        }

        // No scheduling, just check isActive flag
        return premium.isActive ?
            <span className="status-active">Active</span> :
            <span className="status-inactive">Inactive</span>;
    };

    // Calculate and display premium price promotion status
    const getPremiumPromotionStatus = (premium) => {
        if (!premium || !premium.pricePromotion || !premium.pricePromotion.isEnabled) {
            return <span className="status-inactive">Disabled</span>;
        }

        const now = new Date();
        const startDate = premium.pricePromotion.startDate ? new Date(premium.pricePromotion.startDate) : null;
        const endDate = premium.pricePromotion.endDate ? new Date(premium.pricePromotion.endDate) : null;

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

    // Calculate and display combo pack status
    const getComboStatusDisplay = (combo) => {
        if (!combo) {
            return <span>Not available</span>;
        }

        const now = new Date();

        // Check if combo has scheduling
        if (combo.schedulingEnabled && (combo.startDate || combo.endDate)) {
            const startDate = combo.startDate ? new Date(combo.startDate) : null;
            const endDate = combo.endDate ? new Date(combo.endDate) : null;

            // Combo hasn't started yet
            if (startDate && now < startDate) {
                return (
                    <span className="status-scheduled">
                        Scheduled (starts on {startDate.toLocaleString()})
                    </span>
                );
            }

            // Combo has ended
            if (endDate && now > endDate) {
                return <span className="status-expired">Expired</span>;
            }

            // Combo is currently active within schedule
            if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
                return <span className="status-active">Active (Scheduled)</span>;
            }
        }

        // No scheduling, just check isActive flag
        return combo.isActive ?
            <span className="status-active">Active</span> :
            <span className="status-inactive">Inactive</span>;
    };

    // Calculate and display combo discount promotion status
    const getComboDiscountPromotionStatus = (combo) => {
        if (!combo || !combo.discountPromotion || !combo.discountPromotion.isEnabled) {
            return <span className="status-inactive">Disabled</span>;
        }

        const now = new Date();
        const startDate = combo.discountPromotion.startDate ? new Date(combo.discountPromotion.startDate) : null;
        const endDate = combo.discountPromotion.endDate ? new Date(combo.discountPromotion.endDate) : null;

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

    // Calculate and display promo content status
    const getPromoStatusDisplay = () => {
        if (!promoContent) {
            return <span>Not available</span>;
        }

        const now = new Date();

        // Check if promo has scheduling
        if (promoContent.schedulingEnabled && (promoContent.startDate || promoContent.endDate)) {
            const startDate = promoContent.startDate ? new Date(promoContent.startDate) : null;
            const endDate = promoContent.endDate ? new Date(promoContent.endDate) : null;

            // Promo hasn't started yet
            if (startDate && now < startDate) {
                return (
                    <span className="status-scheduled">
                        Scheduled (starts on {startDate.toLocaleString()})
                    </span>
                );
            }

            // Promo has ended
            if (endDate && now > endDate) {
                return <span className="status-expired">Expired</span>;
            }

            // Promo is currently active within schedule
            if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
                return <span className="status-active">Active (Scheduled)</span>;
            }
        }

        // No scheduling, just check isActive flag
        return promoContent.isActive ?
            <span className="status-active">Active</span> :
            <span className="status-inactive">Inactive</span>;
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

    // Save all homepage data
    const saveAllHomepageData = async () => {
        setIsSaving(true);
        clearMessages();

        try {
            const updates = {};

            // Prepare all data for batch update
            categories.forEach((category, index) => {
                updates[`homeCategories/${index}`] = category;
            });

            premiumSelections.forEach((premium, index) => {
                // Remove scheduling fields if not enabled
                const dataToSave = { ...premium };
                if (!dataToSave.schedulingEnabled) {
                    delete dataToSave.startDate;
                    delete dataToSave.endDate;
                }
                updates[`premiumSelections/${index}`] = dataToSave;
            });

            comboPacks.forEach((combo, index) => {
                // Remove scheduling fields if not enabled
                const dataToSave = { ...combo };
                if (!dataToSave.schedulingEnabled) {
                    delete dataToSave.startDate;
                    delete dataToSave.endDate;
                }
                updates[`comboPacks/${index}`] = dataToSave;
            });

            testimonials.forEach((testimonial, index) => {
                updates[`testimonials/${index}`] = testimonial;
            });

            // Remove scheduling fields if not enabled for promo content
            const promoToSave = { ...promoContent };
            if (!promoToSave.schedulingEnabled) {
                delete promoToSave.startDate;
                delete promoToSave.endDate;
            }
            updates['promoContent'] = promoToSave;

            // Execute batch update
            await update(dbRef(database), updates);

            setSuccessMessage("All homepage data saved successfully!");
        } catch (error) {
            console.error("Error saving all homepage data:", error);
            setError(`Failed to save homepage data: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="homepage-management loading">
                <h2>Homepage Management</h2>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="homepage-management">
            <h2>Homepage Management</h2>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {/* Section Tabs */}
            <div className="section-tabs">
                <button
                    className={activeSection === 'categories' ? 'active' : ''}
                    onClick={() => setActiveSection('categories')}
                >
                    Categories
                </button>
                <button
                    className={activeSection === 'premium' ? 'active' : ''}
                    onClick={() => setActiveSection('premium')}
                >
                    Premium Selections
                </button>
                <button
                    className={activeSection === 'combos' ? 'active' : ''}
                    onClick={() => setActiveSection('combos')}
                >
                    Combo Packs
                </button>
                <button
                    className={activeSection === 'testimonials' ? 'active' : ''}
                    onClick={() => setActiveSection('testimonials')}
                >
                    Testimonials
                </button>
                <button
                    className={activeSection === 'promo' ? 'active' : ''}
                    onClick={() => setActiveSection('promo')}
                >
                    Promotional Content
                </button>
            </div>

            {/* Save All Button */}
            <div className="save-all-container">
                <button
                    className="save-all-button"
                    onClick={saveAllHomepageData}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving All Data...' : 'Save All Homepage Data'}
                </button>
            </div>

            {/* Categories Section */}
            {activeSection === 'categories' && (
                <div className="section-container categories-section">
                    <div className="section-header">
                        <h3>Manage Categories</h3>
                        <div className="category-actions">
                            <input
                                type="text"
                                placeholder="New category name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                disabled={isSaving}
                            />
                            <button
                                onClick={addNewCategory}
                                disabled={isSaving || !newCategoryName.trim()}
                            >
                                Add Category
                            </button>
                        </div>
                    </div>

                    <div className="section-content">
                        <div className="categories-list">
                            {categories.map((category, index) => (
                                <div
                                    key={category.id}
                                    className={`category-item ${selectedCategoryIndex === index ? 'selected' : ''}`}
                                    onClick={() => setSelectedCategoryIndex(index)}
                                >
                                    <div className="category-item-title">{category.title}</div>
                                    <div className="category-item-actions">
                                        <button
                                            className="position-button up"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveCategoryPosition(index, 'up');
                                            }}
                                            disabled={index === 0}
                                        >
                                            <FaArrowUp />
                                        </button>
                                        <button
                                            className="position-button down"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveCategoryPosition(index, 'down');
                                            }}
                                            disabled={index === categories.length - 1}
                                        >
                                            <FaArrowDown />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedCategoryIndex !== -1 && (
                            <div className="category-editor">
                                <div className="category-preview">
                                    <img
                                        src={categories[selectedCategoryIndex].image || `https://via.placeholder.com/800x600?text=${categories[selectedCategoryIndex].title}`}
                                        alt={categories[selectedCategoryIndex].title}
                                        className="category-image-preview"
                                    />
                                    <div className="upload-container">
                                        <input
                                            id="image-upload-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'category', categories[selectedCategoryIndex].id.toString())}
                                            disabled={isUploading || isSaving}
                                        />
                                        {uploadFile && uploadSection === 'category' && (
                                            <button
                                                className="upload-button"
                                                onClick={handleImageUpload}
                                                disabled={isUploading || isSaving}
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                        )}

                                        {isUploading && uploadSection === 'category' && (
                                            <div className="progress-container">
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                                <span className="progress-text">{uploadProgress}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="category-form">
                                    <div className="form-group">
                                        <label>Category Title:</label>
                                        <input
                                            type="text"
                                            value={categories[selectedCategoryIndex].title}
                                            onChange={(e) => handleCategoryInputChange(selectedCategoryIndex, 'title', e.target.value)}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Category Items:</label>
                                        <div className="category-items-container">
                                            {categories[selectedCategoryIndex].items && categories[selectedCategoryIndex].items.map((item, itemIndex) => (
                                                <div key={itemIndex} className="category-item-row">
                                                    <div className="item-text">
                                                        <FaCheckCircle className="check-icon" />
                                                        {item}
                                                    </div>
                                                    <button
                                                        className="remove-item-button"
                                                        onClick={() => removeCategoryItem(selectedCategoryIndex, itemIndex)}
                                                        disabled={isSaving}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}

                                            <div className="add-item-container">
                                                <input
                                                    type="text"
                                                    placeholder="New item"
                                                    value={newCategoryItem}
                                                    onChange={(e) => setNewCategoryItem(e.target.value)}
                                                    disabled={isSaving}
                                                />
                                                <button
                                                    onClick={() => addCategoryItem(selectedCategoryIndex)}
                                                    disabled={isSaving || !newCategoryItem.trim()}
                                                >
                                                    <FaPlus /> Add Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            className="save-button"
                                            onClick={() => saveCategory(selectedCategoryIndex)}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Category'}
                                        </button>

                                        <button
                                            className="delete-button"
                                            onClick={() => deleteCategory(selectedCategoryIndex)}
                                            disabled={isSaving}
                                        >
                                            Delete Category
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Premium Selections Section */}
            {activeSection === 'premium' && (
                <div className="section-container premium-section">
                    <div className="section-header">
                        <h3>Manage Premium Selections</h3>
                        <button
                            onClick={addNewPremiumSelection}
                            disabled={isSaving}
                        >
                            Add New Premium Product
                        </button>
                    </div>

                    <div className="section-content">
                        <div className="premium-list">
                            {premiumSelections.map((premium, index) => (
                                <div
                                    key={premium.id}
                                    className={`premium-item ${selectedPremiumIndex === index ? 'selected' : ''}`}
                                    onClick={() => setSelectedPremiumIndex(index)}
                                >
                                    <div className="premium-item-title">{premium.name}</div>
                                    <div className="premium-item-price">
                                        {premium.pricePromotion && premium.pricePromotion.isEnabled ? (
                                            <>
                                                <span className="premium-current-price">₹{premium.pricePromotion.promotionalPrice}</span>
                                                <span className="premium-original-price">₹{premium.pricePromotion.regularPrice}</span>
                                            </>
                                        ) : (
                                            <span className="premium-current-price">₹{premium.price}</span>
                                        )}
                                    </div>
                                    <div className="premium-item-status">
                                        {getPremiumStatusDisplay(premium)}
                                    </div>
                                    <div className="premium-item-actions">
                                        <button
                                            className="position-button up"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                movePremiumPosition(index, 'up');
                                            }}
                                            disabled={index === 0}
                                        >
                                            <FaArrowUp />
                                        </button>
                                        <button
                                            className="position-button down"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                movePremiumPosition(index, 'down');
                                            }}
                                            disabled={index === premiumSelections.length - 1}
                                        >
                                            <FaArrowDown />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedPremiumIndex !== -1 && (
                            <div className="premium-editor">
                                <div className="premium-preview">
                                    <img
                                        src={premiumSelections[selectedPremiumIndex].image || `https://via.placeholder.com/800x600?text=${premiumSelections[selectedPremiumIndex].name}`}
                                        alt={premiumSelections[selectedPremiumIndex].name}
                                        className="premium-image-preview"
                                    />
                                    <div className="upload-container">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'premium', premiumSelections[selectedPremiumIndex].id.toString())}
                                            disabled={isUploading || isSaving}
                                        />
                                        {uploadFile && uploadSection === 'premium' && (
                                            <button
                                                className="upload-button"
                                                onClick={handleImageUpload}
                                                disabled={isUploading || isSaving}
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                        )}

                                        {isUploading && uploadSection === 'premium' && (
                                            <div className="progress-container">
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                                <span className="progress-text">{uploadProgress}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="premium-form">
                                    <div className="form-group">
                                        <label>Product Name:</label>
                                        <input
                                            type="text"
                                            value={premiumSelections[selectedPremiumIndex].name}
                                            onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'name', e.target.value)}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Description:</label>
                                        <textarea
                                            value={premiumSelections[selectedPremiumIndex].description}
                                            onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'description', e.target.value)}
                                            disabled={isSaving}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price (₹):</label>
                                            <input
                                                type="number"
                                                value={premiumSelections[selectedPremiumIndex].price}
                                                onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'price', e.target.value)}
                                                disabled={isSaving}
                                                min={0}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Origin:</label>
                                            <input
                                                type="text"
                                                value={premiumSelections[selectedPremiumIndex].origin}
                                                onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'origin', e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>

                                    {/* Premium Scheduling Section */}
                                    <div className="form-section">
                                        <div className="section-header">
                                            <h4>Product Scheduling</h4>
                                            <div className="scheduling-toggle">
                                                <input
                                                    type="checkbox"
                                                    id={`premium-scheduling-toggle-${selectedPremiumIndex}`}
                                                    checked={premiumSelections[selectedPremiumIndex]?.schedulingEnabled || false}
                                                    onChange={() => handlePremiumSchedulingToggle(selectedPremiumIndex)}
                                                    disabled={isSaving}
                                                />
                                                <label htmlFor={`premium-scheduling-toggle-${selectedPremiumIndex}`}>
                                                    <FaClock /> Enable Scheduling
                                                </label>
                                            </div>
                                        </div>

                                        {premiumSelections[selectedPremiumIndex].schedulingEnabled && (
                                            <div className="scheduling-options">
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Start Date & Time:</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={premiumSelections[selectedPremiumIndex].startDate || ''}
                                                            onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'startDate', e.target.value)}
                                                            disabled={isSaving}
                                                        />
                                                        <small>Leave blank for immediate start</small>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>End Date & Time:</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={premiumSelections[selectedPremiumIndex].endDate || ''}
                                                            onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'endDate', e.target.value)}
                                                            disabled={isSaving}
                                                        />
                                                        <small>Leave blank for no end date</small>
                                                    </div>
                                                </div>

                                                <div className="status-display">
                                                    <strong>Scheduling Status:</strong> {getPremiumStatusDisplay(premiumSelections[selectedPremiumIndex])}
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <div className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    id={`premium-active-toggle-${selectedPremiumIndex}`}
                                                    checked={premiumSelections[selectedPremiumIndex].isActive || false}
                                                    onChange={(e) => handlePremiumInputChange(selectedPremiumIndex, 'isActive', e.target.checked)}
                                                    disabled={isSaving}
                                                />
                                                <label htmlFor={`premium-active-toggle-${selectedPremiumIndex}`}>
                                                    Active
                                                    <small> (manually enable/disable regardless of scheduling)</small>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Promotion Section */}
                                    <div className="form-section">
                                        <div className="section-header">
                                            <h4>Price Promotion</h4>
                                            <div className="scheduling-toggle">
                                                <input
                                                    type="checkbox"
                                                    id={`price-promo-toggle-${selectedPremiumIndex}`}
                                                    checked={premiumSelections[selectedPremiumIndex]?.pricePromotion?.isEnabled || false}
                                                    onChange={() => handlePremiumPricePromotionToggle(selectedPremiumIndex)}
                                                    disabled={isSaving}
                                                />
                                                <label htmlFor={`price-promo-toggle-${selectedPremiumIndex}`}>
                                                    <FaClock /> Enable Timed Pricing
                                                </label>
                                            </div>
                                        </div>

                                        {premiumSelections[selectedPremiumIndex].pricePromotion && premiumSelections[selectedPremiumIndex].pricePromotion.isEnabled && (
                                            <div className="price-promo-section">
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Regular Price (₹):</label>
                                                        <input
                                                            type="number"
                                                            value={(premiumSelections[selectedPremiumIndex].pricePromotion && premiumSelections[selectedPremiumIndex].pricePromotion.regularPrice) || 0}
                                                            onChange={(e) => handlePremiumPromotionInputChange(selectedPremiumIndex, 'regularPrice', e.target.value)}
                                                            min={0}
                                                            placeholder="Regular price outside promotion period"
                                                            disabled={isSaving}
                                                        />
                                                        <small>Price shown outside the promotion period</small>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Promotional Price (₹):</label>
                                                        <input
                                                            type="number"
                                                            value={(premiumSelections[selectedPremiumIndex].pricePromotion && premiumSelections[selectedPremiumIndex].pricePromotion.promotionalPrice) || 0}
                                                            onChange={(e) => handlePremiumPromotionInputChange(selectedPremiumIndex, 'promotionalPrice', e.target.value)}
                                                            min={0}
                                                            placeholder="Special price during promotion"
                                                            disabled={isSaving}
                                                        />
                                                        <small>Discounted price shown during promotion period</small>
                                                    </div>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Promotion Start:</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={(premiumSelections[selectedPremiumIndex].pricePromotion && premiumSelections[selectedPremiumIndex].pricePromotion.startDate) || ''}
                                                            onChange={(e) => handlePremiumPromotionInputChange(selectedPremiumIndex, 'startDate', e.target.value)}
                                                            disabled={isSaving}
                                                        />
                                                        <small>When the promotional price begins</small>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Promotion End:</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={(premiumSelections[selectedPremiumIndex].pricePromotion && premiumSelections[selectedPremiumIndex].pricePromotion.endDate) || ''}
                                                            onChange={(e) => handlePremiumPromotionInputChange(selectedPremiumIndex, 'endDate', e.target.value)}
                                                            disabled={isSaving}
                                                        />
                                                        <small>When the promotional price ends</small>
                                                    </div>
                                                </div>

                                                <div className="status-display">
                                                    <strong>Price Promotion Status:</strong> {getPremiumPromotionStatus(premiumSelections[selectedPremiumIndex])}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            className="save-button"
                                            onClick={() => savePremiumSelection(selectedPremiumIndex)}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Premium Selection'}
                                        </button>

                                        <button
                                            className="delete-button"
                                            onClick={() => deletePremiumSelection(selectedPremiumIndex)}
                                            disabled={isSaving}
                                        >
                                            Delete Premium Selection
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Combo Packs Section */}
            {activeSection === 'combos' && (
                <div className="section-container combos-section">
                    <div className="section-header">
                        <h3>Manage Combo Packs</h3>
                        <button
                            onClick={addNewComboPack}
                            disabled={isSaving}
                        >
                            Add New Combo Pack
                        </button>
                    </div>

                    <div className="section-content">
                        <div className="combos-list">
                            {comboPacks.map((combo, index) => (
                                <div
                                    key={combo.id}
                                    className={`combo-item ${selectedComboIndex === index ? 'selected' : ''}`}
                                    onClick={() => setSelectedComboIndex(index)}
                                >
                                    <div className="combo-item-title">{combo.name}</div>
                                    <div className="combo-item-price">
                                        <span className="combo-current-price">₹{combo.price}</span>
                                        <span className="combo-original-price">₹{combo.originalPrice}</span>
                                    </div>
                                    <div className="combo-item-status">
                                        {getComboStatusDisplay(combo)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedComboIndex !== -1 && (
                            <div className="combo-editor">
                                <div className="combo-preview">
                                    <img
                                        src={comboPacks[selectedComboIndex].image || `https://via.placeholder.com/800x600?text=${comboPacks[selectedComboIndex].name}`}
                                        alt={comboPacks[selectedComboIndex].name}
                                        className="combo-image-preview"
                                    />
                                    <div className="upload-container">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'combo', comboPacks[selectedComboIndex].id.toString())}
                                            disabled={isUploading || isSaving}
                                        />
                                        {uploadFile && uploadSection === 'combo' && (
                                            <button
                                                className="upload-button"
                                                onClick={handleImageUpload}
                                                disabled={isUploading || isSaving}
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                        )}

                                        {isUploading && uploadSection === 'combo' && (
                                            <div className="progress-container">
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                                <span className="progress-text">{uploadProgress}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="combo-form">
                                    <div className="form-group">
                                        <label>Combo Name:</label>
                                        <input
                                            type="text"
                                            value={comboPacks[selectedComboIndex].name}
                                            onChange={(e) => handleComboInputChange(selectedComboIndex, 'name', e.target.value)}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Items (separated by +):</label>
                                        <textarea
                                            value={comboPacks[selectedComboIndex].items}
                                            onChange={(e) => handleComboInputChange(selectedComboIndex, 'items', e.target.value)}
                                            disabled={isSaving}
                                            rows={2}
                                            placeholder="Item 1 + Item 2 + Item 3"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Original Price (₹):</label>
                                            <input
                                                type="number"
                                                value={comboPacks[selectedComboIndex].originalPrice}
                                                onChange={(e) => handleComboInputChange(selectedComboIndex, 'originalPrice', e.target.value)}
                                                disabled={isSaving}
                                                min={0}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Sale Price (₹):</label>
                                            <input
                                                type="number"
                                                value={comboPacks[selectedComboIndex].price}
                                                onChange={(e) => handleComboInputChange(selectedComboIndex, 'price', e.target.value)}
                                                disabled={isSaving}
                                                min={0}
                                            />
                                        </div>
                                    </div>

                                    {/* Combo Pack Scheduling Section */}
                                    <div className="form-section">
                                        <div className="section-header">
                                            <h4>Combo Pack Scheduling</h4>
                                            <div className="scheduling-toggle">
                                                <input
                                                    type="checkbox"
                                                    id={`combo-scheduling-toggle-${selectedComboIndex}`}
                                                    checked={comboPacks[selectedComboIndex].schedulingEnabled || false}
                                                    onChange={() => handleComboSchedulingToggle(selectedComboIndex)}
                                                    disabled={isSaving}
                                                />
                                                <label htmlFor={`combo-scheduling-toggle-${selectedComboIndex}`}>
                                                    <FaClock /> Enable Scheduling
                                                </label>
                                            </div>
                                        </div>

                                        {comboPacks[selectedComboIndex].schedulingEnabled && (
                                            <div className="scheduling-options">
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Start Date & Time:</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={comboPacks[selectedComboIndex].startDate || ''}
                                                            onChange={(e) => handleComboInputChange(selectedComboIndex, 'startDate', e.target.value)}
                                                            disabled={isSaving}
                                                        />
                                                        <small>Leave blank for immediate start</small>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>End Date & Time:</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={comboPacks[selectedComboIndex].endDate || ''}
                                                            onChange={(e) => handleComboInputChange(selectedComboIndex, 'endDate', e.target.value)}
                                                            disabled={isSaving}
                                                        />
                                                        <small>Leave blank for no end date</small>
                                                    </div>
                                                </div>

                                                <div className="status-display">
                                                    <strong>Scheduling Status:</strong> {getComboStatusDisplay(comboPacks[selectedComboIndex])}
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <div className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    id={`combo-active-toggle-${selectedComboIndex}`}
                                                    checked={comboPacks[selectedComboIndex].isActive || false}
                                                    onChange={(e) => handleComboInputChange(selectedComboIndex, 'isActive', e.target.checked)}
                                                    disabled={isSaving}
                                                />
                                                <label htmlFor={`combo-active-toggle-${selectedComboIndex}`}>
                                                    Active
                                                    <small> (manually enable/disable regardless of scheduling)</small>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Savings Text:</label>
                                        <input
                                            type="text"
                                            value={comboPacks[selectedComboIndex].savings}
                                            onChange={(e) => handleComboInputChange(selectedComboIndex, 'savings', e.target.value)}
                                            disabled={isSaving || (comboPacks[selectedComboIndex].discountPromotion && comboPacks[selectedComboIndex].discountPromotion.isEnabled)}
                                            placeholder="Save ₹X"
                                        />
                                        {comboPacks[selectedComboIndex].discountPromotion && comboPacks[selectedComboIndex].discountPromotion.isEnabled && (
                                            <small>Discount text is controlled by the promotion scheduling below</small>
                                        )}
                                    </div>

                                    {/* Discount Text Promotion Section */}
                                    <div className="form-section">
                                        <div className="section-header">
                                            <h4>Discount Text Scheduling</h4>
                                            <div className="scheduling-toggle">
                                                <input
                                                    type="checkbox"
                                                    id={`discount-promo-toggle-${selectedComboIndex}`}
                                                    checked={(comboPacks[selectedComboIndex].discountPromotion && comboPacks[selectedComboIndex].discountPromotion.isEnabled) || false}
                                                    onChange={() => handleComboDiscountPromotionToggle(selectedComboIndex)}
                                                    disabled={isSaving}
                                                />
                                                <label htmlFor={`discount-promo-toggle-${selectedComboIndex}`}>
                                                    <FaClock /> Enable Timed Discount
                                                </label>
                                            </div>
                                        </div>

                                        {comboPacks[selectedComboIndex].discountPromotion && comboPacks[selectedComboIndex].discountPromotion.isEnabled && (
                                            <div className="discount-promo-section">
                                                <div className="form-group">
                                                    <label>Promotional Discount Text:</label>
                                                    <input
                                                        type="text"
                                                        value={(comboPacks[selectedComboIndex].discountPromotion && comboPacks[selectedComboIndex].discountPromotion.discountText) || ''}
                                                        onChange={(e) => handleComboPromotionInputChange(selectedComboIndex, 'discountText', e.target.value)}
                                                        placeholder="e.g., LIMITED TIME: SAVE ₹300"
                                                        disabled={isSaving}
                                                    />
                                                    <small>Text shown only during the scheduled period</small>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Start Showing:</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={(comboPacks[selectedComboIndex].discountPromotion && comboPacks[selectedComboIndex].discountPromotion.startDate) || ''}
                                                            onChange={(e) => handleComboPromotionInputChange(selectedComboIndex, 'startDate', e.target.value)}
                                                            disabled={isSaving}
                                                        />
                                                        <small>When to start showing the discount text</small>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Stop Showing:</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={(comboPacks[selectedComboIndex].discountPromotion && comboPacks[selectedComboIndex].discountPromotion.endDate) || ''}
                                                            onChange={(e) => handleComboPromotionInputChange(selectedComboIndex, 'endDate', e.target.value)}
                                                            disabled={isSaving}
                                                        />
                                                        <small>When to stop showing the discount text</small>
                                                    </div>
                                                </div>

                                                <div className="status-display">
                                                    <strong>Discount Status:</strong> {getComboDiscountPromotionStatus(comboPacks[selectedComboIndex])}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            className="save-button"
                                            onClick={() => saveCombopack(selectedComboIndex)}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Combo Pack'}
                                        </button>

                                        <button
                                            className="delete-button"
                                            onClick={() => deleteComboPack(selectedComboIndex)}
                                            disabled={isSaving}
                                        >
                                            Delete Combo Pack
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Testimonials Section */}
            {activeSection === 'testimonials' && (
                <div className="section-container testimonials-section">
                    <div className="section-header">
                        <h3>Manage Testimonials</h3>
                        <button
                            onClick={addNewTestimonial}
                            disabled={isSaving}
                        >
                            Add New Testimonial
                        </button>
                    </div>

                    <div className="section-content">
                        <div className="testimonials-list">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={testimonial.id}
                                    className={`testimonial-item ${selectedTestimonialIndex === index ? 'selected' : ''}`}
                                    onClick={() => setSelectedTestimonialIndex(index)}
                                >
                                    <div className="testimonial-item-name">{testimonial.name}</div>
                                    <div className="testimonial-item-rating">
                                        {Array.from({ length: testimonial.rating }, (_, i) => (
                                            <span key={i} className="star">★</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedTestimonialIndex !== -1 && (
                            <div className="testimonial-editor">
                                <div className="testimonial-preview">
                                    <img
                                        src={testimonials[selectedTestimonialIndex].image || `https://via.placeholder.com/200x200?text=${testimonials[selectedTestimonialIndex].name.split(' ')[0]}`}
                                        alt={testimonials[selectedTestimonialIndex].name}
                                        className="testimonial-image-preview"
                                    />
                                    <div className="upload-container">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'testimonial', testimonials[selectedTestimonialIndex].id.toString())}
                                            disabled={isUploading || isSaving}
                                        />
                                        {uploadFile && uploadSection === 'testimonial' && (
                                            <button
                                                className="upload-button"
                                                onClick={handleImageUpload}
                                                disabled={isUploading || isSaving}
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                        )}

                                        {isUploading && uploadSection === 'testimonial' && (
                                            <div className="progress-container">
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                                <span className="progress-text">{uploadProgress}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="testimonial-form">
                                    <div className="form-group">
                                        <label>Customer Name:</label>
                                        <input
                                            type="text"
                                            value={testimonials[selectedTestimonialIndex].name}
                                            onChange={(e) => handleTestimonialInputChange(selectedTestimonialIndex, 'name', e.target.value)}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Review Text:</label>
                                        <textarea
                                            value={testimonials[selectedTestimonialIndex].text}
                                            onChange={(e) => handleTestimonialInputChange(selectedTestimonialIndex, 'text', e.target.value)}
                                            disabled={isSaving}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Rating (1-5):</label>
                                            <input
                                                type="number"
                                                value={testimonials[selectedTestimonialIndex].rating}
                                                onChange={(e) => handleTestimonialInputChange(selectedTestimonialIndex, 'rating', e.target.value)}
                                                disabled={isSaving}
                                                min={1}
                                                max={5}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Date:</label>
                                            <input
                                                type="text"
                                                value={testimonials[selectedTestimonialIndex].date}
                                                onChange={(e) => handleTestimonialInputChange(selectedTestimonialIndex, 'date', e.target.value)}
                                                disabled={isSaving}
                                                placeholder="e.g., 2 weeks ago"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            className="save-button"
                                            onClick={() => saveTestimonial(selectedTestimonialIndex)}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Testimonial'}
                                        </button>

                                        <button
                                            className="delete-button"
                                            onClick={() => deleteTestimonial(selectedTestimonialIndex)}
                                            disabled={isSaving}
                                        >
                                            Delete Testimonial
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Promotional Content Section */}
            {activeSection === 'promo' && (
                <div className="section-container promo-section">
                    <div className="section-header">
                        <h3>Manage Promotional Content</h3>
                    </div>

                    <div className="section-content">
                        <div className="promo-editor">
                            <div className="promo-preview">
                                <h4>Promo Banner Image</h4>
                                <img
                                    src={promoContent.promoImage || `https://via.placeholder.com/800x600?text=Promo+Banner`}
                                    alt="Promotional Banner"
                                    className="promo-image-preview"
                                />
                                <div className="upload-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'promo', 'promoImage')}
                                        disabled={isUploading || isSaving}
                                    />
                                    {uploadFile && uploadSection === 'promo' && (
                                        <button
                                            className="upload-button"
                                            onClick={handleImageUpload}
                                            disabled={isUploading || isSaving}
                                        >
                                            {isUploading ? 'Uploading...' : 'Upload Image'}
                                        </button>
                                    )}

                                    {isUploading && uploadSection === 'promo' && (
                                        <div className="progress-container">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                            <span className="progress-text">{uploadProgress}%</span>
                                        </div>
                                    )}
                                </div>

                                <h4>App Preview Image</h4>
                                <img
                                    src={promoContent.appPreviewImage || `https://via.placeholder.com/300x600?text=App+Preview`}
                                    alt="App Preview"
                                    className="app-image-preview"
                                />
                                <div className="upload-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'appPreview', 'appPreviewImage')}
                                        disabled={isUploading || isSaving}
                                    />
                                    {uploadFile && uploadSection === 'appPreview' && (
                                        <button
                                            className="upload-button"
                                            onClick={handleImageUpload}
                                            disabled={isUploading || isSaving}
                                        >
                                            {isUploading ? 'Uploading...' : 'Upload Image'}
                                        </button>
                                    )}

                                    {isUploading && uploadSection === 'appPreview' && (
                                        <div className="progress-container">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                            <span className="progress-text">{uploadProgress}%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Promo Status Display */}
                                <div className="promo-status">
                                    <strong>Status:</strong> {getPromoStatusDisplay()}
                                </div>
                            </div>

                            <div className="promo-form">
                                <div className="form-group">
                                    <label>Promotion Tag:</label>
                                    <input
                                        type="text"
                                        value={promoContent.title}
                                        onChange={(e) => handlePromoInputChange('title', e.target.value)}
                                        disabled={isSaving}
                                        placeholder="e.g., Limited Time Offer"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Promotion Title:</label>
                                    <input
                                        type="text"
                                        value={promoContent.subtitle}
                                        onChange={(e) => handlePromoInputChange('subtitle', e.target.value)}
                                        disabled={isSaving}
                                        placeholder="e.g., First Order Discount"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description:</label>
                                    <textarea
                                        value={promoContent.description}
                                        onChange={(e) => handlePromoInputChange('description', e.target.value)}
                                        disabled={isSaving}
                                        rows={2}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Promo Code:</label>
                                    <input
                                        type="text"
                                        value={promoContent.promoCode}
                                        onChange={(e) => handlePromoInputChange('promoCode', e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Features:</label>
                                    <div className="features-container">
                                        {promoContent.features.map((feature, index) => (
                                            <div key={index} className="feature-item">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={(e) => updatePromoFeature(index, e.target.value)}
                                                    disabled={isSaving}
                                                />
                                                <button
                                                    className="remove-feature-button"
                                                    onClick={() => removePromoFeature(index)}
                                                    disabled={isSaving}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            className="add-feature-button"
                                            onClick={addPromoFeature}
                                            disabled={isSaving}
                                        >
                                            <FaPlus /> Add Feature
                                        </button>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Button Text:</label>
                                        <input
                                            type="text"
                                            value={promoContent.buttonText}
                                            onChange={(e) => handlePromoInputChange('buttonText', e.target.value)}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Button Link:</label>
                                        <input
                                            type="text"
                                            value={promoContent.buttonLink}
                                            onChange={(e) => handlePromoInputChange('buttonLink', e.target.value)}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>

                                {/* Promo Scheduling Section */}
                                <div className="form-section">
                                    <div className="section-header">
                                        <h4>Promotion Scheduling</h4>
                                        <div className="scheduling-toggle">
                                            <input
                                                type="checkbox"
                                                id="promo-scheduling-toggle"
                                                checked={promoContent.schedulingEnabled || false}
                                                onChange={handlePromoSchedulingToggle}
                                                disabled={isSaving}
                                            />
                                            <label htmlFor="promo-scheduling-toggle">
                                                <FaClock /> Enable Scheduling
                                            </label>
                                        </div>
                                    </div>

                                    {promoContent.schedulingEnabled && (
                                        <div className="scheduling-options">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Start Date & Time:</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={promoContent.startDate || ''}
                                                        onChange={(e) => handlePromoInputChange('startDate', e.target.value)}
                                                        disabled={isSaving}
                                                    />
                                                    <small>Leave blank for immediate start</small>
                                                </div>

                                                <div className="form-group">
                                                    <label>End Date & Time:</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={promoContent.endDate || ''}
                                                        onChange={(e) => handlePromoInputChange('endDate', e.target.value)}
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
                                                id="promo-active-toggle"
                                                checked={promoContent.isActive || false}
                                                onChange={(e) => handlePromoInputChange('isActive', e.target.checked)}
                                                disabled={isSaving}
                                            />
                                            <label htmlFor="promo-active-toggle">
                                                Active
                                                <small> (manually enable/disable regardless of scheduling)</small>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        className="save-button"
                                        onClick={savePromoContent}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Promotional Content'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default HomePageManagement;