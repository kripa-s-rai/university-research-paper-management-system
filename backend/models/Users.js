const db = require('../db');
const bcrypt = require('bcryptjs');

const User = {
  register: async (userData, callback) => {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Insert query with correct field names (matching the table schema)
    const sql = 'INSERT INTO users (Name, Email, Password, Role, DepartmentID) VALUES (?, ?, ?, ?, ?)';
    
    // Execute the query with the passed user data
    db.query(sql, [userData.username, userData.email, hashedPassword, userData.role, userData.department], (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },

  findOne: (searchParams, callback) => {
    const { email, name } = searchParams;
    const sql = email ? 'SELECT * FROM users WHERE Email = ?' : 'SELECT * FROM users WHERE Name = ?';
    const searchValue = email || name;

    db.query(sql, [searchValue], (err, result) => {
      if (err) return callback(err);
      return callback(null, result[0]); // Return the first user found
    });
  },

  updateUserRole: (userId, role, callback) => {
    // Update user role query
    const sql = 'UPDATE users SET Role = ? WHERE UserID = ?';
    db.query(sql, [role, userId], (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  }
};

module.exports = User;
