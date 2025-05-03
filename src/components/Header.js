// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import '../styles/components/Header.css';

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Banner Admin Panel</Link>
        </div>
        
        <nav className="nav">
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/create">Create Banner</Link>
            </li>
            <li>
              <Link to="/create-items">Create Items</Link>
            </li>
            <li>
              <Link to="/manage-items">Manage Items</Link>
            </li>
          </ul>
        </nav>
        
        <div className="user-info">
          <span className="email">{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
