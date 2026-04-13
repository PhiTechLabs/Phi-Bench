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
    role: {
        type: String,
        enum: ["superAdmin", "admin", "client"],
        default: "client"
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);