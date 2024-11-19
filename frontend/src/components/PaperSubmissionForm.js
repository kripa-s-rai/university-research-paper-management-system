import React, { useState } from 'react';
import axios from 'axios';

const PaperSubmissionForm = () => {
    const [title, setTitle] = useState('');
    const [submissionDate, setSubmissionDate] = useState('');
    const [authorID, setAuthorID] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/papers/submit', { title, submissionDate, authorID });
            alert(response.data.message);
        } catch (error) {
            console.error(error);
            alert('Error submitting paper');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Paper Title" onChange={(e) => setTitle(e.target.value)} required />
            <input type="date" onChange={(e) => setSubmissionDate(e.target.value)} required />
            <input type="number" placeholder="Author ID" onChange={(e) => setAuthorID(e.target.value)} required />
            <button type="submit">Submit Paper</button>
        </form>
    );
};

export default PaperSubmissionForm;
