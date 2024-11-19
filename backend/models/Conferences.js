const db = require('../db');

const Conferences = {
  getAllConferences: (callback) => {
    const sql = 'SELECT * FROM conferences';
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      return callback(null, result);
    });
  },
};

module.exports=Conferences;


