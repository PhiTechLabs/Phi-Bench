import express from "express";
import * as interviewController from "../controllers/interviewController.js";

const router = express.Router();

router.post("/", interviewController.createInterview);
router.get("/", interviewController.getAllInterviews);
router.get("/:id", interviewController.getInterview);
router.put("/:id", interviewController.updateInterview);
router.delete("/:id", interviewController.deleteInterview);
router.patch("/:id/feedback", interviewController.addFeedback);

export default router;