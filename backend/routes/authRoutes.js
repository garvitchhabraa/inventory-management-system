const express = require("express");
const router = express.Router();
const db = require("../config/db");

// REGISTER
router.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Check if user already exists
    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }

            // Insert new user
            db.query(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [name, email, password],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Registration failed"
                        });
                    }

                    res.json({
                        success: true,
                        message: "Account created successfully"
                    });
                }
            );
        }
    );
});

// LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [email, password],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            res.json({
                success: true,
                message: "Login successful",
                user: results[0]
            });
        }
    );
});

module.exports = router;