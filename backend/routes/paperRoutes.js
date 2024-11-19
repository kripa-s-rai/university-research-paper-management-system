const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');

router.post('/submit', paperController.submitPaper);
router.get('/author/:id', paperController.getPapersByAuthor);
router.put('/:id/status', paperController.updatePaperStatus);
router.get('/search', paperController.searchPapers);
router.get('/', paperController.getResearchPapers);
router.get('/:id', paperController.getPaperById);
router.delete('/:id', paperController.deletePaper);
router.post("/:paperId/:type", paperController.addAssociation);
router.delete("/:paperId/:type/:valueId", paperController.removeAssociation);

module.exports = router;
