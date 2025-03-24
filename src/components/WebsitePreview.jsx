import React, { useState } from 'react';
import './WebsitePreview.css';

const WebsitePreview = ({ publishedImages }) => {
  const [activePage, setActivePage] = useState('home');
  
  return (
    <div className="website-preview">
      <div className="website-header">
        <h1>Your Website</h1>
        <nav className="website-nav">
          <ul>
            <li 
              className={activePage === 'home' ? 'active' : ''} 
              onClick={() => setActivePage('home')}
            >
              Home
            </li>
            <li 
              className={activePage === 'products' ? 'active' : ''} 
              onClick={() => setActivePage('products')}
            >
              Products
            </li>
            <li 
              className={activePage === 'gallery' ? 'active' : ''} 
              onClick={() => setActivePage('gallery')}
            >
              Category
            </li>
            <li 
              className={activePage === 'about' ? 'active' : ''} 
              onClick={() => setActivePage('about')}
            >
              About Us
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="preview-content">
        {activePage === 'home' && (
          <div className="home-preview">
            <div className="banner-section">
              <h2>Banners</h2>
              {publishedImages.banners && publishedImages.banners.length > 0 ? (
                <div className="banner-slider">
                  {publishedImages.banners.map(banner => (
                    <div key={banner.id} className="banner">
                      <img src={banner.url} alt={banner.title} />
                      <div className="banner-content">
                        <h3>{banner.title}</h3>
                        <button className="shop-now">Shop Now</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-preview">No banners published</div>
              )}
            </div>
            
            <div className="featured-products">
              <h2>Featured Products</h2>
              {publishedImages.products && publishedImages.products.length > 0 ? (
                <div className="product-grid">
                  {publishedImages.products.slice(0, 3).map(product => (
                    <div key={product.id} className="product-card">
                      <img src={product.url} alt={product.title} />
                      <h3>{product.title}</h3>
                      <p className="price">{product.price}</p>
                      <button className="add-to-cart">Add to Cart</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-preview">No products published</div>
              )}
            </div>
          </div>
        )}
        
        {activePage === 'products' && (
          <div className="products-preview">
            <h2>Our Products</h2>
            {publishedImages.products && publishedImages.products.length > 0 ? (
              <div className="product-grid full">
                {publishedImages.products.map(product => (
                  <div key={product.id} className="product-card">
                    <img src={product.url} alt={product.title} />
                    <h3>{product.title}</h3>
                    <p className="price">{product.price}</p>
                    <button className="add-to-cart">Add to Cart</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-preview">No products published</div>
            )}
          </div>
        )}
        
        {activePage === 'gallery' && (
          <div className="gallery-preview">
            <h2>Category</h2>
            {publishedImages.gallery && publishedImages.gallery.length > 0 ? (
              <div className="gallery-grid">
                {publishedImages.gallery.map(image => (
                  <div key={image.id} className="gallery-item">
                    <img src={image.url} alt={image.title} />
                    <div className="gallery-caption">{image.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-preview">No gallery images published</div>
            )}
          </div>
        )}
        
        {activePage === 'about' && (
          <div className="about-preview">
            <h2>Our Team</h2>
            {publishedImages.team && publishedImages.team.length > 0 ? (
              <div className="team-grid">
                {publishedImages.team.map(member => (
                  <div key={member.id} className="team-member">
                    <img src={member.url} alt={member.name} />
                    <h3>{member.name}</h3>
                    <p className="position">{member.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-preview">No team members published</div>
            )}
          </div>
        )}
      </div>
      
      <div className="website-footer">
        <p>© 2025 Your Company. All content managed through Content Dashboard.</p>
      </div>
    </div>
  );
};

export default WebsitePreview;