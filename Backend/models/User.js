import mongoose from "mongoose";

    const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
    },

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
    },

    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        default: null,
    },

    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
    
    refreshToken: {
    type: String,
    default: null,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
    },
}, { timestamps: true });

export default mongoose.model("User", userSchema);