import React from "react";
import "./SyntaxRenderer.css";

const SyntaxRenderer = ({ keyName, value, valueType }) => {
  // Determine class based on value type
  const valueClass = valueType === "number"
    ? "number"
    : valueType === "money"
    ? "money"
    : valueType === "threshold"
    ? "threshold-warning"
    : "";

  return (
    <p>
      > <span className="key">{keyName}:</span>{" "}
      <span className={valueClass}>{value}</span>
    </p>
  );
};

export default SyntaxRenderer;
