// import Home from "../pages/Home";
// import JobOpenings from "../pages/JobOpenings";
// import JobDetails from "../pages/JobDetails";
// import Candidates from "../pages/Candidates";
// import Interviews from "../pages/Interviews";
// import Bench from "../pages/Bench";
// import Submissions from "../pages/Submissions";
// import Vendors from "../pages/Vendors";
// import Reports from "../pages/Reports";
// import Settings from "../pages/settings/Settings";
// import Client from "../pages/Client";
// import ClientDetails from "../pages/ClientDetails";
// import AddClient from "../pages/AddClient";
// import CandidateDetails from "../pages/CandidateDetails";
// import Users from "../pages/settings/Users";
// import Roles from "../pages/settings/Roles";
// import Permissions from "../pages/settings/Permission";

// import ProtectedRoute from "../components/ProtectedRoute";

// export const roleRoutes = [


//     {
//         path: "home",
//         element: (
//             <ProtectedRoute>
//                 <Home />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "jobs",
//         element: (
//             <ProtectedRoute permission="job.view">
//                 <JobOpenings />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "jobs/:id",
//         element: (
//             <ProtectedRoute permission="job.view">
//                 <JobDetails />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "candidates",
//         element: (
//             <ProtectedRoute permission="candidate.view">
//                 <Candidates />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "candidates/:id",
//         element: (
//             <ProtectedRoute permission="candidate.view">
//                 <CandidateDetails />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "client-list",
//         element: (
//             <ProtectedRoute permission="client.view">
//                 <Client />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "client-list/:id",
//         element: (
//             <ProtectedRoute permission="client.view">
//                 <ClientDetails />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "add-client",
//         element: (
//             <ProtectedRoute permission="client.create">
//                 <AddClient />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "interviews",
//         element: (
//             <ProtectedRoute>
//                 <Interviews />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "bench",
//         element: (
//             <ProtectedRoute>
//                 <Bench />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "submissions",
//         element: (
//             <ProtectedRoute>
//                 <Submissions />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "vendors",
//         element: (
//             <ProtectedRoute>
//                 <Vendors />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "reports",
//         element: (
//             <ProtectedRoute>
//                 <Reports />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "settings",
//         element: (
//             <ProtectedRoute>
//                 <Settings />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "settings/users",
//         element: (
//             <ProtectedRoute>
//                 <Users />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "settings/roles",
//         element: (
//             <ProtectedRoute>
//                 <Roles />
//             </ProtectedRoute>
//         ),
//     },

//     {
//         path: "settings/permissions",
//         element: (
//             <ProtectedRoute>
//                 <Permissions />
//             </ProtectedRoute>
//         ),
//     },
// ];




import Home from "../pages/Home";
import JobOpenings from "../pages/JobOpenings";
import JobDetails from "../pages/JobDetails";
import Candidates from "../pages/Candidates";
import Interviews from "../pages/Interviews";
import Bench from "../pages/Bench";
import Submissions from "../pages/Submissions";
import Vendors from "../pages/Vendors";
import Reports from "../pages/Reports";
import Settings from "../pages/settings/Settings";
import Client from "../pages/Client";
import ClientDetails from "../pages/ClientDetails";
import AddClient from "../pages/AddClient";
import CandidateDetails from "../pages/CandidateDetails";
import Users from "../pages/settings/Users";
import Roles from "../pages/settings/Roles";
import Permissions from "../pages/settings/Permission";

import ProtectedRoute from "../components/ProtectedRoute";

import { PERMISSIONS } from "../pages/settings/constants/permissions";

export const roleRoutes = [

    {
        path: "home",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        ),
    },

    // JOBS
    {
        path: "jobs",
        element: (
            <ProtectedRoute permission={PERMISSIONS.JOB_VIEW}>
                <JobOpenings />
            </ProtectedRoute>
        ),
    },

    {
        path: "jobs/:id",
        element: (
            <ProtectedRoute permission={PERMISSIONS.JOB_VIEW}>
                <JobDetails />
            </ProtectedRoute>
        ),
    },

    // CANDIDATES
    {
        path: "candidates",
        element: (
            <ProtectedRoute permission={PERMISSIONS.CANDIDATE_VIEW}>
                <Candidates />
            </ProtectedRoute>
        ),
    },

    {
        path: "candidates/:id",
        element: (
            <ProtectedRoute permission={PERMISSIONS.CANDIDATE_VIEW}>
                <CandidateDetails />
            </ProtectedRoute>
        ),
    },

    // CLIENTS
    {
        path: "client-list",
        element: (
            <ProtectedRoute permission={PERMISSIONS.CLIENT_VIEW}>
                <Client />
            </ProtectedRoute>
        ),
    },

    {
        path: "client-list/:id",
        element: (
            <ProtectedRoute permission={PERMISSIONS.CLIENT_VIEW}>
                <ClientDetails />
            </ProtectedRoute>
        ),
    },

    {
        path: "add-client",
        element: (
            <ProtectedRoute permission={PERMISSIONS.CLIENT_CREATE}>
                <AddClient />
            </ProtectedRoute>
        ),
    },

    // INTERVIEWS
    {
        path: "interviews",
        element: (
            <ProtectedRoute permission={PERMISSIONS.INTERVIEW_VIEW}>
                <Interviews />
            </ProtectedRoute>
        ),
    },

    // BENCH
    {
        path: "bench",
        element: (
            <ProtectedRoute permission={PERMISSIONS.BENCH_VIEW}>
                <Bench />
            </ProtectedRoute>
        ),
    },

    // SUBMISSIONS
    {
        path: "submissions",
        element: (
            <ProtectedRoute permission={PERMISSIONS.SUBMISSION_VIEW}>
                <Submissions />
            </ProtectedRoute>
        ),
    },

    // VENDORS
    {
        path: "vendors",
        element: (
            <ProtectedRoute permission={PERMISSIONS.VENDOR_VIEW}>
                <Vendors />
            </ProtectedRoute>
        ),
    },

    // REPORTS
    {
        path: "reports",
        element: (
            <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
                <Reports />
            </ProtectedRoute>
        ),
    },

    // SETTINGS
    {
        path: "settings",
        element: (
            <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
                <Settings />
            </ProtectedRoute>
        ),
    },

    // USERS
    {
        path: "settings/users",
        element: (
            <ProtectedRoute permission={PERMISSIONS.USER_VIEW}>
                <Users />
            </ProtectedRoute>
        ),
    },

    // ROLES
    {
        path: "settings/roles",
        element: (
            <ProtectedRoute permission={PERMISSIONS.ROLE_VIEW}>
                <Roles />
            </ProtectedRoute>
        ),
    },

    // PERMISSIONS
    {
        path: "settings/permissions",
        element: (
            <ProtectedRoute permission={PERMISSIONS.PERMISSION_VIEW}>
                <Permissions />
            </ProtectedRoute>
        ),
    },

];