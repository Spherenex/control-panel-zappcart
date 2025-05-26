






// import React, { useState, useEffect } from 'react';
// import { ref, onValue, update, remove } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../firebase/config';
// import '../styles/pages/ManageItems.css';

// const ManageItems = () => {
//   const [activeTab, setActiveTab] = useState('items'); // 'items' or 'categories'
//   const [items, setItems] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editingItem, setEditingItem] = useState(null);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [editFormData, setEditFormData] = useState({
//     name: '',
//     description: '',
//     weight: '',
//     pieces: '',
//     serves: '',
//     price: '',
//     originalPrice: '',
//     discount: '',
//     deliveryTime: '30',
//     category: 'Meat',
//     image: null,
//     featured: false,
//     isActive: true,
//     meatCut: 'jc-jatka'
//   });
//   const [editCategoryData, setEditCategoryData] = useState({
//     name: '',
//     description: '',
//     image: null,
//     isActive: true
//   });

//   const predefinedCategories = ['Meat', 'Seafood', 'Shop by categories', 'Bestsellers', 'Match Day Essentials', 'Premium fish & seafood selection'];

//   useEffect(() => {
//     // Fetch Items
//     const itemsRef = ref(db, 'items');
//     const itemsUnsubscribe = onValue(itemsRef, (snapshot) => {
//       try {
//         if (snapshot.exists()) {
//           const itemsData = [];
//           snapshot.forEach((childSnapshot) => {
//             itemsData.push({
//               firebaseKey: childSnapshot.key,
//               ...childSnapshot.val()
//             });
//           });
//           setItems(itemsData);
//         } else {
//           setItems([]);
//         }
//       } catch (err) {
//         console.error('Error fetching items:', err);
//         setError('Failed to load items. Please try again later.');
//       }
//     }, (err) => {
//       console.error('Error listening to items:', err);
//       setError('Failed to load items. Please try again later.');
//     });

//     // Fetch Categories
//     const categoriesRef = ref(db, 'displayCategories');
//     const categoriesUnsubscribe = onValue(categoriesRef, (snapshot) => {
//       try {
//         if (snapshot.exists()) {
//           const categoriesData = [];
//           snapshot.forEach((childSnapshot) => {
//             categoriesData.push({
//               firebaseKey: childSnapshot.key,
//               ...childSnapshot.val()
//             });
//           });
//           setCategories(categoriesData);
//         } else {
//           setCategories([]);
//         }
//       } catch (err) {
//         console.error('Error fetching categories:', err);
//         setError('Failed to load categories. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     }, (err) => {
//       console.error('Error listening to categories:', err);
//       setError('Failed to load categories. Please try again later.');
//       setLoading(false);
//     });

//     return () => {
//       itemsUnsubscribe();
//       categoriesUnsubscribe();
//     };
//   }, []);

//   // Item Management Functions
//   const handleEditItem = (item) => {
//     setEditingItem(item);
//     setEditFormData({
//       name: item.name || '',
//       description: item.description || '',
//       weight: item.weight || '',
//       pieces: item.pieces || '',
//       serves: item.serves || '',
//       price: item.price || '',
//       originalPrice: item.originalPrice || '',
//       discount: item.discount || '',
//       deliveryTime: item.deliveryTime || '30',
//       category: item.category || 'Meat',
//       image: null,
//       featured: item.featured || false,
//       isActive: item.isActive || true,
//       meatCut: item.meatCut || 'jc-jatka'
//     });
//   };

//   const handleItemInputChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     setEditFormData(prev => ({
//       ...prev,
//       [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSaveItemEdit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let imageUrl = editingItem.image;

//       if (editFormData.image) {
//         const folderPath = editFormData.category === 'Shop by categories' && editFormData.displayCategory
//           ? `items/${editFormData.displayCategory}/${editFormData.meatCut}`
//           : `items/${editFormData.category.replace(/\s+/g, '-').toLowerCase()}/${editFormData.meatCut}`;
//         const imageStorageRef = storageRef(storage, `${folderPath}/${Date.now()}_${editFormData.image.name}`);
//         const snapshot = await uploadBytes(imageStorageRef, editFormData.image);
//         imageUrl = await getDownloadURL(snapshot.ref);
//       }

