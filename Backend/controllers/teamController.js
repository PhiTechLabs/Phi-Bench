import Team from "../models/team.js";
import User from "../models/User.js";

export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate("branchId", "name code")
            .populate("teamLead", "username email")
            .populate("members", "username");

        res.status(200).json({
            success: true,
            teams,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createTeam = async (req, res) => {
    try {

        const {
            name,
            description,
            branchId,
            teamLead,
            members = [],
        } = req.body;

        const exists = await Team.findOne({ name });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Team already exists",
            });
        }

        const team = await Team.create({
            name,
            description,
            branchId,
            teamLead,
            members,
        });

        // Update users
        const allUsers = [
            ...members,
            ...(teamLead ? [teamLead] : []),
        ];

        await User.updateMany(
            {
                _id: { $in: allUsers },
            },
            {
                teamId: team._id,
            }
        );

        res.status(201).json({
            success: true,
            team,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const updateTeam = async (req, res) => {
    try {

        const {
            name,
            description,
            branchId,
            teamLead,
            members = [],
        } = req.body;

        const oldTeam = await Team.findById(
            req.params.id
        );

        if (!oldTeam) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        // Remove old mappings
        await User.updateMany(
            {
                teamId: oldTeam._id,
            },
            {
                $unset: {
                    teamId: 1,
                },
            }
        );

        const team =
            await Team.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    branchId,
                    teamLead,
                    members,
                },
                {
                    new: true,
                }
            );

        // Add new mappings
        const allUsers = [
            ...members,
            ...(teamLead ? [teamLead] : []),
        ];

        await User.updateMany(
            {
                _id: {
                    $in: allUsers,
                },
            },
            {
                teamId: team._id,
            }
        );

        res.status(200).json({
            success: true,
            team,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const deleteTeam = async (req, res) => {
    try {

        const team =
            await Team.findById(
                req.params.id
            );

        if (!team) {

            return res.status(404).json({
                success: false,
                message: "Team not found",
            });

        }

        await User.updateMany(
            {
                teamId: team._id,
            },
            {
                $unset: {
                    teamId: 1,
                },
            }
        );

        await Team.findByIdAndDelete(
            team._id
        );

        res.status(200).json({
            success: true,
            message:
                "Team deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};