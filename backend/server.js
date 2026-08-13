const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Database connection
const db = require("./config/db");

// Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// DATABASE TEST
// ===============================
db.query("SELECT 1", (err) => {
    if (err) {
        console.log("❌ MySQL connection failed:", err.message);
    } else {
        console.log("✅ mysql connected successfully");
    }
});

// ===============================
// HOME ROUTE
// ===============================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 Stock Flow API is running!"
    });
});

// ===============================
// API ROUTES
// ===============================
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ===============================
// SERVER START
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
});