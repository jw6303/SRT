import React, { useState, useEffect, useRef } from "react";
import "./CLIShippingForm.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

const CLIShippingForm = ({ onSubmit }) => {
  const fields = [
    { key: "fullName", label: "Full Name", autoComplete: "name" },
    { key: "email", label: "Email Address", autoComplete: "email", isEmail: true },
    { key: "phone", label: "Phone Number", autoComplete: "tel" },
    { key: "addressLine1", label: "Address Line 1", autoComplete: "address-line1" },
    { key: "city", label: "City", autoComplete: "address-level2" },
    { key: "subdivision", label: "State/Region", autoComplete: "address-level1" },
    { key: "postalCode", label: "Postal Code", autoComplete: "postal-code" },
    { key: "country", label: "Country", autoComplete: "country" },
  ];

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({});
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    autoFillFromBrowser();
  }, []);

  const autoFillFromBrowser = async () => {
    if (navigator.credentials) {
      try {
        const credential = await navigator.credentials.get({ password: true });
        if (credential) {
          setShippingInfo((prev) => ({
            ...prev,
            email: credential.id,
          }));
        }
      } catch (error) {
        console.error("Autofill failed:", error);
      }
    }
  };

  const handleInput = async (e) => {
    const input = e.target.value.trim();
    const currentField = fields[currentFieldIndex];

    if (currentField?.isEmail) {
      handleEmailSuggestions(input);
    }

    if (e.key === "Enter") {
      if (!input) return;

      setShippingInfo((prev) => ({ ...prev, [currentField.key]: input }));

      if (currentFieldIndex < fields.length - 1) {
        setCurrentFieldIndex((prev) => prev + 1);
        e.target.value = "";
      } else {
        setIsComplete(true);
        onSubmit(shippingInfo);
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

  return (
    <div className="cli-shipping-form">
      <div className="cli-log">
        <p className="cli-prompt">
          <span className="machine-name">User@PC</span>
          <span className="path">:~/Solana Raffle Terminal/$</span>
        </p>
        <p className="cli-section-title">{`> Capturing Shipping Details:`}</p>

        {fields.map((field, index) => (
          <p key={field.key} className="cli-field">
            <span className="cli-label">{`> ${field.label}: `}</span>
            <input
              ref={inputRef}
              type="text"
              autoComplete={field.autoComplete}
              onFocus={(e) => document.execCommand("paste")}
              onKeyDown={handleInput}
              placeholder="_"
              className="cli-input-box"
              defaultValue={shippingInfo[field.key] || ""}
              style={{ width: "15ch" }}
            />
          </p>
        ))}

        {/* Email Suggestions */}
        {emailSuggestions.length > 0 && fields[currentFieldIndex]?.isEmail && (
          <div className="email-suggestions">
            {emailSuggestions.map((suggestion, index) => (
              <p key={index} onClick={() => setShippingInfo((prev) => ({ ...prev, email: suggestion }))}>
                {suggestion}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CLIShippingForm;