//       const updatedItem = {
//         ...editingItem,
//         name: editFormData.name,
//         description: editFormData.description,
//         weight: editFormData.weight,
//         pieces: editFormData.pieces,
//         serves: parseInt(editFormData.serves) || 0,
//         price: parseFloat(editFormData.price) || 0,
//         originalPrice: parseFloat(editFormData.originalPrice) || 0,
//         discount: parseFloat(editFormData.discount) || 0,
//         deliveryTime: parseInt(editFormData.deliveryTime) || 30,
//         category: editFormData.category,
//         image: imageUrl,
//         featured: editFormData.featured,
//         isActive: editFormData.isActive,
//         meatCut: editFormData.meatCut,
//         updatedAt: Date.now()
//       };

//       await update(ref(db, `items/${editingItem.firebaseKey}`), updatedItem);
//       setEditingItem(null);
//       resetItemForm();
//     } catch (error) {
//       console.error('Error updating item:', error);
//       setError('Failed to update item. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleItemStatus = async (firebaseKey, currentActive) => {
//     try {
//       const itemRef = ref(db, `items/${firebaseKey}`);
//       await update(itemRef, { 
//         isActive: !currentActive,
//         updatedAt: Date.now()
//       });
//     } catch (error) {
//       console.error('Error toggling item status:', error);
//       setError('Failed to update item status. Please try again.');
//     }
//   };

//   const handleDeleteItem = async (firebaseKey) => {
//     if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
//       try {
//         await remove(ref(db, `items/${firebaseKey}`));
//       } catch (error) {
//         console.error('Error deleting item:', error);
//         setError('Failed to delete item. Please try again.');
//       }
//     }
//   };

//   // Category Management Functions
//   const handleEditCategory = (category) => {
//     setEditingCategory(category);
//     setEditCategoryData({
//       name: category.name || '',
//       description: category.description || '',
//       image: null,
//       isActive: category.isActive !== false
//     });
//   };

//   const handleCategoryInputChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     setEditCategoryData(prev => ({
//       ...prev,
//       [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSaveCategoryEdit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let imageUrl = editingCategory.image;

//       if (editCategoryData.image) {
//         const imageStorageRef = storageRef(storage, `displayCategories/${Date.now()}_${editCategoryData.image.name}`);
//         const snapshot = await uploadBytes(imageStorageRef, editCategoryData.image);
//         imageUrl = await getDownloadURL(snapshot.ref);
//       }

//       const updatedCategory = {
//         ...editingCategory,
//         name: editCategoryData.name,
//         description: editCategoryData.description,
//         image: imageUrl,
//         isActive: editCategoryData.isActive,
//         updatedAt: Date.now()
//       };

//       await update(ref(db, `displayCategories/${editingCategory.firebaseKey}`), updatedCategory);
//       setEditingCategory(null);
//       resetCategoryForm();
//     } catch (error) {
//       console.error('Error updating category:', error);
//       setError('Failed to update category. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleCategoryStatus = async (firebaseKey, currentActive) => {
//     try {
//       const categoryRef = ref(db, `displayCategories/${firebaseKey}`);
//       await update(categoryRef, { 
//         isActive: !currentActive,
//         updatedAt: Date.now()
//       });
//     } catch (error) {
//       console.error('Error toggling category status:', error);
//       setError('Failed to update category status. Please try again.');
//     }
//   };

//   const handleDeleteCategory = async (firebaseKey, categoryName) => {
//     if (window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone and may affect existing products.`)) {
//       try {
//         await remove(ref(db, `displayCategories/${firebaseKey}`));
//       } catch (error) {
//         console.error('Error deleting category:', error);
//         setError('Failed to delete category. Please try again.');
//       }
//     }
//   };

//   // Utility Functions
//   const resetItemForm = () => {
//     setEditFormData({
//       name: '',
//       description: '',
//       weight: '',
//       pieces: '',
//       serves: '',
//       price: '',
//       originalPrice: '',
//       discount: '',
//       deliveryTime: '30',
//       category: 'Meat',
//       image: null,
//       featured: false,
//       isActive: true,
//       meatCut: 'jc-jatka'
//     });
//   };

