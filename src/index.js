import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { OktaAuth } from "@okta/okta-auth-js";
import { oktaConfig } from "./auth/oktaConfig";

import App from "./App";
import "./index.css";

const oktaAuth = new OktaAuth(oktaConfig);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App oktaAuth={oktaAuth} />
    </BrowserRouter>
  </React.StrictMode>
);
