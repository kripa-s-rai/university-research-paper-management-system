const express = require('express');
const router = express.Router();
const conferenceController = require('../controllers/conferenceController');

// Get all departments
router.get('/', conferenceController.getAllConferences);
router.delete('/:id', conferenceController.deleteConference);
router.put('/:id', conferenceController.modifyConference);

module.exports = router;