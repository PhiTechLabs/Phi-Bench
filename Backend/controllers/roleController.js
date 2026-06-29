import Role from "../models/role.js";
import User from "../models/User.js";


import { canManageRole } from "../utils/rbac.js";

// ───────────────────────────────────────────────────────────
// GET ALL ROLES
// ───────────────────────────────────────────────────────────
export const getRoles = async (req, res) => {

    try {

        const query = {};

        if (
            req.user?.role?.name !==
            "super_admin"
        ) {
            query.name = {
                $ne: "super_admin",
            };
        }

        const roles = await Role.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // ─── ATTACH REAL USER COUNT ───────────────────────
        const rolesWithCounts = await Promise.all(

            roles.map(async (role) => {

                const userCount =
                    await User.countDocuments({
                        roleId: role._id,
                    });

                return {
                    ...role,
                    userCount,
                };
            })
        );

        return res.status(200).json({

            count: rolesWithCounts.length,

            roles: rolesWithCounts,

        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};

// ───────────────────────────────────────────────────────────
// GET ALL AVAILABLE PERMISSIONS
// ───────────────────────────────────────────────────────────
export const getPermissions = async (req, res) => {

    try {

        return res.status(200).json({
            modules: [
                "home",
                "job",
                "candidate",
                "bench",
                "submissions",
                "interview",
                "clients",
                "report",
                "users",
                "roles",
            ],
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};

// ───────────────────────────────────────────────────────────
// CREATE ROLE
// ───────────────────────────────────────────────────────────
export const createRole = async (req, res) => {

    try {

        let {
            name,
            description,
            hierarchyLevel,
            modulePermissions,
        } = req.body;

        // ─────────────────────────────────────────────
        // VALIDATION
        // ─────────────────────────────────────────────
        if (!name || hierarchyLevel === undefined) {

            return res.status(400).json({
                message: "Name and hierarchy level are required",
            });
        }

        const currentUserRole = req.user.role;

        // ─────────────────────────────────────────────
        // HIERARCHY ENFORCEMENT
        // ─────────────────────────────────────────────
        if (
            currentUserRole.name !== "super_admin" &&
            Number(hierarchyLevel) <=
            currentUserRole.hierarchyLevel
        ) {

            return res.status(403).json({
                message:
                    "You cannot create roles above or equal to your hierarchy level",
            });
        }

        // ─────────────────────────────────────────────
        // NORMALIZE NAME
        // ─────────────────────────────────────────────
        const normalizedName = name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");


        // ─────────────────────────────────────────────
        // DUPLICATE CHECK
        // ─────────────────────────────────────────────
        const existingRole = await Role.findOne({
            name: normalizedName,
        });

        if (existingRole) {

            return res.status(400).json({
                message: "Role already exists",
            });
        }

        

        // ─────────────────────────────────────────────
        // CREATE ROLE
        // ─────────────────────────────────────────────
        const role = await Role.create({
            name: normalizedName,
            description: description || "",
            hierarchyLevel: Number(hierarchyLevel),
            modulePermissions: modulePermissions || {},
            createdBy: req.user.id,
            isSystemRole: false,
        });

        return res.status(201).json({

            message: "Role created successfully",

            role,

        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};

// ───────────────────────────────────────────────────────────
// UPDATE ROLE
// ───────────────────────────────────────────────────────────
export const updateRole = async (req, res) => {

    try {

        const { id } = req.params;

        let {
            name,
            description,
            hierarchyLevel,
        } = req.body;

        const role = await Role.findById(id);

        if (!role) {

            return res.status(404).json({
                message: "Role not found",
            });
        }

        if (
            role.name === "super_admin" &&
            req.user.role.name !==
            "super_admin"
        ) {
            return res.status(403).json({
                message:
                    "Super Admin role cannot be modified",
            });
        }

        const currentUserRole = req.user.role;

        // ─────────────────────────────────────────────
        // HIERARCHY ENFORCEMENT
        // ─────────────────────────────────────────────
        if (
            !canManageRole(
                currentUserRole,
                role
            )
        ) {

            return res.status(403).json({
                message:
                    "You cannot modify this role",
            });
        }

        // ─────────────────────────────────────────────
        // PROTECT SYSTEM ROLE NAMES
        // ─────────────────────────────────────────────
        if (
            role.isSystemRole &&
            name &&
            name !== role.name
        ) {

            return res.status(403).json({
                message:
                    "System role names cannot be changed",
            });
        }

        const normalizedName = name
            ? name
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")
            : role.name;

        if (name) {

            const existingRole =
                await Role.findOne({
                    name: normalizedName,
                    _id: { $ne: id },
                });

            if (existingRole) {

                return res.status(400).json({
                    message:
                        "Role name already exists",
                });
            }
        }


        if (name) {
            role.name = normalizedName;
        }

        if (description !== undefined) {
            role.description = description;
        }

        if (hierarchyLevel !== undefined) {
            role.hierarchyLevel =
                Number(hierarchyLevel);
        }

        await role.save();

        return res.status(200).json({

            message: "Role updated successfully",

            role,

        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};


// ───────────────────────────────────────────────────────────
// UPDATE MODULE PERMISSIONS
// ───────────────────────────────────────────────────────────
export const updateModulePermissions =
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                module,
                permissions,
            } = req.body;

            const role =
                await Role.findById(id);

            if (!role) {

                return res.status(404).json({
                    message:
                        "Role not found",
                });
            }

                if (
                    role.name === "super_admin" &&
                    req.user.role.name !==
                    "super_admin"
                ) {
                    return res.status(403).json({
                        message:
                            "Super Admin permissions cannot be modified",
                    });
                }

            const currentUserRole =
                req.user.role;

            if (
                !canManageRole(
                    currentUserRole,
                    role
                )
            ) {
                return res.status(403).json({
                    message:
                        "You cannot modify this role",
                });
            }

            // ───────────────── VALIDATE MODULE ─────────────────
            const allowedModules = [
                "home",
                "job",
                "candidate",
                "bench",
                "submissions",
                "interview",
                "clients",
                "report",
                "users",
                "roles",
            ];

            if (
                !allowedModules.includes(
                    module
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid module",
                });
            }

            // ───────────────── UPDATE MODULE PERMISSIONS ─────────────────
            role.modulePermissions[
                module
            ] = {
                view:
                    permissions.view ||
                    "none",

                edit:
                    permissions.edit ||
                    "none",

                add:
                    permissions.add ||
                    "none",

                delete:
                    permissions.delete ||
                    "none",
            };

            await role.save();

            return res.status(200).json({

                message:
                    "Permissions updated successfully",

                role,

            });

        } catch (error) {

            return res.status(500).json({
                message: error.message,
            });
        }
    };

    
// ───────────────────────────────────────────────────────────
// DELETE ROLE
// ───────────────────────────────────────────────────────────
export const deleteRole = async (req, res) => {

    try {

        const { id } = req.params;

        const role = await Role.findById(id);

        if (!role) {

            return res.status(404).json({
                message: "Role not found",
            });
        }

        const currentUserRole = req.user.role;

        // ─────────────────────────────────────────────
        // HIERARCHY ENFORCEMENT
        // ─────────────────────────────────────────────
        if (
            !canManageRole(
                currentUserRole,
                role
            )
        ) {

            return res.status(403).json({
                message:
                    "You cannot delete this role",
            });
        }

        // ─────────────────────────────────────────────
        // PROTECT SYSTEM ROLES AND SUPERADMIN
        // ─────────────────────────────────────────────
        if (
            role.name === "super_admin"
        ) {
            return res.status(403).json({
                message:
                    "Super Admin role cannot be deleted",
            });
        }

        if (role.isSystemRole) {

            return res.status(403).json({
                message:
                    "System roles cannot be deleted",
            });
        }

        const assignedUsers =
            await User.countDocuments({
                roleId: id,
            });

        if (assignedUsers > 0) {

            return res.status(400).json({
                message:
                    "Role is assigned to users and cannot be deleted",
            });
        }

        await role.deleteOne();

        return res.status(200).json({

            message: "Role deleted successfully",

        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};