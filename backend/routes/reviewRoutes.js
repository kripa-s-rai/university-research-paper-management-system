const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Route to add a new review
router.post('/', reviewController.addReview);

// Route to get reviews for a specific paper
router.get('/paper/:paperID', reviewController.getReviewsByPaperID);

// Route to get all reviews (optional, for admin or reporting purposes)
router.get('/', reviewController.getAllReviews);

module.exports = router;
