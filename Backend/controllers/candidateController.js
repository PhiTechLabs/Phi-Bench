import asyncHandler from "express-async-handler";
import {
    createCandidateService,
    listCandidatesService,
    getCandidateByIdService,
    updateCandidateService,
    deleteCandidateService,
    toggleBenchService,
} from "../services/candidateService.js";

export const createCandidate = asyncHandler(async (req, res) => {
    const candidate = await createCandidateService(req.body, req.user.id);
    res.status(201).json({
        message: "Candidate created successfully",
        candidate,
    });
});

export const listCandidates = asyncHandler(async (req, res) => {

    const candidates = await listCandidatesService(req.user.id);

    res.json({
        count: candidates.length,
        candidates
    });

});

export const getCandidateById = asyncHandler(async (req, res) => {
    const candidate = await getCandidateByIdService(req.params.id);
    res.json({ candidate });
});

export const updateCandidate = asyncHandler(async (req, res) => {
    const candidate = await updateCandidateService(req.params.id, req.body);
    res.json({ message: "Candidate updated successfully", candidate });
});

export const deleteCandidate = asyncHandler(async (req, res) => {
    await deleteCandidateService(req.params.id);
    res.json({ message: "Candidate deleted successfully" });
});

export const toggleBench = asyncHandler(async (req, res) => {
    const candidate = await toggleBenchService(req.params.id);
    res.json({ message: "Bench status toggled", candidate });
});