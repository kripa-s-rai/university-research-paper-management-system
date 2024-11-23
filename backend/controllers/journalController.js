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

exports.deleteJournal = async (req, res) => {
  const { id } = req.params;
  try {
    await journalModel.deleteJournal(id);
    res.status(200).json({ message: 'Journal deleted successfully.' });
  } catch (err) {
    console.error("Error deleting journal:", err);
    res.status(500).json({ message: 'Error deleting journal.' });
  }
};

// Controller for modifying journal
exports.modifyJournal = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await Journal.modifyJournal(id, name);
    res.status(200).json({ message: 'Journal updated successfully.' });
  } catch (err) {
    console.error("Error modifying journal:", err);
    res.status(500).json({ message: 'Error modifying journal.' });
  }
};
