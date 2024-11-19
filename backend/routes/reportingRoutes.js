const express = require('express');
const router = express.Router();

const mysql = require('mysql2/promise');
const initializeDb = async () => {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'urpms_user',
    password: 'urpms123',
    database: 'uprms',
  });
  return db;
};
// Get paper statistics
router.get('/aggregated', async (req, res) => {
  try {
    const db = await initializeDb();  // Initialize the DB connection inside the route handler
    const [rows] = await db.query(`
      SELECT Status, COUNT(*) AS NumberOfPapers
      FROM papers
      GROUP BY Status;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching aggregated data:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch aggregated data' });
  }
});


module.exports = router;
