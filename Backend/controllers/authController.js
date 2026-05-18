import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Role from "../models/Role.js";

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).populate("roleId");
        console.log(user);
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.roleId.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // ✅ JWT goes into HttpOnly cookie — JS can NEVER read this, blocks XSS
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,         // flip to true in production (needs HTTPS)
            sameSite: "lax",       // blocks CSRF on same-site requests
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // ✅ Only non-sensitive info goes to frontend (safe to store in localStorage)
        res.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.roleId.name,
                permissions: user.roleId.permissions || [],
            },
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.json({ message: "Logged out successfully" });
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
        const users = await User.find().select("-password").sort({ createdAt: -1 });
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