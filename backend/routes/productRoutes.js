const express = require("express");
const router = express.Router();
const db = require("../config/db");


// =========================
// GET ALL PRODUCTS (supports optional query params: search, category, supplier, stockStatus, minPrice, maxPrice, minQty, maxQty, sortBy)
// =========================

router.get("/", (req, res) => {
    const { search, category, supplier } = req.query;

    let sql = "SELECT * FROM products";
    const whereConditions = [];
    const queryParams = [];

    if (search && search.trim() !== "") {
        const searchTerm = `%${search.trim()}%`;
        whereConditions.push("(name LIKE ? OR sku LIKE ? OR category LIKE ? OR supplier LIKE ?)");
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category && category.trim() !== "" && category !== "All") {
        whereConditions.push("category = ?");
        queryParams.push(category.trim());
    }

    if (supplier && supplier.trim() !== "" && supplier !== "All") {
        whereConditions.push("supplier = ?");
        queryParams.push(supplier.trim());
    }

    if (whereConditions.length > 0) {
        sql += " WHERE " + whereConditions.join(" AND ");
    }

    sql += " ORDER BY id DESC";

    db.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            products: results
        });
    });
});


// =========================
// ADD PRODUCT
// =========================

router.post("/", (req, res) => {

    const {
        name,
        category,
        sku,
        price,
        quantity,
        supplier,
        description
    } = req.body;


    if (!name || !category || !sku || price === undefined || quantity === undefined) {

        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        });
    }


    const sql = `
        INSERT INTO products
        (name, category, sku, price, quantity, supplier, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [
        name,
        category,
        sku,
        price,
        quantity,
        supplier || null,
        description || null
    ];


    db.query(sql, values, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to add product",
                error: err.message
            });
        }


        res.status(201).json({

            success: true,

            message: "Product added successfully",

            productId: result.insertId

        });

    });

});

// =========================
// DELETE PRODUCT
// =========================

router.delete("/:id", (req, res) => {

    const productId = req.params.id;

    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [productId], (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete product"
            });

        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        res.json({
            success: true,
            message: "Product deleted successfully"
        });

    });

});
// =========================
// UPDATE PRODUCT
// =========================
router.put("/:id", (req, res) => {
    const id = req.params.id;

    const {
        name,
        category,
        sku,
        price,
        quantity,
        supplier,
        description
    } = req.body;

    const sql = `
        UPDATE products
        SET name=?, category=?, sku=?, price=?, quantity=?, supplier=?, description=?
        WHERE id=?
    `;

    db.query(
        sql,
        [
            name,
            category,
            sku,
            price,
            quantity,
            supplier,
            description,
            id
        ],
        (err, result) => {
            if (err) {
                console.error("Update product error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update product",
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Product updated successfully"
            });
        }
    );
});
module.exports = router;