//   const resetCategoryForm = () => {
//     setEditCategoryData({
//       name: '',
//       description: '',
//       image: null,
//       isActive: true
//     });
//   };

//   if (loading && items.length === 0 && categories.length === 0) {
//     return (
//       <div className="manage-items-container">
//         <div className="loading-container">
//           <div className="spinner"></div>
//           <p>Loading data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="manage-items-container">
//         <div className="alert error">
//           {error}
//           <button onClick={() => setError(null)} className="close-error">×</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="manage-items-container">
//       <div className="page-header">
//         <h1>Manage Items & Categories</h1>
//         <p>Admin panel to manage all products and categories</p>
//       </div>

//       {/* Tab Navigation */}
//       <div className="tab-navigation">
//         <button 
//           className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
//           onClick={() => setActiveTab('items')}
//         >
//           Manage Items ({items.length})
//         </button>
//         <button 
//           className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
//           onClick={() => setActiveTab('categories')}
//         >
//           Manage Categories ({categories.length})
//         </button>
//       </div>

//       {/* Items Tab */}
//       {activeTab === 'items' && (
//         <div className="tab-content">
//           {items.length === 0 ? (
//             <div className="no-items">
//               <h3>No items available to manage</h3>
//               <p>Items created through the admin panel will appear here.</p>
//             </div>
//           ) : (
//             <div className="items-list">
//               <div className="list-header">
//                 <h2>All Items ({items.length})</h2>
//               </div>
//               {items.map(item => (
//                 <div key={item.firebaseKey} className={`item-card ${!item.isActive ? 'inactive' : ''}`}>
//                   <div className="item-image">
//                     {item.image ? (
//                       <img src={item.image} alt={item.name} />
//                     ) : (
//                       <div className="no-image">No image uploaded</div>
//                     )}
//                   </div>
//                   <div className="item-details">
//                     <h3>{item.name}</h3>
//                     <div className="item-info">
//                       <p><strong>Category:</strong> {item.category}</p>
//                       {item.displayCategory && <p><strong>Display Category:</strong> {item.displayCategory}</p>}
//                       {item.meatCut && <p><strong>Meat Cut:</strong> {item.meatCut === 'jc-jatka' ? 'JC Jatka' : 'Halal Cut'}</p>}
//                       <p><strong>Weight:</strong> {item.weight}</p>
//                       <p><strong>Price:</strong> ₹{item.price}</p>
//                       <p><strong>Original Price:</strong> ₹{item.originalPrice}</p>
//                       <p><strong>Discount:</strong> {item.discount}%</p>
//                       <p><strong>Status:</strong> 
//                         <span className={`status ${item.isActive ? 'active' : 'inactive'}`}>
//                           {item.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </p>
//                       {item.featured && <p><strong>Featured:</strong> <span className="featured-badge">Yes</span></p>}
//                     </div>
//                   </div>
//                   <div className="item-actions">
//                     <button onClick={() => handleEditItem(item)} className="edit-button">Edit</button>
//                     <button 
//                       onClick={() => handleToggleItemStatus(item.firebaseKey, item.isActive)} 
//                       className={`toggle-button ${item.isActive ? 'deactivate' : 'activate'}`}
//                     >
//                       {item.isActive ? 'Deactivate' : 'Activate'}
//                     </button>
//                     <button onClick={() => handleDeleteItem(item.firebaseKey)} className="delete-button">Delete</button>
//                   </div>
                  
//                   {/* Edit Item Form */}
//                   {editingItem && editingItem.firebaseKey === item.firebaseKey && (
//                     <div className="edit-form-overlay">
//                       <form onSubmit={handleSaveItemEdit} className="edit-form">
//                         <h3>Edit Item</h3>
//                         <div className="form-row">
//                           <div className="form-group">
//                             <label htmlFor="name">Name*</label>
//                             <input
//                               type="text"
//                               id="name"
//                               name="name"
//                               value={editFormData.name}
//                               onChange={handleItemInputChange}
//                               required
//                             />
//                           </div>
//                           <div className="form-group">
//                             <label htmlFor="weight">Weight*</label>
//                             <input
//                               type="text"
//                               id="weight"
//                               name="weight"
//                               value={editFormData.weight}
//                               onChange={handleItemInputChange}
//                               required
//                             />
//                           </div>
//                         </div>
                        
