

// import React, { useState, useEffect } from 'react';
// import { ref, push, set, get } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../firebase/config';
// import '../styles/pages/CreateItems.css';

// const CreateItems = () => {
//   const categories = [
//     "Bestsellers",
//     "Shop by categories",
//     "Match Day Essentials",
//     "Premium fish & seafood selection"
//   ];
  
//   const [displayCategories, setDisplayCategories] = useState([
//     { id: "chicken", name: "Chicken" },
//     { id: "fish-seafood", name: "Fish & Seafood" },
//     { id: "mutton", name: "Mutton" },
//     { id: "liver-more", name: "Liver & More" },
//     { id: "prawns-crabs", name: "Prawns & Crabs" },
//     { id: "eggs", name: "Eggs" },
//     { id: "combos", name: "Combos" }
//   ]);
  
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [activeDisplayCategory, setActiveDisplayCategory] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
  
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     weight: '',
//     pieces: '',
//     serves: '',
//     price: '',
//     originalPrice: '',
//     discount: '',
//     deliveryTime: '30',
//     image: null,
//     featured: false,
//     meatCut: 'jc-jatka' // Default to JC Jatka
//   });

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const categoriesRef = ref(db, 'categories');
//         const snapshot = await get(categoriesRef);
        
//         if (snapshot.exists()) {
//           const categoriesData = snapshot.val();
//           const categoriesArray = Object.keys(categoriesData).map(key => ({
//             ...categoriesData[key],
//             firebaseKey: key
//           }));
          
//           const newDisplayCategories = categoriesArray.map(cat => ({
//             id: cat.id,
//             name: cat.name
//           }));
          
//           if (newDisplayCategories.length > 0) {
//             setDisplayCategories(newDisplayCategories);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       }
//     };
    
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (formData.originalPrice && formData.discount) {
//       const original = parseFloat(formData.originalPrice);
//       const discountPercent = parseFloat(formData.discount);
      
//       if (!isNaN(original) && !isNaN(discountPercent) && discountPercent >= 0 && discountPercent <= 100) {
//         const discountedPrice = original - (original * (discountPercent / 100));
//         setFormData(prev => ({
//           ...prev,
//           price: Math.round(discountedPrice).toString()
//         }));
//       }
//     }
//   }, [formData.originalPrice, formData.discount]);

//   useEffect(() => {
//     if (formData.originalPrice && formData.price && !formData.discount) {
//       const original = parseFloat(formData.originalPrice);
//       const current = parseFloat(formData.price);
      
//       if (!isNaN(original) && !isNaN(current) && original > current) {
//         const discountPercent = Math.round(((original - current) / original) * 100);
//         setFormData(prev => ({
//           ...prev,
//           discount: discountPercent.toString()
//         }));
//       }
//     }
//   }, [formData.originalPrice, formData.price, formData.discount]);

//   const handleCategoryClick = (category) => {
//     setActiveCategory(category);
//     setActiveDisplayCategory(null);
//     setFormData(prev => ({
//       ...prev,
//       featured: category === "Bestsellers"
//     }));
//     setMessage({ type: '', text: '' });
//   };

//   const handleDisplayCategoryClick = (category) => {
//     setActiveDisplayCategory(category);
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
    
//     if (type === 'file') {
//       setFormData({
//         ...formData,
//         [name]: files[0]
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: type === 'checkbox' ? checked : value
//       });
//     }
//   };

//   const handleSaveItem = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       if (!formData.name || !formData.weight || !formData.price || !formData.originalPrice) {
//         throw new Error('Please fill in all required fields');
//       }

//       if (!activeCategory) {
//         throw new Error('Please select a main category');
//       }

//       if (activeCategory === "Shop by categories" && !activeDisplayCategory) {
//         throw new Error('Please select a display category when adding to Shop by categories');
//       }
      
//       if (!formData.meatCut) {
//         throw new Error('Please select a meat cut type (JC Jatka or Halal Cut)');
//       }

//       if (!formData.meatCut) {
//         throw new Error('Please select a meat cut type (JC Jatka or Halal Cut)');
//       }

//       let imageUrl = '';
      
//       if (formData.image) {
//         const folderPath = activeCategory === "Shop by categories" && activeDisplayCategory 
//           ? `items/${activeDisplayCategory.id}/${formData.meatCut}` 
//           : `items/${activeCategory.replace(/\s+/g, '-').toLowerCase()}/${formData.meatCut}`;
          
//         const imageStorageRef = storageRef(storage, `${folderPath}/${Date.now()}_${formData.image.name}`);
//         const snapshot = await uploadBytes(imageStorageRef, formData.image);
//         imageUrl = await getDownloadURL(snapshot.ref);
//       } else {
//         throw new Error('Please select an image for the product');
//       }

//       const itemId = formData.name
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/-$/, '');

//       const itemData = {
//         id: itemId,
//         name: formData.name,
//         description: formData.description || '',
//         weight: formData.weight,
//         pieces: formData.pieces,
//         serves: parseInt(formData.serves) || 0,
//         price: Number(formData.price),
//         originalPrice: Number(formData.originalPrice),
//         discount: Number(formData.discount) || 0,
//         deliveryTime: Number(formData.deliveryTime) || 30,
//         category: activeCategory,
//         featured: activeCategory === "Bestsellers" ? true : formData.featured,
//         meatCut: formData.meatCut, // Add the meat cut type to the item data
//         isActive: true, // Add isActive field for product visibility control
//         createdAt: Date.now(),
//         image: imageUrl
//       };

//       if (activeCategory === "Shop by categories" && activeDisplayCategory) {
//         itemData.displayCategory = activeDisplayCategory.id;
//       }

//       const itemsRef = ref(db, 'items');
//       const newItemRef = push(itemsRef);
      
//       await set(newItemRef, itemData);
      
//       if (activeCategory === "Shop by categories" && activeDisplayCategory) {
//         try {
//           const categoriesRef = ref(db, 'categories');
//           const snapshot = await get(categoriesRef);
          
//           if (snapshot.exists()) {
//             const categoriesData = snapshot.val();
//             let categoryToUpdate = null;
//             let categoryKey = null;
            
