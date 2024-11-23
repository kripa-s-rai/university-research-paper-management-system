const db = require('../db');

// Add a new review
/*const addReview = async (req, res) => {
  const { PaperID, ReviewerID, Comment, Rating } = req.body;

  if (!PaperID || !ReviewerID || !Comment || !Rating) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const query = `
      INSERT INTO reviews (PaperID, ReviewerID, Comment, Rating, ReviewDate)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const values = [PaperID, ReviewerID, Comment, Rating];
    await db.promise().query(query, values);

    res.status(201).json({ message: 'Review added successfully.' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review.' });
  }
};

// Get reviews for a specific paper
const getReviewsByPaperID = async (req, res) => {
  const { paperID } = req.params;

  try {
    const query = `
      SELECT r.ReviewID, r.Comment, r.Rating, r.ReviewDate, u.Name AS ReviewerName
      FROM reviews r
      JOIN users u ON r.ReviewerID = u.UserID
      WHERE r.PaperID = ?
    `;
    const reviews = await db.promise().query(query, [paperID]);

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};
*/
// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const query = `
      SELECT r.ReviewID, r.Comment, r.Rating, r.ReviewDate, u.Name AS ReviewerName, p.Title AS PaperTitle
      FROM reviews r
      JOIN users u ON r.ReviewerID = u.UserID
      JOIN papers p ON r.PaperID = p.PaperID
    `;
    const reviews = await db.query(query);

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

/*module.exports = {
  /*addReview,
  getReviewsByPaperID,
  getAllReviews,
};
*/

// Add a review
exports.addReview = async (req, res) => {
  const { PaperID, ReviewerID, Comment, Rating } = req.body;

  // Validate input
  if (!PaperID || !ReviewerID || !Comment || Rating === undefined) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO reviews (PaperID, ReviewerID, Comment, Rating, ReviewDate) VALUES (?, ?, ?, ?, NOW())',
      [PaperID, ReviewerID, Comment, Rating]
    );
    res.status(201).json({ message: 'Review added successfully.', reviewId: result.insertId });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review.' });
  }
};

// Get reviews for a paper
exports.getReviewsByPaperID = async (req, res) => {
  const { paperId } = req.params;

  try {
    const reviews = await db.query(
      'SELECT r.*, u.Name AS ReviewerName FROM reviews r JOIN users u ON r.ReviewerID = u.UserID WHERE r.PaperID = ?',
      [paperId]
    );
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};
