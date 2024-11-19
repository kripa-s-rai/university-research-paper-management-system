const Domains = require('../models/Domain');


exports.getAllDomains = (req, res) => {
  Domains.getAllDomains((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ domains: result });
  });
};
