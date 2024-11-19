import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchPapers = () => {
  const [title, setTitle] = useState('');
  const [domainId, setDomainId] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const response = await axios.get('/api/papers/search', { params: { title, domainId } });
    setResults(response.data);
  };

  return (
    <div>
      <h2>Search Papers</h2>
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Domain ID" value={domainId} onChange={(e) => setDomainId(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map(paper => (
          <li key={paper.id}>{paper.title} - Status: {paper.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPapers;
