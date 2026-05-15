import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true, },

    description: { type: String, default: "", },

    hierarchyLevel: { type: Number, required: true,},

    permissions: [{type: String,}],

    dataScope: { type: String, enum: ["SELF", "TEAM", "BRANCH", "ORGANIZATION", "CUSTOM"], default: "SELF", },

    isSystemRole: { type: Boolean, default: false, },

    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User",},

}, { timestamps: true });

export default mongoose.model("Role", roleSchema);