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

export const roleRoutes = [
    { index: true, element: <Home /> },
    { path: "home", element: <Home /> },

    { path: "jobs", element: <JobOpenings /> },
    { path: "jobs/:id", element: <JobDetails /> },

    { path: "candidates", element: <Candidates /> },
    { path: "interviews", element: <Interviews /> },
    { path: "bench", element: <Bench /> },
    { path: "submissions", element: <Submissions /> },
    { path: "vendors", element: <Vendors /> },
    { path: "reports", element: <Reports /> },
    { path: "settings", element: <Settings /> },

    { path: "client-list", element: <Client /> },
    { path: "client-list/:id", element: <ClientDetails /> },
    { path: "add-client", element: <AddClient /> },
];