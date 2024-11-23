const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

// Get all journals
router.get('/', journalController.getAllJournals);
router.delete('/:id', journalController.deleteJournal);
router.put('/:id', journalController.modifyJournal);



module.exports = router;