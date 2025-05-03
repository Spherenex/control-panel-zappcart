// // src/components/BannerList.js
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
// import '../styles/components/BannerList.css';

// const BannerList = ({ banners, onToggleStatus, onDelete }) => {
//   if (!banners || banners.length === 0) {
//     return (
//       <div className="no-banners">
//         <h3>No Banners Found</h3>
//         <p>Create your first banner to get started</p>
//         <Link to="/create" className="create-button">
//           Create New Banner
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="banner-list">
//       {banners.map((banner) => (
//         <div key={banner.id} className={`banner-item ${banner.isActive ? 'active' : 'inactive'}`}>
//           <div className="banner-item-preview">
//             <img 
//               src={banner.image} 
//               alt={banner.title} 
//               className="banner-thumbnail" 
//             />
//           </div>
          
//           <div className="banner-item-content">
//             <h3>{banner.title}</h3>
//             <p className="subtitle">{banner.subtitle}</p>
//             <div className="banner-item-details">
//               <span className="product-name">{banner.productName}</span>
//               <span className="price">
//                 <span className="original">₹{banner.originalPrice}</span>
//                 <span className="current">₹{banner.currentPrice}</span>
//               </span>
//             </div>
//             <div className="banner-status">
//               {banner.isActive ? (
//                 <span className="status active">Active</span>
//               ) : (
//                 <span className="status inactive">Inactive</span>
//               )}
//             </div>
//           </div>
          
//           <div className="banner-item-actions">
//             <button 
//               className="action-btn toggle-status"
//               onClick={() => onToggleStatus(banner.id, banner.isActive)}
//               title={banner.isActive ? 'Deactivate Banner' : 'Activate Banner'}
//             >
//               {banner.isActive ? <FaEyeSlash /> : <FaEye />}
//             </button>
            
//             <Link 
//               to={`/edit/${banner.id}`} 
//               className="action-btn edit"
//               title="Edit Banner"
//             >
//               <FaEdit />
//             </Link>
            
//             <button 
//               className="action-btn delete"
//               onClick={() => onDelete(banner.id)}
//               title="Delete Banner"
//             >
//               <FaTrash />
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default BannerList;

import React from 'react';

const BannerList = ({ banners, bannerImages, onToggleStatus, onDelete }) => {
  return (
    <div className="banners-list">
      {banners.length === 0 ? (
        <div className="no-banners">No banners available to manage.</div>
      ) : (
        banners.map((banner) => (
          <div key={banner.id} className="banner-card">
            <div className="banner-image">
              {bannerImages[banner.id] ? (
                <img src={bannerImages[banner.id]} alt={`Banner ${banner.id}`} />
              ) : (
                <div className="no-image">No image uploaded</div>
              )}
            </div>
            <div className="banner-details">
              <h3>{banner.title || 'Untitled Banner'}</h3>
              <p><strong>Subtitle:</strong> {banner.subtitle || 'N/A'}</p>
              <p><strong>Product:</strong> {banner.productName || 'N/A'}</p>
              <p><strong>Original Price:</strong> ₹{banner.originalPrice || 'N/A'}</p>
              <p><strong>Current Price:</strong> ₹{banner.currentPrice || 'N/A'}</p>
              <p><strong>Status:</strong> <span className={banner.isActive ? 'active' : 'inactive'}>{banner.isActive ? 'Active' : 'Inactive'}</span></p>
              {banner.startDate && <p><strong>Start Date:</strong> {new Date(banner.startDate).toLocaleString()}</p>}
              {banner.endDate && <p><strong>End Date:</strong> {new Date(banner.endDate).toLocaleString()}</p>}
            </div>
            <div className="banner-actions">
              <button 
                className="toggle-button" 
                onClick={() => onToggleStatus(banner.id, banner.isActive)}
              >
                {banner.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button 
                className="delete-button" 
                onClick={() => onDelete(banner.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BannerList;