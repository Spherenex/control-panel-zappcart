// import React, { useState } from 'react';
// import './App.css';
// import ImageUploader from './components/ImageUploader';
// import BannerManagement from './components/BannerManagement';

// function App() {
//   const [activeSection, setActiveSection] = useState('banners'); // 'banners', 'images', etc.
  
//   return (
//     <div className="App">
//       <div className="control-panel-container">
//         <h1>Zappcart Control Panel</h1>
        
//         <div className="panel-tabs">
//           <button 
//             className={`tab-button ${activeSection === 'banners' ? 'active' : ''}`}
//             onClick={() => setActiveSection('banners')}
//           >
//             Banner Management
//           </button>
//           {/* <button 
//             className={`tab-button ${activeSection === 'images' ? 'active' : ''}`}
//             onClick={() => setActiveSection('images')}
//           >
//             Image Management
//           </button> */}
//           {/* Add more tabs for other content types as needed */}
//         </div>
        
//         <div className="panel-content">
//           {activeSection === 'banners' && <BannerManagement />}
//           {/* {activeSection === 'images' && <ImageUploader />} */}
//           {/* Add more sections for other content types as needed */}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';
import BannerManagement from './components/BannerManagement';
import HomePageManagement from './components/HomePageManagement';

function App() {
  const [activeSection, setActiveSection] = useState('banners'); // 'banners', 'homepage', 'images', etc.
  
  return (
    <div className="App">
      <div className="control-panel-container">
        <h1>Zappcart Control Panel</h1>
        
        <div className="panel-tabs">
          <button 
            className={`tab-button ${activeSection === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveSection('banners')}
          >
            Banner Management
          </button>
          <button 
            className={`tab-button ${activeSection === 'homepage' ? 'active' : ''}`}
            onClick={() => setActiveSection('homepage')}
          >
            Homepage Management
          </button>
          {/* <button 
            className={`tab-button ${activeSection === 'images' ? 'active' : ''}`}
            onClick={() => setActiveSection('images')}
          >
            Image Management
          </button> */}
          {/* Add more tabs for other content types as needed */}
        </div>
        
        <div className="panel-content">
          {activeSection === 'banners' && <BannerManagement />}
          {activeSection === 'homepage' && <HomePageManagement />}
          {/* {activeSection === 'images' && <ImageUploader />} */}
          {/* Add more sections for other content types as needed */}
        </div>
      </div>
    </div>
  );
}

export default App;