// ShippingSection.jsx
import React from "react";
import CLIShippingForm from "../../../components/CLIShippingForm";

const ShippingSection = ({
  isShippingCollapsed,
  setIsShippingCollapsed,
  shippingError,
  handleShippingSubmit,
}) => (
  <div className={`shipping-section tree-branch ${shippingError ? "error-highlight" : ""}`}>
    <h4
      className="collapsible-header"
      onClick={() => setIsShippingCollapsed(!isShippingCollapsed)}
    >
      Shipping Information <span className="required-indicator"> *</span>{" "}
      {isShippingCollapsed ? "▶" : "▼"}
    </h4>
    {!isShippingCollapsed && (
      <>
        <CLIShippingForm onSubmit={handleShippingSubmit} />
        {shippingError && <p className="error-message">Error: {shippingError}</p>}
      </>
    )}
  </div>
);

export default ShippingSection;
