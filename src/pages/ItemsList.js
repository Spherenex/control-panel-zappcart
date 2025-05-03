// src/pages/ItemsList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, remove } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import '../styles/pages/ItemsList.css';

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCategoryFilter, setDisplayCategoryFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Category mapping for display
  const categoryMap = {
    'Bestsellers': 'Bestsellers',
    'Shop by categories': 'Shop by Categories',
    'Match Day Essentials': 'Match Day Essentials',
    'Premium fish & seafood selection': 'Premium Fish & Seafood'
  };

  // Display categories mapping
  const displayCategories = {
    'chicken': 'Chicken',
    'fish-seafood': 'Fish & Seafood',
    'mutton': 'Mutton',
    'liver-more': 'Liver & More',
    'prawns-crabs': 'Prawns & Crabs',
    'eggs': 'Eggs',
    'combos': 'Combos'
  };

  useEffect(() => {
    // Fetch items from Firebase
    const itemsRef = ref(db, 'items');
    
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const itemsData = snapshot.val();
        const itemsArray = Object.entries(itemsData).map(([key, value]) => ({
          ...value,
          firebaseKey: key
        }));
        
        // Sort by created date (newest first)
        itemsArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setItems(itemsArray);
      } else {
        setItems([]);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      setLoading(false);
    });
    
    // Clean up function
    return () => unsubscribe();
  }, []);

  // Filter items based on current filters
  const filteredItems = items.filter(item => {
    // Filter by main category
    if (filter !== 'all' && item.category !== filter) {
      return false;
    }
    
    // Filter by display category
    if (displayCategoryFilter !== 'all' && item.displayCategory !== displayCategoryFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Handle delete confirmation
  const handleDeleteClick = (item) => {
    setConfirmDelete(item);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Confirm and execute delete
  const handleConfirmDelete = async (item) => {
    try {
      // Delete from database
      const itemRef = ref(db, `items/${item.firebaseKey}`);
      await remove(itemRef);
      
      // Delete image from storage if it exists
      if (item.image) {
        try {
          const imageRef = storageRef(storage, item.image);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.error("Error deleting image:", storageError);
          // Continue with deletion even if image removal fails
        }
      }
      
      setMessage({
        type: 'success',
        text: `Item "${item.name}" deleted successfully!`
      });
      
      // Clear confirm dialog
      setConfirmDelete(null);
      
      // Items list will update automatically due to the onValue listener
    } catch (error) {
      console.error("Error deleting item:", error);
      setMessage({
        type: 'error',
        text: `Error deleting item: ${error.message}`
      });
      setConfirmDelete(null);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return <div className="loading-container">Loading items...</div>;
  }

  return (
    <div className="items-list-container">
      <div className="items-list-header">
        <h1>Manage Items</h1>
        <Link to="/create-items" className="add-item-btn">Add New Item</Link>
      </div>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-selects">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryMap).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Display Category:</label>
            <select
              value={displayCategoryFilter}
              onChange={(e) => setDisplayCategoryFilter(e.target.value)}
            >
              <option value="all">All Display Categories</option>
              {Object.entries(displayCategories).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="no-items-message">
          <p>No items found matching the current filters.</p>
        </div>
      ) : (
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Display Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.firebaseKey}>
                  <td className="item-image">
                    <img src={item.image} alt={item.name} />
                  </td>
                  <td className="item-name">{item.name}</td>
                  <td className="item-price">
                    ₹{item.price}
                    {item.originalPrice > item.price && (
                      <span className="original-price">₹{item.originalPrice}</span>
                    )}
                  </td>
                  <td className="item-category">{categoryMap[item.category] || item.category}</td>
                  <td className="item-display-category">
                    {item.displayCategory ? displayCategories[item.displayCategory] || item.displayCategory : '—'}
                  </td>
                  <td className="item-actions">
                    <Link to={`/edit-item/${item.firebaseKey}`} className="edit-btn">Edit</Link>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteClick(item)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="delete-dialog-overlay">
          <div className="delete-dialog">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>?</p>
            <p className="warning">This action cannot be undone.</p>
            
            <div className="dialog-actions">
              <button className="cancel-btn" onClick={handleCancelDelete}>Cancel</button>
              <button className="confirm-delete-btn" onClick={() => handleConfirmDelete(confirmDelete)}>
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsList;