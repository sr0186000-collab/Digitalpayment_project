const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");

// REGISTER
router.post("/register", async (req, res) => {
    console.log("REGISTER HIT");
    console.log(req.body);
    const { name, password, phone } = req.body;
    const email = req.body.email.toLowerCase();

    // ✅ validation
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: "All fields required" });
    }

    // ✅ phone length check (India)
    if (phone.length !== 10) {
        return res.status(400).json({ error: "Enter valid 10-digit phone number" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultBalance = 1000;

        await db.query(
            "INSERT INTO users (name,email,password,phone,balance) VALUES (?,?,?,?,?)",
            [name, email, hashedPassword, phone, defaultBalance]
        );

        res.json({ message: "✅ User Registered Successfully" });

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Email or Phone already exists" });
        }
        res.status(500).json(err);
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    // ✅ validation
    if (!email || !password) {
        return res.status(400).json({ error: "Please enter email and password" });
    }

    try {
        const [result] = await db.query(
            "SELECT * FROM users WHERE email=?", 
            [email]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result[0];

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ error: "Wrong password" });
        }

        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.json({
            message: "✅ Login Successful",
            token,
            user
        });

    } catch (err) {
        res.status(500).json(err);
    }
});

// GET USER
router.get("/user", authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query(
            "SELECT id, name, email, phone, balance FROM users WHERE id=?", 
            [req.user.id]
        );

        res.json(result[0]);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;