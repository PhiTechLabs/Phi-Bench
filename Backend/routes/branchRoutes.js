import express from "express";

import {
    getBranches,
    createBranch,
} from "../controllers/branchController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    getBranches
);

router.post(
    "/",
    protect,
    createBranch
);

export default router;