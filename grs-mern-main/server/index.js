const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const rateLimit = require("express-rate-limit");

dotenv.config();

if (cluster.isPrimary) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", () => {
        cluster.fork();
    });

} else {

    const app = express();

    // Render ke proxy ko trust karo
    app.set("trust proxy", 1);

    const PORT = process.env.PORT || 5000;

    connectDB();

    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(express.static("public"));

    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests from this user, please try again later",
    }));

    // APIs started
    app.use("/api/student", require("./routes/studentRoute"));
    app.use("/api/admin", require("./routes/adminRoute"));
    app.use("/api/college", require("./routes/collegeRoute"));
    app.use("/api/session", require("./routes/sessionRoute"));
    app.use("/api/complaintType", require("./routes/complaintTypeRoute"));
    app.use("/api/complaint", require("./routes/complaintRoute"));

    // APIs ended

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}