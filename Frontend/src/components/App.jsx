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

import JobDetails from "../pages/JobDetails"; //
import Bench from "../pages/Bench.jsx";
import Submissions from "../pages/Submissions.jsx";
import Vendors from "../pages/Vendors.jsx";
import Reports from "../pages/Reports.jsx";
import Settings from "../pages/Settings.jsx";
import CandidateDetails from "../pages/CandidateDetails.jsx";


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
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/client" element={<Client />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/client/new" element={<AddClient />} />
                <Route path="/client/:id" element={<ClientDetails />} />
                <Route path="/bench" element={<Bench />} />
                <Route path="/submissions" element={<Submissions />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                
                <Route path="/candidates/:id" element={<CandidateDetails />} />
            </Route>

        </Routes>
        </Router>
    );
}

export default App;