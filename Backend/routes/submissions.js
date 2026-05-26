import express from "express";
import * as submissionController from "../controllers/submissionController.js";

const router = express.Router();

router.post("/", submissionController.createSubmission);
router.get("/", submissionController.getAllSubmissions);
router.get("/:id", submissionController.getSubmission);
router.put("/:id", submissionController.updateSubmission);
router.delete("/:id", submissionController.deleteSubmission);

export default router;