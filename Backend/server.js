import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; // ✅ NEW — needed to read HttpOnly cookies
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:1234",
    credentials: true, // ✅ REQUIRED — allows cookies to be sent cross-origin
}));

app.use(express.json());
app.use(cookieParser()); // ✅ Must be before routes

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));