import React, { useState, useEffect, useRef } from "react";
import "./CLIShippingForm.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa"; // ✅ Icons instead of emojis

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

  const [shippingInfo, setShippingInfo] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const inputRefs = useRef({});

  useEffect(() => {
    autoFillFromBrowser();
  }, []);

  // ✅ Autofill browser saved data
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

  // ✅ Handle Input Change (Store data immediately)
  const handleInputChange = (field, value) => {
    setShippingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Handle Confirmation (Send data to BuyLogic)
  const handleConfirm = () => {
    if (Object.keys(shippingInfo).length < fields.length) {
      alert("⚠️ Please complete all fields before confirming.");
      return;
    }
    setIsConfirmed(true);
    setIsComplete(true);
    onSubmit(shippingInfo);
  };

  return (
    <div className="cli-shipping-form">
      <div className="cli-log">
        <p className="cli-prompt">
          <span className="machine-name">User@PC</span>
          <span className="path">:~/Solana Raffle Terminal/$</span>
        </p>
        <p className="cli-section-title">{`> Capturing Shipping Details:`}</p>

        {/* Input Fields */}
        {fields.map((field) => (
          <p key={field.key} className="cli-field">
            <span className="cli-label">{`> ${field.label}: `}</span>
            <input
              ref={(el) => (inputRefs.current[field.key] = el)}
              type="text"
              autoComplete={field.autoComplete}
              defaultValue={shippingInfo[field.key] || ""}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className="cli-input-box"
              style={{ width: "18ch" }}
            />
          </p>
        ))}
      </div>

      {/* Confirm Button */}
      {!isConfirmed && (
        <button className="cli-confirm-btn" onClick={handleConfirm}>
          <FaCheck /> Confirm Shipping Details
        </button>
      )}

      {/* Confirmation Message */}
      {isConfirmed && (
        <p className="cli-success-message">
          <FaCheck /> Shipping Details Confirmed. Ready for purchase.
        </p>
      )}
    </div>
  );
};

export default CLIShippingForm;