//                         <div className="form-group">
//                           <label htmlFor="description">Description</label>
//                           <textarea
//                             id="description"
//                             name="description"
//                             value={editFormData.description}
//                             onChange={handleItemInputChange}
//                           />
//                         </div>

//                         <div className="form-row">
//                           <div className="form-group">
//                             <label htmlFor="originalPrice">Original Price* (₹)</label>
//                             <input
//                               type="number"
//                               id="originalPrice"
//                               name="originalPrice"
//                               value={editFormData.originalPrice}
//                               onChange={handleItemInputChange}
//                               required
//                             />
//                           </div>
//                           <div className="form-group">
//                             <label htmlFor="price">Selling Price* (₹)</label>
//                             <input
//                               type="number"
//                               id="price"
//                               name="price"
//                               value={editFormData.price}
//                               onChange={handleItemInputChange}
//                               required
//                             />
//                           </div>
//                           <div className="form-group">
//                             <label htmlFor="discount">Discount %</label>
//                             <input
//                               type="number"
//                               id="discount"
//                               name="discount"
//                               value={editFormData.discount}
//                               onChange={handleItemInputChange}
//                             />
//                           </div>
//                         </div>

//                         <div className="form-row">
//                           <div className="form-group">
//                             <label htmlFor="category">Category*</label>
//                             <select
//                               id="category"
//                               name="category"
//                               value={editFormData.category}
//                               onChange={handleItemInputChange}
//                               required
//                             >
//                               {predefinedCategories.map(cat => (
//                                 <option key={cat} value={cat}>{cat}</option>
//                               ))}
//                             </select>
//                           </div>
//                           <div className="form-group">
//                             <label htmlFor="meatCut">Meat Cut</label>
//                             <select
//                               id="meatCut"
//                               name="meatCut"
//                               value={editFormData.meatCut}
//                               onChange={handleItemInputChange}
//                             >
//                               <option value="jc-jatka">JC Jatka</option>
//                               <option value="halal-cut">Halal Cut</option>
//                             </select>
//                           </div>
//                         </div>
                        
//                         <div className="form-group">
//                           <label htmlFor="image">Update Image</label>
//                           <input
//                             type="file"
//                             id="image"
//                             name="image"
//                             accept="image/*"
//                             onChange={handleItemInputChange}
//                           />
//                         </div>

//                         <div className="form-checkboxes">
//                           <div className="checkbox-group">
//                             <input
//                               type="checkbox"
//                               id="featured"
//                               name="featured"
//                               checked={editFormData.featured}
//                               onChange={handleItemInputChange}
//                             />
//                             <label htmlFor="featured">Featured Item</label>
//                           </div>
//                           <div className="checkbox-group">
//                             <input
//                               type="checkbox"
//                               id="isActive"
//                               name="isActive"
//                               checked={editFormData.isActive}
//                               onChange={handleItemInputChange}
//                             />
//                             <label htmlFor="isActive">Active</label>
//                           </div>
//                         </div>

