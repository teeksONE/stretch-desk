import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Timer from "./routes/Timer";
import BreakOverlay from "./routes/BreakOverlay";
import Settings from "./routes/Settings";
import Warning from "./routes/Warning";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Timer />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/break/:exerciseId" element={<BreakOverlay />} />
        <Route path="/warning" element={<Warning />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);