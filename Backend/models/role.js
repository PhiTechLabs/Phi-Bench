import mongoose from "mongoose";

const permissionValues = [
    "none",
    "own",
    "all",
    "approval",
    "team",
    "hierarchy",
    "reporting",
];

const modulePermissionSchema =
    new mongoose.Schema(
        {
            view: {
                type: String,
                enum: permissionValues,
                default: "none",
            },

            edit: {
                type: String,
                enum: permissionValues,
                default: "none",
            },

            add: {
                type: String,
                enum: permissionValues,
                default: "none",
            },

            delete: {
                type: String,
                enum: permissionValues,
                default: "none",
            },
        },
        { _id: false }
    );

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        description: {
            type: String,
            default: "",
        },

        hierarchyLevel: {
            type: Number,
            required: true,
        },

        // ───────────────── MODULE PERMISSIONS ─────────────────
        modulePermissions: {
            home: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            job: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            candidate: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            bench: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            submissions: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            interview: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            clients: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            report: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            users: {
                type: modulePermissionSchema,
                default: () => ({}),
            },

            roles: {
                type: modulePermissionSchema,
                default: () => ({}),
            },
        },

        dataScope: {
            type: String,
            enum: [
                "SELF",
                "TEAM",
                "BRANCH",
                "ORGANIZATION",
                "CUSTOM",
            ],
            default: "SELF",
        },

        isSystemRole: {
            type: Boolean,
            default: false,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model(
    "Role",
    roleSchema
);