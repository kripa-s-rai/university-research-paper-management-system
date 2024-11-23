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

  const [domains, setDomains] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [journals, setJournals] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [conferenceSuggestions, setConferenceSuggestions] = useState([]);
  const [journalSuggestions, setJournalSuggestions] = useState([]);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);

  const [inputDomain, setInputDomain] = useState("");
  const [inputConference, setInputConference] = useState("");
  const [inputJournal, setInputJournal] = useState("");
  const [inputAuthor, setInputAuthor] = useState("");

  const [editedTitle, setEditedTitle] = useState("");
  const [editedAbstract, setEditedAbstract] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.UserID) return;
      try {
        setLoading(true);
        const [papersRes, domainsRes, conferencesRes, journalsRes, authorsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/papers/author/${user.UserID}`),
          axios.get("http://localhost:5000/api/domains/"),
          axios.get("http://localhost:5000/api/conferences/"),
          axios.get("http://localhost:5000/api/journals/"),
          axios.get("http://localhost:5000/api/authors/"),
        ]);

        setPapers(papersRes.data);
        setDomains(domainsRes.data.domains || []);
        setConferences(conferencesRes.data.conferences || []);
        setJournals(journalsRes.data.journals || []);
        setAuthors(authorsRes.data.authors || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleManage = (paper) => {
    setSelectedPaper(paper);
    setEditedTitle(paper.Title);
    setEditedAbstract(paper.Abstract);
  };

  const handleCloseManage = () => {
    setSelectedPaper(null);
    resetInputs();
  };

  const resetInputs = () => {
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
      setPapers((prev) => prev.filter((paper) => paper.PaperID !== paperId));
    } catch (error) {
      alert(`Error deleting paper: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUpdatePaper = async () => {
    try {
      await axios.put(`http://localhost:5000/api/papers/${selectedPaper.PaperID}`, {
        Title: editedTitle,
        Abstract: editedAbstract,
      });
      alert("Paper updated successfully!");
      refreshPaper();
    } catch (error) {
      alert(`Error updating paper: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAddAssociation = async (type, value) => {
    if (!value.trim()) return alert("Input cannot be empty!");
    try {
      const response = await axios.post(`http://localhost:5000/api/papers/${selectedPaper.PaperID}/${type}`, { value });
      console.log("API Response:", response.data); // Debugging
      alert(`${capitalizeFirstLetter(type.slice(0, -1))} added successfully!`);
      refreshPaper();
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      alert(`Error adding ${type.slice(0, -1)}: ${error.response?.data?.error || error.message}`);
    }
  };
  

  const handleRemoveAssociation = async (type, valueId) => {
    try {
      await axios.delete(`http://localhost:5000/api/papers/${selectedPaper.PaperID}/${type}/${valueId}`);
      alert(`${capitalizeFirstLetter(type.slice(0, -1))} removed successfully!`);
      refreshPaper();
    } catch (error) {
      alert(`Error removing ${type.slice(0, -1)}: ${error.response?.data?.error || error.message}`);
    }
  };

  const refreshPaper = async () => {
    try {
      const updatedPaper = await axios.get(`http://localhost:5000/api/papers/${selectedPaper.PaperID}`);
      setSelectedPaper(updatedPaper.data);
      setPapers((prev) => prev.map((p) => (p.PaperID === updatedPaper.data.PaperID ? updatedPaper.data : p)));
    } catch (error) {
      console.error("Error refreshing paper data:", error);
    }
  };

  const handleSuggestions = (type, value) => {
    const suggestionsMap = {
      domains: domains,
      conferences: conferences,
      journals: journals,
      authors: authors,
    };

    const setSuggestionMap = {
      domains: setDomainSuggestions,
      conferences: setConferenceSuggestions,
      journals: setJournalSuggestions,
      authors: setAuthorSuggestions,
    };

    const suggestions = suggestionsMap[type]?.filter((item) => {
      const searchField = type === "authors" ? item.Name : item[`${capitalizeFirstLetter(type.slice(0, -1))}Name`];
      return searchField.toLowerCase().includes(value.toLowerCase());
    });

    setSuggestionMap[type]?.(suggestions || []);
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

{selectedPaper && (
        <div className="manage-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Manage Paper</h5>
              <button className="btn-close" onClick={handleCloseManage}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="paperTitle" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="paperTitle"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="paperAbstract" className="form-label">Abstract</label>
                <textarea
                  className="form-control"
                  id="paperAbstract"
                  rows="3"
                  value={editedAbstract}
                  onChange={(e) => setEditedAbstract(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-3">
                <h6>Associated Domains</h6>
                {selectedPaper.Domains?.map((domain) => (
                  <span key={domain.DomainID} className="badge bg-secondary me-2">
                    {domain.DomainName}
                    <button
                      type="button"
                      className="btn-close ms-1"
                      onClick={() => handleRemoveAssociation("domains", domain.DomainID)}
                    ></button>
                  </span>
                ))}
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Add domain"
                  value={inputDomain}
                  onChange={(e) => {
                    setInputDomain(e.target.value);
                    handleSuggestions("domains", e.target.value);
                  }}
                />
                <ul className="list-group mt-1">
                  {domainSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.DomainID}
                      className="list-group-item"
                      onClick={() => handleAddAssociation("domains", suggestion.DomainName)}
                    >
                      {suggestion.DomainName}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-3">
                <h6>Associated Conferences</h6>
                {selectedPaper.Conferences?.map((conference) => (
                  <span key={conference.ConferenceID} className="badge bg-secondary me-2">
                    {conference.ConferenceName}
                    <button
                      type="button"
                      className="btn-close ms-1"
                      onClick={() => handleRemoveAssociation("conferences", conference.ConferenceID)}
                    ></button>
                  </span>
                ))}
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Add conference"
                  value={inputConference}
                  onChange={(e) => {
                    setInputConference(e.target.value);
                    handleSuggestions("conferences", e.target.value);
                  }}
                />
                <ul className="list-group mt-1">
                  {conferenceSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.ConferenceID}
                      className="list-group-item"
                      onClick={() => handleAddAssociation("conferences", suggestion.ConferenceName)}
                    >
                      {suggestion.ConferenceName}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-3">
                <h6>Associated Journals</h6>
                {selectedPaper.Journals?.map((journal) => (
                  <span key={journal.JournalID} className="badge bg-secondary me-2">
                    {journal.JournalName}
                    <button
                      type="button"
                      className="btn-close ms-1"
                      onClick={() => handleRemoveAssociation("journals", journal.JournalID)}
                    ></button>
                  </span>
                ))}
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Add journal"
                  value={inputJournal}
                  onChange={(e) => {
                    setInputJournal(e.target.value);
                    handleSuggestions("journals", e.target.value);
                  }}
                />
                <ul className="list-group mt-1">
                  {journalSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.JournalID}
                      className="list-group-item"
                      onClick={() => handleAddAssociation("journals", suggestion.JournalName)}
                    >
                      {suggestion.JournalName}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-3">
                <h6>Associated Authors</h6>
                {selectedPaper.Authors?.map((author) => (
                  <span key={author.UserID} className="badge bg-secondary me-2">
                    {author.Name}
                    <button
                      type="button"
                      className="btn-close ms-1"
                      onClick={() => handleRemoveAssociation("authors", author.UserID)}
                    ></button>
                  </span>
                ))}
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Add author"
                  value={inputAuthor}
                  onChange={(e) => {
                    setInputAuthor(e.target.value);
                    handleSuggestions("authors", e.target.value);
                  }}
                />
                <ul className="list-group mt-1">
                  {authorSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.UserID}
                      className="list-group-item"
                      onClick={() => handleAddAssociation("authors", suggestion.Name)}
                    >
                      {suggestion.Name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseManage}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleUpdatePaper}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPapers;

