// src/PaperSubmission.js
import React, { useState } from 'react';
import axios from 'axios';

const PaperSubmission = () => {
    const [title, setTitle] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/papers', { title });
            alert(response.data.message);
        } catch (error) {
            console.error(error);
            alert('Error submitting paper');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="title">Paper Title:</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <button type="submit">Submit Paper</button>
        </form>
    );
};

export default PaperSubmission;
