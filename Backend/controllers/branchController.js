import Branch from "../models/Branch.js";
import User from "../models/User.js";

// Controller function to get all branches
export const getBranches = async (req, res) => {

    try {

        const branches =
            await Branch.find()
                .sort({ name: 1 });

        return res.status(200).json({
            branches,
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};

// Controller function to create a new branch
export const createBranch = async (req, res) => {

    try {

        const { name, code } = req.body;

        if (!name || !code) {

            return res.status(400).json({
                message:
                    "Branch name and code are required",
            });
        }

        const existingBranch =
            await Branch.findOne({
                $or: [
                    { name: name.trim() },
                    { code: code.trim().toUpperCase() },
                ],
            });

        if (existingBranch) {

            return res.status(400).json({
                message:
                    "Branch already exists",
            });
        }

        const branch =
            await Branch.create({

                name: name.trim(),

                code: code.trim().toUpperCase(),

                createdBy: req.user.id,
            });

        return res.status(201).json({

            message:
                "Branch created successfully",

            branch,
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};

// Additional controller functions for updating and deleting branches can be added here
export const deleteBranch = async (req, res) => {

    try {

        const { id } = req.params;

        const branch = await Branch.findById(id);

        if (!branch) {

            return res.status(404).json({
                message: "Branch not found",
            });
        }

        // Check if branch is assigned to any users
        const assignedUsers = await User.countDocuments({
            branchId: id,
        });

        if (assignedUsers > 0) {

            return res.status(400).json({
                message:
                    "Cannot delete branch. Users are assigned to it.",
            });
        }

        await Branch.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Branch deleted successfully",
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};