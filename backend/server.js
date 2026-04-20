require("dotenv").config();
const express = require("express"); 
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/transaction"));

// Default route
app.get("/", (req, res) => {
    res.send("🚀 Secure Payment Backend Running");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on all devices");
});