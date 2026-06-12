import express from "express";


import {
    getBranches,
    createBranch,
    deleteBranch
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

router.delete(
    "/:id",
    protect,
    deleteBranch
);

export default router;