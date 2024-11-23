// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status

  // Check for user data in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true); // Set authenticated to true if user exists in localStorage
    }
  }, []);

  // Login function to set user data and authentication state
  const login = (userData) => {
    setUser(userData); 
    setIsAuthenticated(true); // Update isAuthenticated to true
    localStorage.setItem('user', JSON.stringify(userData)); // Save user data in localStorage
  };

  // Logout function to clear user data and authentication state
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false); // Update isAuthenticated to false on logout
    localStorage.removeItem('user'); // Remove user data from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
