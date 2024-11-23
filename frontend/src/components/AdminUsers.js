import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(response.data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      setUsers(users.filter(user => user.UserID !== userId));
      alert('User deleted successfully!');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user =>
        user.UserID === userId ? { ...user, Role: newRole } : user
      ));
      alert('User role updated successfully!');
    } catch (error) {
      alert('Failed to update user role.');
    }
  };

  return (
    <div className="admin-users-container">
      <h2 className="page-title">Manage Users</h2>
      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Loading users...</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.UserID}>
                  <td>{user.Name}</td>
                  <td>{user.Email}</td>
                  <td>{user.Role}</td>
                  <td>{new Date(user.JoinDate).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <select
                      className="role-select"
                      value={user.Role}
                      onChange={(e) => updateUserRole(user.UserID, e.target.value)}
                    >
                      <option value="Author">Author</option>
                      <option value="Reviewer">Reviewer</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(user.UserID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
