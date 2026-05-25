import Role from "../models/Role.js";
import { PERMISSIONS } from "../config/permissions.js";
import User from "../models/User.js";

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

        const {
            name,
            description,
            permissions,
            hierarchyLevel,
            dataScope,
        } = req.body;

        // VALIDATE REQUIRED FIELDS
        if (!name || hierarchyLevel === undefined) {

            return res.status(400).json({
                message: "Name and hierarchy level are required",
            });

        }

        // CHECK DUPLICATE ROLE
        const existingRole = await Role.findOne({
            name: name.toLowerCase(),
        });

        if (existingRole) {

            return res.status(400).json({
                message: "Role already exists",
            });

        }

        // VALIDATE PERMISSIONS
        const validPermissions = Object.values(PERMISSIONS);

        const invalidPermissions = permissions.filter(
            (permission) => !validPermissions.includes(permission)
        );

        if (invalidPermissions.length > 0) {

            return res.status(400).json({
                message: "Invalid permissions detected",
                invalidPermissions,
            });

        }

        // CREATE ROLE
        const role = await Role.create({

            name: name.toLowerCase(),

            description,

            hierarchyLevel,

            permissions,

            dataScope,

            createdBy: req.user.id,

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

        const {
            name,
            description,
            permissions,
            hierarchyLevel,
            dataScope,
        } = req.body;

        const role = await Role.findById(id);

        if (!role) {

            return res.status(404).json({
                message: "Role not found",
            });

        }

        // PROTECT SYSTEM ROLES
        if (role.isSystemRole) {

            return res.status(403).json({
                message: "System roles cannot be modified",
            });

        }

        // CHECK DUPLICATE NAME
        if (name) {

            const existingRole = await Role.findOne({
                name: name.toLowerCase(),
                _id: { $ne: id },
            });

            if (existingRole) {

                return res.status(400).json({
                    message: "Role name already exists",
                });

            }

        }

        // VALIDATE PERMISSIONS
        if (permissions) {

            const validPermissions = Object.values(PERMISSIONS);

            const invalidPermissions = permissions.filter(
                (permission) => !validPermissions.includes(permission)
            );

            if (invalidPermissions.length > 0) {

                return res.status(400).json({
                    message: "Invalid permissions detected",
                    invalidPermissions,
                });

            }

            role.permissions = permissions;

        }

        // UPDATE FIELDS
        if (name) {
            role.name = name.toLowerCase();
        }

        if (description !== undefined) {
            role.description = description;
        }

        if (hierarchyLevel !== undefined) {
            role.hierarchyLevel = hierarchyLevel;
        }

        if (dataScope) {
            role.dataScope = dataScope;
        }

        await role.save();

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




// export const createRole = async (req, res) => {

//     try {

//         const { name, permissions } = req.body;

//         const existingRole = await Role.findOne({ name });

//         if (existingRole) {
//             return res.status(400).json({
//                 message: "Role already exists",
//             });
//         }

//         const role = await Role.create({
//             name,
//             permissions,
//         });

//         res.status(201).json({
//             message: "Role created successfully",
//             role,
//         });

//     } catch (error) {

//         res.status(500).json({
//             message: error.message,
//         });

//     }

// };




// ─── UPDATE ROLE ───────────────────────────────────────────
// export const updateRole = async (req, res) => {

//     try {

//         const { id } = req.params;
//         const { name, permissions } = req.body;

//         const role = await Role.findByIdAndUpdate(
//             id,
//             {
//                 name,
//                 permissions,
//             },
//             {
//                 new: true,
//             }
//         );

//         if (!role) {
//             return res.status(404).json({
//                 message: "Role not found",
//             });
//         }

//         res.json({
//             message: "Role updated successfully",
//             role,
//         });

//     } catch (error) {

//         res.status(500).json({
//             message: error.message,
//         });

//     }

// };

// ─── DELETE ROLE ───────────────────────────────────────────



// export const deleteRole = async (req, res) => {

//     try {

//         const { id } = req.params;

//         const role = await Role.findByIdAndDelete(id);

//         if (!role) {
//             return res.status(404).json({
//                 message: "Role not found",
//             });
//         }

//         res.json({
//             message: "Role deleted successfully",
//         });

//     } catch (error) {

//         res.status(500).json({
//             message: error.message,
//         });

//     }

// };




export const deleteRole = async (req, res) => {

    try {

        const { id } = req.params;

        const role = await Role.findById(id);

        if (!role) {

            return res.status(404).json({
                message: "Role not found",
            });

        }

        // PROTECT SYSTEM ROLES
        if (role.isSystemRole) {

            return res.status(403).json({
                message: "System roles cannot be deleted",
            });

        }

        // CHECK ASSIGNED USERS
        const assignedUsers = await User.countDocuments({
            roleId: id,
        });

        if (assignedUsers > 0) {

            return res.status(400).json({
                message: "Role is assigned to users and cannot be deleted",
            });

        }

        await role.deleteOne();

        res.json({

            message: "Role deleted successfully",

        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};