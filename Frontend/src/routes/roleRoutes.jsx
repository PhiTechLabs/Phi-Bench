import Home from "../pages/Home";
import JobOpenings from "../pages/JobOpenings";
import JobDetails from "../pages/JobDetails";
import Candidates from "../pages/Candidates";
import Interviews from "../pages/Interviews";
import Bench from "../pages/Bench";
import Submissions from "../pages/Submissions";
import Vendors from "../pages/Vendors";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Client from "../pages/Client";
import ClientDetails from "../pages/ClientDetails";
import AddClient from "../pages/AddClient";
import CandidateDetails from "../pages/CandidateDetails";

import ProtectedRoute from "../components/ProtectedRoute";

export const roleRoutes = [

    {
        path: "home",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        ),
    },

    {
        path: "jobs",
        element: (
            <ProtectedRoute permission="job.view">
                <JobOpenings />
            </ProtectedRoute>
        ),
    },

    {
        path: "jobs/:id",
        element: (
            <ProtectedRoute permission="job.view">
                <JobDetails />
            </ProtectedRoute>
        ),
    },

    {
        path: "candidates",
        element: (
            <ProtectedRoute permission="candidate.view">
                <Candidates />
            </ProtectedRoute>
        ),
    },

    {
        path: "candidates/:id",
        element: (
            <ProtectedRoute permission="candidate.view">
                <CandidateDetails />
            </ProtectedRoute>
        ),
    },

    {
        path: "client-list",
        element: (
            <ProtectedRoute permission="client.view">
                <Client />
            </ProtectedRoute>
        ),
    },

    {
        path: "client-list/:id",
        element: (
            <ProtectedRoute permission="client.view">
                <ClientDetails />
            </ProtectedRoute>
        ),
    },

    {
        path: "add-client",
        element: (
            <ProtectedRoute permission="client.create">
                <AddClient />
            </ProtectedRoute>
        ),
    },

    {
        path: "interviews",
        element: (
            <ProtectedRoute>
                <Interviews />
            </ProtectedRoute>
        ),
    },

    {
        path: "bench",
        element: (
            <ProtectedRoute>
                <Bench />
            </ProtectedRoute>
        ),
    },

    {
        path: "submissions",
        element: (
            <ProtectedRoute>
                <Submissions />
            </ProtectedRoute>
        ),
    },

    {
        path: "vendors",
        element: (
            <ProtectedRoute>
                <Vendors />
            </ProtectedRoute>
        ),
    },

    {
        path: "reports",
        element: (
            <ProtectedRoute>
                <Reports />
            </ProtectedRoute>
        ),
    },

    {
        path: "settings",
        element: (
            <ProtectedRoute>
                <Settings />
            </ProtectedRoute>
        ),
    },
];