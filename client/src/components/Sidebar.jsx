import React from "react";

const SideBar = ({ form }) => {
  return (
    <div
      style={{
        width: 320,
        minHeight: "100vh",
        backgroundColor: "#fff",
        borderRight: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column"
      }}>
      
      {form ?
      <div style={{ flex: 1 }}>{form}</div> :

      <div style={{ padding: "20px", color: "#888" }}>
          Select a PDF tool to get started
        </div>
      }
    </div>);
};

export default React.memo(SideBar);