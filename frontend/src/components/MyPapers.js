import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MyPapers.css";
import { useAuth } from "../context/AuthContext";

const MyPapers = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [authorId, setAuthorId] = useState("");

  const [domains, setDomains] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [journals, setJournals] = useState([]);
  const [authors, setAuthors] = useState([]); // For co-authors

  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [conferenceSuggestions, setConferenceSuggestions] = useState([]);
  const [journalSuggestions, setJournalSuggestions] = useState([]);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);

  const [inputDomain, setInputDomain] = useState("");
  const [inputConference, setInputConference] = useState("");
  const [inputJournal, setInputJournal] = useState("");
  const [inputAuthor, setInputAuthor] = useState("");

  useEffect(() => {
    if (user) {
      setAuthorId(user.UserID);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authorId) return;
      try {
        const [papersResponse, domainsResponse, conferencesResponse, journalsResponse, authorsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/papers/author/${authorId}`),
          axios.get("http://localhost:5000/api/domains/"),
          axios.get("http://localhost:5000/api/conferences/"),
          axios.get("http://localhost:5000/api/journals/"),
          axios.get("http://localhost:5000/api/authors/"),
        ]);

        setPapers(papersResponse.data);
        setDomains(domainsResponse.data.domains || []);
        setConferences(conferencesResponse.data.conferences || []);
        setJournals(journalsResponse.data.journals || []);
        setAuthors(authorsResponse.data.authors || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorId]);

  const handleManage = (paper) => {
    setSelectedPaper(paper);
  };

  const handleCloseManage = () => {
    setSelectedPaper(null);
    setInputDomain("");
    setInputConference("");
    setInputJournal("");
    setInputAuthor("");
    setDomainSuggestions([]);
    setConferenceSuggestions([]);
    setJournalSuggestions([]);
    setAuthorSuggestions([]);
  };

  const handleDeletePaper = async (paperId) => {
    try {
      await axios.delete(`http://localhost:5000/api/papers/${paperId}`);
      alert("Paper deleted successfully!");
      setPapers(papers.filter((paper) => paper.PaperID !== paperId));
    } catch (error) {
      alert(`Error deleting paper: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAddAssociation = async (type, value) => {
    try {
      await axios.post(`http://localhost:5000/api/papers/${selectedPaper.PaperID}/${type}`, { value });
      alert(`${capitalizeFirstLetter(type.slice(0, -1))} added successfully!`);
      // Refresh paper data
      const updatedPaper = await axios.get(`http://localhost:5000/api/papers/${selectedPaper.PaperID}`);
      setSelectedPaper(updatedPaper.data);
    } catch (error) {
      alert(`Error adding ${type.slice(0, -1)}: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleRemoveAssociation = async (type, valueId) => {
    try {
      await axios.delete(`http://localhost:5000/api/papers/${selectedPaper.PaperID}/${type}/${valueId}`);
      alert(`${capitalizeFirstLetter(type.slice(0, -1))} removed successfully!`);
      // Refresh paper data
      const updatedPaper = await axios.get(`http://localhost:5000/api/papers/${selectedPaper.PaperID}`);
      setSelectedPaper(updatedPaper.data);
    } catch (error) {
      alert(`Error removing ${type.slice(0, -1)}: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSuggestions = (type, value) => {
    if (type === "domains") {
      setDomainSuggestions(domains.filter((domain) => domain.DomainName.toLowerCase().includes(value.toLowerCase())));
    } else if (type === "conferences") {
      setConferenceSuggestions(
        conferences.filter((conference) => conference.ConferenceName.toLowerCase().includes(value.toLowerCase()))
      );
    } else if (type === "journals") {
      setJournalSuggestions(journals.filter((journal) => journal.JournalName.toLowerCase().includes(value.toLowerCase())));
    } else if (type === "authors") {
      setAuthorSuggestions(
        authors.filter((author) => author.Name.toLowerCase().includes(value.toLowerCase()))
      );
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
            <div key={paper.PaperID} className="col-md-6 mb-4">
              <div className="card h-100 shadow">
                <div className="card-body">
                  <h5 className="card-title">{paper.Title}</h5>
                  <p className="card-text">
                    <strong>Status:</strong> {paper.Status} <br />
                    <strong>Abstract:</strong> {paper.Abstract || "No abstract provided"} <br />
                    <strong>Submission Date:</strong> {new Date(paper.SubmissionDate).toLocaleDateString()}
                  </p>
                  <button
                    className="btn btn-primary mb-2"
                    onClick={() => window.open(`http://localhost:5000/${paper.document}`, "_blank")}
                  >
                    Read
                  </button>
                  <button
                    className="btn btn-danger mb-2 ms-2"
                    onClick={() => handleDeletePaper(paper.PaperID)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-secondary mb-2 ms-2"
                    onClick={() => handleManage(paper)}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Management Modal */}
      {selectedPaper && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Paper: {selectedPaper.Title}</h5>
                <button type="button" className="btn-close" onClick={handleCloseManage}></button>
              </div>
              <div className="modal-body">
                {/* Domains Management */}
                <div className="mb-4">
                  <h6>Domains</h6>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search or add a domain"
                      value={inputDomain}
                      onChange={(e) => {
                        setInputDomain(e.target.value);
                        handleSuggestions("domains", e.target.value);
                      }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleAddAssociation("domains", inputDomain)}
                    >
                      Add Domain
                    </button>
                  </div>
                  <ul className="list-group">
                    {selectedPaper.domains?.map((domain) => (
                      <li key={domain.DomainID} className="list-group-item d-flex justify-content-between align-items-center">
                        {domain.DomainName}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveAssociation("domains", domain.DomainID)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conferences Management */}
                <div className="mb-4">
                  <h6>Conferences</h6>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search or add a conference"
                      value={inputConference}
                      onChange={(e) => {
                        setInputConference(e.target.value);
                        handleSuggestions("conferences", e.target.value);
                      }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleAddAssociation("conferences", inputConference)}
                    >
                      Add Conference
                    </button>
                  </div>
                  <ul className="list-group">
                    {selectedPaper.conferences?.map((conference) => (
                      <li
                        key={conference.ConferenceID}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {conference.ConferenceName}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveAssociation("conferences", conference.ConferenceID)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Journals Management */}
                <div className="mb-4">
                  <h6>Journals</h6>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search or add a journal"
                      value={inputJournal}
                      onChange={(e) => {
                        setInputJournal(e.target.value);
                        handleSuggestions("journals", e.target.value);
                      }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleAddAssociation("journals", inputJournal)}
                    >
                      Add Journal
                    </button>
                  </div>
                  <ul className="list-group">
                    {selectedPaper.journals?.map((journal) => (
                      <li
                        key={journal.JournalID}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {journal.JournalName}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveAssociation("journals", journal.JournalID)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Authors Management */}
                <div className="mb-4">
                  <h6>Authors</h6>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search or add an author"
                      value={inputAuthor}
                      onChange={(e) => {
                        setInputAuthor(e.target.value);
                        handleSuggestions("authors", e.target.value);
                      }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleAddAssociation("authors", inputAuthor)}
                    >
                      Add Author
                    </button>
                  </div>
                  <ul className="list-group">
                    {selectedPaper.authors?.map((author) => (
                      <li key={author.UserID} className="list-group-item d-flex justify-content-between align-items-center">
                        {author.Name}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveAssociation("authors", author.UserID)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseManage}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPapers;
