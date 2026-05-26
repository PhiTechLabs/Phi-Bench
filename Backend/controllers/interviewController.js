import Interview from "../models/Interview.js";

// ─── CREATE INTERVIEW ────────────────────────────────────────────────────────
export const createInterview = async (req, res) => {
  try {
    const interviewData = req.body;

    const interview = new Interview({
      ...interviewData,
      createdBy: req.user?._id,
    });

    await interview.save();

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      interview,
    });
  } catch (error) {
    console.error("Create interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      errors: [{ message: error.message }],
    });
  }
};

// ─── GET ALL INTERVIEWS ──────────────────────────────────────────────────────
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("candidateId", "name email phone")
      .populate("jobId", "title")
      .populate("clientId", "name")
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error("Get interviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
      errors: [{ message: error.message }],
    });
  }
};

// ─── GET INTERVIEWS BY CANDIDATE ─────────────────────────────────────────────
export const getCandidateInterviews = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const interviews = await Interview.find({ candidateId })
      .populate("jobId", "title")
      .populate("clientId", "name")
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error("Get candidate interviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate interviews",
      errors: [{ message: error.message }],
    });
  }
};

// ─── GET SINGLE INTERVIEW ────────────────────────────────────────────────────
export const getInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id)
      .populate("candidateId", "name email phone")
      .populate("jobId", "title")
      .populate("clientId", "name");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview",
      errors: [{ message: error.message }],
    });
  }
};

// ─── UPDATE INTERVIEW ────────────────────────────────────────────────────────
export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const interview = await Interview.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      interview,
    });
  } catch (error) {
    console.error("Update interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update interview",
      errors: [{ message: error.message }],
    });
  }
};

// ─── DELETE INTERVIEW ────────────────────────────────────────────────────────
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findByIdAndDelete(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview cancelled successfully",
    });
  } catch (error) {
    console.error("Delete interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel interview",
      errors: [{ message: error.message }],
    });
  }
};

// ─── ADD FEEDBACK ────────────────────────────────────────────────────────────
export const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, rating } = req.body;

    const interview = await Interview.findByIdAndUpdate(
      id,
      {
        $set: {
          feedback,
          rating,
          status: "Completed",
        },
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback added successfully",
      interview,
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add feedback",
      errors: [{ message: error.message }],
    });
  }
};