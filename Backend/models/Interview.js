import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    // Candidate Information
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
    },
    candidateEmail: {
      type: String,
      required: true,
    },
    candidatePhone: String,

    // Job & Client Information
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },  
    jobTitle: {
      type: String,
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    clientName: String,
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
    },

    // Interview Details
    interviewRound: {
      type: String,
      enum: [
        "Phone Screen",
        "Technical Round",
        "HR Round",
        "Manager Round",
        "Final Round",
        "Client Interview",
        "Panel Interview",
      ],
      required: true,
    },
    interviewType: {
      type: String,
      enum: ["Phone Call", "Video Call", "In-Person", "Panel"],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
    },
    timeZone: {
      type: String,
      default: "UTC",
    },

    // Interviewers
    interviewers: [
      {
        name: String,
        email: String,
        role: String,
      },
    ],

    // Meeting Details
    meetingDetails: {
      mode: {
        type: String,
        enum: ["phone", "video", "in-person"],
      },
      phoneNumber: String,
      meetingLink: String,
      address: String,
    },

    // Additional Information
    instructions: String,
    internalNotes: String,

    // Status & Feedback
    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "Completed", "Cancelled", "Rescheduled"],
      default: "Scheduled",
    },
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Calendar & Reminders
    sendCalendarInvite: {
      type: Boolean,
      default: true,
    },
    sendReminder: {
      type: Boolean,
      default: true,
    },
    reminderTime: {
      type: String,
      default: "1 day before",
    },
    calendarInviteSent: {
      type: Boolean,
      default: false,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },

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

export default mongoose.model("Interview", interviewSchema);