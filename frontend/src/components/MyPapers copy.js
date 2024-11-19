import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MyPapers.css"; // Custom styling for better UI
import { useAuth } from '../context/AuthContext';

const MyPapers = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [authorId, setAuthorId] = useState("");

  const [domains, setDomains] = useState([]);
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [conferenceSuggestions, setConferenceSuggestions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [journalSuggestions, setJournalSuggestions] = useState([]);

  useEffect(() => {
    if (user) {
      setAuthorId(user.UserID);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authorId) return;
      try {
        const papersResponse = await axios.get(`http://localhost:5000/api/papers/author/${authorId}`);
        const domainsResponse = await axios.get("http://localhost:5000/api/domains/");
        const conferencesResponse = await axios.get("http://localhost:5000/api/conferences/");
        const journalsResponse = await axios.get("http://localhost:5000/api/journals/");
        
        setPapers(papersResponse.data);
        setDomains(domainsResponse.data.domains || []);
        setConferences(conferencesResponse.data.conferences || []);
        setJournals(journalsResponse.data.journals || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorId]);

  const handleAdd = async (paperId, type, value) => {
    const endpointMap = {
      authors: "authors",
      domains: "domains",
      conferences: "conferences",
      journals: "journals",
    };
    try {
      await axios.post(`http://localhost:5000/api/papers/${paperId}/${endpointMap[type]}`, value);
      alert(`${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
    } catch (error) {
      alert(`Error adding ${type}: ${error.message}`);
    }
  };

  const handleDeletePaper = async (paperId) => {
    try {
      await axios.delete(`http://localhost:5000/api/papers/${paperId}`);
      alert("Paper deleted successfully!");
      setPapers(papers.filter((paper) => paper.PaperID !== paperId));
    } catch (error) {
      alert(`Error deleting paper: ${error.message}`);
    }
  };

  const handleSuggestions = (type, value) => {
    if (type === "domains") {
      setDomainSuggestions(
        domains.filter((domain) =>
          domain.DomainName.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else if (type === "conferences") {
      setConferenceSuggestions(
        conferences.filter((conference) =>
          conference.ConferenceName.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else if (type === "journals") {
      setJournalSuggestions(
        journals.filter((journal) =>
          journal.JournalName.toLowerCase().includes(value.toLowerCase())
        )
      );
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
