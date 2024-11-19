const Journal = require('../models/Journals');

// Get all departments
exports.getAllJournals = (req, res) => {
  Journal.getAllJournals((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ journals : result });
  });
};
