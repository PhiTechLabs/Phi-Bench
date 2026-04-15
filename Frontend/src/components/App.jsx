<<<<<<< HEAD
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
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import SuperAdmin from "../pages/SuperAdmin";
import Admin from "../pages/Admin";
import Client from "../pages/Client";

import AddClient from "../pages/AddClient";
import Candidates from "../pages/Candidates";
import ClientDetails from "../pages/ClientDetails";
import Home from "../pages/Home";   
import Interviews from "../pages/Interviews";
import JobOpenings from "../pages/JobOpenings";

import Layout from "./layout";


function App() {
    return (
        <Router>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/superadmin" element={<SuperAdmin />} />
            <Route path="/admin" element={<Admin />} />


            <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/jobs" element={<JobOpenings />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/client" element={<Client />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/clients/new" element={<AddClient />} />
                <Route path="/clients/:id" element={<ClientDetails />} />
            </Route>

        </Routes>
        </Router>
    );
>>>>>>> 25d71be73720b4c9ba78ab485da5b00170ff4ca9
}

export default App;