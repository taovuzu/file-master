import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RootApp from "./RootApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
