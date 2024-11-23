import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./EntityManagement.css"; // Optional CSS for styling

const EntityManagement = () => {
  const [currentEntity, setCurrentEntity] = useState("domains"); // Tracks which entity is selected
  const [domains, setDomains] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [journals, setJournals] = useState([]);
  const [conferences, setConferences] = useState([]);

  const [newDomainName, setNewDomainName] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newJournalName, setNewJournalName] = useState("");
  const [newConferenceName, setNewConferenceName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newConferenceDate, setNewConferenceDate] = useState("");

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

  const handleAddEntity = async (entityType, newName, setter, fetcher) => {
    if (!newName.trim()) {
      setError(`${entityType.slice(0, -1)} name cannot be empty.`);
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/${entityType}`, { name: newName });
      setter(""); // Clear the input
      fetcher(); // Refresh the list
    } catch (error) {
      console.error(`Error adding ${entityType.slice(0, -1)}:`, error);
      setError(`Failed to add ${entityType.slice(0, -1)}. Please try again.`);
    }
  };

  const handleModifyEntity = async (entityType, updatedData) => {
    try {
      await axios.put(`http://localhost:5000/api/${entityType}`, updatedData);
      fetchEntities(entityType, setDomains); // Refresh list
    } catch (error) {
      console.error(`Error modifying ${entityType}:`, error);
      setError(`Failed to modify ${entityType}. Please try again.`);
    }
  };

  const handleDeleteEntity = async (entityType, id) => {
    try {
      await axios.delete(`http://localhost:5000/api/${entityType}/${id}`);
      fetchEntities(entityType, setDomains); // Refresh list
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
      setError(`Failed to delete ${entityType}. Please try again.`);
    }
  };

  // Function to render entity content based on selected entity
  const renderEntityContent = () => {
    switch (currentEntity) {
      case "domains":
        return (
          <div>
            <h2>Domains</h2>
            <input
              type="text"
              placeholder="Enter new domain"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
            />
            <button onClick={() => handleAddEntity("domains", newDomainName, setNewDomainName, () => fetchEntities("domains", setDomains))}>
              Add Domain
            </button>
            <table>
              <thead>
                <tr>
                  <th>Domain Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.DomainID}>
                    <td>{domain.DomainName}</td>
                    <td>
                      <button onClick={() => handleModifyEntity("domains", { DomainID: domain.DomainID, DomainName: "Updated Domain" })}>
                        Modify
                      </button>
                      <button onClick={() => handleDeleteEntity("domains", domain.DomainID)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "departments":
        return (
          <div>
            <h2>Departments</h2>
            <input
              type="text"
              placeholder="Enter new department"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
            />
            <button onClick={() => handleAddEntity("departments", newDepartmentName, setNewDepartmentName, () => fetchEntities("departments", setDepartments))}>
              Add Department
            </button>
            <table>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.DeptID}>
                    <td>{dept.DepartmentName}</td>
                    <td>
                      <button onClick={() => handleModifyEntity("departments", { DeptID: dept.DeptID, DepartmentName: "Updated Department" })}>
                        Modify
                      </button>
                      <button onClick={() => handleDeleteEntity("departments", dept.DeptID)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "journals":
        return (
          <div>
            <h2>Journals</h2>
            <input
              type="text"
              placeholder="Enter new journal"
              value={newJournalName}
              onChange={(e) => setNewJournalName(e.target.value)}
            />
            <button onClick={() => handleAddEntity("journals", newJournalName, setNewJournalName, () => fetchEntities("journals", setJournals))}>
              Add Journal
            </button>
            <table>
              <thead>
                <tr>
                  <th>Journal Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((journal) => (
                  <tr key={journal.JournalID}>
                    <td>{journal.JournalName}</td>
                    <td>
                      <button onClick={() => handleModifyEntity("journals", { JournalID: journal.JournalID, JournalName: "Updated Journal" })}>
                        Modify
                      </button>
                      <button onClick={() => handleDeleteEntity("journals", journal.JournalID)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "conferences":
        return (
          <div>
            <h2>Conferences</h2>
            <input
              type="text"
              placeholder="Enter new conference"
              value={newConferenceName}
              onChange={(e) => setNewConferenceName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <input
              type="date"
              value={newConferenceDate}
              onChange={(e) => setNewConferenceDate(e.target.value)}
            />
            <button onClick={() => handleAddEntity("conferences", newConferenceName, setNewConferenceName, () => fetchEntities("conferences", setConferences))}>
              Add Conference
            </button>
            <table>
              <thead>
                <tr>
                  <th>Conference Name</th>
                  <th>Location</th>
                  <th>Conference Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conferences.map((conference) => (
                  <tr key={conference.ConferenceID}>
                    <td>{conference.ConferenceName}</td>
                    <td>{conference.Location}</td>
                    <td>{conference.ConferenceDate}</td>
                    <td>
                      <button onClick={() => handleModifyEntity("conferences", { ConferenceID: conference.ConferenceID, ConferenceName: "Updated Name" })}>
                        Modify
                      </button>
                      <button onClick={() => handleDeleteEntity("conferences", conference.ConferenceID)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div>Select an entity to manage.</div>;
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <nav>
          <ul>
            <li><button onClick={() => setCurrentEntity("domains")}>Domains</button></li>
            <li><button onClick={() => setCurrentEntity("departments")}>Departments</button></li>
            <li><button onClick={() => setCurrentEntity("journals")}>Journals</button></li>
            <li><button onClick={() => setCurrentEntity("conferences")}>Conferences</button></li>
          </ul>
        </nav>
      </div>
      <div className="content">{renderEntityContent()}</div>
    </div>
  );
};

export default EntityManagement;
