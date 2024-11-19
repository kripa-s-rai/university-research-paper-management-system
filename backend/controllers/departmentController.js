// controllers/departmentController.js
const Department = require('../models/Department');

// Get all departments
exports.getAllDepartments = (req, res) => {
  Department.getAllDepartments((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ departments: result });
  });
};

// Get department by ID
exports.getDepartmentById = (req, res) => {
  const deptId = req.params.id;

  Department.getDepartmentById(deptId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!result) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.status(200).json({ department: result });
  });
};

// Insert a new department
exports.createDepartment = (req, res) => {
  const departmentData = req.body;

  if (!departmentData.DepartmentName) {
    return res.status(400).json({ error: 'Department Name is required' });
  }

  Department.insertDepartment(departmentData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Department created successfully!', departmentId: result.insertId });
  });
};

// Update a department
exports.updateDepartment = (req, res) => {
  const deptId = req.params.id;
  const departmentData = req.body;

  if (!departmentData.DepartmentName) {
    return res.status(400).json({ error: 'Department Name is required' });
  }

  Department.updateDepartment(deptId, departmentData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Department updated successfully!' });
  });
};

// Delete a department
exports.deleteDepartment = (req, res) => {
  const deptId = req.params.id;

  Department.deleteDepartment(deptId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Department deleted successfully!' });
  });
};
