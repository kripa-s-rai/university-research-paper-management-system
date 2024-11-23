const express = require('express');
const router = express.Router();
const db = require('../db');

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

// Update user role
router.put('/users/:id/role', (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  // Validate the role against the enum values
  const validRoles = ['Author', 'Reviewer', 'Administrator'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const sql = 'UPDATE users SET Role = ? WHERE UserID = ?';
  db.query(sql, [role, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User role updated successfully!' });
  });
});

// Delete user
router.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE UserId = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'User deleted successfully!' });
  });
});

// Delete paper
router.delete('/papers/:id', (req, res) => {
  const PaperId = req.params.id;
  const sql = 'DELETE FROM papers WHERE PaperId = ?';
  db.query(sql, [PaperId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Paper deleted successfully!' });
  });
});

// Update paper status (Accept/Reject)
router.put('/papers/:id/status', (req, res) => {
  const paperId = req.params.id;
  const { status, publicationDate } = req.body;

  const sql = `
    UPDATE papers 
    SET Status = ?, PublicationDate = ?
    WHERE PaperID = ?;
  `;

  db.query(sql, [status, publicationDate, paperId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Paper status updated successfully!' });
  });
});
router.get('/papers/:paperId/authors', (req, res) => {
  const paperId = req.params.paperId;
  console.log(`Fetching authors for paper with ID: ${paperId}`);

  // Query to get the corresponding author
  const correspondingAuthorSql = `
    SELECT u.Name 
    FROM users u
    WHERE u.UserID = (SELECT CorrespondingAuthorID FROM papers WHERE PaperID = ?)
  `;

  // Query to get other authors from the paperauthors table
  const authorsSql = `
    SELECT u.Name 
    FROM users u
    JOIN paperauthors pa ON u.UserID = pa.AuthorID
    WHERE pa.PaperID = ? AND u.UserID != (SELECT CorrespondingAuthorID FROM papers WHERE PaperID = ?)
  `;

  db.query(correspondingAuthorSql, [paperId], (err, correspondingAuthorResult) => {
    if (err) {
      console.error('Error querying corresponding author:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (correspondingAuthorResult.length === 0) {
      console.log('No corresponding author found for this paper');
      return res.status(404).json({ message: 'No corresponding author found for this paper' });
    }

    const correspondingAuthor = correspondingAuthorResult[0].Name;

    // Now fetch the other authors
    db.query(authorsSql, [paperId, paperId], (err, otherAuthorsResult) => {
      if (err) {
        console.error('Error querying other authors:', err);
        return res.status(500).json({ error: 'Database query error' });
      }

      const authors = otherAuthorsResult.map((author) => author.Name);

      // Send back both corresponding author and other authors
      res.status(200).json({
        correspondingAuthor,
        authors,
      });
    });
  });
});

// View paper details
router.get('/papers/:id', (req, res) => {
  const paperId = req.params.id;
  const sql = 'SELECT * FROM papers WHERE PaperID = ?';
  db.query(sql, [paperId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.status(200).json(result[0]);
  });
});

module.exports = router;
