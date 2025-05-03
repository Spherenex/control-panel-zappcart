

// // src/pages/CreateItems.js
// import React, { useState, useEffect } from 'react';
// import { ref, push, set, get } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../firebase/config';
// import '../styles/pages/CreateItems.css';

// const CreateItems = () => {
//   // Main categories in database
//   const categories = [
//     "Bestsellers",
//     "Shop by categories",
//     "Match Day Essentials",
//     "Premium fish & seafood selection"
//   ];
  
//   // Display categories shown to users (in the Shop by categories section)
//   const [displayCategories, setDisplayCategories] = useState([
//     { id: "chicken", name: "Chicken" },
//     { id: "fish-seafood", name: "Fish & Seafood" },
//     { id: "mutton", name: "Mutton" },
//     { id: "liver-more", name: "Liver & More" },
//     { id: "prawns-crabs", name: "Prawns & Crabs" },
//     { id: "eggs", name: "Eggs" },
//     { id: "combos", name: "Combos" }
//   ]);
  
//   // Selected category state
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [activeDisplayCategory, setActiveDisplayCategory] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
  
//   // Form data state
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
//     featured: false
//   });

//   // Fetch existing categories on component mount
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
          
//           // Update display categories with fetched data
//           const newDisplayCategories = categoriesArray.map(cat => ({
//             id: cat.id,
//             name: cat.name
//           }));
          
//           // Only update if we have categories from DB
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

//   // Effect to calculate price when originalPrice or discount changes
//   useEffect(() => {
//     if (formData.originalPrice && formData.discount) {
//       const original = parseFloat(formData.originalPrice);
//       const discountPercent = parseFloat(formData.discount);
      
//       if (!isNaN(original) && !isNaN(discountPercent) && discountPercent >= 0 && discountPercent <= 100) {
//         // Calculate the discounted price
//         const discountedPrice = original - (original * (discountPercent / 100));
//         // Round to 2 decimal places and update price
//         setFormData(prev => ({
//           ...prev,
//           price: Math.round(discountedPrice).toString()
//         }));
//       }
//     }
//   }, [formData.originalPrice, formData.discount]);

//   // Effect to calculate discount when originalPrice and price changes
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
//   }, [formData.originalPrice, formData.price]);

//   // Handle selecting the main category
//   const handleCategoryClick = (category) => {
//     setActiveCategory(category);
//     setActiveDisplayCategory(null);
    
//     // Set featured flag automatically for bestsellers
//     setFormData(prev => ({
//       ...prev,
//       featured: category === "Bestsellers"
//     }));
    
//     // Reset message when switching categories
//     setMessage({ type: '', text: '' });
//   };

//   // Handle selecting the display category
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
//       // Basic validation
//       if (!formData.name || !formData.weight || !formData.price || !formData.originalPrice) {
//         throw new Error('Please fill in all required fields');
//       }

//       if (!activeCategory) {
//         throw new Error('Please select a main category');
//       }

//       if (activeCategory === "Shop by categories" && !activeDisplayCategory) {
//         throw new Error('Please select a display category when adding to Shop by categories');
//       }

//       let imageUrl = '';
      
//       // Upload image if selected
//       if (formData.image) {
//         // Use category for folder organization
//         const folderPath = activeCategory === "Shop by categories" && activeDisplayCategory 
//           ? `items/${activeDisplayCategory.id}` 
//           : `items/${activeCategory.replace(/\s+/g, '-').toLowerCase()}`;
          
//         const imageStorageRef = storageRef(storage, `${folderPath}/${Date.now()}_${formData.image.name}`);
//         const snapshot = await uploadBytes(imageStorageRef, formData.image);
//         imageUrl = await getDownloadURL(snapshot.ref);
//       } else {
//         throw new Error('Please select an image for the product');
//       }

//       // Generate unique ID based on slugified name
//       const itemId = formData.name
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/-$/, '');

//       // Prepare data for Realtime Database
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
//         featured: activeCategory === "Bestsellers" ? true : formData.featured, // Auto set for bestsellers
//         createdAt: Date.now(),
//         image: imageUrl
//       };

//       // Add display category if selected
//       if (activeCategory === "Shop by categories" && activeDisplayCategory) {
//         itemData.displayCategory = activeDisplayCategory.id;
//       }

//       // Save to Realtime Database
//       const itemsRef = ref(db, 'items');
//       const newItemRef = push(itemsRef);
      
//       await set(newItemRef, itemData);
      
