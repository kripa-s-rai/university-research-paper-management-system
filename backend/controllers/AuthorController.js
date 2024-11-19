// controllers/AuthorController.js

const db = require("../db"); // Adjust path as needed

const AuthorController = {
    getAllAuthors: (req, res) => {
      const query = "SELECT UserID, Name FROM users WHERE Role = 'author'";
  
      new Promise((resolve, reject) => {
        db.execute(query, (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
      })
        .then(([rows]) => {
          console.log("Query Result:", rows);
          res.status(200).json({ authors: rows });
        })
        .catch((error) => {
          console.error("Error fetching authors:", error.message);
          res.status(500).json({ error: "Failed to fetch authors." });
        });
    },
  };

module.exports = AuthorController;
