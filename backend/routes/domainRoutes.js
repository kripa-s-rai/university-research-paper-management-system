const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');

// Route to get all domains
router.get('/',domainController.getAllDomains);
router.delete('/:id', domainController.deleteDomain);
router.put('/:id', domainController.modifyDomain);

module.exports = router;