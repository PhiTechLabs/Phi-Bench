import Home from "../pages/Home";
import JobOpenings from "../pages/JobOpenings";
import Candidates from "../pages/Candidates";
import Interviews from "../pages/Interviews";
import Bench from "../pages/Bench";
import Submissions from "../pages/Submissions";
import Vendors from "../pages/Vendors";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Client from "../pages/Client";
import AddClient from "../pages/AddClient";

// Import the generic Profile component
import { Profile } from "../components/Profile";

export const roleRoutes = [
    { path: "home", element: <Home /> },

    // Jobs - using generic Profile
    { path: "jobs", element: <JobOpenings /> },
    { path: "jobs/:id", element: <Profile entityType="job" /> },

    // Candidates - using generic Profile
    { path: "candidates", element: <Candidates /> },
    { path: "candidates/:id", element: <Profile entityType="candidate" /> },
    
    { path: "interviews", element: <Interviews /> },
    { path: "bench", element: <Bench /> },
    { path: "submissions", element: <Submissions /> },
    { path: "vendors", element: <Vendors /> },
    { path: "reports", element: <Reports /> },
    { path: "settings", element: <Settings /> },

    // Clients - using generic Profile
    { path: "client-list", element: <Client /> },
    { path: "client-list/:id", element: <Profile entityType="client" /> },
    { path: "add-client", element: <AddClient /> },
];