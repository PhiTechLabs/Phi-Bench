import Branch from "../models/Branch.js";

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