//                         <div className="form-actions">
//                           <button type="submit" className="save-button" disabled={loading}>
//                             {loading ? 'Saving...' : 'Save Changes'}
//                           </button>
//                           <button type="button" onClick={() => setEditingItem(null)} className="cancel-button">
//                             Cancel
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Categories Tab */}
//       {activeTab === 'categories' && (
//         <div className="tab-content">
//           {categories.length === 0 ? (
//             <div className="no-items">
//               <h3>No categories available to manage</h3>
//               <p>Categories created through the admin panel will appear here.</p>
//             </div>
//           ) : (
//             <div className="categories-list">
//               <div className="list-header">
//                 <h2>All Categories ({categories.length})</h2>
//               </div>
//               {categories.map(category => (
//                 <div key={category.firebaseKey} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
//                   <div className="category-image">
//                     {category.image ? (
//                       <img src={category.image} alt={category.name} />
//                     ) : (
//                       <div className="no-image">No image uploaded</div>
//                     )}
//                   </div>
//                   <div className="category-details">
//                     <h3>{category.name}</h3>
//                     <div className="category-info">
//                       <p><strong>Description:</strong> {category.description || 'No description'}</p>
//                       <p><strong>ID:</strong> {category.id}</p>
//                       <p><strong>Product Count:</strong> {category.productCount || 0}</p>
//                       <p><strong>Status:</strong> 
//                         <span className={`status ${category.isActive !== false ? 'active' : 'inactive'}`}>
//                           {category.isActive !== false ? 'Active' : 'Inactive'}
//                         </span>
//                       </p>
//                       {category.createdAt && (
//                         <p><strong>Created:</strong> {new Date(category.createdAt).toLocaleDateString()}</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="category-actions">
//                     <button onClick={() => handleEditCategory(category)} className="edit-button">Edit</button>
//                     <button 
//                       onClick={() => handleToggleCategoryStatus(category.firebaseKey, category.isActive !== false)} 
//                       className={`toggle-button ${category.isActive !== false ? 'deactivate' : 'activate'}`}
//                     >
//                       {category.isActive !== false ? 'Deactivate' : 'Activate'}
//                     </button>
//                     <button onClick={() => handleDeleteCategory(category.firebaseKey, category.name)} className="delete-button">Delete</button>
//                   </div>
                  
//                   {/* Edit Category Form */}
//                   {editingCategory && editingCategory.firebaseKey === category.firebaseKey && (
//                     <div className="edit-form-overlay">
//                       <form onSubmit={handleSaveCategoryEdit} className="edit-form">
//                         <h3>Edit Category</h3>
//                         <div className="form-group">
//                           <label htmlFor="categoryName">Category Name*</label>
//                           <input
//                             type="text"
//                             id="categoryName"
//                             name="name"
//                             value={editCategoryData.name}
//                             onChange={handleCategoryInputChange}
//                             required
//                           />
//                         </div>
                        
//                         <div className="form-group">
//                           <label htmlFor="categoryDescription">Description</label>
//                           <textarea
//                             id="categoryDescription"
//                             name="description"
//                             value={editCategoryData.description}
//                             onChange={handleCategoryInputChange}
//                             placeholder="Enter category description"
//                           />
//                         </div>
                        
//                         <div className="form-group">
//                           <label htmlFor="categoryImage">Update Image</label>
//                           <input
//                             type="file"
//                             id="categoryImage"
//                             name="image"
//                             accept="image/*"
//                             onChange={handleCategoryInputChange}
//                           />
//                         </div>

//                         <div className="checkbox-group">
//                           <input
//                             type="checkbox"
//                             id="categoryActive"
//                             name="isActive"
//                             checked={editCategoryData.isActive}
//                             onChange={handleCategoryInputChange}
//                           />
//                           <label htmlFor="categoryActive">Active</label>
//                         </div>

//                         <div className="form-actions">
//                           <button type="submit" className="save-button" disabled={loading}>
//                             {loading ? 'Saving...' : 'Save Changes'}
//                           </button>
//                           <button type="button" onClick={() => setEditingCategory(null)} className="cancel-button">
//                             Cancel
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageItems;


import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import '../styles/pages/ManageItems.css';

