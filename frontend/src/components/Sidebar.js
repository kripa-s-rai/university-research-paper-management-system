import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Entity Management</h2>
      <ul>
        <li>
          <Link to="/domains">Domains</Link>
        </li>
        <li>
          <Link to="/departments">Departments</Link>
        </li>
        <li>
          <Link to="/journals">Journals</Link>
        </li>
        <li>
          <Link to="/conferences">Conferences</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
