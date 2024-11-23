import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPapers.css';

const AdminPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null); // To track the paper currently being viewed
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility

  // Fetch papers from the API
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/papers');
        setPapers(response.data);
      } catch (err) {
        setError('Failed to fetch papers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);
  const openPaper = () => {
    if (selectedPaper && selectedPaper.document) {
      const paperUrl = `http://localhost:5000/${selectedPaper.document}`;
      window.open(paperUrl, '_blank');
    } else {
      alert('No document available to read.');
    }
  }
  // Delete paper by ID
  const deletePaper = async (paperId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this paper?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/papers/${paperId}`);
      setPapers(papers.filter((paper) => paper.PaperID !== paperId));
      alert('Paper deleted successfully!');
    } catch (err) {
      alert('Failed to delete paper. Please try again.');
    }
  };

  // Update paper status (Accept)
  const updatePaperStatus = async (paperId, newStatus) => {
    try {
      const publicationDate = newStatus === 'Accepted' ? new Date().toISOString().split('T')[0] : null;

      // Update the paper status and publication date when accepted
      await axios.put(`http://localhost:5000/api/admin/papers/${paperId}/status`, {
        status: newStatus,
        publicationDate: publicationDate,
      });

      setPapers(
        papers.map((paper) =>
          paper.PaperID === paperId
            ? { ...paper, Status: newStatus, PublicationDate: publicationDate }
            : paper
        )
      );

      alert(`Paper ${newStatus.toLowerCase()} successfully!`);
    } catch (err) {
      alert(`Failed to ${newStatus.toLowerCase()} paper. Please try again.`);
    }
  };

  // Fetch paper authors and details
  const fetchPaperDetails = async (paperId) => {
    try {
      // Fetch paper details
      const paperResponse = await axios.get(`http://localhost:5000/api/admin/papers/${paperId}`);
      const paperDetails = paperResponse.data;
  
      // Fetch authors (corresponding author + other authors)
      const authorsResponse = await axios.get(`http://localhost:5000/api/admin/papers/${paperId}/authors`);
      
      console.log("Paper details:", paperDetails);  // Log to see the full paper data
      console.log("Authors response:", authorsResponse.data);  // Log to check authors data
  
      if (authorsResponse.status === 404) {
        alert('No authors found for this paper');
        return;
      }
  
      const { correspondingAuthor, authors } = authorsResponse.data || {};
      const authorsList = correspondingAuthor ? [correspondingAuthor, ...authors] : authors || [];
  
      // Check the structure of authors list
      console.log("Formatted authors list:", authorsList);
  
      // Update state with paper details and authors
      setSelectedPaper({
        ...paperDetails,
        correspondingAuthor: correspondingAuthor || 'Unknown Author', // Fallback if not available
        authors: authorsList,  // Include authors (including corresponding author)
      });
  
      setIsModalOpen(true);  // Open the modal to display paper details
    } catch (err) {
      console.error('Error fetching paper details:', err);
      alert('Failed to fetch paper details.');
    }
  };
  
  
  
  // Filter and search logic
  const filteredPapers = papers.filter(
    (paper) =>
      paper.Title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter ? paper.Status === statusFilter : true)
  );

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPaper(null); // Clear the selected paper when modal is closed
  };

  return (
    <div className="admin-papers">
      <h2>All Papers</h2>

      {/* Search and Filter */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Loading and Error States */}
      {loading && <p>Loading papers...</p>}
      {error && <p className="error">{error}</p>}

      {/* Papers List */}
      {!loading && !error && (
        <table className="papers-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Publication Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPapers.map((paper) => (
              <tr key={paper.PaperID}>
                <td>{paper.Title}</td>
                <td>{paper.Status}</td>
                <td>{paper.PublicationDate ? new Date(paper.PublicationDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => fetchPaperDetails(paper.PaperID)}
                  >
                    View
                  </button>
                  {paper.Status !== 'Accepted' && (
                    <button
                      className="accept-btn"
                      onClick={() => updatePaperStatus(paper.PaperID, 'Accepted')}
                    >
                      Accept
                    </button>
                  )}
                  {paper.Status !== 'Rejected' && (
                    <button
                      className="reject-btn"
                      onClick={() => updatePaperStatus(paper.PaperID, 'Rejected')}
                    >
                      Reject
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => deletePaper(paper.PaperID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* View Paper Modal */}
      {isModalOpen && selectedPaper && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedPaper.Title}</h3>
            <p><strong>Abstract:</strong> {selectedPaper.Abstract}</p>
            <p><strong>Submitted By:</strong> {selectedPaper.correspondingAuthor}</p> {/* Corresponding Author */}
            <p><strong>Authors:</strong>{selectedPaper.authors || 'No authors available'}</p>
            <ul>
              {selectedPaper.authors.map((author) => (
                <li key={author.UserID}>{author.Name}</li>
              ))}
            </ul>
            <div className="modal-actions">
              <button className="read-btn" onClick={openPaper}>
                Read Paper
              </button>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPapers;
