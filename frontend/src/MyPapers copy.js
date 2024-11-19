import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const MyPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [authorId, setAuthorId] = useState(""); // To add a co-author
  const [domainId, setDomainId] = useState(""); // To assign a domain
  const [conferenceId, setConferenceId] = useState(""); // To link a conference
  const [journalId, setJournalId] = useState(""); // To associate a journal

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/papers/author/1");
        setPapers(response.data);
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleAddAuthor = async (paperId) => {
    try {
      await axios.post(`http://localhost:5000/api/papers/${paperId}/authors`, { authorId });
      alert("Author added successfully!");
    } catch (error) {
      console.error("Error adding author:", error);
    }
  };

  const handleAddDomain = async (paperId) => {
    try {
      await axios.post(`http://localhost:5000/api/papers/${paperId}/domains`, { domainId });
      alert("Domain added successfully!");
    } catch (error) {
      console.error("Error adding domain:", error);
    }
  };

  const handleLinkConference = async (paperId) => {
    try {
      await axios.post(`http://localhost:5000/api/papers/${paperId}/conferences`, { conferenceId });
      alert("Conference linked successfully!");
    } catch (error) {
      console.error("Error linking conference:", error);
    }
  };

  const handleAssociateJournal = async (paperId) => {
    try {
      await axios.post(`http://localhost:5000/api/papers/${paperId}/journals`, { journalId });
      alert("Journal associated successfully!");
    } catch (error) {
      console.error("Error associating journal:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Submitted Papers</h2>
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {papers.map((paper) => (
            <div key={paper.PaperID} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{paper.Title}</h5>
                  <p className="card-text">
                    <strong>Status:</strong> {paper.Status} <br />
                    <strong>Abstract:</strong> {paper.Abstract || "No abstract provided"} <br />
                    <strong>Submission Date:</strong> {new Date(paper.SubmissionDate).toLocaleDateString()}
                  </p>
                  <a
                    href={`http://localhost:5000/${paper.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary mb-2"
                  >
                    Read
                  </a>
                  <button
                    className="btn btn-secondary mb-2"
                    onClick={() => setSelectedPaper(paper.PaperID)}
                  >
                    Manage
                  </button>
                  {selectedPaper === paper.PaperID && (
                    <div className="mt-3">
                      <div>
                        <label>Add Co-author:</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Author ID"
                          value={authorId}
                          onChange={(e) => setAuthorId(e.target.value)}
                        />
                        <button
                          className="btn btn-success"
                          onClick={() => handleAddAuthor(paper.PaperID)}
                        >
                          Add Author
                        </button>
                      </div>
                      <div className="mt-3">
                        <label>Assign Domain:</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Domain ID"
                          value={domainId}
                          onChange={(e) => setDomainId(e.target.value)}
                        />
                        <button
                          className="btn btn-success"
                          onClick={() => handleAddDomain(paper.PaperID)}
                        >
                          Add Domain
                        </button>
                      </div>
                      <div className="mt-3">
                        <label>Link Conference:</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Conference ID"
                          value={conferenceId}
                          onChange={(e) => setConferenceId(e.target.value)}
                        />
                        <button
                          className="btn btn-success"
                          onClick={() => handleLinkConference(paper.PaperID)}
                        >
                          Link Conference
                        </button>
                      </div>
                      <div className="mt-3">
                        <label>Associate Journal:</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Journal ID"
                          value={journalId}
                          onChange={(e) => setJournalId(e.target.value)}
                        />
                        <button
                          className="btn btn-success"
                          onClick={() => handleAssociateJournal(paper.PaperID)}
                        >
                          Add Journal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPapers;
