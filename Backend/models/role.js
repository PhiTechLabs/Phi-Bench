import mongoose from "mongoose";
import { PERMISSIONS } from "../config/permissions.js";

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

        permissions: [
        {
            type: String,
            enum: ["*", ...Object.values(PERMISSIONS)],
        },
        ],

        dataScope: {
        type: String,
        enum: ["SELF", "TEAM", "BRANCH", "ORGANIZATION", "CUSTOM"],
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

    export default mongoose.model("Role", roleSchema);