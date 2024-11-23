const Conferences = require('../models/Conferences');

// Get all departments
exports.getAllConferences = (req, res) => {
  Conferences.getAllConferences((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ conferences: result });
  });
};

exports.deleteConference = async (req, res) => {
  const { id } = req.params;
  try {
    await Conferences.deleteConference(id);
    res.status(200).json({ message: 'Conference deleted successfully.' });
  } catch (err) {
    console.error("Error deleting conference:", err);
    res.status(500).json({ message: 'Error deleting conference.' });
  }
};

// Controller for modifying conference
exports.modifyConference = async (req, res) => {
  const { id } = req.params;
  const { name, location, conferenceDate } = req.body;
  try {
    await Conferences.modifyConference(id, name, location, conferenceDate);
    res.status(200).json({ message: 'Conference updated successfully.' });
  } catch (err) {
    console.error("Error modifying conference:", err);
    res.status(500).json({ message: 'Error modifying conference.' });
  }
};