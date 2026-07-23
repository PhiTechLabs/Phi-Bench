import dns from "dns";

// This DNS override is a workaround for local network/ISP DNS resolvers
// that fail on MongoDB Atlas's mongodb+srv:// SRV record lookups — it has
// nothing to do with the app itself, so it must never run in production.
// Railway's containers have their own correctly-configured DNS; forcing all
// lookups through specific public resolvers there is unnecessary and could
// introduce a new, unrelated point of failure if Railway's network ever
// restricts outbound DNS to arbitrary external IPs.
if (process.env.NODE_ENV !== "production") {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js"; // NEW
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import jobRoutes from "./routes/jobRoutes.js";
import router from "./routes/RoutesRole.js"
import submissionRoutes from "./routes/submissionRoutes.js";
import interviewRoutes  from "./routes/interviewRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import teamRoutes from "./routes/teamRoutes.js"
import searchRoutes from "./routes/searchRoutes.js"; // NEW
import codePreviewRoutes from "./routes/codePreviewRoutes.js"; // NEW
import tableViewRoutes from "./routes/tableViewRoutes.js"; // NEW — DataTable saved views/columns, synced per user

dotenv.config();
connectDB();
const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────
// FRONTEND_URL is set in Railway's environment variables to your real
// Vercel URL (e.g. "https://phi-bench.vercel.app") once deployed. Locally,
// it falls back to the Parcel dev server's default port so nothing extra
// needs to be set on your own machine.
//
// Supports a comma-separated list (e.g. "https://phi-bench.vercel.app,
// https://phi-bench-git-staging.vercel.app") in case you ever need to allow
// a preview deployment URL alongside the production one.
const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:1234"
)
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, server-to-server health
        // checks) — only browser requests carry an Origin header that
        // needs checking.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/submissions", submissionRoutes);
app.use("/api/interviews",  interviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/candidates", candidateRoutes); // NEW
app.use("/api/jobs", jobRoutes); // NEW
app.use("/api/branches", branchRoutes); // NEW
app.use("/api/roles", router); //  NEW
app.use("/api/teams", teamRoutes);
app.use("/api/search", searchRoutes); // NEW
app.use("/api/code-preview", codePreviewRoutes); // NEW
app.use("/api/table-views", tableViewRoutes); // NEW
app.get("/", (req, res) => {
    res.send("API Running");
});
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));