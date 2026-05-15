import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Role from "../models/Role.js";
import { PERMISSIONS } from "../config/permissions.js";

dotenv.config();

const seedRoles = async () => {
    try {
        await connectDB();

        await Role.deleteMany();

        const roles = [
            {
                name: "superAdmin",
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
                    PERMISSIONS.CANDIDATE_VIEW,
                    PERMISSIONS.CANDIDATE_CREATE,
                    PERMISSIONS.CANDIDATE_EDIT,

                    PERMISSIONS.JOB_VIEW,
                    PERMISSIONS.JOB_CREATE,
                    PERMISSIONS.JOB_EDIT,

                    PERMISSIONS.CLIENT_VIEW,
                    PERMISSIONS.CLIENT_CREATE,
                    PERMISSIONS.CLIENT_EDIT,
                    ],
            },
            {
                name: "teamLead",
                hierarchyLevel: 3,
                dataScope: "TEAM",
                isSystemRole: true,
                permissions: [],
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
                ],
            },
            {
                name: "client",
                hierarchyLevel: 5,
                dataScope: "CUSTOM",
                isSystemRole: true,
                permissions: [
                    PERMISSIONS.JOB_VIEW,
                ]
            },
        ];

        await Role.insertMany(roles);

        console.log("Default roles seeded");
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedRoles();