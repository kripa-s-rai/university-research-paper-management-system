const Conferences = require('../models/Conferences');

// Get all departments
exports.getAllConferences = (req, res) => {
  Conferences.getAllConferences((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ confernces: result });
  });
};
