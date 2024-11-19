// models/Department.js
const db = require('../db');

const Department = {
  // Get all departments
  getAllDepartments: (callback) => {
    const sql = 'SELECT * FROM departments';
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },

  // Get a department by ID
  getDepartmentById: (id, callback) => {
    const sql = 'SELECT * FROM departments WHERE DeptID = ?';
    db.query(sql, [id], (err, result) => {
      if (err) return callback(err);
      return callback(null, result[0]);
    });
  },

  // Insert a new department
  insertDepartment: (departmentData, callback) => {
    const sql = 'INSERT INTO departments (DepartmentName) VALUES (?)';
    db.query(sql, [departmentData.DepartmentName], (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },

  // Update a department
  updateDepartment: (id, departmentData, callback) => {
    const sql = 'UPDATE departments SET DepartmentName = ? WHERE DeptID = ?';
    db.query(sql, [departmentData.DepartmentName, id], (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },

  // Delete a department
  deleteDepartment: (id, callback) => {
    const sql = 'DELETE FROM departments WHERE DeptID = ?';
    db.query(sql, [id], (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  }
};

module.exports = Department;
