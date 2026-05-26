import Submission from "../models/Submission.js";

// ─── CREATE SUBMISSION ───────────────────────────────────────────────────────
export const createSubmission = async (req, res) => {
  try {
    const submissionData = req.body;

    const submission = new Submission({
      ...submissionData,
      createdBy: req.user?._id,
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: "Candidate submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("Create submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit candidate",
      errors: [{ message: error.message }],
    });
  }
};

// ─── GET ALL SUBMISSIONS ─────────────────────────────────────────────────────
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("candidateId", "name email phone")
      .populate("jobId", "title")
      .populate("clientId", "name")
      .sort({ submittedDate: -1 });

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      errors: [{ message: error.message }],
    });
  }
};

// ─── GET SUBMISSIONS BY CANDIDATE ────────────────────────────────────────────
export const getCandidateSubmissions = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const submissions = await Submission.find({ candidateId })
      .populate("jobId", "title")
      .populate("clientId", "name")
      .sort({ submittedDate: -1 });

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Get candidate submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate submissions",
      errors: [{ message: error.message }],
    });
  }
};

// ─── GET SINGLE SUBMISSION ───────────────────────────────────────────────────
export const getSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate("candidateId", "name email phone")
      .populate("jobId", "title")
      .populate("clientId", "name");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Get submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      errors: [{ message: error.message }],
    });
  }
};

// ─── UPDATE SUBMISSION ───────────────────────────────────────────────────────
export const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Submission updated successfully",
      submission,
    });
  } catch (error) {
    console.error("Update submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update submission",
      errors: [{ message: error.message }],
    });
  }
};

// ─── DELETE SUBMISSION ───────────────────────────────────────────────────────
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete submission",
      errors: [{ message: error.message }],
    });
  }
};