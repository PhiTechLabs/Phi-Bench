import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Login from "../pages/Login";
import AddClient from "../pages/AddClient";
import Home from "../pages/Home";
import JobOpenings from "../pages/JobOpenings";
import Candidates from "../pages/Candidates";

import Interviews from "../pages/Interviews";
import Clients from "../pages/Clients";
import ClientDetails from "../pages/ClientDetails"; // ✅ ADD THIS

import Layout from "./layout";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/jobs" element={<JobOpenings />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/new" element={<AddClient />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;