const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const Paper = require('../models/Papers');

// Get all users
router.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(users);
  });
});

// Get all papers
router.get('/papers', (req, res) => {
  const sql = 'SELECT * FROM papers';
  db.query(sql, (err, papers) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(papers);
  });
});

// Delete user
router.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'User deleted successfully!' });
  });
});

// Delete paper
router.delete('/papers/:id', (req, res) => {
  const paperId = req.params.id;
  const sql = 'DELETE FROM papers WHERE id = ?';
  db.query(sql, [paperId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Paper deleted successfully!' });
  });
});

module.exports = router;
