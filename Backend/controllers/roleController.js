import Role from "../models/Role.js";

// ─── GET ALL ROLES ─────────────────────────────────────────
export const getRoles = async (req, res) => {

    try {

        const roles = await Role.find()
            .sort({ createdAt: -1 });

        res.json({
            count: roles.length,
            roles,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ─── CREATE ROLE ───────────────────────────────────────────
export const createRole = async (req, res) => {

    try {

        const { name, permissions } = req.body;

        const existingRole = await Role.findOne({ name });

        if (existingRole) {
            return res.status(400).json({
                message: "Role already exists",
            });
        }

        const role = await Role.create({
            name,
            permissions,
        });

        res.status(201).json({
            message: "Role created successfully",
            role,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ─── UPDATE ROLE ───────────────────────────────────────────
export const updateRole = async (req, res) => {

    try {

        const { id } = req.params;
        const { name, permissions } = req.body;

        const role = await Role.findByIdAndUpdate(
            id,
            {
                name,
                permissions,
            },
            {
                new: true,
            }
        );

        if (!role) {
            return res.status(404).json({
                message: "Role not found",
            });
        }

        res.json({
            message: "Role updated successfully",
            role,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ─── DELETE ROLE ───────────────────────────────────────────
export const deleteRole = async (req, res) => {

    try {

        const { id } = req.params;

        const role = await Role.findByIdAndDelete(id);

        if (!role) {
            return res.status(404).json({
                message: "Role not found",
            });
        }

        res.json({
            message: "Role deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};