import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Role from "../models/role.js";

dotenv.config();

const roles = [

    {
        name: "super_admin",
        hierarchyLevel: 1,
        dataScope: "ORGANIZATION",
        isSystemRole: true,

        modulePermissions: {
            home: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            job: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            candidate: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            clients: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            interview: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            submissions: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            bench: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            report: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },
            users: {
                view: "all",
                add: "all",
                edit: "all",
                delete: "all",
            },

            roles: {
                view: "all",
                add: "all",
                edit: "all",
                delete: "all",
            },
        }
    },

    {
        name: "admin",
        hierarchyLevel: 2,
        dataScope: "BRANCH",
        isSystemRole: true,

        modulePermissions: {
            home: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            job: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            candidate: {
                view: "all",
                edit: "all",
                add: "all",
                delete: "all",
            },

            users: {
                view: "all",
                add: "all",
                edit: "all",
                delete: "all",
            },

            roles: {
                view: "all",
                add: "all",
                edit: "all",
                delete: "all",
            }
        }
    },

    {
        name: "team_lead",
        hierarchyLevel: 3,
        dataScope: "TEAM",
        isSystemRole: true,

        
    },

    {
        name: "recruiter",
        hierarchyLevel: 4,
        dataScope: "SELF",
        isSystemRole: true,

    },

    {
        name: "client",
        hierarchyLevel: 5,
        dataScope: "CUSTOM",
        isSystemRole: true,

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
