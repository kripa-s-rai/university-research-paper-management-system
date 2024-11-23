import React, { useState } from 'react';

const TableManager = ({ data, type, addEntry, updateEntry }) => {
  const [newEntry, setNewEntry] = useState({}); // State for new entry input
  const [editableIndex, setEditableIndex] = useState(-1); // Track editable row

  // Handle input changes for new and editable rows
  const handleInputChange = (e, field, index = null) => {
    if (index === null) {
      setNewEntry({ ...newEntry, [field]: e.target.value });
    } else {
      const updatedData = [...data];
      updatedData[index] = { ...updatedData[index], [field]: e.target.value };
      updateEntry(updatedData);
    }
  };

  // Add new entry
  const handleAdd = () => {
    if (!newEntry.ConferenceName && type === "conferences") return alert("Name is required");
    if (!newEntry.JournalName && type === "journals") return alert("Name is required");
    addEntry(newEntry);
    setNewEntry({});
  };

  return (
    <div>
      <h2>{type === "conferences" ? "Conferences" : "Journals"}</h2>
      <table border="1" cellPadding="5" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            {type === "conferences" && (
              <>
                <th>Conference Name</th>
                <th>Location</th>
                <th>Date</th>
                <th>Actions</th>
              </>
            )}
            {type === "journals" && (
              <>
                <th>Journal Name</th>
                <th>Date</th>
                <th>Actions</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {type === "conferences" && (
                <>
                  <td>
                    {editableIndex === index ? (
                      <input
                        value={item.ConferenceName}
                        onChange={(e) => handleInputChange(e, "ConferenceName", index)}
                      />
                    ) : (
                      item.ConferenceName
                    )}
                  </td>
                  <td>
                    {editableIndex === index ? (
                      <input
                        value={item.Location}
                        onChange={(e) => handleInputChange(e, "Location", index)}
                      />
                    ) : (
                      item.Location
                    )}
                  </td>
                  <td>
                    {editableIndex === index ? (
                      <input
                        value={item.ConferenceDate}
                        onChange={(e) => handleInputChange(e, "ConferenceDate", index)}
                      />
                    ) : (
                      item.ConferenceDate
                    )}
                  </td>
                </>
              )}
              {type === "journals" && (
                <>
                  <td>
                    {editableIndex === index ? (
                      <input
                        value={item.JournalName}
                        onChange={(e) => handleInputChange(e, "JournalName", index)}
                      />
                    ) : (
                      item.JournalName
                    )}
                  </td>
                  <td>
                    {editableIndex === index ? (
                      <input
                        value={item.JournalDate}
                        onChange={(e) => handleInputChange(e, "JournalDate", index)}
                      />
                    ) : (
                      item.JournalDate
                    )}
                  </td>
                </>
              )}
              <td>
                {editableIndex === index ? (
                  <button onClick={() => setEditableIndex(-1)}>Save</button>
                ) : (
                  <button onClick={() => setEditableIndex(index)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
          <tr>
            {type === "conferences" && (
              <>
                <td>
                  <input
                    value={newEntry.ConferenceName || ""}
                    onChange={(e) => handleInputChange(e, "ConferenceName")}
                    placeholder="Enter Conference Name"
                  />
                </td>
                <td>
                  <input
                    value={newEntry.Location || ""}
                    onChange={(e) => handleInputChange(e, "Location")}
                    placeholder="Enter Location"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={newEntry.ConferenceDate || ""}
                    onChange={(e) => handleInputChange(e, "ConferenceDate")}
                  />
                </td>
              </>
            )}
            {type === "journals" && (
              <>
                <td>
                  <input
                    value={newEntry.JournalName || ""}
                    onChange={(e) => handleInputChange(e, "JournalName")}
                    placeholder="Enter Journal Name"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={newEntry.JournalDate || ""}
                    onChange={(e) => handleInputChange(e, "JournalDate")}
                  />
                </td>
              </>
            )}
            <td>
              <button onClick={handleAdd}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TableManager;
