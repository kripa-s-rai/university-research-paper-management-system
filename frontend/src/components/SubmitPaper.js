import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubmitPaper.css';
import { useAuth } from '../context/AuthContext'; // Assuming this context gives user data

const SubmitPaper = () => {
  const { user, loading } = useAuth(); // Get user data from context and loading state
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    document: null,
    domainId: '',
    conference: '',
    journal: '',
    authorId: '', // We will set this from user context
  });
  const [domains, setDomains] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [journals, setJournals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [conferenceSuggestions, setConferenceSuggestions] = useState([]);
  const [journalSuggestions, setJournalSuggestions] = useState([]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Log user object for debugging
  useEffect(() => {
    console.log('User object:', user);

    if (user && user.UserID) {
      console.log('Setting authorId:', user.UserID); // Log before setting the state
      setFormData((prevData) => ({ ...prevData, authorId: user.UserID }));
    } else {
      console.log('User not logged in or UserID is missing');
    }

    // Fetch domains, conferences, and journals
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      setFormData((prevData) => ({ ...prevData, document: null }));
    } else if (file && file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 5MB limit.');
    } else {
      setError('');
      setFormData((prevData) => ({ ...prevData, document: file }));
    }
  };

  // Handle domain search input change
  const handleDomainChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, domainId: value }));

    const filteredDomains = domains.filter((domain) =>
      domain.DomainName.toLowerCase().includes(value.toLowerCase())
    );
    setDomainSuggestions(filteredDomains);
  };

  // Handle conference search input change
  const handleConferenceChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, conference: value }));

    const filteredConferences = conferences.filter((conference) =>
      conference.name.toLowerCase().includes(value.toLowerCase())
    );
    setConferenceSuggestions(filteredConferences);
  };

  // Handle journal search input change
  const handleJournalChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({ ...prevData, journal: value }));

    const filteredJournals = journals.filter((journal) =>
      journal.name.toLowerCase().includes(value.toLowerCase())
    );
    setJournalSuggestions(filteredJournals);
  };

  // Handle selecting suggestions
  const handleSelectSuggestion = (field, value, id = null) => {
    if (field === 'domainId') {
      setFormData((prevData) => ({ ...prevData, domainId: id }));
    } else {
      setFormData((prevData) => ({ ...prevData, [field]: value }));
    }

    // Clear suggestions after selection
    if (field === 'domainId') setDomainSuggestions([]);
    if (field === 'conference') setConferenceSuggestions([]);
    if (field === 'journal') setJournalSuggestions([]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const { title, abstract, document, domainId, conference, journal, authorId } = formData;
    console.log(formData)

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
    submissionData.append('conference', conference); // Can be empty
    submissionData.append('journal', journal); // Can be empty
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
          authorId: user.UserID, // Reset authorId if needed
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

  // Return loading state if user data is not available
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
              {conferenceSuggestions.map((conf) => (
                <li key={conf.id} onClick={() => handleSelectSuggestion('conference', conf.name, conf.id)}>
                  {conf.name}
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
                <li key={journal.id} onClick={() => handleSelectSuggestion('journal', journal.name, journal.id)}>
                  {journal.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="form-actions">
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? `Submitting (${progress}%)` : 'Submit Paper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPaper;
