// import React, { useState, useEffect } from 'react';
// import { ref, onValue, update, remove } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Added imports
// import { db, storage } from '../firebase/config'; // Added storage import
// import '../styles/pages/ManageItems.css';

// const ManageItems = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editingItem, setEditingItem] = useState(null);
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
//     image: null,
//     featured: false
//   });

//   useEffect(() => {
//     const fetchItems = () => {
//       try {
//         console.log("Fetching all items from Firebase...");
//         const itemsRef = ref(db, 'items');

//         onValue(itemsRef, (snapshot) => {
//           if (snapshot.exists()) {
//             const itemsData = snapshot.val();
//             const itemsArray = Object.keys(itemsData).map(key => ({
//               ...itemsData[key],
//               firebaseKey: key
//             }));
//             setItems(itemsArray);
//           } else {
//             setItems([]);
//           }
//           setLoading(false);
//         }, (error) => {
//           console.error("Error fetching items:", error);
//           setError("Failed to load items");
//           setLoading(false);
//         });
//       } catch (error) {
//         console.error('Error setting up listener:', error);
//         setError("Failed to load items");
//         setLoading(false);
//       }
//     };

//     fetchItems();

//     return () => {
//       const itemsRef = ref(db, 'items');
//       onValue(itemsRef, () => {}, { onlyOnce: true });
//     };
//   }, []);

