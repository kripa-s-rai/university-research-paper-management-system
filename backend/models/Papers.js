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
  getOrCreateDomain: async (domainName) => {
    const selectQuery = 'SELECT DomainID FROM domains WHERE DomainName = ?';
    const insertQuery = 'INSERT INTO domains (DomainName) VALUES (?)';

    const [rows] = await db.execute(selectQuery, [domainName]);
    if (rows.length > 0) {
      return rows[0].DomainID;
    } else {
      const [result] = await db.execute(insertQuery, [domainName]);
      return result.insertId;
    }
  },

  // Add or get Conference
  getOrCreateConference: async (conferenceName) => {
    const selectQuery = 'SELECT ConferenceID FROM conferences WHERE ConferenceName = ?';
    const insertQuery = 'INSERT INTO conferences (ConferenceName) VALUES (?)';

    const [rows] = await db.execute(selectQuery, [conferenceName]);
    if (rows.length > 0) {
      return rows[0].ConferenceID;
    } else {
      const [result] = await db.execute(insertQuery, [conferenceName]);
      return result.insertId;
    }
  },

  // Add or get Journal
  getOrCreateJournal: async (journalName) => {
    const selectQuery = 'SELECT JournalID FROM journals WHERE JournalName = ?';
    const insertQuery = 'INSERT INTO journals (JournalName, JournalDate) VALUES (?, NOW())';

    const [rows] = await db.execute(selectQuery, [journalName]);
    if (rows.length > 0) {
      return rows[0].JournalID;
    } else {
      const [result] = await db.execute(insertQuery, [journalName]);
      return result.insertId;
    }
  },

  // Add or get Author (for co-authors)
  getOrCreateAuthor: async (authorName) => {
    const selectQuery = "SELECT UserID FROM users WHERE Name = ? AND Role = 'author'";
    const insertQuery = "INSERT INTO users (Name, Role) VALUES (?, 'author')";

    const [rows] = await db.execute(selectQuery, [authorName]);
    if (rows.length > 0) {
      return rows[0].UserID;
    } else {
      const [result] = await db.execute(insertQuery, [authorName]);
      return result.insertId;
    }
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
    const sql = 'INSERT INTO paperjournal (PaperID, JournalID) SELECT ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM paperjournal WHERE PaperID = ? AND JournalID = ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [paperId, journalId, paperId, journalId], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  unlinkPaperWithDomain: (paperId, domainId) => {
    const query = 'DELETE FROM paperdomains WHERE PaperID = ? AND DomainID = ?';
    return db.execute(query, [paperId, domainId]);
  },

  // Remove link between paper and conference
  unlinkPaperWithConference: (paperId, conferenceId) => {
    const query = 'DELETE FROM paperconferences WHERE PaperID = ? AND ConferenceID = ?';
    return db.execute(query, [paperId, conferenceId]);
  },

  // Remove link between paper and journal
  unlinkPaperWithJournal: (paperId, journalId) => {
    const query = 'DELETE FROM paperjournal WHERE PaperID = ? AND JournalID = ?';
    return db.execute(query, [paperId, journalId]);
  },

  // Remove link between paper and co-author
  unlinkPaperWithAuthor: (paperId, authorId) => {
    const query = 'DELETE FROM paperauthors WHERE PaperID = ? AND AuthorID = ?';
    return db.execute(query, [paperId, authorId]);
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
  getPaperById: (paperId) => {
    return new Promise((resolve, reject) => {
      if (!paperId || (typeof paperId !== 'string' && typeof paperId !== 'number')) {
        return reject(new Error("Invalid paperId"));
      }
  
      const query = "SELECT * FROM papers WHERE PaperID = ?";
      db.query(query, [paperId], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return reject(err);
        }
        
        if (result.length === 0) {
          return reject(new Error("Paper not found"));
        }
  
        resolve(result);
      });
    });
  },
  

  deletePaper: (paperId) => {
    const query = 'DELETE FROM papers WHERE PaperID = ?';

    return new Promise((resolve, reject) => {
      db.execute(query, [paperId], (err, result) => {
        if (err) {
          console.error('Error executing delete query:', err);
          reject(new Error('Failed to delete paper')); // Reject with error if failed
        }
        resolve(result); // Resolve if successful
      });
    });
  },
  getAssociatedDomains:async (paperId) => {
    // Query the database for associated domains for a given paper ID
    try {
      // Use con.promise().query() to make the query return a promise
      const [rows] = await db.promise().query(
        'SELECT * FROM domains JOIN paperdomains ON domains.DomainID = paperdomains.DomainID WHERE paperdomains.PaperID = ?',
        [paperId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching associated domains:', error.message);
      throw error;  // Optional: Rethrow error to be handled by the caller
    }
  },
  
  getAssociatedConferences: async (paperId) => {
    // Similar query for conferences
    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM conferences JOIN paperconferences ON conferences.ConferenceID = paperconferences.ConferenceID WHERE paperconferences.PaperID = ?',
        [paperId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching associated conferences:', error.message);
      throw error;
    }
  },
  
  getAssociatedJournals :async (paperId) => {
    // Similar query for journals
    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM journals JOIN paperjournal ON journals.JournalID = paperjournal.JournalID WHERE paperjournal.PaperID = ?',
        [paperId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching associated journals:', error.message);
      throw error;
    }
  },
  
  getAssociatedAuthors: async (paperId) => {
    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM users JOIN paperauthors ON users.UserID = paperauthors.AuthorID WHERE paperauthors.PaperID = ?',
        [paperId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching associated authors:', error.message);
      throw error;
    }
  },
  addAssociation: async (paperId, type, value) => {
    switch (type) {
      case "domains":
        if (isNaN(value)) {
          // If value is not an ID, assume it's a new domain name
          value = await Paper.getOrCreateDomain(value);
        }
        await Paper.linkPaperWithDomain(paperId, value);
        break;
      case "conferences":
        if (isNaN(value)) {
          value = await Paper.getOrCreateConference(value);
        }
        await Paper.linkPaperWithConference(paperId, value);
        break;
      case "journals":
        if (isNaN(value)) {
          value = await Paper.getOrCreateJournal(value);
        }
        await Paper.linkPaperWithJournal(paperId, value);
        break;
      case "authors":
        if (isNaN(value)) {
          value = await Paper.getOrCreateAuthor(value);
        }
        await Paper.linkPaperWithAuthor(paperId, value);
        break;
      default:
        throw new Error("Invalid association type");
    }
  },

  // Remove association
  removeAssociation: async (paperId, type, valueId) => {
    switch (type) {
      case "domains":
        await Paper.unlinkPaperWithDomain(paperId, valueId);
        break;
      case "conferences":
        await Paper.unlinkPaperWithConference(paperId, valueId);
        break;
      case "journals":
        await Paper.unlinkPaperWithJournal(paperId, valueId);
        break;
      case "authors":
        await Paper.unlinkPaperWithAuthor(paperId, valueId);
        break;
      default:
        throw new Error("Invalid association type");
    }
  },
};

module.exports = Paper;
