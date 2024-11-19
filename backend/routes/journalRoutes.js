const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

// Get all journals
router.get('/', journalController.getAllJournals);



module.exports = router;