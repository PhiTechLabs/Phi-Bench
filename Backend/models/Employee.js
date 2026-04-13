import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: true
        },
        email: {
        type: String,
        required: true,
        unique: true
        },
        skills: {
        type: [String], // array of skills
        default: []
        },
        experience: {
        type: Number, // years
        required: true
        },
        status: {
        type: String,
        enum: ["bench", "allocated"],
        default: "bench"
        },
        availableFrom: {
        type: Date,
        default: Date.now
        }
    },
    { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);