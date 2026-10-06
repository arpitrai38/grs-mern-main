const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Render / proxy support
app.set("trust proxy", 1);

// Render provides PORT through environment variable
const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// -------------------------------
// MIDDLEWARE
// -------------------------------

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use(cors());

app.use(helmet());

app.use(express.static("public"));

// Rate Limiter
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests from this user, please try again later",
    })
);

// -------------------------------
// HEALTH & ROOT ROUTES
// -------------------------------

app.get("/", (req, res) => {
    res.status(200).send("GRS MERN Server is running 🚀");
});

app.get("/health", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "healthy" : "database_disconnected",
        database: isDbConnected ? "connected" : "disconnected",
        uptime: process.uptime()
    });
});

// Guard API routes so they return immediate 503 instead of hanging on Mongoose buffer
app.use("/api", (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database connection unavailable. Please check your MongoDB Atlas credentials and ensure Network Access allows 0.0.0.0/0."
        });
    }
    next();
});

    // -------------------------------
    // API ROUTES
    // -------------------------------

    app.use(
        "/api/student",
        require("./routes/studentRoute")
    );

    app.use(
        "/api/admin",
        require("./routes/adminRoute")
    );

    app.use(
        "/api/college",
        require("./routes/collegeRoute")
    );

    app.use(
        "/api/session",
        require("./routes/sessionRoute")
    );

    app.use(
        "/api/complaintType",
        require("./routes/complaintTypeRoute")
    );

    app.use(
        "/api/complaint",
        require("./routes/complaintRoute")
    );

    // -------------------------------
    // START SERVER
    // -------------------------------

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });