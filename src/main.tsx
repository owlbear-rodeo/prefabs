import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { PluginGate } from "./PluginGate";
import { PluginThemeProvider } from "./PluginThemeProvider";
import CssBaseline from "@mui/material/CssBaseline";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PluginGate>
      <PluginThemeProvider>
        <CssBaseline />
        <App />
      </PluginThemeProvider>
    </PluginGate>
  </React.StrictMode>
);
