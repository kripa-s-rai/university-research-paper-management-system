import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css"; // Optional CSS for styling

const Dashboard = () => {
  const [domains, setDomains] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [journals, setJournals] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [error, setError] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    fetchEntities("domains", setDomains);
    fetchEntities("departments", setDepartments);
    fetchEntities("journals", setJournals);
    fetchEntities("conferences", setConferences);
  }, []);

  const fetchEntities = async (entityType, setter) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/${entityType}`);
      setter(response.data[entityType] || []);
    } catch (error) {
      console.error(`Error fetching ${entityType}:`, error);
      setError(`Failed to fetch ${entityType}. Please try again later.`);
    }
  };

  return (
    <div className="dashboard">
      <h1>Entity Dashboard</h1>
      {error && <p className="error">{error}</p>}

      {/* Display Entity Counts */}
      <div className="entity-summary">
        <div>Domains: {domains.length}</div>
        <div>Departments: {departments.length}</div>
        <div>Journals: {journals.length}</div>
        <div>Conferences: {conferences.length}</div>
      </div>
    </div>
  );
};

export default Dashboard;
