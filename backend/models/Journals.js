const db = require('../db');

const Journals = {
  getAllJournals: (callback) => {
    const sql = 'SELECT * FROM journals';
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },
  deleteJournal :(id) => {
    return new Promise((resolve, reject) => {
      db.query('CALL deleteJournal(?)', [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  
  // Modify a journal
  modifyJournal : (id, name) => {
    return new Promise((resolve, reject) => {
      db.query('CALL modifyJournal(?, ?)', [id, name], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
};

module.exports=Journals;


