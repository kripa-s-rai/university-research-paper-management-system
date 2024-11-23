import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('author');
  const [department, setDepartment] = useState(''); // Added department state
  const [departments, setDepartments] = useState([]); // State for departments list
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch departments from the backend API
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/departments/');
        console.log("Fetched Departments:", response.data); // Debugging: Check the structure

        // Check for 'departments' property to get the actual array
        if (response.data && Array.isArray(response.data.departments)) {
          setDepartments(response.data.departments);
        } else {
          setDepartments([]); // Set empty array if data is not structured as expected
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments.');
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  const isValidPassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters long and contain a number.');
      setIsLoading(false);
      return;
    }

    if (!department) {
      setError('Please select a department');
      setIsLoading(false);
      return;
    }

    const userData = { username, email, password, role, department }; // Include department in userData
    console.log(userData);
    try {
      await axios.post('http://localhost:5000/api/users/register', userData);
      alert('User registered successfully!');
      navigate('/login');

      // Clear form fields after successful registration
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('author');
      setDepartment(''); // Clear department
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Error registering user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-form">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="author">Author</option>
            <option value="reviewer">Reviewer</option>
          </select>
          
          {/* Department Select */}
          <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.DeptID} value={dept.DeptID}>
                {dept.DepartmentName}
              </option>
            ))}
          </select>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