const ManageItems = () => {
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'categories'
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    weight: '',
    pieces: '',
    serves: '',
    price: '',
    originalPrice: '',
    discount: '',
    deliveryTime: '30',
    category: 'Meat',
    image: null,
    featured: false,
    isActive: true,
    meatCut: 'jc-jatka'
  });
  const [editCategoryData, setEditCategoryData] = useState({
    name: '',
    description: '',
    image: null,
    isActive: true
  });

  const predefinedCategories = ['Meat', 'Seafood', 'Shop by categories', 'Bestsellers', 'Match Day Essentials', 'Premium fish & seafood selection'];

  useEffect(() => {
    // Fetch Items
    const itemsRef = ref(db, 'items');
    const itemsUnsubscribe = onValue(itemsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const itemsData = [];
          snapshot.forEach((childSnapshot) => {
            itemsData.push({
              firebaseKey: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          setItems(itemsData);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items. Please try again later.');
      }
    }, (err) => {
      console.error('Error listening to items:', err);
      setError('Failed to load items. Please try again later.');
    });

    // Fetch Categories
    const categoriesRef = ref(db, 'displayCategories');
    const categoriesUnsubscribe = onValue(categoriesRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const categoriesData = [];
          snapshot.forEach((childSnapshot) => {
            categoriesData.push({
              firebaseKey: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Error listening to categories:', err);
      setError('Failed to load categories. Please try again later.');
      setLoading(false);
    });

    return () => {
      itemsUnsubscribe();
      categoriesUnsubscribe();
    };
  }, []);

  // Item Management Functions
  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name || '',
      description: item.description || '',
      weight: item.weight || '',
      pieces: item.pieces || '',
      serves: item.serves || '',
      price: item.price || '',
      originalPrice: item.originalPrice || '',
      discount: item.discount || '',
      deliveryTime: item.deliveryTime || '30',
      category: item.category || 'Meat',
      image: null,
      featured: item.featured || false,
      isActive: item.isActive || true,
      meatCut: item.meatCut || 'jc-jatka'
    });
    
    // Prevent body scrolling when popup is open
    document.body.style.overflow = 'hidden';
  };

  const handleItemInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveItemEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = editingItem.image;

      if (editFormData.image) {
        const folderPath = editFormData.category === 'Shop by categories' && editFormData.displayCategory
          ? `items/${editFormData.displayCategory}/${editFormData.meatCut}`
          : `items/${editFormData.category.replace(/\s+/g, '-').toLowerCase()}/${editFormData.meatCut}`;
        const imageStorageRef = storageRef(storage, `${folderPath}/${Date.now()}_${editFormData.image.name}`);
        const snapshot = await uploadBytes(imageStorageRef, editFormData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const updatedItem = {
        ...editingItem,
        name: editFormData.name,
        description: editFormData.description,
        weight: editFormData.weight,
        pieces: editFormData.pieces,
        serves: parseInt(editFormData.serves) || 0,
        price: parseFloat(editFormData.price) || 0,
        originalPrice: parseFloat(editFormData.originalPrice) || 0,
        discount: parseFloat(editFormData.discount) || 0,
        deliveryTime: parseInt(editFormData.deliveryTime) || 30,
        category: editFormData.category,
        image: imageUrl,
        featured: editFormData.featured,
        isActive: editFormData.isActive,
        meatCut: editFormData.meatCut,
        updatedAt: Date.now()
      };

      await update(ref(db, `items/${editingItem.firebaseKey}`), updatedItem);
      setEditingItem(null);
      resetItemForm();
      
      // Re-enable body scrolling
      document.body.style.overflow = '';
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItemStatus = async (firebaseKey, currentActive) => {
    try {
      const itemRef = ref(db, `items/${firebaseKey}`);
      await update(itemRef, { 
        isActive: !currentActive,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error toggling item status:', error);
      setError('Failed to update item status. Please try again.');
    }
  };

  const handleDeleteItem = async (firebaseKey) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await remove(ref(db, `items/${firebaseKey}`));
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item. Please try again.');
      }
    }
  };

  // Category Management Functions
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryData({
      name: category.name || '',
      description: category.description || '',
      image: null,
      isActive: category.isActive !== false
    });
    
    // Prevent body scrolling when popup is open
    document.body.style.overflow = 'hidden';
  };

  const handleCategoryInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setEditCategoryData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveCategoryEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = editingCategory.image;

      if (editCategoryData.image) {
        const imageStorageRef = storageRef(storage, `displayCategories/${Date.now()}_${editCategoryData.image.name}`);
        const snapshot = await uploadBytes(imageStorageRef, editCategoryData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const updatedCategory = {
        ...editingCategory,
        name: editCategoryData.name,
        description: editCategoryData.description,
        image: imageUrl,
        isActive: editCategoryData.isActive,
        updatedAt: Date.now()
      };

      await update(ref(db, `displayCategories/${editingCategory.firebaseKey}`), updatedCategory);
      setEditingCategory(null);
      resetCategoryForm();
      
      // Re-enable body scrolling
      document.body.style.overflow = '';
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategoryStatus = async (firebaseKey, currentActive) => {
    try {
      const categoryRef = ref(db, `displayCategories/${firebaseKey}`);
      await update(categoryRef, { 
        isActive: !currentActive,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error toggling category status:', error);
      setError('Failed to update category status. Please try again.');
    }
  };

  const handleDeleteCategory = async (firebaseKey, categoryName) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone and may affect existing products.`)) {
      try {
        await remove(ref(db, `displayCategories/${firebaseKey}`));
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category. Please try again.');
      }
    }
  };

  // Handle modal close
  const handleCloseItemModal = () => {
    setEditingItem(null);
    resetItemForm();
    // Re-enable body scrolling
    document.body.style.overflow = '';
  };

  const handleCloseCategoryModal = () => {
    setEditingCategory(null);
    resetCategoryForm();
    // Re-enable body scrolling
    document.body.style.overflow = '';
  };

  // Utility Functions
  const resetItemForm = () => {
    setEditFormData({
      name: '',
      description: '',
      weight: '',
      pieces: '',
      serves: '',
      price: '',
      originalPrice: '',
      discount: '',
      deliveryTime: '30',
      category: 'Meat',
      image: null,
      featured: false,
      isActive: true,
      meatCut: 'jc-jatka'
    });
  };

  const resetCategoryForm = () => {
    setEditCategoryData({
      name: '',
      description: '',
      image: null,
      isActive: true
    });
  };

  if (loading && items.length === 0 && categories.length === 0) {
    return (
      <div className="manage-items-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-items-container">
        <div className="alert error">
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-items-container">
      <div className="page-header">
        <h1>Manage Items & Categories</h1>
        <p>Admin panel to manage all products and categories</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Manage Items ({items.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Manage Categories ({categories.length})
        </button>
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="tab-content">
          {items.length === 0 ? (
            <div className="no-items">
              <h3>No items available to manage</h3>
              <p>Items created through the admin panel will appear here.</p>
            </div>
          ) : (
            <div className="items-list">
              <div className="list-header">
                <h2>All Items ({items.length})</h2>
              </div>
              {items.map(item => (
                <div key={item.firebaseKey} className={`item-card ${!item.isActive ? 'inactive' : ''}`}>
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="no-image">No image uploaded</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <div className="item-info">
                      <p><strong>Category:</strong> {item.category}</p>
                      {item.displayCategory && <p><strong>Display Category:</strong> {item.displayCategory}</p>}
                      {item.meatCut && <p><strong>Meat Cut:</strong> {item.meatCut === 'jc-jatka' ? 'JC Jatka' : 'Halal Cut'}</p>}
                      <p><strong>Weight:</strong> {item.weight}</p>
                      <p><strong>Price:</strong> ₹{item.price}</p>
                      <p><strong>Original Price:</strong> ₹{item.originalPrice}</p>
                      <p><strong>Discount:</strong> {item.discount}%</p>
                      <p><strong>Status:</strong> 
                        <span className={`status ${item.isActive ? 'active' : 'inactive'}`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                      {item.featured && <p><strong>Featured:</strong> <span className="featured-badge">Yes</span></p>}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEditItem(item)} className="edit-button">Edit</button>
                    <button 
                      onClick={() => handleToggleItemStatus(item.firebaseKey, item.isActive)} 
                      className={`toggle-button ${item.isActive ? 'deactivate' : 'activate'}`}
                    >
                      {item.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteItem(item.firebaseKey)} className="delete-button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="tab-content">
          {categories.length === 0 ? (
            <div className="no-items">
              <h3>No categories available to manage</h3>
              <p>Categories created through the admin panel will appear here.</p>
            </div>
          ) : (
            <div className="categories-list">
              <div className="list-header">
                <h2>All Categories ({categories.length})</h2>
              </div>
              {categories.map(category => (
                <div key={category.firebaseKey} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
                  <div className="category-image">
                    {category.image ? (
                      <img src={category.image} alt={category.name} />
                    ) : (
                      <div className="no-image">No image uploaded</div>
                    )}
                  </div>
                  <div className="category-details">
                    <h3>{category.name}</h3>
                    <div className="category-info">
                      <p><strong>Description:</strong> {category.description || 'No description'}</p>
                      <p><strong>ID:</strong> {category.id}</p>
                      <p><strong>Product Count:</strong> {category.productCount || 0}</p>
                      <p><strong>Status:</strong> 
                        <span className={`status ${category.isActive !== false ? 'active' : 'inactive'}`}>
                          {category.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                      {category.createdAt && (
                        <p><strong>Created:</strong> {new Date(category.createdAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="category-actions">
                    <button onClick={() => handleEditCategory(category)} className="edit-button">Edit</button>
                    <button 
                      onClick={() => handleToggleCategoryStatus(category.firebaseKey, category.isActive !== false)} 
                      className={`toggle-button ${category.isActive !== false ? 'deactivate' : 'activate'}`}
                    >
                      {category.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteCategory(category.firebaseKey, category.name)} className="delete-button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Item Popup - Moved outside of item cards */}
      {editingItem && (
        <div className="modal-overlay" onClick={handleCloseItemModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSaveItemEdit} className="edit-form">
              <div className="modal-header">
                <h3>Edit Item</h3>
                <button type="button" className="modal-close" onClick={handleCloseItemModal}>×</button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleItemInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weight">Weight*</label>
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    value={editFormData.weight}
                    onChange={handleItemInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleItemInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="originalPrice">Original Price* (₹)</label>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    value={editFormData.originalPrice}
                    onChange={handleItemInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Selling Price* (₹)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={editFormData.price}
                    onChange={handleItemInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="discount">Discount %</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={editFormData.discount}
                    onChange={handleItemInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={editFormData.category}
                    onChange={handleItemInputChange}
                    required
                  >
                    {predefinedCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="meatCut">Meat Cut</label>
                  <select
                    id="meatCut"
                    name="meatCut"
                    value={editFormData.meatCut}
                    onChange={handleItemInputChange}
                  >
                    <option value="jc-jatka">JC Jatka</option>
                    <option value="halal-cut">Halal Cut</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="image">Update Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleItemInputChange}
                />
              </div>

              <div className="form-checkboxes">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={editFormData.featured}
                    onChange={handleItemInputChange}
                  />
                  <label htmlFor="featured">Featured Item</label>
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={editFormData.isActive}
                    onChange={handleItemInputChange}
                  />
                  <label htmlFor="isActive">Active</label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleCloseItemModal} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Popup - Moved outside of category cards */}
      {editingCategory && (
        <div className="modal-overlay" onClick={handleCloseCategoryModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSaveCategoryEdit} className="edit-form">
              <div className="modal-header">
                <h3>Edit Category</h3>
                <button type="button" className="modal-close" onClick={handleCloseCategoryModal}>×</button>
              </div>
              <div className="form-group">
                <label htmlFor="categoryName">Category Name*</label>
                <input
                  type="text"
                  id="categoryName"
                  name="name"
                  value={editCategoryData.name}
                  onChange={handleCategoryInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="categoryDescription">Description</label>
                <textarea
                  id="categoryDescription"
                  name="description"
                  value={editCategoryData.description}
                  onChange={handleCategoryInputChange}
                  placeholder="Enter category description"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="categoryImage">Update Image</label>
                <input
                  type="file"
                  id="categoryImage"
                  name="image"
                  accept="image/*"
                  onChange={handleCategoryInputChange}
                />
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="categoryActive"
                  name="isActive"
                  checked={editCategoryData.isActive}
                  onChange={handleCategoryInputChange}
                />
                <label htmlFor="categoryActive">Active</label>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleCloseCategoryModal} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;