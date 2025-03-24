import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import UploadModal from './components/UploadModal';
import WebsitePreview from './components/WebsitePreview';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [publishStatus, setPublishStatus] = useState({});
  const [images, setImages] = useState({
    banners: [
      { id: 1, url: '/api/placeholder/800/300', title: 'Summer Sale', published: true },
      { id: 2, url: '/api/placeholder/800/300', title: 'New Collection', published: false },
    ],
    products: [
      { id: 1, url: '/api/placeholder/400/400', title: 'Product 1', price: '$99', published: true },
      { id: 2, url: '/api/placeholder/400/400', title: 'Product 2', price: '$129', published: true },
      { id: 3, url: '/api/placeholder/400/400', title: 'Product 3', price: '$79', published: false },
    ],
    gallery: [
      { id: 1, url: '/api/placeholder/400/300', title: 'Store Interior', published: true },
      { id: 2, url: '/api/placeholder/400/300', title: 'Customer Review', published: true },
    ],
    team: [
      { id: 1, url: '/api/placeholder/300/300', title: 'CEO', name: 'John Smith', published: true },
      { id: 2, url: '/api/placeholder/300/300', title: 'Marketing Director', name: 'Sarah Johnson', published: false },
    ]
  });

  const contentTypes = [
    { id: 'banners', name: 'Banners', description: 'Homepage banner images' },
    { id: 'products', name: 'Products', description: 'Product catalog images' },
    { id: 'gallery', name: 'Gallery', description: 'Store and event photos' },
    { id: 'team', name: 'Team', description: 'Team member photos' }
  ];

  const handleOpenUpload = (type) => {
    setCurrentUploadType(type);
    setIsModalOpen(true);
  };

  const handleUpload = (newImage) => {
    // Add new image to the appropriate category
    const categoryImages = images[currentUploadType] || [];
    const newId = categoryImages.length > 0 ? Math.max(...categoryImages.map(img => img.id)) + 1 : 1;
    
    const updatedImages = {
      ...images,
      [currentUploadType]: [...categoryImages, { ...newImage, id: newId, published: false }]
    };
    
    setImages(updatedImages);
    setIsModalOpen(false);
    
    // Show notification
    setPublishStatus({
      message: `${newImage.title} uploaded successfully! Publish to website?`,
      type: 'success',
      id: Date.now(),
      showButtons: true,
      imageId: newId,
      category: currentUploadType
    });
  };

  const handlePublish = (imageId, category) => {
    const updatedCategoryImages = images[category].map(img => 
      img.id === imageId ? { ...img, published: true } : img
    );
    
    const updatedImages = {
      ...images,
      [category]: updatedCategoryImages
    };
    
    setImages(updatedImages);
    
    // Simulate publishing to website
    setTimeout(() => {
      setPublishStatus({
        message: 'Image published to website successfully!',
        type: 'success',
        id: Date.now()
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setPublishStatus({});
      }, 3000);
    }, 1000);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Get all published images across categories
  const getAllPublishedImages = () => {
    const published = {};
    Object.keys(images).forEach(category => {
      published[category] = images[category].filter(img => img.published);
    });
    return published;
  };

  return (
    <div className="app">
      <Header 
        onPreviewClick={togglePreview} 
        publishStatus={publishStatus}
        onPublish={() => handlePublish(publishStatus.imageId, publishStatus.category)}
        isPreviewActive={showPreview}
      />
      
      <main className="content">
        {showPreview ? (
          <WebsitePreview publishedImages={getAllPublishedImages()} />
        ) : (
          <Dashboard 
            contentTypes={contentTypes} 
            images={images} 
            onUpload={handleOpenUpload}
            onPublish={handlePublish}
          />
        )}
      </main>
      
      {isModalOpen && (
        <UploadModal 
          contentType={contentTypes.find(type => type.id === currentUploadType)}
          onClose={() => setIsModalOpen(false)} 
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default App;