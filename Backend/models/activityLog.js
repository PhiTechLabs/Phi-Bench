import mongoose from "mongoose";

const changeSchema = new mongoose.Schema(
    {
        field: {
            type: String,
            required: true, // view / edit / add / delete
        },

        oldValue: {
            type: String,
            default: "none",
        },

        newValue: {
            type: String,
            default: "none",
        },
    },
    { _id: false }
);

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            required: true,
            default: "permission_update",
        },

        module: {
            type: String,
            required: true,
        },

        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },

        roleName: {
            type: String,
            required: true,
        },

        changes: {
            type: [changeSchema],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model(
    "ActivityLog",
    activityLogSchema
);