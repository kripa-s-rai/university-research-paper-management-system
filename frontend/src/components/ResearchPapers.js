import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResearchPapers.css';

const ResearchPapers = () => {
  const [papers, setPapers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentPaperID, setCurrentPaperID] = useState(null);
  const [reviewData, setReviewData] = useState({ comment: '', rating: '' });

  // Fetch research papers
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

  // Fetch domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/domains');
        setDomains(response.data);
      } catch (error) {
        console.error('Error fetching domains:', error);
      }
    };
    fetchDomains();
  }, []);

  const handleAddReview = async () => {
    if (!reviewData.comment || !reviewData.rating) {
      alert('Please fill out all fields');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/reviews`, {
        PaperID: currentPaperID,
        Comment: reviewData.comment,
        Rating: reviewData.rating,
      });
      alert('Review added successfully!');
      setShowReviewModal(false);
      setReviewData({ comment: '', rating: '' });
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review.');
    }
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.Title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesDomain = selectedDomain === '' || paper.DomainID === Number(selectedDomain);
    return matchesSearch && matchesDomain && paper.Status === 'Accepted';
  });

  return (
    <div className="research-paper-container">
      <header className="research-header">
        <h1>Explore Research Papers</h1>
        <p>Find insightful research across various domains and topics.</p>
      </header>

      <section className="filter-panel">
        <input
          type="text"
          placeholder="Search papers by title"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="domain-filter-container">
          <input
            type="text"
            placeholder="Filter by domain"
            className="domain-input"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          />
        </div>
      </section>

      {loading ? (
        <p className="loading-text">Loading research papers...</p>
      ) : (
        <div className="papers-grid">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => (
              <div className="paper-card" key={paper.PaperID}>
                <h2 className="paper-title">{paper.Title || 'Untitled Paper'}</h2>
                <p className="paper-author">
                  <strong>Author:</strong> {paper.CorrespondingAuthor || 'Unknown'}
                </p>
                <p className="paper-domain">
                  <strong>Domain:</strong> {paper.DomainName || 'N/A'}
                </p>
                <div className="paper-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => window.open(`http://localhost:5000/${paper.document}`, "_blank")}
                  >
                    Read
                  </button>
                  <button className="btn btn-secondary">Download</button>
                  <button
                    className="btn btn-add-review"
                    onClick={() => {
                      setCurrentPaperID(paper.PaperID);
                      setShowReviewModal(true);
                    }}
                  >
                    Add Review
                  </button>
                </div>
                <div className="paper-reviews">
                  <strong>Reviews:</strong>
                  {paper.Reviews?.length > 0 ? (
                    paper.Reviews.map((review) => (
                      <div key={review.ReviewID} className="review">
                        <p>{review.Comment}</p>
                        <span>Rating: {review.Rating}/5</span>
                      </div>
                    ))
                  ) : (
                    <p>No reviews available</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-results-text">No research papers found.</p>
          )}
        </div>
      )}

      {/* Modal for Adding Reviews */}
      {showReviewModal && (
        <div className="review-modal">
          <div className="review-modal-content">
            <h3>Add Review</h3>
            <textarea
              placeholder="Write your review here"
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            ></textarea>
            <input
              type="number"
              min="1"
              max="5"
              placeholder="Rating (1-5)"
              value={reviewData.rating}
              onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleAddReview}>
                Submit
              </button>
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPapers;
