const db = require('../db');

const Journals = {
  getAllJournals: (callback) => {
    const sql = 'SELECT * FROM journals';
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },
};

module.exports=Journals;


