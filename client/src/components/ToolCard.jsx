import React from "react";

const ToolCard = ({ icon, title, description }) => {
  return (
    <div
      style={{
        border: "1px solid #eee",
        padding: "20px",
        textAlign: "center",
        borderRadius: "8px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0, 0, 0,0.05)",
      }}
    >
      <div style={{ fontSize: "40px", marginBottom: "10px" }}>{icon}</div>
      <h3>{title}</h3>
      <p style={{ color: "#666" }}>{description}</p>
    </div>
  );
};
export default ToolCard;
