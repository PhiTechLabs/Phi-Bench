import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { ClientProvider } from "./context/ClientContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClientProvider>
    <App />
  </ClientProvider>
);