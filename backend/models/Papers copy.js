const db = require('../db'); // Import the database connection

const Paper = {
  // Submit a paper
  submit: (paperData) => {
    const sql = 'INSERT INTO papers (title, abstract, document, status, CorrespondingAuthorId,SubmissionDate, PublicationDate,Keywords) VALUES (?, ?, ?, ?, ?,?,?,?)';
    const submissionDate = new Date(); // Automatically set the submission date
    const publicationDate = paperData.publicationDate || null; // Optional publication date
    const keywords = paperData.keywords || null;
    return new Promise((resolve, reject) => {
      db.query(sql, [paperData.title, paperData.abstract, paperData.document, 'submitted', paperData.authorId,submissionDate, publicationDate,keywords], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result); // Return the result to the controller
      });
    });
  },

  // Link paper with a domain using the paperdomains junction table
  linkPaperWithDomain: (paperId, domainId) => {
    const sql = 'INSERT INTO paperdomains (PaperID, DomainID) SELECT ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM paperdomains WHERE PaperID = ? AND DomainID = ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [paperId, domainId, paperId, domainId], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  // Link paper with a conference using the paperconferences junction table
  linkPaperWithConference: (paperId, conferenceId) => {
    const sql = 'INSERT INTO paperconferences (PaperID, ConferenceID) SELECT ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM paperconferences WHERE PaperID = ? AND ConferenceID = ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [paperId, conferenceId, paperId, conferenceId], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  // Link paper with a journal using the paperjournals junction table
  linkPaperWithJournal: (paperId, journalId) => {
    const sql = 'INSERT INTO paperjournals (PaperID, JournalID) SELECT ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM paperjournals WHERE PaperID = ? AND JournalID = ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [paperId, journalId, paperId, journalId], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  // Get papers by author (this fetches paper details from papers table)
  getPapersByAuthor: (authorId) => {
    const sql = 'SELECT * FROM papers WHERE CorrespondingAuthorID = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [authorId], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  // Update paper status
  updatePaperStatus: (paperId, status) => {
    const sql = 'UPDATE papers SET status = ? WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [status, paperId], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  // Search papers by title and domainId (searches papers and their junctions)
  searchPapers: (title, domainId) => {
    let sql = 'SELECT p.* FROM papers p JOIN paperdomains pd ON p.id = pd.PaperID WHERE 1=1';
    const params = [];

    if (title) {
      sql += ' AND p.title LIKE ?';
      params.push(`%${title}%`);
    }

    if (domainId) {
      sql += ' AND pd.DomainID = ?';
      params.push(domainId);
    }

    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  // Check if a domain exists and return its ID (used for ensuring uniqueness)
  checkDomainExists: (domainName) => {
    const sql = 'SELECT DomainID FROM domains WHERE DomainName = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [domainName], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result.length ? result[0].DomainID : null); // Return the existing DomainID or null if it doesn't exist
      });
    });
  },

  // Check if a conference exists and return its ID (used for ensuring uniqueness)
  checkConferenceExists: (conferenceName) => {
    const sql = 'SELECT ConferenceID FROM conferences WHERE ConferenceName = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [conferenceName], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result.length ? result[0].ConferenceID : null); // Return the existing ConferenceID or null if it doesn't exist
      });
    });
  },

  // Check if a journal exists and return its ID (used for ensuring uniqueness)
  checkJournalExists: (journalName) => {
    const sql = 'SELECT JournalID FROM journals WHERE JournalName = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [journalName], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result.length ? result[0].JournalID : null); // Return the existing JournalID or null if it doesn't exist
      });
    });
  },
  getPaperById:async (paperId) => {
    const query = 'SELECT * FROM papers WHERE PaperID = ?';
    const [rows] = await db.execute(query, [paperId]);
    return rows;
  },
  deletePaper:async (paperId) => {
    const query = 'DELETE FROM papers WHERE PaperID = ?';
    await db.execute(query, [paperId]);
  }
};

module.exports = Paper;
