import React, { useState } from "react";
import "./SubHeader.styles.css";

const SubHeader = ({ title, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange(value); // Pass the search term to the parent
  };

  return (
    <div className="sub-header">
      <h2 className="sub-header-title">{title}</h2>
      <input
        type="text"
        className="sub-header-input"
        placeholder="Search raffles..."
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SubHeader;
