import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPapers = () => {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    const fetchPapers = async () => {
      const response = await axios.get('/api/admin/papers');
      setPapers(response.data);
    };
    fetchPapers();
  }, []);

  const deletePaper = async (paperId) => {
    await axios.delete(`/api/admin/papers/${paperId}`);
    setPapers(papers.filter(paper => paper.id !== paperId));
    alert('Paper deleted successfully!');
  };

  return (
    <div>
      <h2>All Papers</h2>
      <ul>
        {papers.map(paper => (
          <li key={paper.id}>
            {paper.title} - Status: {paper.status}
            <button onClick={() => deletePaper(paper.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPapers;
