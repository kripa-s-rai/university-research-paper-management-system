const Domains = require('../models/Domain');


exports.getAllDomains = (req, res) => {
  Domains.getAllDomains((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ domains: result });
  });
};

exports.deleteDomain = async (req, res) => {
  const { id } = req.params;
  try {
    await Domains.deleteDomain(id);
    res.status(200).json({ message: 'Domain deleted successfully.' });
  } catch (err) {
    console.error("Error deleting domain:", err);
    res.status(500).json({ message: 'Error deleting domain.' });
  }
};

// Controller for modifying domain
exports.modifyDomain = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await Domains.modifyDomain(id, name);
    res.status(200).json({ message: 'Domain updated successfully.' });
  } catch (err) {
    console.error("Error modifying domain:", err);
    res.status(500).json({ message: 'Error modifying domain.' });
  }
};

