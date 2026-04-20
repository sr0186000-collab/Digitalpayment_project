const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const { encryptData } = require("../utils/rsa");

// SEND MONEY
router.post("/send-money", auth, async (req, res) => {
    const { phone, amount, note } = req.body;   // ✅ change here
    const sender_id = req.user.id;

    if (!phone || !amount) {
        return res.status(400).json({ error: "All fields required" });
    }

    const amt = Number(amount);

    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        // ✅ 1. Find receiver by phone
        const [receiver] = await connection.query(
            "SELECT id FROM users WHERE phone=?",
            [phone]
        );

        if (receiver.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "User not found" });
        }

        const receiver_id = receiver[0].id;

        // ❗ prevent sending to self
        if (receiver_id === sender_id) {
            await connection.rollback();
            return res.status(400).json({ error: "Cannot send money to yourself" });
        }

        // ✅ 2. Check sender balance
        const [sender] = await connection.query(
            "SELECT balance FROM users WHERE id=?",
            [sender_id]
        );

        if (sender.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Sender not found" });
        }

        if (sender[0].balance < amt) {
            await connection.rollback();
            return res.status(400).json({ error: "Insufficient Balance" });
        }

        // ✅ 3. RSA Encryption
        const encrypted = encryptData(`${sender_id}->${receiver_id}:${amt}`);

        // ✅ 4. Insert transaction
        await connection.query(
            "INSERT INTO transactions (sender_id,receiver_id,amount,encrypted_data,note) VALUES (?,?,?,?,?)",
            [sender_id, receiver_id, amt, encrypted, note]
        );

        // ✅ 5. Update balances
        await connection.query(
            "UPDATE users SET balance = balance - ? WHERE id=?",
            [amt, sender_id]
        );

        await connection.query(
            "UPDATE users SET balance = balance + ? WHERE id=?",
            [amt, receiver_id]
        );

        await connection.commit();
        connection.release();

        res.json({ message: "💸 Transaction Successful (Encrypted)" });

    } catch (err) {
        res.status(500).json(err);
    }
});


// HISTORY (same rahega, optional phone bhi add kar sakte ho)
router.get("/transactions", auth, async (req, res) => {
    const userId = req.user.id;

    try {
        const [result] = await db.query(
            `SELECT 
                t.*, 
                s.email AS sender_email,
                s.phone AS sender_phone,
                r.email AS receiver_email,
                r.phone AS receiver_phone
            FROM transactions t
            JOIN users s ON t.sender_id = s.id
            JOIN users r ON t.receiver_id = r.id
            WHERE t.sender_id=? OR t.receiver_id=?
            ORDER BY t.created_at DESC`,
            [userId, userId]
        );

        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;