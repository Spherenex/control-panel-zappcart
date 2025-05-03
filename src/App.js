// // // src/App.js
// // import React, { useState, useEffect } from 'react';
// // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // import { onAuthStateChanged } from 'firebase/auth';
// // import { auth } from './firebase/config';

// // // Pages
// // import Dashboard from './pages/Dashboard';
// // import EditBanner from './pages/EditBanner';
// // import CreateBanner from './pages/CreateBanner';
// // import CreateItems from './pages/CreateItems';
// // import ItemsList from './pages/ItemsList';
// // import EditItem from './pages/EditItem';
// // import CategoryPage from './pages/CategoryPage';
// // import Login from './components/Login';
// // import Header from './components/Header';

// // // CSS
// // import './App.css';

// // function App() {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// //       setUser(currentUser);
// //       setLoading(false);
// //     });

// //     return () => unsubscribe();
// //   }, []);

// //   if (loading) {
// //     return <div className="loading">Loading...</div>;
// //   }

// //   return (
// //     <Router>
// //       <div className="app">
// //         {user && <Header user={user} />}
// //         <div className="content">
// //           <Routes>
// //             {/* Auth Route */}
// //             <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
// //             {/* Admin Panel Routes */}
// //             <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
// //             <Route path="/edit/:id" element={user ? <EditBanner /> : <Navigate to="/login" />} />
// //             <Route path="/create" element={user ? <CreateBanner /> : <Navigate to="/login" />} />
// //             <Route path="/create-items" element={user ? <CreateItems /> : <Navigate to="/login" />} />
// //             <Route path="/manage-items" element={user ? <ItemsList /> : <Navigate to="/login" />} />
// //             <Route path="/edit-item/:id" element={user ? <EditItem /> : <Navigate to="/login" />} />
            
// //             {/* Public Routes */}
// //             <Route path="/category/:categoryId" element={<CategoryPage />} />
            
// //             {/* Fallback */}
// //             <Route path="*" element={<Navigate to="/" />} />
// //           </Routes>
// //         </div>
// //       </div>
// //     </Router>
// //   );
// // }

// // export default App;
// // src/App.js
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from './firebase/config';

// // Pages
// import Dashboard from './pages/Dashboard';
// import EditBanner from './pages/EditBanner';
// import CreateBanner from './pages/CreateBanner';
// import CreateItems from './pages/CreateItems'; // Import the CreateItems component
// import Login from './components/Login';
// import Header from './components/Header';

// // CSS
// import './App.css';

// function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   return (
//     <Router>
//       <div className="app">
//         {user && <Header user={user} />}
//         <div className="content">
//           <Routes>
//             <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
//             <Route 
//               path="/" 
//               element={user ? <Dashboard /> : <Navigate to="/login" />} 
//             />
//             <Route 
//               path="/edit/:id" 
//               element={user ? <EditBanner /> : <Navigate to="/login" />} 
//             />
//             <Route 
//               path="/create" 
//               element={user ? <CreateBanner /> : <Navigate to="/login" />} 
//             />
//             <Route 
//               path="/create-items" 
//               element={user ? <CreateItems /> : <Navigate to="/login" />} 
//             />
//           </Routes>
          
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Pages
import Dashboard from './pages/Dashboard';
import EditBanner from './pages/EditBanner';
import CreateBanner from './pages/CreateBanner';
import CreateItems from './pages/CreateItems';
import ManageItems from './pages/ManageItems'; // Import the ManageItems component
import Login from './components/Login';
import Header from './components/Header';

// CSS
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {user && <Header user={user} />}
        <div className="content">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route 
              path="/" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/edit/:id" 
              element={user ? <EditBanner /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/create" 
              element={user ? <CreateBanner /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/create-items" 
              element={user ? <CreateItems /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/manage-items" 
              element={user ? <ManageItems /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;