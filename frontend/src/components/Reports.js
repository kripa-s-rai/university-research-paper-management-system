import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        console.error('Error fetching aggregated data', error);
      }
    };

    const fetchPapers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/papers/'); // Adjust this URL if needed
        setPapers(response.data);
        setLoading(false); // Set loading to false when papers are fetched
      } catch (error) {
        console.error('Error fetching papers data', error);
      }
    };

    fetchAggregatedData();
    fetchPapers();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Papers Statistics</h2>

      {/* Aggregated Data */}
      <div>
        <h3>Aggregated Data (Papers by Status)</h3>
        <ul>
          {aggregatedData.map((item) => (
            <li key={item.Status}>
              {item.Status}: {item.NumberOfPapers} paper(s)
            </li>
          ))}
        </ul>
      </div>

      {/* Papers List */}
      <div className="mt-4">
        <h3>Papers</h3>
        {loading ? (
          <p>Loading papers...</p>
        ) : (
          <table className="table table-striped">
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
                    {paper.authors ? paper.authors.join(', ') : 'No authors'} {/* Assuming authors is an array */}
                  </td>
                  <td>{paper.Status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
