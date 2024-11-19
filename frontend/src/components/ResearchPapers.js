import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResearchPapers.css';

const ResearchPapers = () => {
  const [papers, setPapers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainSuggestions, setDomainSuggestions] = useState([]);

  // Fetch research papers from backend
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/papers');
        setPapers(response.data);
      } catch (error) {
        console.error('Error fetching papers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  // Fetch domains from backend and remove duplicates
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/domains');

        // Remove duplicate domains based on DomainName
        const uniqueDomains = Array.from(
          new Map(response.data.map((domain) => [domain.DomainName, domain])).values()
        );

        setDomains(uniqueDomains);
      } catch (error) {
        console.error('Error fetching domains:', error);
      }
    };
    fetchDomains();
  }, []);

  // Handle domain filter input and show suggestions
  const handleDomainInputChange = (event) => {
    const query = event.target.value.toLowerCase();
    setDomainSuggestions(domains.filter(domain => domain.DomainName.toLowerCase().includes(query)));
    setSelectedDomain(query); // Update the selected domain for input
  };

  // Handle domain selection from suggestions
  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain.DomainName);
    setDomainSuggestions([]); // Clear the suggestions after selection
  };

  // Handle search query
  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filtered papers based on domain and search query
  const filteredPapers = papers.filter((paper) => {
    const matchesDomain = selectedDomain === '' || paper.DomainID === Number(selectedDomain);
    const matchesSearch = paper.Title.toLowerCase().includes(searchQuery);
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="research-paper-container">
      <header className="research-header">
        <h1>Explore Research Papers</h1>
        <p>Browse the latest research across various domains and topics.</p>
      </header>

      <section className="filter-panel">
        <input
          type="text"
          placeholder="Search by title"
          className="search-input"
          value={searchQuery}
          onChange={handleSearch}
        />

        {/* Domain input with suggestions */}
        <div className="domain-filter-container">
          <input
            type="text"
            placeholder="Search by Domain"
            value={selectedDomain}
            onChange={handleDomainInputChange}
            className="domain-input"
          />
          <ul className="suggestions-list">
            {domainSuggestions.map((domain) => (
              <li key={domain.DomainID} onClick={() => handleDomainSelect(domain)}>
                {domain.DomainName}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {loading ? (
        <p className="loading-text">Loading research papers...</p>
      ) : (
        <div className="papers-grid">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => (
              <div className="paper-card" key={paper.PaperID}>
                <h2 className="paper-title">{paper.Title}</h2>
                <p className="paper-author">Author: {paper.CorrespondingAuthor}</p>

                <div className="paper-actions">
                  <button
                    className="btn btn-primary mb-2"
                    onClick={() => window.open(`http://localhost:5000/${paper.document}`, "_blank")}
                  >
                    Read
                  </button>
                  <button className="btn btn-secondary mb-2">
                    Download
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results-text">No research papers found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchPapers;
