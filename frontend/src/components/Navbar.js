// src/components/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth(); // Get the values from context
  const location = useLocation();

  const handleLogout = () => {
    logout();  // Use the logout function from the context
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">Research System</Link>
      </div>
      <ul className="navbar-links">
        {/* Show links based on authentication status */}
        {isAuthenticated ? (
          <>
            <li><Link to="/submit-paper" className="navbar-link">Submit Paper</Link></li>
            <li><Link to="/my-papers" className="navbar-link">My Papers</Link></li>
            <li><Link to="/reports" className="navbar-link">Reports</Link></li>
            {/*<li><Link to="/admin/users" className="navbar-link">Admin Users</Link></li>
            <li><Link to="/admin/papers" className="navbar-link">Admin Papers</Link></li>*/}
            <li><Link to="/profile" className="navbar-link">Profile</Link></li>
            <li><button onClick={handleLogout} className="navbar-button">Logout</button></li>
          </>
        ) : (
          <>
            {location.pathname !== "/login" && location.pathname !== "/register" && (
              <>
                <li><Link to="/login" className="navbar-link">Login</Link></li>
                <li><Link to="/register" className="navbar-link">Register</Link></li>
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;