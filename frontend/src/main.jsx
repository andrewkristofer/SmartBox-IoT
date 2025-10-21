import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n";
import { SettingsProvider } from "./contexts/SettingsContext.jsx"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SettingsProvider>  {/* wrapped for all app */}
      <App />
    </SettingsProvider>
  </StrictMode>
);
