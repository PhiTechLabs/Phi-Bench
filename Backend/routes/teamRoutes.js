import express from "express";

import {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
} from "../controllers/teamController.js";

const router = express.Router();

router.get("/", getTeams);

router.post("/", createTeam);

router.put("/:id", updateTeam);

router.delete("/:id", deleteTeam);

export default router;