//   const handleEdit = (item) => {
//     setEditingItem(item);
//     setEditFormData({
//       name: item.name,
//       description: item.description || '',
//       weight: item.weight || '',
//       pieces: item.pieces || '',
//       serves: item.serves || '',
//       price: item.price || '',
//       originalPrice: item.originalPrice || '',
//       discount: item.discount || '',
//       deliveryTime: item.deliveryTime || '30',
//       image: null,
//       featured: item.featured || false
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     if (type === 'file') {
//       setEditFormData(prev => ({ ...prev, [name]: files[0] }));
//     } else {
//       setEditFormData(prev => ({
//         ...prev,
//         [name]: type === 'checkbox' ? checked : value
//       }));
//     }
//   };

//   const handleSaveEdit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let imageUrl = editingItem.image;

//       if (editFormData.image) {
//         const folderPath = editingItem.category === "Shop by categories" && editingItem.displayCategory
//           ? `items/${editingItem.displayCategory}`
//           : `items/${editingItem.category.replace(/\s+/g, '-').toLowerCase()}`;
//         const imageStorageRef = storageRef(storage, `${folderPath}/${Date.now()}_${editFormData.image.name}`);
//         const snapshot = await uploadBytes(imageStorageRef, editFormData.image);
//         imageUrl = await getDownloadURL(snapshot.ref);
//       }

//       const updatedItem = {
//         id: editingItem.id,
//         name: editFormData.name,
//         description: editFormData.description,
//         weight: editFormData.weight,
//         pieces: editFormData.pieces,
//         serves: parseInt(editFormData.serves) || 0,
//         price: Number(editFormData.price),
//         originalPrice: Number(editFormData.originalPrice),
//         discount: Number(editFormData.discount) || 0,
//         deliveryTime: Number(editFormData.deliveryTime) || 30,
//         category: editingItem.category,
//         featured: editFormData.featured,
//         createdAt: editingItem.createdAt,
//         image: imageUrl
//       };

//       if (editingItem.category === "Shop by categories" && editingItem.displayCategory) {
//         updatedItem.displayCategory = editingItem.displayCategory;
//       }

//       await update(ref(db, `items/${editingItem.firebaseKey}`), updatedItem);
//       setEditingItem(null);
//       setEditFormData({
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
//         featured: false
//       });
//     } catch (error) {
//       console.error('Error updating item:', error);
//       setError("Failed to update item");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (firebaseKey) => {
//     if (window.confirm('Are you sure you want to delete this item?')) {
//       try {
//         await remove(ref(db, `items/${firebaseKey}`));
//       } catch (error) {
//         console.error('Error deleting item:', error);
//         setError("Failed to delete item");
//       }
//     }
//   };

//   if (loading) {
//     return <div className="loading">Loading items...</div>;
//   }

//   if (error) {
//     return <div className="error">{error}</div>;
//   }

//   return (
//     <div className="manage-items-container">
//       <h1>Manage Items</h1>
//       {items.length === 0 ? (
//         <div className="no-items">No items available to manage.</div>
//       ) : (
//         <div className="items-list">
//           {items.map(item => (
//             <div key={item.firebaseKey} className="item-card">
//               <img src={item.image} alt={item.name} className="item-image" />
//               <div className="item-details">
//                 <h3>{item.name}</h3>
//                 <p><strong>Category:</strong> {item.category}</p>
//                 {item.displayCategory && <p><strong>Display Category:</strong> {item.displayCategory}</p>}
//                 <p><strong>Price:</strong> ₹{item.price}</p>
//                 <p><strong>Original Price:</strong> ₹{item.originalPrice}</p>
//                 <p><strong>Discount:</strong> {item.discount}%</p>
//               </div>
//               <div className="item-actions">
//                 <button onClick={() => handleEdit(item)} className="edit-btn">Edit</button>
//                 <button onClick={() => handleDelete(item.firebaseKey)} className="delete-btn">Delete</button>
//               </div>
//               {editingItem && editingItem.firebaseKey === item.firebaseKey && (
//                 <form onSubmit={handleSaveEdit} className="edit-form">
//                   <div className="form-group">
//                     <label htmlFor="name">Name*</label>
//                     <input
//                       type="text"
//                       id="name"
//                       name="name"
//                       value={editFormData.name}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="description">Description</label>
//                     <textarea
//                       id="description"
//                       name="description"
//                       value={editFormData.description}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="weight">Weight*</label>
//                     <input
//                       type="text"
//                       id="weight"
//                       name="weight"
//                       value={editFormData.weight}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="pieces">Pieces</label>
//                     <input
//                       type="text"
//                       id="pieces"
//                       name="pieces"
//                       value={editFormData.pieces}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="serves">Serves</label>
//                     <input
//                       type="number"
//                       id="serves"
//                       name="serves"
//                       value={editFormData.serves}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="originalPrice">Original Price* (₹)</label>
//                     <input
//                       type="number"
//                       id="originalPrice"
//                       name="originalPrice"
//                       value={editFormData.originalPrice}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="discount">Discount %</label>
//                     <input
//                       type="number"
//                       id="discount"
//                       name="discount"
//                       value={editFormData.discount}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="price">Price* (₹)</label>
//                     <input
//                       type="number"
//                       id="price"
//                       name="price"
//                       value={editFormData.price}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="deliveryTime">Delivery Time (minutes)</label>
//                     <input
//                       type="number"
//                       id="deliveryTime"
//                       name="deliveryTime"
//                       value={editFormData.deliveryTime}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="image">Image</label>
//                     <input
//                       type="file"
//                       id="image"
//                       name="image"
//                       accept="image/*"
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div className="form-group checkbox">
//                     <input
//                       type="checkbox"
//                       id="featured"
//                       name="featured"
//                       checked={editFormData.featured}
//                       onChange={handleInputChange}
//                     />
//                     <label htmlFor="featured">Featured Item</label>
//                   </div>
//                   <button type="submit" className="save-btn" disabled={loading}>
//                     {loading ? 'Saving...' : 'Save Changes'}
//                   </button>
//                   <button type="button" onClick={() => setEditingItem(null)} className="cancel-btn">Cancel</button>
//                 </form>
//               )}
//             </div>
//           ))}
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
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
    isActive: true
  });
  const [categories] = useState(['Meat', 'Seafood', 'Shop by categories']); // Predefined categories

  useEffect(() => {
    const itemsRef = ref(db, 'items');
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Error listening to items:', err);
      setError('Failed to load items. Please try again later.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (item) => {
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
      isActive: item.isActive || true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = editingItem.image;

      if (editFormData.image) {
        const folderPath = editFormData.category === 'Shop by categories' && editFormData.displayCategory
          ? `items/${editFormData.displayCategory}`
          : `items/${editFormData.category.replace(/\s+/g, '-').toLowerCase()}`;
        const imageStorageRef = storageRef(storage, `${folderPath}/${Date.now()}_${editFormData.image.name}`);
        const snapshot = await uploadBytes(imageStorageRef, editFormData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const updatedItem = {
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
        isActive: editFormData.isActive
      };

      if (editFormData.category === 'Shop by categories') {
        updatedItem.displayCategory = editFormData.displayCategory || '';
      }

      await update(ref(db, `items/${editingItem.firebaseKey}`), updatedItem);
      setEditingItem(null);
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
        isActive: true
      });
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (firebaseKey, currentActive) => {
    try {
      const itemRef = ref(db, `items/${firebaseKey}`);
      await update(itemRef, { isActive: !currentActive });
    } catch (error) {
      console.error('Error toggling item status:', error);
      setError('Failed to update item status. Please try again.');
    }
  };

  const handleDelete = async (firebaseKey) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await remove(ref(db, `items/${firebaseKey}`));
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="manage-items-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-items-container">
        <div className="alert error">{error}</div>
      </div>
    );
  }

  return (
    <div className="manage-items-container">
      <h1>Manage Items</h1>
      {items.length === 0 ? (
        <div className="no-items">No items available to manage.</div>
      ) : (
        <div className="items-list">
          {items.map(item => (
            <div key={item.firebaseKey} className="item-card">
              <div className="item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="no-image">No image uploaded</div>
                )}
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p><strong>Category:</strong> {item.category}</p>
                {item.displayCategory && <p><strong>Display Category:</strong> {item.displayCategory}</p>}
                <p><strong>Price:</strong> ₹{item.price}</p>
                <p><strong>Original Price:</strong> ₹{item.originalPrice}</p>
                <p><strong>Discount:</strong> {item.discount}%</p>
                <p><strong>Status:</strong> <span className={item.isActive ? 'active' : 'inactive'}>{item.isActive ? 'Active' : 'Inactive'}</span></p>
              </div>
              <div className="item-actions">
                <button onClick={() => handleEdit(item)} className="edit-button">Edit</button>
                <button onClick={() => handleToggleStatus(item.firebaseKey, item.isActive)} className="toggle-button">
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(item.firebaseKey)} className="delete-button">Delete</button>
              </div>
              {editingItem && editingItem.firebaseKey === item.firebaseKey && (
                <form onSubmit={handleSaveEdit} className="edit-form">
                  <div className="form-group">
                    <label htmlFor="name">Name*</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight">Weight*</label>
                    <input
                      type="text"
                      id="weight"
                      name="weight"
                      value={editFormData.weight}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pieces">Pieces</label>
                    <input
                      type="text"
                      id="pieces"
                      name="pieces"
                      value={editFormData.pieces}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="serves">Serves</label>
                    <input
                      type="number"
                      id="serves"
                      name="serves"
                      value={editFormData.serves}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="originalPrice">Original Price* (₹)</label>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      value={editFormData.originalPrice}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Price* (₹)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={editFormData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deliveryTime">Delivery Time (minutes)</label>
                    <input
                      type="number"
                      id="deliveryTime"
                      name="deliveryTime"
                      value={editFormData.deliveryTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Category*</label>
                    <select
                      id="category"
                      name="category"
                      value={editFormData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  {editFormData.category === 'Shop by categories' && (
                    <div className="form-group">
                      <label htmlFor="displayCategory">Display Category*</label>
                      <input
                        type="text"
                        id="displayCategory"
                        name="displayCategory"
                        value={editFormData.displayCategory || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="image">Image</label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group checkbox">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={editFormData.featured}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="featured">Featured Item</label>
                  </div>
                  <div className="form-group checkbox">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={editFormData.isActive}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isActive">Active</label>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setEditingItem(null)} className="cancel-button">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageItems;