import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubmitPaper.css';
import { useAuth } from '../context/AuthContext'; // Assuming this context gives user data

const SubmitPaper = () => {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    document: null,
    domainId: '',
    conference: '',
    journal: '',
    authorId: '', // Set from user context
  });
  const [domains, setDomains] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [journals, setJournals] = useState([]);
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [conferenceSuggestions, setConferenceSuggestions] = useState([]);
  const [journalSuggestions, setJournalSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    if (user && user.UserID) {
      setFormData((prevData) => ({ ...prevData, authorId: user.UserID }));
    }

    const fetchData = async () => {
      try {
        const [domainRes, conferenceRes, journalRes] = await Promise.all([
          axios.get('http://localhost:5000/api/domains/'),
          axios.get('http://localhost:5000/api/conferences/'),
          axios.get('http://localhost:5000/api/journals/'),
        ]);
        setDomains(domainRes.data?.domains || []);
        setConferences(conferenceRes.data?.conferences || []);
        setJournals(journalRes.data?.journals || []);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
    } else if (file?.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 5MB limit.');
    } else {
      setError('');
      setFormData((prevData) => ({ ...prevData, document: file }));
    }
  };

  const handleDomainChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, domainId: value }));
    setDomainSuggestions(
      domains.filter((domain) =>
        domain.DomainName.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleConferenceChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, conference: value }));
    setConferenceSuggestions(
      conferences.filter((conference) =>
        conference.ConferenceName.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleJournalChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, journal: value }));
    setJournalSuggestions(
      journals.filter((journal) =>
        journal.JournalName.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleSelectSuggestion = (field, value, id = null) => {
    setFormData((prevData) => ({ ...prevData, [field]: id || value }));
    if (field === 'domainId') setDomainSuggestions([]);
    if (field === 'conference') setConferenceSuggestions([]);
    if (field === 'journal') setJournalSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const { title, abstract, document, domainId, conference, journal, authorId } = formData;

    if (!title || !abstract || !document || !domainId || !authorId) {
      setError('Please fill out all required fields before submitting.');
      setIsSubmitting(false);
      return;
    }

    const submissionData = new FormData();
    submissionData.append('title', title);
    submissionData.append('abstract', abstract);
    submissionData.append('document', document);
    submissionData.append('domainId', domainId);
    submissionData.append('conference', conference);
    submissionData.append('journal', journal);
    submissionData.append('authorId', authorId);

    try {
      const response = await axios.post('http://localhost:5000/api/papers/submit', submissionData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      if (response.status === 200) {
        setSuccessMessage('Paper submitted successfully!');
        setFormData({
          title: '',
          abstract: '',
          document: null,
          domainId: '',
          conference: '',
          journal: '',
          authorId: user.UserID,
        });
        setProgress(0);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting paper.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="submit-paper-page">
      <header className="submit-paper-header">
        <h1>Submit Your Research Paper</h1>
        <p>Complete the form below to submit your research paper for review and publication.</p>
      </header>

      <div className="submit-paper-container">
        <form className="submit-paper-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="abstract">Abstract</label>
            <textarea
              id="abstract"
              value={formData.abstract}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <div className="form-field">
            <label htmlFor="document">Upload Document (PDF)</label>
            <input
              type="file"
              id="document"
              accept="application/pdf"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="domainId">Domain</label>
            <input
              type="text"
              id="domainId"
              value={domains.find((d) => d.DomainID === formData.domainId)?.DomainName || formData.domainId}
              onChange={handleDomainChange}
              placeholder="Type to search or select domain"
            />
            <ul className="suggestions-list">
              {domainSuggestions.map((domain) => (
                <li key={domain.DomainID} onClick={() => handleSelectSuggestion('domainId', domain.DomainName, domain.DomainID)}>
                  {domain.DomainName}
                </li>
              ))}
            </ul>
          </div>

          <div className="form-field">
            <label htmlFor="conference">Conference</label>
            <input
              type="text"
              id="conference"
              value={formData.conference}
              onChange={handleConferenceChange}
              placeholder="Type to search conference"
            />
            <ul className="suggestions-list">
              {conferenceSuggestions.map((conference) => (
                <li key={conference.ConferenceID} onClick={() => handleSelectSuggestion('conference', conference.ConferenceName)}>
                  {conference.ConferenceName}
                </li>
              ))}
            </ul>
          </div>

          <div className="form-field">
            <label htmlFor="journal">Journal</label>
            <input
              type="text"
              id="journal"
              value={formData.journal}
              onChange={handleJournalChange}
              placeholder="Type to search journal"
            />
            <ul className="suggestions-list">
              {journalSuggestions.map((journal) => (
                <li key={journal.JournalID} onClick={() => handleSelectSuggestion('journal', journal.JournalName)}>
                  {journal.JournalName}
                </li>
              ))}
            </ul>
          </div>

          <div className="form-actions">
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Paper'}
            </button>
          </div>
        </form>

        {isSubmitting && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}>
              {progress}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitPaper;