//       // If this is a "Shop by categories" item with a display category,
//       // update the product count for that category
//       if (activeCategory === "Shop by categories" && activeDisplayCategory) {
//         try {
//           const categoriesRef = ref(db, 'categories');
//           const snapshot = await get(categoriesRef);
          
//           if (snapshot.exists()) {
//             const categoriesData = snapshot.val();
//             let categoryToUpdate = null;
//             let categoryKey = null;
            
//             // Find the category that matches the activeDisplayCategory
//             Object.keys(categoriesData).forEach(key => {
//               if (categoriesData[key].id === activeDisplayCategory.id) {
//                 categoryToUpdate = categoriesData[key];
//                 categoryKey = key;
//               }
//             });
            
//             if (categoryToUpdate && categoryKey) {
//               // Update product count
//               const currentCount = categoryToUpdate.productCount || 0;
//               await set(ref(db, `categories/${categoryKey}/productCount`), currentCount + 1);
//             } else {
//               // Create a new category if it doesn't exist
//               const newCategoryRef = push(ref(db, 'categories'));
//               await set(newCategoryRef, {
//                 id: activeDisplayCategory.id,
//                 name: activeDisplayCategory.name,
//                 description: `${activeDisplayCategory.name} products`,
//                 productCount: 1,
//                 createdAt: Date.now(),
//                 image: imageUrl // Use the product image for the category initially
//               });
//             }
//           } else {
//             // No categories exist, create a new one
//             const newCategoryRef = push(ref(db, 'categories'));
//             await set(newCategoryRef, {
//               id: activeDisplayCategory.id,
//               name: activeDisplayCategory.name,
//               description: `${activeDisplayCategory.name} products`,
//               productCount: 1,
//               createdAt: Date.now(),
//               image: imageUrl // Use the product image for the category initially
//             });
//           }
//         } catch (error) {
//           console.error('Error updating category product count:', error);
//         }
//       }
      
//       // Reset form
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
//         featured: activeCategory === "Bestsellers" // Keep this set if still in bestsellers
//       });
      
//       // Show success message
//       setMessage({
//         type: 'success',
//         text: activeDisplayCategory 
//           ? `Item successfully added to ${activeDisplayCategory.name} in ${activeCategory}!`
//           : `Item successfully added to ${activeCategory}!`
//       });
      
//       // Reset file input
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

//   // Get available display categories for the selected main category
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
  const categories = [
    "Bestsellers",
    "Shop by categories",
    "Match Day Essentials",
    "Premium fish & seafood selection"
  ];
  
  const [displayCategories, setDisplayCategories] = useState([
    { id: "chicken", name: "Chicken" },
    { id: "fish-seafood", name: "Fish & Seafood" },
    { id: "mutton", name: "Mutton" },
    { id: "liver-more", name: "Liver & More" },
    { id: "prawns-crabs", name: "Prawns & Crabs" },
    { id: "eggs", name: "Eggs" },
    { id: "combos", name: "Combos" }
  ]);
  
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
    featured: false
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = ref(db, 'categories');
        const snapshot = await get(categoriesRef);
        
        if (snapshot.exists()) {
          const categoriesData = snapshot.val();
          const categoriesArray = Object.keys(categoriesData).map(key => ({
            ...categoriesData[key],
            firebaseKey: key
          }));
          
          const newDisplayCategories = categoriesArray.map(cat => ({
            id: cat.id,
            name: cat.name
          }));
          
          if (newDisplayCategories.length > 0) {
            setDisplayCategories(newDisplayCategories);
          }
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

      let imageUrl = '';
      
      if (formData.image) {
        const folderPath = activeCategory === "Shop by categories" && activeDisplayCategory 
          ? `items/${activeDisplayCategory.id}` 
          : `items/${activeCategory.replace(/\s+/g, '-').toLowerCase()}`;
          
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
          const categoriesRef = ref(db, 'categories');
          const snapshot = await get(categoriesRef);
          
          if (snapshot.exists()) {
            const categoriesData = snapshot.val();
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
        featured: activeCategory === "Bestsellers"
      });
      
      setMessage({
        type: 'success',
        text: activeDisplayCategory 
          ? `Item successfully added to ${activeDisplayCategory.name} in ${activeCategory}!`
          : `Item successfully added to ${activeCategory}!`
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
    return displayCategories;
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
          </div>
        </div>
        
        {activeCategory === "Shop by categories" && availableDisplayCategories.length > 0 && (
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
                </button>
              ))}
            </div>
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