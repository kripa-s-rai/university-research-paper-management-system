const db = require('../db');

const Domains = {
  getAllDomains: (callback) => {
    const sql = 'SELECT * FROM domains';
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },
};

module.exports=Domains;


