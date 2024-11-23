const db = require('../db');

const Conferences = {
  getAllConferences: (callback) => {
    const sql = 'SELECT * FROM conferences';
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },
  deleteConference: (id) => {
    return new Promise((resolve, reject) => {
      db.query('CALL deleteConference(?)', [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  
  // Modify a conference
  modifyConference :(id, name, location, conferenceDate) => {
    return new Promise((resolve, reject) => {
      db.query('CALL modifyConference(?, ?, ?, ?)', [id, name, location, conferenceDate], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
};

module.exports=Conferences;


