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
import './ProductManagement.css';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    
    // Form state for editing or creating a product
    const [productForm, setProductForm] = useState({
        name: '',
        price: 0,
        category: 'Chicken',
        description: '',
        rating: 4.5,
        ratingCount: 0,
        discount: 0,
        inStock: true,
        weight: '500g',
        features: []
    });
    
    // New feature input
    const [newFeature, setNewFeature] = useState('');
    
    // Categories
    const categories = ['Chicken', 'Mutton', 'Fish & Seafood'];
    
    // Fetch all products when component mounts
    useEffect(() => {
        fetchProducts();
    }, []);
    
    // Fetch products from Firebase
    const fetchProducts = async () => {
        setIsLoading(true);
        
        try {
            const productsRef = dbRef(database, 'products');
            const snapshot = await get(productsRef);
            
            if (snapshot.exists()) {
                const productsData = snapshot.val();
                // Convert from object to array with IDs
                const productsArray = Object.entries(productsData).map(([id, data]) => ({
                    id,
                    ...data
                }));
                
                // Fetch images for each product
                const productsWithImages = await Promise.all(
                    productsArray.map(async (product) => {
                        try {
                            const imagePath = product.imageFolderPath || `products/${product.category?.toLowerCase() || 'other'}/${product.id}`;
                            const imageURL = await getMostRecentImage(imagePath);
                            return { ...product, image: imageURL };
                        } catch (error) {
                            console.error(`Error fetching image for product ${product.id}:`, error);
                            return {
                                ...product,
                                image: `https://via.placeholder.com/400x300?text=${product.name}`
                            };
                        }
                    })
                );
                
                setProducts(productsWithImages);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Failed to load products from database");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Function to get the most recent image from a folder
    const getMostRecentImage = async (folderPath) => {
        try {
            const folderRef = storageRef(storage, folderPath);
            const fileList = await listAll(folderRef);
            
            if (fileList.items.length === 0) {
                console.warn(`No images found in ${folderPath}`);
                return `https://via.placeholder.com/400x300?text=No+Image+Available`;
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
            return `https://via.placeholder.com/400x300?text=Error+Loading+Image`;
        }
    };
    
    // Select a product for editing
    const handleSelectProduct = (productId) => {
        setSelectedProductId(productId);
        clearMessages();
        
        // Find the product and populate the form
        const selectedProduct = products.find(p => p.id === productId);
        if (selectedProduct) {
            setProductForm({
                name: selectedProduct.name || '',
                price: selectedProduct.price || 0,
                category: selectedProduct.category || 'Chicken',
                description: selectedProduct.description || '',
                rating: selectedProduct.rating || 4.5,
                ratingCount: selectedProduct.ratingCount || 0,
                discount: selectedProduct.discount || 0,
                inStock: selectedProduct.inStock !== false, // Default to true if not specified
                weight: selectedProduct.weight || '500g',
                features: selectedProduct.features || []
            });
        }
    };
    
    // Start creating a new product
    const handleNewProduct = () => {
        setSelectedProductId(null);
        clearMessages();
        
        // Reset form to defaults
        setProductForm({
            name: '',
            price: 0,
            category: 'Chicken',
            description: '',
            rating: 4.5,
            ratingCount: 0,
            discount: 0,
            inStock: true,
            weight: '500g',
            features: []
        });
    };
    
    // Handle input changes for product form
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setProductForm(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'number') {
            setProductForm(prev => ({
                ...prev,
                [name]: value === '' ? '' : Number(value)
            }));
        } else {
            setProductForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    // Add a feature to the product
    const handleAddFeature = () => {
        if (!newFeature.trim()) {
            return;
        }
        
        setProductForm(prev => ({
            ...prev,
            features: [...prev.features, newFeature.trim()]
        }));
        
        setNewFeature('');
    };
    
    // Remove a feature from the product
    const handleRemoveFeature = (index) => {
        setProductForm(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };
    
    // Handle file selection for image upload
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setUploadFile(e.target.files[0]);
            clearMessages();
        }
    };
    
    // Handle image upload
    const handleImageUpload = async () => {
        if (!uploadFile) {
            setError("Please select an image to upload");
            return;
        }
        
        if (!selectedProductId && !productForm.name) {
            setError("Please provide a product name before uploading an image");
            return;
        }
        
        setIsUploading(true);
        setUploadProgress(0);
        clearMessages();
        
        try {
            // Generate a timestamp to ensure uniqueness and enable sorting by recency
            const timestamp = new Date().getTime();
            const fileExt = uploadFile.name.split('.').pop();
            
            // Determine the storage path based on product
            let productId = selectedProductId;
            let productCategory = productForm.category.toLowerCase().replace(/[\s&]+/g, ''); // Clean up category name
            
            // If creating a new product, create a temporary ID
            if (!productId) {
                productId = `temp_${timestamp}`;
            }
            
            // Create storage path
            const storagePath = `products/${productCategory}/${productId}/image_${timestamp}.${fileExt}`;
            
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
                        
                        // If editing existing product, update its image in state
                        if (selectedProductId) {
                            setProducts(prev => 
                                prev.map(product => 
                                    product.id === selectedProductId 
                                        ? { ...product, image: downloadURL, imageFolderPath: `products/${productCategory}/${productId}` } 
                                        : product
                                )
                            );
                        }
                        
                        setProductForm(prev => ({
                            ...prev,
                            // Store the image folder path for reference
                            imageFolderPath: `products/${productCategory}/${productId}`
                        }));
                        
                        setIsUploading(false);
                        setUploadFile(null);
                        
                        // Reset the file input
                        const fileInput = document.getElementById('product-image-input');
                        if (fileInput) fileInput.value = '';
                        
                        setSuccessMessage("Product image uploaded successfully!");
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
    
    // Save product to database
    const saveProduct = async () => {
        // Basic validation
        if (!productForm.name || !productForm.description || productForm.price <= 0) {
            setError("Please fill in all required fields: name, description, and price");
            return;
        }
        
        setIsSaving(true);
        clearMessages();
        
        try {
            let productId = selectedProductId;
            let productData = {
                ...productForm,
                // Convert certain fields to numbers to ensure proper data types
                price: Number(productForm.price),
                rating: Number(productForm.rating),
                ratingCount: Number(productForm.ratingCount),
                discount: Number(productForm.discount),
            };
            
            // If creating a new product, generate a new ID
            if (!productId) {
                // Get all product IDs to find the highest one
                const allIds = products.map(p => parseInt(p.id)).filter(id => !isNaN(id));
                const highestId = allIds.length > 0 ? Math.max(...allIds) : 0;
                productId = String(highestId + 1);
            }
            
            // Reference to the product in database
            const productRef = dbRef(database, `products/${productId}`);
            
            // Save product data
            await set(productRef, productData);
            
            // Update local state
            if (selectedProductId) {
                // Update existing product
                setProducts(prev => 
                    prev.map(product => 
                        product.id === productId 
                            ? { ...product, ...productData, id: productId } 
                            : product
                    )
                );
            } else {
                // Add new product
                setProducts(prev => [
                    ...prev, 
                    { 
                        ...productData, 
                        id: productId,
                        image: `https://via.placeholder.com/400x300?text=${productData.name}`
                    }
                ]);
                
                // Select the new product
                setSelectedProductId(productId);
            }
            
            setSuccessMessage(`Product ${selectedProductId ? 'updated' : 'created'} successfully!`);
        } catch (error) {
            console.error("Error saving product:", error);
            setError(`Failed to save product: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    // Delete product
    const deleteProduct = async () => {
        if (!selectedProductId) {
            return;
        }
        
        if (!window.confirm(`Are you sure you want to delete this product?`)) {
            return;
        }
        
        setIsSaving(true);
        clearMessages();
        
        try {
            // Delete product data from database
            await remove(dbRef(database, `products/${selectedProductId}`));
            
            // Delete product from state
            setProducts(prev => prev.filter(product => product.id !== selectedProductId));
            
            // Reset selection
            setSelectedProductId(null);
            
            setSuccessMessage("Product deleted successfully!");
        } catch (error) {
            console.error("Error deleting product:", error);
            setError(`Failed to delete product: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    // Clear error and success messages
    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };
    
    // Show loading state
    if (isLoading) {
        return (
            <div className="product-management loading">
                <h2>Product Management</h2>
                <div className="loading-spinner"></div>
            </div>
        );
    }
    
    return (
        <div className="product-management">
            <h2>Product Management</h2>
            
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <div className="product-management-container">
                <div className="products-list-section">
                    <div className="list-header">
                        <h3>Products ({products.length})</h3>
                        <button 
                            className="new-product-button"
                            onClick={handleNewProduct}
                            disabled={isSaving || isUploading}
                        >
                            <FaPlus /> New Product
                        </button>
                    </div>
                    
                    <div className="products-list">
                        {products.map(product => (
                            <div 
                                key={product.id}
                                className={`product-list-item ${selectedProductId === product.id ? 'selected' : ''}`}
                                onClick={() => handleSelectProduct(product.id)}
                            >
                                <div className="product-list-image">
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = `https://via.placeholder.com/100x100?text=${product.name.substring(0, 10)}`;
                                        }}
                                    />
                                </div>
                                <div className="product-list-details">
                                    <div className="product-list-name">{product.name}</div>
                                    <div className="product-list-price">₹{product.price}</div>
                                    <div className="product-list-category">{product.category}</div>
                                </div>
                            </div>
                        ))}
                        
                        {products.length === 0 && (
                            <div className="no-products-message">
                                No products found. Create your first product!
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="product-editor-section">
                    <h3>{selectedProductId ? 'Edit Product' : 'Create New Product'}</h3>
                    
                    <div className="product-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Product Name: <span className="required">*</span></label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={productForm.name}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="category">Category:</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={productForm.category}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="description">Description: <span className="required">*</span></label>
                            <textarea
                                id="description"
                                name="description"
                                value={productForm.description}
                                onChange={handleInputChange}
                                rows={3}
                                disabled={isSaving}
                                required
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price">Price (₹): <span className="required">*</span></label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={productForm.price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="1"
                                    disabled={isSaving}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="discount">Discount (%):</label>
                                <input
                                    id="discount"
                                    name="discount"
                                    type="number"
                                    value={productForm.discount}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    disabled={isSaving}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="weight">Weight:</label>
                                <input
                                    id="weight"
                                    name="weight"
                                    type="text"
                                    value={productForm.weight}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 500g, 1kg"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="rating">Rating:</label>
                                <input
                                    id="rating"
                                    name="rating"
                                    type="number"
                                    value={productForm.rating}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    disabled={isSaving}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="ratingCount">Rating Count:</label>
                                <input
                                    id="ratingCount"
                                    name="ratingCount"
                                    type="number"
                                    value={productForm.ratingCount}
                                    onChange={handleInputChange}
                                    min="0"
                                    disabled={isSaving}
                                />
                            </div>
                            
                            <div className="form-group checkbox-group">
                                <label htmlFor="inStock">
                                    <input
                                        id="inStock"
                                        name="inStock"
                                        type="checkbox"
                                        checked={productForm.inStock}
                                        onChange={handleInputChange}
                                        disabled={isSaving}
                                    />
                                    In Stock
                                </label>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Product Features:</label>
                            <div className="features-container">
                                {productForm.features.map((feature, index) => (
                                    <div key={index} className="feature-item">
                                        <span>{feature}</span>
                                        <button
                                            type="button"
                                            className="remove-feature-button"
                                            onClick={() => handleRemoveFeature(index)}
                                            disabled={isSaving}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                                
                                <div className="add-feature-container">
                                    <input
                                        type="text"
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        placeholder="Add a feature"
                                        disabled={isSaving}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddFeature}
                                        disabled={isSaving || !newFeature.trim()}
                                    >
                                        <FaPlus /> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Product Image:</label>
                            <div className="image-upload-container">
                                <div className="product-image-preview">
                                    {selectedProductId && (
                                        <img 
                                            src={products.find(p => p.id === selectedProductId)?.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                            alt="Product preview"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
                                            }}
                                        />
                                    )}
                                    
                                    {!selectedProductId && (
                                        <div className="no-image-placeholder">
                                            No image uploaded yet
                                        </div>
                                    )}
                                </div>
                                
                                <div className="upload-controls">
                                    <input
                                        id="product-image-input"
                                        type="file"
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
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button
                                className="save-button"
                                onClick={saveProduct}
                                disabled={isSaving || isUploading}
                            >
                                {isSaving 
                                    ? 'Saving...' 
                                    : (selectedProductId ? 'Update Product' : 'Create Product')}
                            </button>
                            
                            {selectedProductId && (
                                <button
                                    className="delete-button"
                                    onClick={deleteProduct}
                                    disabled={isSaving || isUploading}
                                >
                                    Delete Product
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;