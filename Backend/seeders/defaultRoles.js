import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Role from "../models/Role.js";
import { PERMISSIONS } from "../config/permissions.js";

dotenv.config();

const roles = [

    {
        name: "super_admin",
        hierarchyLevel: 1,
        dataScope: "ORGANIZATION",
        isSystemRole: true,
        permissions: ["*"],
    },

    {
        name: "admin",
        hierarchyLevel: 2,
        dataScope: "BRANCH",
        isSystemRole: true,

        permissions: [

            // Candidates
            PERMISSIONS.CANDIDATE_VIEW,
            PERMISSIONS.CANDIDATE_CREATE,
            PERMISSIONS.CANDIDATE_EDIT,
            PERMISSIONS.CANDIDATE_DELETE,

            // Jobs
            PERMISSIONS.JOB_VIEW,
            PERMISSIONS.JOB_CREATE,
            PERMISSIONS.JOB_EDIT,
            PERMISSIONS.JOB_DELETE,

            // Clients
            PERMISSIONS.CLIENT_VIEW,
            PERMISSIONS.CLIENT_CREATE,
            PERMISSIONS.CLIENT_EDIT,
            PERMISSIONS.CLIENT_DELETE,

            // Users
            PERMISSIONS.USER_VIEW,
            PERMISSIONS.USER_CREATE,
            PERMISSIONS.USER_EDIT,
            PERMISSIONS.USER_DELETE,

            // Roles
            PERMISSIONS.ROLE_VIEW,
            PERMISSIONS.ROLE_CREATE,
            PERMISSIONS.ROLE_EDIT,
            PERMISSIONS.ROLE_DELETE,
        ],
    },

    {
        name: "team_lead",
        hierarchyLevel: 3,
        dataScope: "TEAM",
        isSystemRole: true,

        permissions: [

            PERMISSIONS.CANDIDATE_VIEW,
            PERMISSIONS.CANDIDATE_CREATE,
            PERMISSIONS.CANDIDATE_EDIT,

            PERMISSIONS.JOB_VIEW,
            PERMISSIONS.JOB_CREATE,

            PERMISSIONS.CLIENT_VIEW,
        ],
    },

    {
        name: "recruiter",
        hierarchyLevel: 4,
        dataScope: "SELF",
        isSystemRole: true,

        permissions: [

            PERMISSIONS.CANDIDATE_VIEW,
            PERMISSIONS.CANDIDATE_CREATE,

            PERMISSIONS.JOB_VIEW,

            PERMISSIONS.CLIENT_VIEW,
        ],
    },

    {
        name: "client",
        hierarchyLevel: 5,
        dataScope: "CUSTOM",
        isSystemRole: true,

        permissions: [
            PERMISSIONS.JOB_VIEW,
        ],
    },

];

const seedRoles = async () => {

    try {

        await connectDB();

        for (const roleData of roles) {

            await Role.findOneAndUpdate(

                {
                    name: roleData.name.toLowerCase(),
                },

                {
                    ...roleData,
                    name: roleData.name.toLowerCase(),
                },

                {
                    upsert: true,
                    new: true,
                }

            );

        }

        console.log("Default roles seeded successfully");

        process.exit();

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

};

seedRoles();
