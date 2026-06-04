import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Role from "../models/role.js";

import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/generateTokens.js";

// ───────────────────────────────────────────────────────────
// LOGIN
// ───────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({
            username,
        })
            .select("+password")
            .populate("roleId");

        if (!user) {

            return res.status(400).json({
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const accessToken =
            generateAccessToken(user);

        const refreshToken =
            generateRefreshToken(user);

        user.refreshToken = refreshToken;

        await user.save();

        // ─── ACCESS TOKEN COOKIE ─────────────────────────
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        // ─── REFRESH TOKEN COOKIE ────────────────────────
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const populatedUser =
            await User.findById(user._id)
                .populate("roleId");

                console.log(
                JSON.stringify(
                    populatedUser.roleId,
                    null,
                    2
                )
            );

        return res.status(200).json({

            user: {
                id: populatedUser._id,
                username: populatedUser.username,
                email: populatedUser.email,
                role: populatedUser.roleId?.name,

                modulePermissions:
                    populatedUser.roleId?.modulePermissions || {},

                hierarchyLevel:
                    populatedUser.roleId?.hierarchyLevel,

                dataScope:
                    populatedUser.roleId?.dataScope,
            }
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message,
        });
    }
};

// ───────────────────────────────────────────────────────────
// LOGOUT
// ───────────────────────────────────────────────────────────
export const logoutUser = async (req, res) => {

    try {

        if (req.user?.id) {

            const user =
                await User.findById(req.user.id);

            if (user) {

                user.refreshToken = null;

                await user.save();
            }
        }

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};

// ───────────────────────────────────────────────────────────
// REFRESH ACCESS TOKEN
// ───────────────────────────────────────────────────────────
export const refreshAccessToken = async (
    req,
    res
) => {

    try {

        const refreshToken =
            req.cookies.refreshToken;

        if (!refreshToken) {

            return res.status(401).json({
                message:
                    "Refresh token missing",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(
            decoded.id
        ).populate("roleId");

        if (!user) {

            return res.status(403).json({
                message: "User not found",
            });
        }

        const newAccessToken =
            generateAccessToken(user);

        res.cookie(
            "accessToken",
            newAccessToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            }
        );

        return res.status(200).json({
            message: "Access token refreshed",
        });

    } catch (error) {

        return res.status(403).json({
            message:
                "Invalid or expired refresh token",
        });
    }
};

// ───────────────────────────────────────────────────────────
// REGISTER USER
// ───────────────────────────────────────────────────────────
export const registerUser = async (
    req,
    res
) => {

    try {

        const {
            username,
            password,
            role,
        } = req.body;

        // ─── VALIDATION ────────────────────────────────
        if (!username || !password || !role) {

            return res.status(400).json({
                message:
                    "All fields are required",
            });
        }

        // ─── CHECK EXISTING USER ───────────────────────
        const userExists =
            await User.findOne({
                username,
            });

        if (userExists) {

            return res.status(400).json({
                message:
                    "User already exists",
            });
        }

        // ─── CURRENT USER ROLE ─────────────────────────
        const currentUserRole = req.user.role;

        if (!currentUserRole) {

            return res.status(403).json({
                message:
                    "Current user role invalid",
            });
        }

        // ─── NORMALIZE ROLE NAME ───────────────────────
        const normalizedRole = role
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        // ─── FIND ROLE ─────────────────────────────────
        let roleDoc = await Role.findOne({
            name: normalizedRole,
        });

        // ─── AUTO CREATE ROLE ──────────────────────────
        if (!roleDoc) {

            const canCreateRole =
                req.user.role?.name === "super_admin";

            if (!canCreateRole) {

                return res.status(403).json({
                    message:
                        "Not allowed to create new roles",
                });
            }

            roleDoc = await Role.create({

                name: normalizedRole,

                description:
                    `${normalizedRole} role`,


                hierarchyLevel:
                    currentUserRole
                        .hierarchyLevel + 1,

                dataScope: "SELF",

                isSystemRole: false,

                createdBy: req.user.id,

            });
        }

        // ─── HIERARCHY SECURITY ────────────────────────
        if (
            req.user.role.name !== "super_admin" &&
            roleDoc.hierarchyLevel <=
            currentUserRole.hierarchyLevel
        ) {

            return res.status(403).json({
                message:
                    "You cannot assign roles above or equal to your hierarchy level",
            });
        }

        // ─── HASH PASSWORD ─────────────────────────────
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // ─── CREATE USER ───────────────────────────────
        const user = await User.create({

            username,

            password: hashedPassword,

            roleId: roleDoc._id,

        });

        await user.populate("roleId");

        return res.status(201).json({

            message:
                "User registered successfully",

            user: {

                id: user._id,

                username: user.username,

                role: user.roleId.name,

            },

        });

    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({
            error: error.message,
        });
    }
};

// ───────────────────────────────────────────────────────────
// GET ALL USERS
// ───────────────────────────────────────────────────────────
export const getAllUsers = async (
    req,
    res
) => {

    try {

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .populate("roleId");

        return res.status(200).json({

            count: users.length,

            users,

        });

    } catch (error) {

        return res.status(500).json({
            error: error.message,
        });
    }
};

// ───────────────────────────────────────────────────────────
// UPDATE USER
// ───────────────────────────────────────────────────────────
export const updateUser = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const {
            username,
            role,
            password,
        } = req.body;

        // ─── FIND TARGET USER ──────────────────────────
        const targetUser =
            await User.findById(id)
                .populate("roleId");

        if (!targetUser) {

            return res.status(404).json({
                message: "User not found",
            });
        }

        // ─── CURRENT USER ROLE ─────────────────────────
        const currentUserRole = req.user.role;
        if (!currentUserRole) {

            return res.status(403).json({
                message:
                    "Current user role invalid",
            });
        }

        // ─── PROTECT HIGHER USERS ──────────────────────
        if (
            req.user.role?.name !== "super_admin" &&
            targetUser.roleId
                ?.hierarchyLevel <=
            currentUserRole.hierarchyLevel
        ) {

            return res.status(403).json({
                message:
                    "You cannot modify users above or equal to your hierarchy",
            });
        }

        const updateFields = {};

        // ─── UPDATE USERNAME ───────────────────────────
        if (username) {

            updateFields.username = username;
        }

        // ─── UPDATE ROLE ───────────────────────────────
        if (role) {

            const normalizedRole = role
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

            let roleDoc =
                await Role.findOne({
                    name: normalizedRole,
                });

            // ─── AUTO CREATE ROLE ──────────────────────
            if (!roleDoc) {

                const canCreateRole =
                    req.user.role?.name === "super_admin";

                if (!canCreateRole) {

                    return res.status(403).json({
                        message:
                            "Not allowed to create new roles",
                    });
                }

                roleDoc = await Role.create({

                    name: normalizedRole,

                    description:
                        `${normalizedRole} role`,

                    hierarchyLevel:
                        currentUserRole
                            .hierarchyLevel + 1,

                    dataScope: "SELF",

                    isSystemRole: false,

                    createdBy: req.user.id,

                });
            }

            // ─── HIERARCHY SECURITY ────────────────────
            if (
                req.user.role?.name !== "super_admin" &&
                roleDoc.hierarchyLevel <=
                currentUserRole.hierarchyLevel
            ) {

                return res.status(403).json({
                    message:
                        "You cannot assign this role",
                });
            }

            updateFields.roleId =
                roleDoc._id;
        }

        // ─── UPDATE PASSWORD ───────────────────────────
        if (password) {

            updateFields.password =
                await bcrypt.hash(password, 10);
        }

        // ─── UPDATE USER ───────────────────────────────
        const updatedUser =
            await User.findByIdAndUpdate(
                id,
                updateFields,
                {
                    new: true,
                }
            )
                .select("-password")
                .populate("roleId");

        return res.status(200).json({

            message:
                "User updated successfully",

            user: updatedUser,

        });

    } catch (error) {

        return res.status(500).json({
            error: error.message,
        });
    }
};

// ───────────────────────────────────────────────────────────
// DELETE USER
// ───────────────────────────────────────────────────────────
export const deleteUser = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        // ─── PREVENT SELF DELETE ───────────────────────
        if (req.user.id === id) {

            return res.status(400).json({
                message:
                    "You cannot delete your own account",
            });
        }

        const targetUser =
            await User.findById(id)
                .populate("roleId");

        if (!targetUser) {

            return res.status(404).json({
                message: "User not found",
            });
        }

        const currentUserRole = req.user.role;

        // ─── HIERARCHY PROTECTION ──────────────────────
        if (
            req.user.role?.name !== "super_admin" &&
            targetUser.roleId
                ?.hierarchyLevel <=
            currentUserRole.hierarchyLevel
        ) {

            return res.status(403).json({
                message:
                    "You cannot delete users above or equal to your hierarchy",
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            message:
                "User deleted successfully",
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message,
        });
    }
};