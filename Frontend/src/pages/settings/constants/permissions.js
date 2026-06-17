// permissions.js

export const MODULES = {
    JOB: "job",
    CLIENT: "clients",
    CANDIDATE: "candidate",
    INTERVIEW: "interview",
    REPORT: "report",
    BENCH: "bench",
    SUBMISSION: "submissions",
    HOME: "home",
    USERS: "users",
    ROLES: "roles",
};

export const ACTIONS = {
    VIEW: "view",
    ADD: "add",
    EDIT: "edit",
    DELETE: "delete",
};

export const PERMISSIONS = {
    JOB_VIEW: {
        module: MODULES.JOB,
        action: ACTIONS.VIEW,
    },

    JOB_ADD: {
        module: MODULES.JOB,
        action: ACTIONS.ADD,
    },

    JOB_EDIT: {
        module: MODULES.JOB,
        action: ACTIONS.EDIT,
    },

    JOB_DELETE: {
        module: MODULES.JOB,
        action: ACTIONS.DELETE,
    },

    CANDIDATE_VIEW: {
        module: MODULES.CANDIDATE,
        action: ACTIONS.VIEW,
    },

    CANDIDATE_ADD: {
        module: MODULES.CANDIDATE,
        action: ACTIONS.ADD,
    },

    CANDIDATE_EDIT: {
        module: MODULES.CANDIDATE,
        action: ACTIONS.EDIT,
    },

    CANDIDATE_DELETE: {
        module: MODULES.CANDIDATE,
        action: ACTIONS.DELETE,
    },

    BENCH_VIEW: {
        module: MODULES.BENCH,
        action: ACTIONS.VIEW,
    },

    SUBMISSION_VIEW: {
        module: MODULES.SUBMISSION,
        action: ACTIONS.VIEW,
    },

    INTERVIEW_VIEW: {
        module: MODULES.INTERVIEW,
        action: ACTIONS.VIEW,
    },

    CLIENT_VIEW: {
        module: MODULES.CLIENT,
        action: ACTIONS.VIEW,
    },

    CLIENT_CREATE: {
        module: MODULES.CLIENT,
        action: ACTIONS.ADD,
    },

    CLIENT_EDIT: {
        module: MODULES.CLIENT,
        action: ACTIONS.EDIT,
    },

    CLIENT_DELETE: {
        module: MODULES.CLIENT,
        action: ACTIONS.DELETE,
    },

    REPORT_VIEW: {
        module: MODULES.REPORT,
        action: ACTIONS.VIEW,
    },

    USERS_VIEW: {
        module: MODULES.USERS,
        action: ACTIONS.VIEW,
    },

    USERS_ADD: {
        module: MODULES.USERS,
        action: ACTIONS.ADD,
    },

    USERS_EDIT: {
        module: MODULES.USERS,
        action: ACTIONS.EDIT,
    },

    USERS_DELETE: {
        module: MODULES.USERS,
        action: ACTIONS.DELETE,
    },

    ROLES_VIEW: {
        module: MODULES.ROLES,
        action: ACTIONS.VIEW,
    },

    ROLES_ADD: {
        module: MODULES.ROLES,
        action: ACTIONS.ADD,
    },

    ROLES_EDIT: {
        module: MODULES.ROLES,
        action: ACTIONS.EDIT,
    },

    ROLES_DELETE: {
        module: MODULES.ROLES,
        action: ACTIONS.DELETE,
    },

    SETTINGS_VIEW: {
        module: MODULES.ROLES,
        action: ACTIONS.VIEW,
    },
    VENDOR_VIEW: {
        module: "vendors",
        action: ACTIONS.VIEW,
    },
    TEAMS_VIEW: {
        module: "teams",
        action: ACTIONS.VIEW,
    },

    TEAMS_ADD: {
        module: "teams",
        action: ACTIONS.ADD,
    },

    TEAMS_EDIT: {
        module: "teams",
        action: ACTIONS.EDIT,
    },

    TEAMS_DELETE: {
        module: "teams",
        action: ACTIONS.DELETE,
    },
};