//             Object.keys(categoriesData).forEach(key => {
//               if (categoriesData[key].id === activeDisplayCategory.id) {
//                 categoryToUpdate = categoriesData[key];
//                 categoryKey = key;
//               }
//             });
            
//             if (categoryToUpdate && categoryKey) {
//               const currentCount = categoryToUpdate.productCount || 0;
//               await set(ref(db, `categories/${categoryKey}/productCount`), currentCount + 1);
//             } else {
//               const newCategoryRef = push(ref(db, 'categories'));
//               await set(newCategoryRef, {
//                 id: activeDisplayCategory.id,
//                 name: activeDisplayCategory.name,
//                 description: `${activeDisplayCategory.name} products`,
//                 productCount: 1,
//                 createdAt: Date.now(),
//                 image: imageUrl
//               });
//             }
//           } else {
//             const newCategoryRef = push(ref(db, 'categories'));
//             await set(newCategoryRef, {
//               id: activeDisplayCategory.id,
//               name: activeDisplayCategory.name,
//               description: `${activeDisplayCategory.name} products`,
//               productCount: 1,
//               createdAt: Date.now(),
//               image: imageUrl
//             });
//           }
//         } catch (error) {
//           console.error('Error updating category product count:', error);
//         }
//       }
      
//       setFormData({
//         name: '',
//         description: '',
//         weight: '',
//         pieces: '',
//         serves: '',
//         price: '',
//         originalPrice: '',
//         discount: '',
//         deliveryTime: '30',
//         image: null,
//         featured: activeCategory === "Bestsellers",
//         meatCut: 'jc-jatka'
//       });
      
//       setMessage({
//         type: 'success',
//         text: activeDisplayCategory 
//           ? `Item successfully added to ${activeDisplayCategory.name} in ${activeCategory} (${formData.meatCut === 'jc-jatka' ? 'JC Jatka' : 'Halal Cut'})!`
//           : `Item successfully added to ${activeCategory} (${formData.meatCut === 'jc-jatka' ? 'JC Jatka' : 'Halal Cut'})!`
//       });
      
//       const fileInput = document.getElementById('image');
//       if (fileInput) fileInput.value = '';
      
