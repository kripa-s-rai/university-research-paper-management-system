import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const Login = () => {
  const [userInput, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/users/login', {
        userInput,
        password,
      });

      const userData = response.data;
      login(userData);
      alert('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response || error.message);
      alert('Error logging in: ' + (error.response?.data?.error || 'Please try again.'));
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <h2>Login to Your Account</h2>
        <p className="welcome-text">Welcome back! Please login to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username or Email"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
