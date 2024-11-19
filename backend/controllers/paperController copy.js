const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Paper = require('../models/Papers'); // Import Paper model for database operations
const db = require('../db'); // Import the database connection

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where the files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Naming convention for uploaded files
  }
});

const upload = multer({ storage });

// Submit paper (with file upload handling)
exports.submitPaper = [
  upload.single('document'),
  (req, res) => {
    // Destructure paper data from req.body
    const { title, abstract, domainId, conference, journal, authorId } = req.body;

    // Validate: Ensure required fields and document are provided
    if (!title || !abstract || !domainId || !authorId || !req.file) {
      return res.status(400).json({ error: 'Title, abstract, domain, author ID, and document are required.' });
    }

    // Handle Domain - Check if the domain already exists
    let domainID = domainId;
    if (isNaN(domainId)) {
      db.query(
        'SELECT DomainID FROM domains WHERE DomainName = ?',
        [domainId],
        (err, domainResult) => {
          if (err) {
            return res.status(500).json({ error: 'Error checking domain.' });
          }

          if (domainResult.length === 0) {
            // Insert new domain if it doesn't exist
            db.query(
              'INSERT INTO domains (DomainName) VALUES (?)',
              [domainId],
              (err, insertDomainResult) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to insert domain.' });
                }
                domainID = insertDomainResult.insertId;
                handleConferenceAndJournal();
              }
            );
          } else {
            domainID = domainResult[0].DomainID;
            handleConferenceAndJournal();
          }
        }
      );
    } else {
      handleConferenceAndJournal();
    }

    function handleConferenceAndJournal() {
      // Handle Conference - Check if the conference already exists
      let conferenceID = conference;
      if (conference && isNaN(conference)) {
        db.query(
          'SELECT ConferenceID FROM conferences WHERE ConferenceName = ?',
          [conference],
          (err, conferenceResult) => {
            if (err) {
              return res.status(500).json({ error: 'Error checking conference.' });
            }

            if (conferenceResult.length === 0) {
              // Insert new conference if it doesn't exist
              db.query(
                'INSERT INTO conferences (ConferenceName) VALUES (?)',
                [conference],
                (err, insertConferenceResult) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to insert conference.' });
                  }
                  conferenceID = insertConferenceResult.insertId;
                  handleJournal();
                }
              );
            } else {
              conferenceID = conferenceResult[0].ConferenceID;
              handleJournal();
            }
          }
        );
      } else {
        handleJournal();
      }

      function handleJournal() {
        // Handle Journal - Check if the journal already exists
        let journalID = journal;
        if (journal && isNaN(journal)) {
          db.query(
            'SELECT JournalID FROM journals WHERE JournalName = ?',
            [journal],
            (err, journalResult) => {
              if (err) {
                return res.status(500).json({ error: 'Error checking journal.' });
              }

              if (journalResult.length === 0) {
                // Insert new journal if it doesn't exist
                db.query(
                  'INSERT INTO journals (JournalName, JournalDate) VALUES (?, NOW())',
                  [journal],
                  (err, insertJournalResult) => {
                    if (err) {
                      return res.status(500).json({ error: 'Failed to insert journal.' });
                    }
                    journalID = insertJournalResult.insertId;
                    insertPaper();
                  }
                );
              } else {
                journalID = journalResult[0].JournalID;
                insertPaper();
              }
            }
          );
        } else {
          insertPaper();
        }
      }

      function insertPaper() {
        // Insert the paper into the papers table
        const paperData = {
          title,
          abstract,
          document: req.file.path, // Path to the uploaded document
          authorId,
          submissionDate: new Date(),
        };

        Paper.submit(paperData)
          .then((paperResult) => {
            
            // Link the paper with domain, conference, and journal in their respective junction tables
            Paper.linkPaperWithDomain(paperResult.insertId, domainID)
              .then(() => {
                if (conferenceID) {
                  Paper.linkPaperWithConference(paperResult.insertId, conferenceID)
                    .then(() => {
                      if (journalID) {
                        Paper.linkPaperWithJournal(paperResult.insertId, journalID)
                          .then(() => {
                            // Respond with success message
                            res.status(200).json({ message: 'Paper submitted successfully!', paperId: paperResult.insertId });
                          })
                          .catch((err) => {
                            res.status(500).json({ error: 'Failed to link paper with journal.' });
                          });
                      } else {
                        res.status(200).json({ message: 'Paper submitted successfully!', paperId: paperResult.insertId });
                      }
                    })
                    .catch((err) => {
                      res.status(500).json({ error: 'Failed to link paper with conference.' });
                    });
                } else {
                  res.status(200).json({ message: 'Paper submitted successfully!', paperId: paperResult.insertId });
                }
              })
              .catch((err) => {
                res.status(500).json({ error: 'Failed to link paper with domain.' });
              });
          })
          .catch((err) => {
            res.status(500).json({ error: 'Failed to submit paper.' });
          });
      }
    }
  }
];

// Get papers by author
exports.getPapersByAuthor = async (req, res) => {
  const authorId = req.params.id;
  try {
    const papers = await Paper.getPapersByAuthor(authorId);
    res.status(200).json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update paper status
exports.updatePaperStatus = async (req, res) => {
  const paperId = req.params.id;
  const { status } = req.body;
  try {
    await Paper.updatePaperStatus(paperId, status);
    res.status(200).json({ message: 'Paper status updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search papers by title or domain
exports.searchPapers = async (req, res) => {
  const { title, domainId } = req.query;
  try {
    const papers = await Paper.searchPapers(title, domainId);
    res.status(200).json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// General research paper search by title or author
exports.getResearchPapers = async (req, res) => {
  const { title, author } = req.query;
  let query = 'SELECT PaperID, Title, SubmissionDate, PublicationDate, CorrespondingAuthorID FROM papers WHERE 1=1';
  const params = [];

  if (title) {
    query += ' AND Title LIKE ?';
    params.push(`%${title}%`);
  }

  if (author) {
    query += ' AND CorrespondingAuthorID = ?';
    params.push(author);
  }

  try {
    const [rows] = await db.execute(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching research papers' });
  }
};

exports.deletePaper = async (req, res) => {
  const paperId = req.params.id;

  try {
    // Fetch the paper record to get the file path
    const [paper] = await Paper.getPaperById(paperId);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found.' });
    }

    // Delete the file from the file system
    if (paper.document) {
      const filePath = path.join(__dirname, '../', paper.document);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    // Delete the paper record from the database
    await Paper.deletePaper(paperId);

    // Return success response
    res.status(200).json({ message: 'Paper deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete paper.' });
  }
};