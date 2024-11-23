import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

const Reports = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aggregatedData, setAggregatedData] = useState([]);

  useEffect(() => {
    const fetchAggregatedData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reporting/aggregated');
        setAggregatedData(response.data);
      } catch (error) {
        console.error('Error fetching aggregated data:', error);
      }
    };

    const fetchPapers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/papers/'); // Adjust this URL if needed
        setPapers(response.data);
        setLoading(false); // Set loading to false when papers are fetched
      } catch (error) {
        console.error('Error fetching papers data:', error);
      }
    };

    fetchAggregatedData();
    fetchPapers();
  }, []);

  return (
    <div className="reports-container">
      <header className="reports-header">
        <h1>Papers Statistics Dashboard</h1>
        <p>View aggregated data and detailed reports on submitted research papers.</p>
      </header>

      {/* Aggregated Data Section */}
      <section className="aggregated-data">
        <h3>Aggregated Data (Papers by Status)</h3>
        <div className="aggregated-grid">
          {aggregatedData.map((item) => (
            <div key={item.Status} className={`status-card ${item.Status.toLowerCase()}`}>
              <h4>{item.Status}</h4>
              <p>{item.NumberOfPapers} paper(s)</p>
            </div>
          ))}
        </div>
      </section>

      {/* Papers List Section */}
      <section className="papers-list">
        <h3>Papers List</h3>
        {loading ? (
          <p className="loading-text">Loading papers...</p>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper) => (
                <tr key={paper.PaperID}>
                  <td>{paper.Title}</td>
                  <td>
                    {paper.authors && paper.authors.length > 0
                      ? paper.authors.join(', ')
                      : 'No authors'}
                  </td>
                  <td>
                    <span className={`status-label ${paper.Status.toLowerCase()}`}>
                      {paper.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Reports;
