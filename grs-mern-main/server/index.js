const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);

    // Create worker processes
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Restart worker if it crashes
    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
        cluster.fork();
    });

} else {

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

    app.use(express.json());

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
    // ROOT ROUTE
    // -------------------------------

    app.get("/", (req, res) => {
        res.status(200).send("GRS MERN Server is running 🚀");
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
}