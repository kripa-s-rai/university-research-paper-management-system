// src/components/Home.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth(); // Use isAuthenticated instead of isLoggedIn
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (isAuthenticated) {  // Check if the user is authenticated
      navigate(path);
    } else {
      navigate('/login', { state: { from: path } });  // Redirect to login if not authenticated
    }
  };

  return (
    <div className="home">
      <header className="home-header">
        <h1>Welcome to the Research Paper Management System</h1>
        <p>Your comprehensive platform for submitting, managing, and exploring research papers.</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn-primary">Login</Link>
          <Link to="/register" className="btn-secondary">Register</Link>
        </div>
      </header>

      <section className="features">
        <div className="feature-card" onClick={() => handleNavigation('/submit-paper')}>
          <h3>Submit Papers</h3>
          <p>Easily submit research papers for review and publication in one convenient platform.</p>
        </div>
        <div className="feature-card" onClick={() => handleNavigation('/research-papers')}>
          <h3>Explore Research</h3>
          <p>Access a wide range of research papers, search by domain, keywords, and author.</p>
        </div>
        <div className="feature-card" onClick={() => handleNavigation('/my-papers')}>
          <h3>Manage Submissions</h3>
          <p>Track the status of your submissions, view feedback, and manage revisions.</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>&copy; 2024 Research Paper Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
