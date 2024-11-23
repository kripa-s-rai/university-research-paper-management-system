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
// Submit paper (with file upload handling)
exports.submitPaper = [
  upload.single('document'),
  async (req, res) => {
    const { title, abstract, domainId, conference, journal, authorId } = req.body;

    if (!title || !abstract || !domainId || !authorId || !req.file) {
      return res.status(400).json({ error: 'Title, abstract, domain, author ID, and document are required.' });
    }

    try {
      // Handle Domain
      const domainID = await checkOrCreate('domains', 'DomainID', 'DomainName', domainId);

      // Handle Conference
      const conferenceID = conference ? await checkOrCreate('conferences', 'ConferenceID', 'ConferenceName', conference) : null;

      // Handle Journal
      const journalID = journal ? await checkOrCreate('journals', 'JournalID', 'JournalName', journal) : null;

      // Insert the paper into the database
      const paperData = {
        title,
        abstract,
        document: req.file.path,
        authorId,
        submissionDate: new Date(),
      };
      const paperResult = await Paper.submit(paperData);

      // Link associations
      await Paper.linkPaperWithDomain(paperResult.insertId, domainID);
      if (conferenceID) await Paper.linkPaperWithConference(paperResult.insertId, conferenceID);
      if (journalID) await Paper.linkPaperWithJournal(paperResult.insertId, journalID);

      res.status(200).json({ message: 'Paper submitted successfully!', paperId: paperResult.insertId });
    } catch (error) {
      console.error('Error submitting paper:', error);
      res.status(500).json({ error: 'Failed to submit paper.' });
    }
  },
];

// Helper function to check existence or create a new entry
async function checkOrCreate(table, idColumn, nameColumn, name) {
  if (!isNaN(name)) return name;

  const [rows] = await db.promise().query(`SELECT ${idColumn} FROM ${table} WHERE ${nameColumn} = ?`, [name]);
  if (rows.length > 0) return rows[0][idColumn];

  const [result] = await db.promise().query(`INSERT INTO ${table} (${nameColumn}) VALUES (?)`, [name]);
  return result.insertId;
}


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
// Assuming the following endpoint exists to get associated entities for a paper
exports.getAssociations = async (req, res) => {
  const { paperId } = req.params;
  
  try {
    const paper = await Paper.getPaperById(paperId); // Find the paper by ID
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    
    const associations = {
      domains: await Paper.getAssociatedDomains(paperId),
      conferences: await Paper.getAssociatedConferences(paperId),
      journals: await Paper.getAssociatedJournals(paperId),
      authors: await Paper.getAssociatedAuthors(paperId)
    };

    res.status(200).json(associations); // Return associations
  } catch (error) {
    console.error("Error fetching associations:", error.message);
    res.status(500).json({ error: "Failed to fetch associations." });
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
