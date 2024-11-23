import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import SubmitPaper from './components/SubmitPaper';
import MyPapers from './components/MyPapers';
import AdminUsers from './components/AdminUsers';
import AdminPapers from './components/AdminPapers';
import ResearchPapers from './components/ResearchPapers';
import Navbar from './components/Navbar';
import Reports from './components/Reports';
import Home from './components/Home';
import EntityManagement from './components/EntityManagement'; // Import the new component

const App = () => {
  const { user, isAuthenticated } = useAuth();
  console.log("User:",user)
  const ProtectedRoute = ({ element, roleRequired }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (roleRequired && user.Role !== roleRequired) {
      return <Navigate to="/" />; // Redirect to home if role doesn't match
    }
    return element;
  };

  return (
    <Router>
      <div>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/research-papers" element={<ResearchPapers />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/submit-paper" element={<ProtectedRoute element={<SubmitPaper />} roleRequired="Author" />} />
          <Route path="/my-papers" element={<ProtectedRoute element={<MyPapers />} roleRequired="Author" />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<ProtectedRoute element={<AdminUsers />} roleRequired="Administrator" />} />
          <Route path="/admin/papers" element={<ProtectedRoute element={<AdminPapers />} roleRequired="Administrator" />} />
          <Route path="/reports" element={<ProtectedRoute element={<Reports />} roleRequired="Administrator" />} />

          {/* Entity Management Route */}
          <Route path="/admin/entity-management" element={<ProtectedRoute element={<EntityManagement />} roleRequired="Administrator" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
