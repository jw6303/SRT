import React, { useState, useEffect, useRef } from "react";
import "./CLIShippingForm.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const CLIShippingForm = ({ onSubmit }) => {
  const fields = [
    { key: "fullName", label: "Full Name", validation: validateFullName },
    { key: "email", label: "Email Address", validation: validateEmail, isEmail: true },
    { key: "phone", label: "Phone Number", validation: validatePhone, autoComplete: "tel" },
    { key: "addressLine1", label: "Address Line 1" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "postalCode", label: "Postal Code", validation: validatePostalCode },
    { key: "country", label: "Country" },
  ];

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({});
  const [error, setError] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [machineName, setMachineName] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const currentField = fields[currentFieldIndex];
  const inputRef = useRef();

  useEffect(() => {
    // Generate a random machine name
    const randomMachineName = `user${Math.floor(Math.random() * 1000)}@PC`;
    setMachineName(randomMachineName);
  }, []);

  const handleInput = (e) => {
    const input = e.target.value.trim();

    // Handle Email Suggestions
    if (currentField?.isEmail) {
      handleEmailSuggestions(input);
    }

    if (e.key === "Enter") {
      if (!input) {
        setError("This field is required.");
        return;
      }

      // Validation
      if (currentField.validation && !currentField.validation(input)) {
        setError(`Invalid input for ${currentField.label}.`);
        return;
      }

      setError("");
      setShippingInfo((prev) => ({ ...prev, [currentField.key]: input }));

      if (currentFieldIndex < fields.length - 1) {
        setCurrentFieldIndex((prev) => prev + 1);
        e.target.value = ""; // Clear input for the next field
        setEmailSuggestions([]); // Clear email suggestions
      } else {
        setIsComplete(true);
        onSubmit(shippingInfo); // Final submission
      }
    }
  };

  const handleEmailSuggestions = (input) => {
    const emailParts = input.split("@");
    if (emailParts.length === 1) {
      setEmailSuggestions([
        `${emailParts[0]}@gmail.com`,
        `${emailParts[0]}@yahoo.com`,
        `${emailParts[0]}@outlook.com`,
      ]);
    } else {
      setEmailSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShippingInfo((prev) => ({ ...prev, email: suggestion }));
    setCurrentFieldIndex((prev) => prev + 1); // Move to the next field (phone number)
    setEmailSuggestions([]);
    inputRef.current.value = ""; // Clear input for the next field
  };

  const handleEditClick = (key) => {
    setEditingField(key); // Set the field to edit mode
  };

  const handleEditSave = (key, value) => {
    const field = fields.find((f) => f.key === key);

    if (!value.trim()) {
      setError("This field is required.");
      return;
    }

    if (field?.validation && !field.validation(value)) {
      setError(`Invalid input for ${field.label}.`);
      return;
    }

    setError("");
    setShippingInfo((prev) => ({ ...prev, [key]: value }));
    setEditingField(null); // Exit edit mode
  };

  const handleKeyDownInEditMode = (e, key) => {
    if (e.key === "Enter") {
      handleEditSave(key, e.target.value);
    }
  };

  return (
    <div className="cli-shipping-form">
      {/* CLI Header */}
      <div className="cli-log">
        <p className="cli-prompt">
          <span className="machine-name">{machineName}</span>
          <span className="path">:~/Solana Raffle Terminal/$</span>
        </p>
        <p className="cli-section-title">{`> Capturing Shipping Details:`}</p>
  
        {/* Dynamic Fields */}
        {fields.map((field) => (
          <p key={field.key} className="cli-field">
            <span className="cli-label">{`> ${field.label}: `}</span>
            {editingField === field.key ? (
              <span className="cli-edit-inline">
                <input
                  type="text"
                  defaultValue={shippingInfo[field.key]}
                  onKeyDown={(e) => handleKeyDownInEditMode(e, field.key)}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  autoFocus
                  className="cli-edit-input"
                />
                <button
                  className="cli-confirm-btn"
                  onClick={() => handleEditSave(field.key, shippingInfo[field.key])}
                >
                  Confirm
                </button>
              </span>
            ) : (
              <span
                className="user-input editable"
                onClick={() => handleEditClick(field.key)}
              >
                {shippingInfo[field.key] || "_"}
              </span>
            )}
          </p>
        ))}
      </div>
  
      {/* Current Input Field */}
      {!isComplete && currentFieldIndex < fields.length ? (
        <div className="cli-input">
          <span className="cli-highlight">{`> Enter ${currentField.label.toUpperCase()}: `}</span>
          <input
            ref={inputRef}
            type="text"
            autoComplete={currentField?.autoComplete || "on"}
            autoFocus
            onKeyDown={handleInput}
            onChange={(e) => {
              handleInput(e);
              e.target.style.width = `${Math.max(15, e.target.value.length + 1)}ch`; // Dynamic width
            }}
            placeholder="_"
            className="cli-input-box"
            style={{ width: "15ch" }} // Default width
          />
        </div>
      ) : null}
  
      {/* Email Suggestions */}
      {emailSuggestions.length > 0 && currentField?.isEmail && (
        <div className="email-suggestions">
          {emailSuggestions.map((suggestion, index) => (
            <p
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </p>
          ))}
        </div>
      )}
  
      {/* Completion Message */}
      {isComplete && !editingField && (
        <div className="cli-completion">
          <p className="cli-completion-message">
            {`> Shipping Details Completed Successfully!`}
          </p>
          <p className="cli-completion-instructions">
            {`> Review your details. Click on any field to edit.`}
          </p>
        </div>
      )}
  
      {/* Error Message */}
      {error && <div className="cli-error">{`Error: ${error}`}</div>}
    </div>
  );
    
};

// Validation Functions
function validateFullName(input) {
  const nameParts = input.trim().split(" ");
  return nameParts.length >= 2;
}

function validateEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

function validatePhone(input) {
  const phoneNumber = parsePhoneNumberFromString(input);
  return phoneNumber && phoneNumber.isValid();
}

function validatePostalCode(input) {
  const postalRegex = /^[A-Za-z0-9\s]+$/;
  return postalRegex.test(input);
}

export default CLIShippingForm;
