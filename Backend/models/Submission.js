import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // Candidate Information
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    // Job Information
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobTitle: String,

    // Client Information
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    clientName: String,

    // Submission Details
    submittedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Interview Scheduled",
        "Offer Extended",
        "Rejected",
        "Withdrawn",
      ],
      default: "Submitted",
    },

    // Notes & Feedback
    recruiterNotes: String,
    clientFeedback: String,

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Submission", submissionSchema);