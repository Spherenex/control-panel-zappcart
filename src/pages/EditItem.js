// src/pages/EditItem.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import '../styles/pages/EditItem.css';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
    category: '',
    displayCategory: '',
    featured: false,
    image: null,
  });
  
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState(null);
  
  // Main categories in database
  const categories = [
    "Bestsellers",
    "Shop by categories",
    "Match Day Essentials",
    "Premium fish & seafood selection"
  ];

  // Display categories shown to users (in the Shop by categories section)
  const displayCategories = [
    { id: "chicken", name: "Chicken" },
    { id: "fish-seafood", name: "Fish & Seafood" },
    { id: "mutton", name: "Mutton" },
    { id: "liver-more", name: "Liver & More" },
    { id: "prawns-crabs", name: "Prawns & Crabs" },
    { id: "eggs", name: "Eggs" },
    { id: "combos", name: "Combos" }
  ];

  // Mapping from display categories to database categories
  const categoryMapping = {
    'chicken': 'Bestsellers',
    'fish-seafood': 'Premium fish & seafood selection',
    'mutton': 'Match Day Essentials',
    'liver-more': 'Shop by categories',
    'prawns-crabs': 'Premium fish & seafood selection',
    'eggs': 'Shop by categories',
    'combos': 'Shop by categories'
  };
  
  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const itemRef = ref(db, `items/${id}`);
        const snapshot = await get(itemRef);
        
        if (snapshot.exists()) {
          const itemData = snapshot.val();
          
          // Set form data
          setFormData({
            name: itemData.name || '',
            description: itemData.description || '',
            weight: itemData.weight || '',
            pieces: itemData.pieces || '',
            serves: itemData.serves ? itemData.serves.toString() : '',
            price: itemData.price ? itemData.price.toString() : '',
            originalPrice: itemData.originalPrice ? itemData.originalPrice.toString() : '',
            discount: itemData.discount ? itemData.discount.toString() : '',
            deliveryTime: itemData.deliveryTime ? itemData.deliveryTime.toString() : '30',
            category: itemData.category || '',
            displayCategory: itemData.displayCategory || '',
            featured: itemData.featured || false,
          });
          
          // Set current image URL
          if (itemData.image) {
            setCurrentImageUrl(itemData.image);
          }
        } else {
          setMessage({
            type: 'error',
            text: 'Item not found'
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching item:', error);
        setMessage({
          type: 'error',
          text: `Error loading item: ${error.message}`
        });
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);
  
  // Effect to calculate price when originalPrice or discount changes
  useEffect(() => {
    if (formData.originalPrice && formData.discount) {
      const original = parseFloat(formData.originalPrice);
      const discountPercent = parseFloat(formData.discount);
      
      if (!isNaN(original) && !isNaN(discountPercent) && discountPercent >= 0 && discountPercent <= 100) {
        // Calculate the discounted price
        const discountedPrice = original - (original * (discountPercent / 100));
        // Round to whole number and update price
        setFormData(prev => ({
          ...prev,
          price: Math.round(discountedPrice).toString()
        }));
      }
    }
  }, [formData.originalPrice, formData.discount]);

  // Effect to calculate discount when originalPrice and price changes
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
  }, [formData.originalPrice, formData.price]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (files[0]) {
        setFormData({
          ...formData,
          [name]: files[0]
        });
        
        // Create image preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Update compatible display categories when main category changes
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      // Clear display category if it's not compatible with the new main category
      displayCategory: prev.displayCategory && categoryMapping[prev.displayCategory] !== newCategory 
        ? '' 
        : prev.displayCategory
    }));
  };
  
  // Get available display categories for the selected main category
  const getAvailableDisplayCategories = () => {
    if (!formData.category) return [];
    
    return displayCategories.filter(category => 
      categoryMapping[category.id] === formData.category
    );
  };
  
  const availableDisplayCategories = getAvailableDisplayCategories();
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Basic validation
      if (!formData.name || !formData.weight || !formData.price || !formData.originalPrice || !formData.category) {
        throw new Error('Please fill in all required fields');
      }
      
      let imageUrl = currentImageUrl;
      
      // Upload new image if selected
      if (formData.image) {
        // Use display category for folder organization if selected
        const imageCategory = formData.displayCategory || formData.category;
        const imageStorageRef = storageRef(storage, `items/${imageCategory}/${Date.now()}_${formData.image.name}`);
        const snapshot = await uploadBytes(imageStorageRef, formData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      // Prepare data for update
      const updateData = {
        name: formData.name,
        description: formData.description || '',
        weight: formData.weight,
        pieces: formData.pieces,
        serves: parseInt(formData.serves) || 0,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        discount: Number(formData.discount) || 0,
        deliveryTime: Number(formData.deliveryTime) || 30,
        category: formData.category,
        featured: formData.featured,
        updatedAt: Date.now()
      };
      
      // Add display category if selected
      if (formData.displayCategory) {
        updateData.displayCategory = formData.displayCategory;
      }
      
      // Add image URL if available
      if (imageUrl) {
        updateData.image = imageUrl;
      }
      
      // Update item in database
      const itemRef = ref(db, `items/${id}`);
      await update(itemRef, updateData);
      
      setMessage({
        type: 'success',
        text: 'Item updated successfully!'
      });
      
      // Reset image input
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
      setImagePreview(null);
      
      // Navigate back to items list after a short delay
      setTimeout(() => {
        navigate('/manage-items');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating item:', error);
      setMessage({
        type: 'error',
        text: `Error: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading-container">Loading item...</div>;
  }
  
  return (
    <div className="edit-item-container">
      <div className="edit-item-header">
        <h1>Edit Item</h1>
        <Link to="/manage-items" className="back-btn">Back to Items</Link>
      </div>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="edit-item-form">
        <div className="form-columns">
          <div className="form-column">
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
                rows="4"
              />
            </div>

            <div className="form-row">
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
            </div>

            <div className="form-row">
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
                <label htmlFor="deliveryTime">Delivery Time (mins)</label>
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
            </div>
          </div>
          
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="category">Main Category*</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {formData.category && availableDisplayCategories.length > 0 && (
              <div className="form-group">
                <label htmlFor="displayCategory">Display Category</label>
                <select
                  id="displayCategory"
                  name="displayCategory"
                  value={formData.displayCategory}
                  onChange={handleInputChange}
                >
                  <option value="">None (Hidden from Shop by Categories)</option>
                  {availableDisplayCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="form-help">
                  This determines where the item will appear in the "Shop by categories" section
                </div>
              </div>
            )}
            
            <div className="form-row">
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
                <label htmlFor="discount">Discount %</label>
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
            </div>

            <div className="form-group">
              <label htmlFor="price">Selling Price* (₹)</label>
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
          </div>
        </div>
        
        <div className="image-section">
          <div className="form-group">
            <label htmlFor="image">Product Image</label>
            <div className="current-image">
              {currentImageUrl && !imagePreview && (
                <>
                  <img src={currentImageUrl} alt={formData.name} />
                  <div className="image-label">Current Image</div>
                </>
              )}
              
              {imagePreview && (
                <>
                  <img src={imagePreview} alt="Preview" />
                  <div className="image-label">New Image Preview</div>
                </>
              )}
            </div>
            
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
            />
            <div className="form-help">
              Leave empty to keep the current image
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <Link to="/manage-items" className="cancel-btn">Cancel</Link>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;