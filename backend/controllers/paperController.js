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
exports.getResearchPapersby = async (req, res) => {
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
    const result = await db.execute(query, params);
    const rows = result[0]; // Extract the rows from the result
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching research papers' });
  }
};
exports.getResearchPapers = async (req, res) => {
  try {
    const [rows] = await db.promise().execute('CALL GetResearchPaper()');
    console.log('Rows',rows);
    if (!rows || rows[0].length === 0) {
      return res.status(404).json({ message: 'No papers found' });
    }

    const formattedRows = rows[0].map((paper) => {
      // Split authors into an array and trim spaces
      const authorsArray = paper.authors
        ? paper.authors.split(',').map((author) => author.trim()) 
        : [];
    
      // Check if the corresponding author is already in the authors array; if not, add them
      if (paper.CorrespondingAuthor && !authorsArray.includes(paper.CorrespondingAuthor)) {
        authorsArray.push(paper.CorrespondingAuthor);
      }
    
      return {
        PaperID: paper.PaperID,
        Title: paper.Title,
        Status: paper.Status,
        Authors: authorsArray, // Include the authors and corresponding author
        CorrespondingAuthor: paper.corresponding_author, // This field is still available if needed
        Document:paper.document,
      };
    });
    

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error('Error fetching research papers:', error);
    res.status(500).json({ error: 'Error fetching research papers' });
  }
};



exports.getPaperById= (paperId) => {
  return Paper.getPaperById(paperId); // Call the function from the Papers model
};
// controllers/paperController.js
exports.deletePaper = async (req, res) => {
  const paperId = req.params.id;

  try {
    // Get paper details
    const paper = await Paper.getPaperById(paperId);

    // Check if paper exists
    if (paper.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    // Delete the document file from the server if it exists
    if (paper[0].document) {
      const filePath = path.join(__dirname, '../', paper[0].document);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    // Delete the paper record from the database
    await Paper.deletePaper(paperId);

    // Send success response
    res.status(200).json({ message: 'Paper and related records deleted successfully!' });
  } catch (err) {
    console.error('Error deleting paper:', err);
    res.status(500).json({ error: 'Failed to delete paper' });
  }
};
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.addAssociation=async (req, res) => {
  const { paperId, type } = req.params;
  const { value } = req.body;

  if (!["domains", "conferences", "journals", "authors"].includes(type)) {
    return res.status(400).json({ error: "Invalid association type." });
  }

  try {
    await Paper.addAssociation(paperId, type, value);
    res.status(201).json({ message: `${capitalizeFirstLetter(type.slice(0, -1))} added successfully.` });
  } catch (error) {
    console.error("Error adding association:", error.message);
    res.status(500).json({ error: "Failed to add association." });
  }
};

exports.removeAssociation= async (req, res) => {
  const { paperId, type, valueId } = req.params;

  if (!["domains", "conferences", "journals", "authors"].includes(type)) {
    return res.status(400).json({ error: "Invalid association type." });
  }

  try {
    await Paper.removeAssociation(paperId, type, valueId);
    res.status(200).json({ message: `${capitalizeFirstLetter(type.slice(0, -1))} removed successfully.` });
  } catch (error) {
    console.error("Error removing association:", error.message);
    res.status(500).json({ error: "Failed to remove association." });
  }
};
