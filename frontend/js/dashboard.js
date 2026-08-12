const API_URL = "http://localhost:5000/api/products";

let products = [];
let editingProductId = null;

// =========================
// LOAD PRODUCTS
// =========================
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        products = data.products || [];

        displayProducts(products);
        updateStats(products);
    } catch (error) {
        console.error(error);
    }
}

// =========================
// DISPLAY PRODUCTS
// =========================
function displayProducts(productList) {
    const tableBody = document.getElementById("productTableBody");
    tableBody.innerHTML = "";

    if (productList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">No products found.</td>
            </tr>
        `;
        return;
    }

    productList.forEach(product => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${product.id}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>${product.sku}</td>
            <td>₹${Number(product.price).toLocaleString("en-IN")}</td>
            <td>
                <span class="stock-badge ${
                    product.quantity <= 5 ? "low-stock" : "normal-stock"
                }">
                    ${product.quantity}
                </span>
            </td>
            <td>${product.supplier || "-"}</td>
            <td>
                <button class="edit-btn" onclick="editProduct(${product.id})">
                    ✏️
                </button>

                <button class="delete-btn" onclick="deleteProduct(${product.id})">
                    🗑️
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// =========================
// UPDATE STATS
// =========================
function updateStats(productList) {
    document.getElementById("totalProducts").textContent = productList.length;

    const totalStock = productList.reduce(
        (sum, p) => sum + Number(p.quantity),
        0
    );

    document.getElementById("totalStock").textContent = totalStock;

    const inventoryValue = productList.reduce(
        (sum, p) => sum + Number(p.price) * Number(p.quantity),
        0
    );

    document.getElementById("inventoryValue").textContent =
        "₹" + inventoryValue.toLocaleString("en-IN");

    const lowStock = productList.filter(
        p => Number(p.quantity) <= 5
    ).length;

    document.getElementById("lowStock").textContent = lowStock;
}

// =========================
// SEARCH PRODUCTS
// =========================
document.getElementById("searchProduct").addEventListener("input", function () {
    const text = this.value.toLowerCase();

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(text) ||
        p.category.toLowerCase().includes(text) ||
        p.sku.toLowerCase().includes(text)
    );

    displayProducts(filtered);
});

// =========================
// OPEN MODAL
// =========================
function openProductModal() {
    editingProductId = null;

    document.getElementById("productForm").reset();
    document.getElementById("productModal").style.display = "flex";
}

// =========================
// CLOSE MODAL
// =========================
function closeProductModal() {
    document.getElementById("productModal").style.display = "none";
}

// =========================
// ADD / UPDATE PRODUCT
// =========================
document.getElementById("productForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const product = {
        name: document.getElementById("productName").value,
        category: document.getElementById("productCategory").value,
        sku: document.getElementById("productSku").value,
        price: Number(document.getElementById("productPrice").value),
        quantity: Number(document.getElementById("productQuantity").value),
        supplier: document.getElementById("productSupplier").value,
        description: document.getElementById("productDescription").value
    };

    try {
        let response;

        // UPDATE
        if (editingProductId) {
            response = await fetch(`${API_URL}/${editingProductId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            });
        }
        // ADD
        else {
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            });
        }

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert(editingProductId
            ? "Product updated successfully!"
            : "Product added successfully!"
        );

        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
});

// =========================
// EDIT PRODUCT
// =========================
function editProduct(id) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    editingProductId = id;

    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productSku").value = product.sku;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productQuantity").value = product.quantity;
    document.getElementById("productSupplier").value = product.supplier || "";
    document.getElementById("productDescription").value = product.description || "";

    document.getElementById("productModal").style.display = "flex";
}

// =========================
// DELETE PRODUCT
// =========================
async function deleteProduct(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert("Product deleted successfully!");

        loadProducts();
    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
}

// =========================
// START APP
// =========================
loadProducts();