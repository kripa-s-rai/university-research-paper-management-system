import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    };
    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    await axios.delete(`/api/admin/users/${userId}`);
    setUsers(users.filter(user => user.id !== userId));
    alert('User deleted successfully!');
  };

  return (
    <div>
      <h2>All Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} - Role: {user.role}
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUsers;
