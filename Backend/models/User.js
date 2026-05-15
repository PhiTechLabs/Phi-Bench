import mongoose from "mongoose";

    const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
}, { timestamps: true });

export default mongoose.model("User", userSchema);