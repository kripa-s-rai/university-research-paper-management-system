const db = require('../db');

const Domains = {
  getAllDomains: (callback) => {
    const sql = 'SELECT * FROM domains';
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },
  deleteDomain :(id) => {
    return new Promise((resolve, reject) => {
      db.query('CALL deleteDomain(?)', [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  
  // Modify a domain
  modifyDomain :(id, name) => {
    return new Promise((resolve, reject) => {
      db.query('CALL modifyDomain(?, ?)', [id, name], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
};

module.exports=Domains;


