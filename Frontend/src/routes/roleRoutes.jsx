import Home from "../pages/Home";
import JobOpenings from "../pages/JobOpenings";
import JobDetails from "../pages/JobDetails";
import Candidates from "../pages/Candidates";
import Interviews from "../pages/Interviews";
import Bench from "../pages/Bench";
import Submissions from "../pages/Submissions";
import SubmissionDetail from "../pages/SubmissionDetail";
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

import Personal from "../pages/settings/component/personalSettings";
import Company from "../pages/settings/component/companyDetails";
import Email from "../pages/settings/component/emailPage";
import Notifications from "../pages/settings/component/notificaionsSettings";

import ProtectedRoute from "../components/ProtectedRoute";
import Teams from "../pages/settings/Teams"

import { PERMISSIONS } from "../pages/settings/constants/permissions";

// console.log("USERS_VIEW", PERMISSIONS.USERS_VIEW);
// console.log("ROLES_VIEW", PERMISSIONS.ROLES_VIEW);
// console.log("PERMISSIONS_VIEW", PERMISSIONS.PERMISSIONS_VIEW);
// console.log("CLIENT_CREATE", PERMISSIONS.CLIENT_CREATE);

export const roleRoutes = [

    {
        path: "home",
        element: (
            <ProtectedRoute
                permission={{
                    module: "home",
                    action: "view",
                }}
            >
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

    {
        path: "submissions/:id",
        element: (
            <ProtectedRoute permission={PERMISSIONS.SUBMISSION_VIEW}>
                <SubmissionDetail />
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

        // PERSONAL SETTINGS
    {
        path: "settings/personal",
        element: (
            <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
                <Personal />
            </ProtectedRoute>
        ),
    },

    // COMPANY DETAILS
    {
        path: "settings/company",
        element: (
            <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
                <Company />
            </ProtectedRoute>
        ),
    },

    // EMAIL SETTINGS
    {
        path: "settings/email",
        element: (
            <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
                <Email />
            </ProtectedRoute>
        ),
    },

    // NOTIFICATION SETTINGS
    {
        path: "settings/notifications",
        element: (
            <ProtectedRoute permission={PERMISSIONS.SETTINGS_VIEW}>
                <Notifications />
            </ProtectedRoute>
        ),
    },

    // USERS
    {
        path: "settings/users",
        element: (
            <ProtectedRoute permission={PERMISSIONS.USERS_VIEW}>
                <Users />
            </ProtectedRoute>
        ),
    },

    // TEAMS
    {
        path: "settings/teams",
        element: (
            <ProtectedRoute permission={PERMISSIONS.TEAMS_VIEW}>
                <Teams />
            </ProtectedRoute>
        ),
    },

    // ROLES
    {
        path: "settings/roles",
        element: (
            <ProtectedRoute permission={PERMISSIONS.ROLES_VIEW}>
                <Roles />
            </ProtectedRoute>
        ),
    },

    // PERMISSIONS
    {
        path: "settings/permissions",
        element: (
            <ProtectedRoute permission={PERMISSIONS.ROLES_VIEW}>
                <Permissions />
            </ProtectedRoute>
        ),
    },

];