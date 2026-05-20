import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Role from "../models/Role.js";
import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/generateTokens.js";

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).populate("roleId");
        console.log(user);
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // ✅ JWT goes into HttpOnly cookie — JS can NEVER read this, blocks XSS
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Only non-sensitive info goes to frontend (safe to store in localStorage)
        res.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.roleId.name || "No Role",
                permissions: user.roleId.permissions || [],
            },
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logoutUser = async (req, res) => {

    try {

        // remove refresh token from DB
        if (req.user?.id) {

            const user = await User.findById(req.user.id);

            if (user) {
                user.refreshToken = null;
                await user.save();
            }

        }

        // clear cookies
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

        res.json({
            message: "Logged out successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const refreshAccessToken = async (req, res) => {

    try {

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id)
            .populate("roleId");

        if (!user) {
            return res.status(403).json({
                message: "User not found"
            });
        }

        const newAccessToken = generateAccessToken(user);

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.json({
            message: "Access token refreshed"
        });

    } catch (error) {

        res.status(403).json({
            message: "Invalid or expired refresh token"
        });

    }

};

// ─── REGISTER (superAdmin only) ───────────────────────────────────────────────
export const registerUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const roleDoc = await Role.findOne({ name: role });

        if (!roleDoc) {
            return res.status(400).json({
                message: "Role not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword, roleId: roleDoc._id });
        await user.populate("roleId");

        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, username: user.username, role: user.roleId.name },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// ─── GET ALL USERS ────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 })
        .populate("roleId");
        res.json({ count: users.length, users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── UPDATE USER ──────────────────────────────────────────────────────────────
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, password } = req.body;

        const updateFields = {};
        if (username) updateFields.username = username;
        if (role) updateFields.role = role;
        if (password) updateFields.password = await bcrypt.hash(password, 10);

        const user = await User.findByIdAndUpdate(id, updateFields, { new: true }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── DELETE USER ──────────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Safety: prevent deleting your own account
        if (req.user.id === id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};