//     } catch (error) {
//       console.error('Error adding item:', error);
//       setMessage({
//         type: 'error',
//         text: `Error: ${error.message}`
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getAvailableDisplayCategories = () => {
//     if (activeCategory !== "Shop by categories") return [];
//     return displayCategories;
//   };

//   const availableDisplayCategories = getAvailableDisplayCategories();

//   return (
//     <div className="create-items-container">
//       <h1>Add Items</h1>
      
//       <div className="category-selection">
//         <div className="category-section">
//           <h3>Step 1: Select Main Category</h3>
//           <div className="category-buttons">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 className={`category-btn ${activeCategory === category ? 'active' : ''}`}
//                 onClick={() => handleCategoryClick(category)}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>
//         </div>
        
//         {activeCategory === "Shop by categories" && availableDisplayCategories.length > 0 && (
//           <div className="category-section">
//             <h3>Step 2: Select Display Category</h3>
//             <div className="display-category-info">
//               <p>This determines where the item will appear in the "Shop by categories" section</p>
//             </div>
//             <div className="category-buttons">
//               {availableDisplayCategories.map((category) => (
//                 <button
//                   key={category.id}
//                   className={`category-btn ${activeDisplayCategory?.id === category.id ? 'active' : ''}`}
//                   onClick={() => handleDisplayCategoryClick(category)}
//                 >
//                   {category.name}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {activeCategory && (activeCategory !== "Shop by categories" || activeDisplayCategory) && (
//         <div className="item-form-container">
//           <h2>
//             Add Item to {activeCategory}
//             {activeDisplayCategory && ` (${activeDisplayCategory.name})`}
//           </h2>
          
//           {message.text && (
//             <div className={`message ${message.type}`}>
//               {message.text}
//             </div>
//           )}
          
//           <form className="item-form" onSubmit={handleSaveItem}>
//             <div className="form-group">
//               <label htmlFor="name">Item Name*</label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Chicken Curry Cut - Small Pieces"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="description">Description</label>
//               <textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Product description"
//               />
//             </div>

//             {/* Meat Cut Type Radio Buttons */}
//             {/* <div className="form-group meat-cut-options">
//               <label>Meat Cut Type*</label>
//               <div className="radio-group">
//                 <div className="radio-option">
//                   <input
//                     type="radio"
//                     id="jc-jatka"
//                     name="meatCut"
//                     value="jc-jatka"
//                     checked={formData.meatCut === 'jc-jatka'}
//                     onChange={handleInputChange}
//                     required
//                   />
//                   <label htmlFor="jc-jatka">JC Jatka</label>
//                 </div>
//                 <div className="radio-option">
//                   <input
//                     type="radio"
//                     id="halal-cut"
//                     name="meatCut"
//                     value="halal-cut"
//                     checked={formData.meatCut === 'halal-cut'}
//                     onChange={handleInputChange}
//                     required
//                   />
//                   <label htmlFor="halal-cut">Halal Cut</label>
//                 </div>
//               </div>
//             </div> */}

//             {/* Meat Cut Type Radio Buttons */}
//             <div className="form-group meat-cut-options">
//               <label>Meat Cut Type*</label>
//               <div className="radio-group">
//                 <div className="radio-option">
//                   <input
//                     type="radio"
//                     id="jc-jatka"
//                     name="meatCut"
//                     value="jc-jatka"
//                     checked={formData.meatCut === 'jc-jatka'}
//                     onChange={handleInputChange}
//                     required
//                   />
//                   <label htmlFor="jc-jatka">JC Jatka</label>
//                 </div>
//                 <div className="radio-option">
//                   <input
//                     type="radio"
//                     id="halal-cut"
//                     name="meatCut"
//                     value="halal-cut"
//                     checked={formData.meatCut === 'halal-cut'}
//                     onChange={handleInputChange}
//                     required
//                   />
//                   <label htmlFor="halal-cut">Halal Cut</label>
//                 </div>
//               </div>
//             </div>

//             <div className="form-group">
//               <label htmlFor="weight">Weight*</label>
//               <input
//                 type="text"
//                 id="weight"
//                 name="weight"
//                 value={formData.weight}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 500 g"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="pieces">Pieces</label>
//               <input
//                 type="text"
//                 id="pieces"
//                 name="pieces"
//                 value={formData.pieces}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 12-18 Pieces"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="serves">Serves</label>
//               <input
//                 type="number"
//                 id="serves"
//                 name="serves"
//                 min="1"
//                 value={formData.serves}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 4"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="originalPrice">Original Price* (₹)</label>
//               <input
//                 type="number"
//                 id="originalPrice"
//                 name="originalPrice"
//                 min="0"
//                 step="0.01"
//                 value={formData.originalPrice}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 195"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="discount">Discount % (Auto-calculates selling price)</label>
//               <input
//                 type="number"
//                 id="discount"
//                 name="discount"
//                 min="0"
//                 max="100"
//                 value={formData.discount}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 18"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="price">Selling Price* (₹) (Auto-calculated from discount)</label>
//               <input
//                 type="number"
//                 id="price"
//                 name="price"
//                 min="0"
//                 step="0.01"
//                 value={formData.price}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 160"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="deliveryTime">Delivery Time (minutes)</label>
//               <input
//                 type="number"
//                 id="deliveryTime"
//                 name="deliveryTime"
//                 min="1"
//                 value={formData.deliveryTime}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 30"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="image">Image*</label>
//               <input
//                 type="file"
//                 id="image"
//                 name="image"
//                 accept="image/*"
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>

//             {activeCategory !== "Bestsellers" && (
//               <div className="form-group checkbox">
//                 <input
//                   type="checkbox"
//                   id="featured"
//                   name="featured"
//                   checked={formData.featured}
//                   onChange={handleInputChange}
//                 />
//                 <label htmlFor="featured">Featured Item (Appears in Bestsellers)</label>
//               </div>
//             )}

//             <div className="button-group">
//               <button 
//                 type="submit" 
//                 className={`submit-btn ${activeCategory === "Bestsellers" ? "bestseller-btn" : ""} ${activeCategory === "Shop by categories" ? "category-btn" : ""}`}
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Saving...' : `Add to ${activeDisplayCategory ? activeDisplayCategory.name : activeCategory}`}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateItems;





// import React, { useState, useEffect } from 'react';
// import { ref, push, set, get } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../firebase/config';
// import '../styles/pages/CreateItems.css';

// const CreateItems = () => {
//   const defaultCategories = [
//     "Bestsellers",
//     "Shop by categories",
//     "Match Day Essentials",
//     "Premium fish & seafood selection"
//   ];
  
//   const [categories, setCategories] = useState(defaultCategories);
//   const [showNewSectionForm, setShowNewSectionForm] = useState(false);
//   const [newSectionName, setNewSectionName] = useState('');
  
//   const [displayCategories, setDisplayCategories] = useState([
//     { id: "chicken", name: "Chicken" },
//     { id: "fish-seafood", name: "Fish & Seafood" },
//     { id: "mutton", name: "Mutton" },
//     { id: "liver-more", name: "Liver & More" },
//     { id: "prawns-crabs", name: "Prawns & Crabs" },
//     { id: "eggs", name: "Eggs" },
//     { id: "combos", name: "Combos" }
//   ]);
  
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [activeDisplayCategory, setActiveDisplayCategory] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
  
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     weight: '',
//     pieces: '',
//     serves: '',
//     price: '',
//     originalPrice: '',
//     discount: '',
//     deliveryTime: '30',
//     image: null,
//     featured: false,
//     meatCut: 'jc-jatka'
//   });

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const categoriesRef = ref(db, 'categories');
//         const snapshot = await get(categoriesRef);
        
//         if (snapshot.exists()) {
//           const categoriesData = snapshot.val();
//           const categoriesArray = Object.keys(categoriesData).map(key => ({
//             ...categoriesData[key],
//             firebaseKey: key
//           }));
          
//           const newDisplayCategories = categoriesArray.map(cat => ({
//             id: cat.id,
//             name: cat.name
//           }));
          
//           if (newDisplayCategories.length > 0) {
//             setDisplayCategories(newDisplayCategories);
//           }
//         }

//         // Fetch dynamic sections
//         const sectionsRef = ref(db, 'sections');
//         const sectionsSnapshot = await get(sectionsRef);
        
//         if (sectionsSnapshot.exists()) {
//           const sectionsData = sectionsSnapshot.val();
//           const dynamicSections = Object.values(sectionsData).map(section => section.name);
//           const allCategories = [...defaultCategories, ...dynamicSections];
//           setCategories(allCategories);
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       }
//     };
    
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (formData.originalPrice && formData.discount) {
//       const original = parseFloat(formData.originalPrice);
//       const discountPercent = parseFloat(formData.discount);
      
//       if (!isNaN(original) && !isNaN(discountPercent) && discountPercent >= 0 && discountPercent <= 100) {
//         const discountedPrice = original - (original * (discountPercent / 100));
//         setFormData(prev => ({
//           ...prev,
//           price: Math.round(discountedPrice).toString()
//         }));
//       }
//     }
//   }, [formData.originalPrice, formData.discount]);

//   useEffect(() => {
//     if (formData.originalPrice && formData.price && !formData.discount) {
//       const original = parseFloat(formData.originalPrice);
//       const current = parseFloat(formData.price);
      
//       if (!isNaN(original) && !isNaN(current) && original > current) {
//         const discountPercent = Math.round(((original - current) / original) * 100);
//         setFormData(prev => ({
//           ...prev,
//           discount: discountPercent.toString()
//         }));
//       }
//     }
//   }, [formData.originalPrice, formData.price, formData.discount]);

//   const handleAddNewSection = async () => {
//     if (!newSectionName.trim()) {
//       setMessage({
//         type: 'error',
//         text: 'Please enter a section name'
//       });
//       return;
//     }

//     try {
//       setIsLoading(true);
      
//       const sectionId = newSectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
      
//       const sectionsRef = ref(db, 'sections');
//       const newSectionRef = push(sectionsRef);
      
//       await set(newSectionRef, {
//         id: sectionId,
//         name: newSectionName.trim(),
//         displayName: newSectionName.trim(),
//         createdAt: Date.now(),
//         isActive: true
//       });

//       setCategories(prev => [...prev, newSectionName.trim()]);
//       setNewSectionName('');
//       setShowNewSectionForm(false);
      
//       setMessage({
//         type: 'success',
//         text: `New section "${newSectionName.trim()}" created successfully!`
//       });
      
//     } catch (error) {
//       console.error('Error creating new section:', error);
//       setMessage({
//         type: 'error',
//         text: 'Error creating new section'
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCategoryClick = (category) => {
//     setActiveCategory(category);
//     setActiveDisplayCategory(null);
//     setFormData(prev => ({
//       ...prev,
//       featured: category === "Bestsellers"
//     }));
//     setMessage({ type: '', text: '' });
//   };

//   const handleDisplayCategoryClick = (category) => {
//     setActiveDisplayCategory(category);
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
    
//     if (type === 'file') {
//       setFormData({
//         ...formData,
//         [name]: files[0]
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: type === 'checkbox' ? checked : value
//       });
//     }
//   };

//   const handleSaveItem = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       if (!formData.name || !formData.weight || !formData.price || !formData.originalPrice) {
//         throw new Error('Please fill in all required fields');
//       }

//       if (!activeCategory) {
//         throw new Error('Please select a main category');
//       }

//       if (activeCategory === "Shop by categories" && !activeDisplayCategory) {
//         throw new Error('Please select a display category when adding to Shop by categories');
//       }
      
//       if (!formData.meatCut) {
//         throw new Error('Please select a meat cut type (JC Jatka or Halal Cut)');
//       }

//       let imageUrl = '';
      
//       if (formData.image) {
//         const folderPath = activeCategory === "Shop by categories" && activeDisplayCategory 
//           ? `items/${activeDisplayCategory.id}/${formData.meatCut}` 
//           : `items/${activeCategory.replace(/\s+/g, '-').toLowerCase()}/${formData.meatCut}`;
          
//         const imageStorageRef = storageRef(storage, `${folderPath}/${Date.now()}_${formData.image.name}`);
//         const snapshot = await uploadBytes(imageStorageRef, formData.image);
//         imageUrl = await getDownloadURL(snapshot.ref);
//       } else {
//         throw new Error('Please select an image for the product');
//       }

//       const itemId = formData.name
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/-$/, '');

//       const itemData = {
//         id: itemId,
//         name: formData.name,
//         description: formData.description || '',
//         weight: formData.weight,
//         pieces: formData.pieces,
//         serves: parseInt(formData.serves) || 0,
//         price: Number(formData.price),
//         originalPrice: Number(formData.originalPrice),
//         discount: Number(formData.discount) || 0,
//         deliveryTime: Number(formData.deliveryTime) || 30,
//         category: activeCategory,
//         featured: activeCategory === "Bestsellers" ? true : formData.featured,
//         meatCut: formData.meatCut,
//         isActive: true,
//         createdAt: Date.now(),
//         image: imageUrl
//       };

//       if (activeCategory === "Shop by categories" && activeDisplayCategory) {
//         itemData.displayCategory = activeDisplayCategory.id;
//       }

//       const itemsRef = ref(db, 'items');
//       const newItemRef = push(itemsRef);
      
//       await set(newItemRef, itemData);
      
//       if (activeCategory === "Shop by categories" && activeDisplayCategory) {
//         try {
//           const categoriesRef = ref(db, 'categories');
//           const snapshot = await get(categoriesRef);
          
//           if (snapshot.exists()) {
//             const categoriesData = snapshot.val();
//             let categoryToUpdate = null;
//             let categoryKey = null;
            
//             Object.keys(categoriesData).forEach(key => {
//               if (categoriesData[key].id === activeDisplayCategory.id) {
//                 categoryToUpdate = categoriesData[key];
//                 categoryKey = key;
//               }
//             });
            
//             if (categoryToUpdate && categoryKey) {
//               const currentCount = categoryToUpdate.productCount || 0;
//               await set(ref(db, `categories/${categoryKey}/productCount`), currentCount + 1);
//             } else {
//               const newCategoryRef = push(ref(db, 'categories'));
//               await set(newCategoryRef, {
//                 id: activeDisplayCategory.id,
//                 name: activeDisplayCategory.name,
//                 description: `${activeDisplayCategory.name} products`,
//                 productCount: 1,
//                 createdAt: Date.now(),
//                 image: imageUrl
//               });
//             }
//           } else {
//             const newCategoryRef = push(ref(db, 'categories'));
//             await set(newCategoryRef, {
//               id: activeDisplayCategory.id,
//               name: activeDisplayCategory.name,
//               description: `${activeDisplayCategory.name} products`,
//               productCount: 1,
//               createdAt: Date.now(),
//               image: imageUrl
//             });
//           }
//         } catch (error) {
//           console.error('Error updating category product count:', error);
//         }
//       }
      
//       setFormData({
//         name: '',
//         description: '',
//         weight: '',
//         pieces: '',
//         serves: '',
//         price: '',
//         originalPrice: '',
//         discount: '',
//         deliveryTime: '30',
//         image: null,
//         featured: activeCategory === "Bestsellers",
//         meatCut: 'jc-jatka'
//       });
      
//       setMessage({
//         type: 'success',
//         text: activeDisplayCategory 
//           ? `Item successfully added to ${activeDisplayCategory.name} in ${activeCategory} (${formData.meatCut === 'jc-jatka' ? 'JC Jatka' : 'Halal Cut'})!`
//           : `Item successfully added to ${activeCategory} (${formData.meatCut === 'jc-jatka' ? 'JC Jatka' : 'Halal Cut'})!`
//       });
      
//       const fileInput = document.getElementById('image');
//       if (fileInput) fileInput.value = '';
      
//     } catch (error) {
//       console.error('Error adding item:', error);
//       setMessage({
//         type: 'error',
//         text: `Error: ${error.message}`
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getAvailableDisplayCategories = () => {
//     if (activeCategory !== "Shop by categories") return [];
//     return displayCategories;
//   };

//   const availableDisplayCategories = getAvailableDisplayCategories();

//   return (
//     <div className="create-items-container">
//       <h1>Add Items</h1>
      
//       <div className="category-selection">
//         <div className="category-section">
//           <h3>Step 1: Select Main Category</h3>
//           <div className="category-buttons">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 className={`category-btn ${activeCategory === category ? 'active' : ''}`}
//                 onClick={() => handleCategoryClick(category)}
//               >
//                 {category}
//               </button>
//             ))}
//             <button
//               className="category-btn add-new-btn"
//               onClick={() => setShowNewSectionForm(true)}
//             >
//               + Add New Section
//             </button>
//           </div>
          
//           {showNewSectionForm && (
//             <div className="new-section-form">
//               <h4>Create New Section</h4>
//               <div className="form-group">
//                 <input
//                   type="text"
//                   value={newSectionName}
//                   onChange={(e) => setNewSectionName(e.target.value)}
//                   placeholder="Enter section name (e.g., Fresh Fruits)"
//                   className="section-name-input"
//                 />
//               </div>
//               <div className="form-buttons">
//                 <button
//                   type="button"
//                   onClick={handleAddNewSection}
//                   disabled={isLoading}
//                   className="create-section-btn"
//                 >
//                   {isLoading ? 'Creating...' : 'Create Section'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowNewSectionForm(false);
//                     setNewSectionName('');
//                   }}
//                   className="cancel-btn"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
        
//         {activeCategory === "Shop by categories" && availableDisplayCategories.length > 0 && (
//           <div className="category-section">
//             <h3>Step 2: Select Display Category</h3>
//             <div className="display-category-info">
//               <p>This determines where the item will appear in the "Shop by categories" section</p>
//             </div>
//             <div className="category-buttons">
//               {availableDisplayCategories.map((category) => (
//                 <button
//                   key={category.id}
//                   className={`category-btn ${activeDisplayCategory?.id === category.id ? 'active' : ''}`}
//                   onClick={() => handleDisplayCategoryClick(category)}
//                 >
//                   {category.name}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {activeCategory && (activeCategory !== "Shop by categories" || activeDisplayCategory) && (
//         <div className="item-form-container">
//           <h2>
//             Add Item to {activeCategory}
//             {activeDisplayCategory && ` (${activeDisplayCategory.name})`}
//           </h2>
          
//           {message.text && (
//             <div className={`message ${message.type}`}>
//               {message.text}
//             </div>
//           )}
          
//           <form className="item-form" onSubmit={handleSaveItem}>
//             <div className="form-group">
//               <label htmlFor="name">Item Name*</label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Chicken Curry Cut - Small Pieces"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="description">Description</label>
//               <textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Product description"
//               />
//             </div>

//             <div className="form-group meat-cut-options">
//               <label>Meat Cut Type*</label>
//               <div className="radio-group">
//                 <div className="radio-option">
//                   <input
//                     type="radio"
//                     id="jc-jatka"
//                     name="meatCut"
//                     value="jc-jatka"
//                     checked={formData.meatCut === 'jc-jatka'}
//                     onChange={handleInputChange}
//                     required
//                   />
//                   <label htmlFor="jc-jatka">JC Jatka</label>
//                 </div>
//                 <div className="radio-option">
//                   <input
//                     type="radio"
//                     id="halal-cut"
//                     name="meatCut"
//                     value="halal-cut"
//                     checked={formData.meatCut === 'halal-cut'}
//                     onChange={handleInputChange}
//                     required
//                   />
//                   <label htmlFor="halal-cut">Halal Cut</label>
//                 </div>
//               </div>
//             </div>

//             <div className="form-group">
//               <label htmlFor="weight">Weight*</label>
//               <input
//                 type="text"
//                 id="weight"
//                 name="weight"
//                 value={formData.weight}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 500 g"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="pieces">Pieces</label>
//               <input
//                 type="text"
//                 id="pieces"
//                 name="pieces"
//                 value={formData.pieces}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 12-18 Pieces"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="serves">Serves</label>
//               <input
//                 type="number"
//                 id="serves"
//                 name="serves"
//                 min="1"
//                 value={formData.serves}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 4"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="originalPrice">Original Price* (₹)</label>
//               <input
//                 type="number"
//                 id="originalPrice"
//                 name="originalPrice"
//                 min="0"
//                 step="0.01"
//                 value={formData.originalPrice}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 195"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="discount">Discount % (Auto-calculates selling price)</label>
//               <input
//                 type="number"
//                 id="discount"
//                 name="discount"
//                 min="0"
//                 max="100"
//                 value={formData.discount}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 18"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="price">Selling Price* (₹) (Auto-calculated from discount)</label>
//               <input
//                 type="number"
//                 id="price"
//                 name="price"
//                 min="0"
//                 step="0.01"
//                 value={formData.price}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 160"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="deliveryTime">Delivery Time (minutes)</label>
//               <input
//                 type="number"
//                 id="deliveryTime"
//                 name="deliveryTime"
//                 min="1"
//                 value={formData.deliveryTime}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 30"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="image">Image*</label>
//               <input
//                 type="file"
//                 id="image"
//                 name="image"
//                 accept="image/*"
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>

//             {activeCategory !== "Bestsellers" && (
//               <div className="form-group checkbox">
//                 <input
//                   type="checkbox"
//                   id="featured"
//                   name="featured"
//                   checked={formData.featured}
//                   onChange={handleInputChange}
//                 />
//                 <label htmlFor="featured">Featured Item (Appears in Bestsellers)</label>
//               </div>
//             )}

//             <div className="button-group">
//               <button 
//                 type="submit" 
//                 className={`submit-btn ${activeCategory === "Bestsellers" ? "bestseller-btn" : ""} ${activeCategory === "Shop by categories" ? "category-btn" : ""}`}
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Saving...' : `Add to ${activeDisplayCategory ? activeDisplayCategory.name : activeCategory}`}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateItems;






import React, { useState, useEffect } from 'react';
import { ref, push, set, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import '../styles/pages/CreateItems.css';

const CreateItems = () => {
  const defaultCategories = [
    "Bestsellers",
    "Shop by categories",
    "Match Day Essentials",
    "Premium fish & seafood selection"
  ];
  
  const [categories, setCategories] = useState(defaultCategories);
  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  
  // Dynamic display categories - will be fetched from Firebase
  const [displayCategories, setDisplayCategories] = useState([]);
  
  // Add new display category form state
  const [showNewDisplayCategoryForm, setShowNewDisplayCategoryForm] = useState(false);
  const [newDisplayCategoryData, setNewDisplayCategoryData] = useState({
    name: '',
    description: '',
    image: null
  });
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeDisplayCategory, setActiveDisplayCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: '',
    pieces: '',
    serves: '',
    price: '',
    originalPrice: '',
    discount: '',
    deliveryTime: '30',
    image: null,
    featured: false,
    meatCut: 'jc-jatka'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch display categories from Firebase
        const displayCategoriesRef = ref(db, 'displayCategories');
        const displaySnapshot = await get(displayCategoriesRef);
        
        if (displaySnapshot.exists()) {
          const displayCategoriesData = displaySnapshot.val();
          const displayCategoriesArray = Object.keys(displayCategoriesData).map(key => ({
            ...displayCategoriesData[key],
            firebaseKey: key
          }));
          setDisplayCategories(displayCategoriesArray);
        } else {
          // Initialize with default display categories if none exist
          const defaultDisplayCategories = [
            { id: "chicken", name: "Chicken", description: "Fresh chicken products" },
            { id: "fish-seafood", name: "Fish & Seafood", description: "Fresh fish and seafood" },
            { id: "mutton", name: "Mutton", description: "Premium mutton cuts" },
            { id: "liver-more", name: "Liver & More", description: "Liver and organ meat" },
            { id: "prawns-crabs", name: "Prawns & Crabs", description: "Fresh prawns and crabs" },
            { id: "eggs", name: "Eggs", description: "Farm fresh eggs" },
            { id: "combos", name: "Combos", description: "Value combo packages" }
          ];
          
          // Save default categories to Firebase
          for (const category of defaultDisplayCategories) {
            const newCategoryRef = push(displayCategoriesRef);
            await set(newCategoryRef, {
              ...category,
              createdAt: Date.now(),
              isActive: true
            });
          }
          
          // Fetch again after initialization
          const updatedSnapshot = await get(displayCategoriesRef);
          if (updatedSnapshot.exists()) {
            const updatedData = updatedSnapshot.val();
            const updatedArray = Object.keys(updatedData).map(key => ({
              ...updatedData[key],
              firebaseKey: key
            }));
            setDisplayCategories(updatedArray);
          }
        }

        // Fetch existing categories logic (unchanged)
        const categoriesRef = ref(db, 'categories');
        const snapshot = await get(categoriesRef);
        
        if (snapshot.exists()) {
          const categoriesData = snapshot.val();
          const categoriesArray = Object.keys(categoriesData).map(key => ({
            ...categoriesData[key],
            firebaseKey: key
          }));
        }

        // Fetch dynamic sections
        const sectionsRef = ref(db, 'sections');
        const sectionsSnapshot = await get(sectionsRef);
        
        if (sectionsSnapshot.exists()) {
          const sectionsData = sectionsSnapshot.val();
          const dynamicSections = Object.values(sectionsData).map(section => section.name);
          const allCategories = [...defaultCategories, ...dynamicSections];
          setCategories(allCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.originalPrice && formData.discount) {
      const original = parseFloat(formData.originalPrice);
      const discountPercent = parseFloat(formData.discount);
      
      if (!isNaN(original) && !isNaN(discountPercent) && discountPercent >= 0 && discountPercent <= 100) {
        const discountedPrice = original - (original * (discountPercent / 100));
        setFormData(prev => ({
          ...prev,
          price: Math.round(discountedPrice).toString()
        }));
      }
    }
  }, [formData.originalPrice, formData.discount]);

  useEffect(() => {
    if (formData.originalPrice && formData.price && !formData.discount) {
      const original = parseFloat(formData.originalPrice);
      const current = parseFloat(formData.price);
      
      if (!isNaN(original) && !isNaN(current) && original > current) {
        const discountPercent = Math.round(((original - current) / original) * 100);
        setFormData(prev => ({
          ...prev,
          discount: discountPercent.toString()
        }));
      }
    }
  }, [formData.originalPrice, formData.price, formData.discount]);

  const handleAddNewSection = async () => {
    if (!newSectionName.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a section name'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const sectionId = newSectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
      
      const sectionsRef = ref(db, 'sections');
      const newSectionRef = push(sectionsRef);
      
      await set(newSectionRef, {
        id: sectionId,
        name: newSectionName.trim(),
        displayName: newSectionName.trim(),
        createdAt: Date.now(),
        isActive: true
      });

      setCategories(prev => [...prev, newSectionName.trim()]);
      setNewSectionName('');
      setShowNewSectionForm(false);
      
      setMessage({
        type: 'success',
        text: `New section "${newSectionName.trim()}" created successfully!`
      });
      
    } catch (error) {
      console.error('Error creating new section:', error);
      setMessage({
        type: 'error',
        text: 'Error creating new section'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New function to handle adding display categories
  const handleAddNewDisplayCategory = async () => {
    if (!newDisplayCategoryData.name.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a display category name'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const categoryId = newDisplayCategoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
      
      let imageUrl = '';
      if (newDisplayCategoryData.image) {
        const imageStorageRef = storageRef(storage, `displayCategories/${Date.now()}_${newDisplayCategoryData.image.name}`);
        const snapshot = await uploadBytes(imageStorageRef, newDisplayCategoryData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const displayCategoriesRef = ref(db, 'displayCategories');
      const newDisplayCategoryRef = push(displayCategoriesRef);
      
      const newDisplayCategory = {
        id: categoryId,
        name: newDisplayCategoryData.name.trim(),
        description: newDisplayCategoryData.description.trim() || `${newDisplayCategoryData.name.trim()} products`,
        image: imageUrl,
        productCount: 0,
        createdAt: Date.now(),
        isActive: true
      };

      await set(newDisplayCategoryRef, newDisplayCategory);

      // Update local state
      setDisplayCategories(prev => [...prev, {
        ...newDisplayCategory,
        firebaseKey: newDisplayCategoryRef.key
      }]);
      
      // Reset form
      setNewDisplayCategoryData({
        name: '',
        description: '',
        image: null
      });
      setShowNewDisplayCategoryForm(false);
      
      setMessage({
        type: 'success',
        text: `New display category "${newDisplayCategoryData.name.trim()}" created successfully!`
      });
      
      // Clear file input
      const fileInput = document.getElementById('displayCategoryImage');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error creating new display category:', error);
      setMessage({
        type: 'error',
        text: 'Error creating new display category'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisplayCategoryInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setNewDisplayCategoryData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setNewDisplayCategoryData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setActiveDisplayCategory(null);
    setFormData(prev => ({
      ...prev,
      featured: category === "Bestsellers"
    }));
    setMessage({ type: '', text: '' });
  };

  const handleDisplayCategoryClick = (category) => {
    setActiveDisplayCategory(category);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!formData.name || !formData.weight || !formData.price || !formData.originalPrice) {
        throw new Error('Please fill in all required fields');
      }

      if (!activeCategory) {
        throw new Error('Please select a main category');
      }

      if (activeCategory === "Shop by categories" && !activeDisplayCategory) {
        throw new Error('Please select a display category when adding to Shop by categories');
      }
      
      if (!formData.meatCut) {
        throw new Error('Please select a meat cut type (JC Jatka or Halal Cut)');
      }

      let imageUrl = '';
      
      if (formData.image) {
        const folderPath = activeCategory === "Shop by categories" && activeDisplayCategory 
          ? `items/${activeDisplayCategory.id}/${formData.meatCut}` 
          : `items/${activeCategory.replace(/\s+/g, '-').toLowerCase()}/${formData.meatCut}`;
          
        const imageStorageRef = storageRef(storage, `${folderPath}/${Date.now()}_${formData.image.name}`);
        const snapshot = await uploadBytes(imageStorageRef, formData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      } else {
        throw new Error('Please select an image for the product');
      }

      const itemId = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-$/, '');

      const itemData = {
        id: itemId,
        name: formData.name,
        description: formData.description || '',
        weight: formData.weight,
        pieces: formData.pieces,
        serves: parseInt(formData.serves) || 0,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        discount: Number(formData.discount) || 0,
        deliveryTime: Number(formData.deliveryTime) || 30,
        category: activeCategory,
        featured: activeCategory === "Bestsellers" ? true : formData.featured,
        meatCut: formData.meatCut,
        isActive: true,
        createdAt: Date.now(),
        image: imageUrl
      };

      if (activeCategory === "Shop by categories" && activeDisplayCategory) {
        itemData.displayCategory = activeDisplayCategory.id;
      }

      const itemsRef = ref(db, 'items');
      const newItemRef = push(itemsRef);
      
      await set(newItemRef, itemData);
      
      if (activeCategory === "Shop by categories" && activeDisplayCategory) {
        try {
          // Update display category product count
          const displayCategoriesRef = ref(db, 'displayCategories');
          const snapshot = await get(displayCategoriesRef);
          
          if (snapshot.exists()) {
            const displayCategoriesData = snapshot.val();
            let categoryToUpdate = null;
            let categoryKey = null;
            
            Object.keys(displayCategoriesData).forEach(key => {
              if (displayCategoriesData[key].id === activeDisplayCategory.id) {
                categoryToUpdate = displayCategoriesData[key];
                categoryKey = key;
              }
            });
            
            if (categoryToUpdate && categoryKey) {
              const currentCount = categoryToUpdate.productCount || 0;
              await set(ref(db, `displayCategories/${categoryKey}/productCount`), currentCount + 1);
              
              // Update local state
              setDisplayCategories(prev => 
                prev.map(cat => 
                  cat.firebaseKey === categoryKey 
                    ? { ...cat, productCount: currentCount + 1 }
                    : cat
                )
              );
            }
          }

          // Also update the categories collection for backward compatibility
          const categoriesRef = ref(db, 'categories');
          const categoriesSnapshot = await get(categoriesRef);
          
          if (categoriesSnapshot.exists()) {
            const categoriesData = categoriesSnapshot.val();
            let categoryToUpdate = null;
            let categoryKey = null;
            
            Object.keys(categoriesData).forEach(key => {
              if (categoriesData[key].id === activeDisplayCategory.id) {
                categoryToUpdate = categoriesData[key];
                categoryKey = key;
              }
            });
            
            if (categoryToUpdate && categoryKey) {
              const currentCount = categoryToUpdate.productCount || 0;
              await set(ref(db, `categories/${categoryKey}/productCount`), currentCount + 1);
            } else {
              const newCategoryRef = push(ref(db, 'categories'));
              await set(newCategoryRef, {
                id: activeDisplayCategory.id,
                name: activeDisplayCategory.name,
                description: `${activeDisplayCategory.name} products`,
                productCount: 1,
                createdAt: Date.now(),
                image: imageUrl
              });
            }
          } else {
            const newCategoryRef = push(ref(db, 'categories'));
            await set(newCategoryRef, {
              id: activeDisplayCategory.id,
              name: activeDisplayCategory.name,
              description: `${activeDisplayCategory.name} products`,
              productCount: 1,
              createdAt: Date.now(),
              image: imageUrl
            });
          }
        } catch (error) {
          console.error('Error updating category product count:', error);
        }
      }
      
      setFormData({
        name: '',
        description: '',
        weight: '',
        pieces: '',
        serves: '',
        price: '',
        originalPrice: '',
        discount: '',
        deliveryTime: '30',
        image: null,
        featured: activeCategory === "Bestsellers",
        meatCut: 'jc-jatka'
      });
      
      setMessage({
        type: 'success',
        text: activeDisplayCategory 
          ? `Item successfully added to ${activeDisplayCategory.name} in ${activeCategory} (${formData.meatCut === 'jc-jatka' ? 'JC Jatka' : 'Halal Cut'})!`
          : `Item successfully added to ${activeCategory} (${formData.meatCut === 'jc-jatka' ? 'JC Jatka' : 'Halal Cut'})!`
      });
      
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage({
        type: 'error',
        text: `Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableDisplayCategories = () => {
    if (activeCategory !== "Shop by categories") return [];
    return displayCategories.filter(cat => cat.isActive !== false);
  };

  const availableDisplayCategories = getAvailableDisplayCategories();

  return (
    <div className="create-items-container">
      <h1>Add Items</h1>
      
      <div className="category-selection">
        <div className="category-section">
          <h3>Step 1: Select Main Category</h3>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
            <button
              className="category-btn add-new-btn"
              onClick={() => setShowNewSectionForm(true)}
            >
              + Add New Section
            </button>
          </div>
          
          {showNewSectionForm && (
            <div className="new-section-form">
              <h4>Create New Section</h4>
              <div className="form-group">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Enter section name (e.g., Fresh Fruits)"
                  className="section-name-input"
                />
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  onClick={handleAddNewSection}
                  disabled={isLoading}
                  className="create-section-btn"
                >
                  {isLoading ? 'Creating...' : 'Create Section'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSectionForm(false);
                    setNewSectionName('');
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {activeCategory === "Shop by categories" && (
          <div className="category-section">
            <h3>Step 2: Select Display Category</h3>
            <div className="display-category-info">
              <p>This determines where the item will appear in the "Shop by categories" section</p>
            </div>
            <div className="category-buttons">
              {availableDisplayCategories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${activeDisplayCategory?.id === category.id ? 'active' : ''}`}
                  onClick={() => handleDisplayCategoryClick(category)}
                >
                  {category.name}
                  {category.productCount !== undefined && (
                    <span className="product-count"> ({category.productCount})</span>
                  )}
                </button>
              ))}
              <button
                className="category-btn add-new-btn"
                onClick={() => setShowNewDisplayCategoryForm(true)}
              >
                + Add New Display Category
              </button>
            </div>
            
            {showNewDisplayCategoryForm && (
              <div className="new-section-form">
                <h4>Create New Display Category</h4>
                <div className="form-group">
                  <label htmlFor="displayCategoryName">Category Name*</label>
                  <input
                    type="text"
                    id="displayCategoryName"
                    name="name"
                    value={newDisplayCategoryData.name}
                    onChange={handleDisplayCategoryInputChange}
                    placeholder="Enter category name (e.g., Poultry, Seafood)"
                    className="section-name-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="displayCategoryDescription">Description</label>
                  <input
                    type="text"
                    id="displayCategoryDescription"
                    name="description"
                    value={newDisplayCategoryData.description}
                    onChange={handleDisplayCategoryInputChange}
                    placeholder="Enter category description"
                    className="section-name-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="displayCategoryImage">Category Image</label>
                  <input
                    type="file"
                    id="displayCategoryImage"
                    name="image"
                    accept="image/*"
                    onChange={handleDisplayCategoryInputChange}
                    className="section-name-input"
                  />
                </div>
                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={handleAddNewDisplayCategory}
                    disabled={isLoading}
                    className="create-section-btn"
                  >
                    {isLoading ? 'Creating...' : 'Create Display Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDisplayCategoryForm(false);
                      setNewDisplayCategoryData({
                        name: '',
                        description: '',
                        image: null
                      });
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {activeCategory && (activeCategory !== "Shop by categories" || activeDisplayCategory) && (
        <div className="item-form-container">
          <h2>
            Add Item to {activeCategory}
            {activeDisplayCategory && ` (${activeDisplayCategory.name})`}
          </h2>
          
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          <form className="item-form" onSubmit={handleSaveItem}>
            <div className="form-group">
              <label htmlFor="name">Item Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Chicken Curry Cut - Small Pieces"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
              />
            </div>

            <div className="form-group meat-cut-options">
              <label>Meat Cut Type*</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="jc-jatka"
                    name="meatCut"
                    value="jc-jatka"
                    checked={formData.meatCut === 'jc-jatka'}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="jc-jatka">JC Jatka</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="halal-cut"
                    name="meatCut"
                    value="halal-cut"
                    checked={formData.meatCut === 'halal-cut'}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="halal-cut">Halal Cut</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight*</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 500 g"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pieces">Pieces</label>
              <input
                type="text"
                id="pieces"
                name="pieces"
                value={formData.pieces}
                onChange={handleInputChange}
                placeholder="e.g., 12-18 Pieces"
              />
            </div>

            <div className="form-group">
              <label htmlFor="serves">Serves</label>
              <input
                type="number"
                id="serves"
                name="serves"
                min="1"
                value={formData.serves}
                onChange={handleInputChange}
                placeholder="e.g., 4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="originalPrice">Original Price* (₹)</label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleInputChange}
                placeholder="e.g., 195"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="discount">Discount % (Auto-calculates selling price)</label>
              <input
                type="number"
                id="discount"
                name="discount"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="e.g., 18"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Selling Price* (₹) (Auto-calculated from discount)</label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 160"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deliveryTime">Delivery Time (minutes)</label>
              <input
                type="number"
                id="deliveryTime"
                name="deliveryTime"
                min="1"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                placeholder="e.g., 30"
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Image*</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                required
              />
            </div>

            {activeCategory !== "Bestsellers" && (
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                <label htmlFor="featured">Featured Item (Appears in Bestsellers)</label>
              </div>
            )}

            <div className="button-group">
              <button 
                type="submit" 
                className={`submit-btn ${activeCategory === "Bestsellers" ? "bestseller-btn" : ""} ${activeCategory === "Shop by categories" ? "category-btn" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : `Add to ${activeDisplayCategory ? activeDisplayCategory.name : activeCategory}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateItems;