import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import { useAuth } from './context/AuthContext';

const App = () => {
  const { user } = useAuth();

  const ProtectedRoute = ({ element }) => {
    return user ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/research-papers" element={<ResearchPapers />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/submit-paper" element={<ProtectedRoute element={<SubmitPaper />} />} />
          <Route path="/my-papers" element={<ProtectedRoute element={<MyPapers />} />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<ProtectedRoute element={<AdminUsers />} />} />
          <Route path="/admin/papers" element={<ProtectedRoute element={<AdminPapers />} />} />

          <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
