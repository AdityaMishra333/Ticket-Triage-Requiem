require("dotenv").config();
require("dotenv").config({
    path: require("path").resolve(__dirname, "../../.env")
});

const cors = require("cors");
const express = require("express");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "AI Ticket Triage Backend is Running"
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
