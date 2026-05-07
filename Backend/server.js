import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";                   // ✅ NEW
import { errorHandler, notFound } from "./middleware/errorHandler.js"; // ✅ NEW

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:1234",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes); // ✅ NEW

app.get("/", (req, res) => {
    res.send("API Running");
});

// ─── ERROR HANDLERS — must come last ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));