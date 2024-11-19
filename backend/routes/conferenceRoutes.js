const express = require('express');
const router = express.Router();
const conferenceController = require('../controllers/conferenceController');

// Get all departments
router.get('/', conferenceController.getAllConferences);

module.exports = router;