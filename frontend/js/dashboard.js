const API_URL = "http://localhost:5000/api/products";

let allProducts = [];


// ================================
// USER
// ================================

const userEmail =
    localStorage.getItem("userEmail");

document.getElementById("userEmail").textContent =
    userEmail || "Administrator";


// ================================
// DATE & TIME
// ================================

function updateDateTime() {

    const now = new Date();

    document.getElementById("currentDate").textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    document.getElementById("currentTime").textContent =
        now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
}

updateDateTime();

setInterval(updateDateTime, 1000);


// ================================
// LOGOUT
// ================================

function logout() {

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");

    window.location.href = "login.html";
}


// ================================
// LOAD PRODUCTS
// ================================

async function loadProducts() {
    try {
        const response = await fetch(API_URL);

        const data = await response.json();

        allProducts = data.products || data;

        console.log("Loaded products:", allProducts);

        renderProducts(allProducts);
        updateStatistics(allProducts);
        updateDashboardInsights(allProducts);

    } catch (error) {
        console.error(error);

        const tableBody = document.getElementById("productTableBody");

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="color:red;padding:20px;text-align:center;">
                        ❌ ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}
// ================================
// RENDER PRODUCTS
// ================================

function renderProducts(products) {

    const tableBody = document.getElementById("productTableBody");

    if (!tableBody) {
        console.error("productTableBody not found");
        return;
    }

    // No products
    if (!products || products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    No products found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = "";

    products.forEach(product => {

        const stockStatus = product.quantity < 10
            ? "low-stock"
            : "in-stock";

        const stockText = product.quantity < 10
            ? "Low Stock"
            : "In Stock";

        tableBody.innerHTML += `
            <tr>

                <td>
                    <div class="product-cell">
                        <div class="product-icon">📦</div>
                        <div>
                            <strong>${product.name}</strong>
                            <small>${product.description || "No description"}</small>
                        </div>
                    </div>
                </td>

                <td>${product.sku}</td>
                <td>${product.category}</td>
                <td>${product.supplier || "-"}</td>
                <td>₹${Number(product.price).toLocaleString("en-IN")}</td>
                <td>${product.quantity}</td>

                <td>
                    <span class="status ${stockStatus}">
                        ${stockText}
                    </span>
                </td>

                <td>
                    <div class="action-buttons">

                        <button class="edit-btn"
                                onclick="editProduct(${product.id})">
                            ✏️
                        </button>

                        <button class="delete-btn"
                                onclick="deleteProduct(${product.id})">
                            🗑️
                        </button>

                    </div>
                </td>

            </tr>
        `;
    });
}

// ================================
// DISPLAY PRODUCTS
// ================================

function displayProducts(products) {

    const tableBody =
        document.getElementById("productTableBody");

    tableBody.innerHTML = "";


    if (products.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    No products found.
                </td>
            </tr>
        `;

        return;
    }


    products.forEach(product => {

        const quantity =
            Number(product.quantity) || 0;

        const price =
            Number(product.price) || 0;


        let statusClass = "in-stock";
        let statusText = "In Stock";


        if (quantity === 0) {

            statusClass = "out-stock";
            statusText = "Out of Stock";

        } else if (quantity <= 5) {

            statusClass = "low-stock";
            statusText = "Low Stock";
        }


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>

                <div class="product-name">
                    ${escapeHTML(product.name)}
                </div>

                <div class="product-description">
                    ${escapeHTML(product.description || "")}
                </div>

            </td>


            <td>
                ${escapeHTML(product.sku || "-")}
            </td>


            <td>
                ${escapeHTML(product.category || "-")}
            </td>


            <td>
                ${escapeHTML(product.supplier || "-")}
            </td>


            <td>
                ₹${price.toLocaleString("en-IN")}
            </td>


            <td>
                <strong>${quantity}</strong>
            </td>


            <td>

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </td>


            <td>

                <button
                    class="edit-btn"
                    onclick="editProduct(${product.id})"
                >
                    ✏ Edit
                </button>


                <button
                    class="delete-btn"
                    onclick="deleteProduct(${product.id})"
                >
                    🗑 Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// ================================
// STATISTICS
// ================================

function updateStatistics(products) {
    // ================================
// DASHBOARD INSIGHTS
// ================================

function updateDashboardInsights(products){

    // Calculate inventory value
    const inventoryValue = products.reduce((sum, product) => {
        return sum + (Number(product.price) * Number(product.quantity));
    }, 0);

    // Estimate monthly revenue (18% of inventory value)
    const monthlyRevenue = Math.round(inventoryValue * 0.18);

    const revenueElement = document.getElementById("monthlyRevenue");

    if(revenueElement){
        revenueElement.textContent =
            "₹" + monthlyRevenue.toLocaleString("en-IN");
    }


    // Needs Attention List
    const attentionList = document.getElementById("attentionList");

    if(!attentionList) return;

    const lowStockProducts = products.filter(product => product.quantity < 5);

    if(lowStockProducts.length === 0){

        attentionList.innerHTML = `
            <div class="attention-empty">
                All products are sufficiently stocked.
            </div>
        `;

        return;
    }

    attentionList.innerHTML = "";

    lowStockProducts.forEach(product => {

        attentionList.innerHTML += `
            <div class="attention-item">

                <div>
                    <strong>${product.name}</strong>
                    <small>${product.category}</small>
                </div>

                <span class="stock-badge">
                    ${product.quantity} left
                </span>

            </div>
        `;
    });
}

    let totalStock = 0;

    let inventoryValue = 0;

    let lowStock = 0;


    products.forEach(product => {

        const quantity =
            Number(product.quantity) || 0;

        const price =
            Number(product.price) || 0;


        totalStock += quantity;

        inventoryValue +=
            quantity * price;


        if (quantity <= 5) {
            lowStock++;
        }

    });


    document.getElementById(
        "totalProducts"
    ).textContent =
        products.length;


    document.getElementById(
        "totalStock"
    ).textContent =
        totalStock.toLocaleString("en-IN");


    document.getElementById(
        "inventoryValue"
    ).textContent =
        "₹" +
        inventoryValue.toLocaleString("en-IN");


    document.getElementById(
        "lowStock"
    ).textContent =
        lowStock;
}
// ================================
// DASHBOARD INSIGHTS
// ================================

function updateDashboardInsights(products) {

    // Calculate inventory value
    const inventoryValue = products.reduce((sum, product) => {
        return sum + (Number(product.price) * Number(product.quantity));
    }, 0);

    // Estimate monthly revenue
    const monthlyRevenue = Math.round(inventoryValue * 0.18);

    const revenueElement = document.getElementById("monthlyRevenue");

    if (revenueElement) {
        revenueElement.textContent =
            "₹" + monthlyRevenue.toLocaleString("en-IN");
    }


    // Low stock / needs attention
    const attentionList = document.getElementById("attentionList");

    if (!attentionList) return;

    const lowStockProducts = products.filter(product => product.quantity < 5);

    if (lowStockProducts.length === 0) {

        attentionList.innerHTML = `
            <div class="attention-empty">
                All products are sufficiently stocked.
            </div>
        `;

        return;
    }

    attentionList.innerHTML = "";

    lowStockProducts.forEach(product => {

        attentionList.innerHTML += `
            <div class="attention-item">

                <div>
                    <strong>${product.name}</strong>
                    <small>${product.category}</small>
                </div>

                <span class="stock-badge">
                    ${product.quantity} left
                </span>

            </div>
        `;
    });
}
updateDateTime();
loadProducts();


// ================================
// SEARCH
// ================================

function searchProducts() {

    const search =
        document.getElementById(
            "searchInput"
        ).value
        .toLowerCase()
        .trim();


    if (!search) {

        displayProducts(allProducts);

        return;
    }


    const filtered =
        allProducts.filter(product => {

            return (

                String(product.name)
                    .toLowerCase()
                    .includes(search)

                ||

                String(product.sku)
                    .toLowerCase()
                    .includes(search)

                ||

                String(product.category)
                    .toLowerCase()
                    .includes(search)

                ||

                String(product.supplier)
                    .toLowerCase()
                    .includes(search)

            );

        });


    displayProducts(filtered);
}


// ================================
// ADD PRODUCT MODAL
// ================================

function openModal() {

    document.getElementById(
        "productModal"
    ).style.display = "flex";
}


function closeModal() {

    document.getElementById(
        "productModal"
    ).style.display = "none";
}


window.addEventListener("click", function(event) {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (event.target === modal) {

        closeModal();
    }

});


// ================================
// ADD PRODUCT
// ================================

document.getElementById(
    "productForm"
).addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const product = {

            name:
                document.getElementById(
                    "productName"
                ).value.trim(),

            category:
                document.getElementById(
                    "productCategory"
                ).value.trim(),

            sku:
                document.getElementById(
                    "productSku"
                ).value.trim(),

            supplier:
                document.getElementById(
                    "productSupplier"
                ).value.trim(),

            price:
                Number(
                    document.getElementById(
                        "productPrice"
                    ).value
                ),

            quantity:
                Number(
                    document.getElementById(
                        "productQuantity"
                    ).value
                ),

            description:
                document.getElementById(
                    "productDescription"
                ).value.trim()

        };


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(product)
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to add product"
                );
            }


            alert(
                "Product added successfully!"
            );


            document.getElementById(
                "productForm"
            ).reset();


            closeModal();

            loadProducts();


        } catch (error) {

            console.error(error);

            alert(
                "Failed to add product: " +
                error.message
            );
        }

    }
);


// ================================
// DELETE PRODUCT
// ================================

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Delete failed"
            );
        }


        alert(
            "Product deleted successfully!"
        );


        loadProducts();


    } catch (error) {

        console.error(error);

        alert(
            "Failed to delete product: " +
            error.message
        );
    }
}


// ================================
// EDIT PRODUCT
// ================================

function editProduct(id) {

    const product =
        allProducts.find(
            item => item.id === id
        );


    if (!product) {
        return;
    }


    alert(
        "Edit feature selected for:\n\n" +
        product.name +
        "\nSKU: " +
        product.sku
    );

    // We will add the complete edit modal
    // after confirming your UPDATE API route.
}


// ================================
// HTML SAFETY
// ================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null ? "" : value;

    return div.innerHTML;
}


// ================================
// INITIAL LOAD
// ================================

loadProducts();
// ================================
// EDIT PRODUCT FEATURE
// ================================

function editProduct(id) {

    const product = allProducts.find(p => p.id == id);

    if (!product) {
        alert("Product not found");
        return;
    }

    document.getElementById("editId").value = product.id;
    document.getElementById("editName").value = product.name;
    document.getElementById("editCategory").value = product.category;
    document.getElementById("editSku").value = product.sku;
    document.getElementById("editSupplier").value = product.supplier || "";
    document.getElementById("editPrice").value = product.price;
    document.getElementById("editQuantity").value = product.quantity;
    document.getElementById("editDescription").value = product.description || "";

    document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

// UPDATE PRODUCT
document.getElementById("editForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const id = document.getElementById("editId").value;

    const updatedProduct = {
        name: document.getElementById("editName").value,
        category: document.getElementById("editCategory").value,
        sku: document.getElementById("editSku").value,
        supplier: document.getElementById("editSupplier").value,
        price: document.getElementById("editPrice").value,
        quantity: document.getElementById("editQuantity").value,
        description: document.getElementById("editDescription").value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProduct)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Update failed");
        }

        alert("Product updated successfully!");

        closeEditModal();
        loadProducts();

    } catch (error) {
        alert("Error: " + error.message);
    }
});

// ================================
// SECTION NAVIGATION
// ================================

function showSection(sectionName, event) {

    // Hide all sections
    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.remove("active-section");
    });

    // Show selected section
    document.getElementById(sectionName + "-section").classList.add("active-section");

    // Update active sidebar item
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    event.currentTarget.classList.add("active");
}
updateDateTime();
loadProducts();
// =================================
// ORDERS FUNCTIONS
// =================================

function addOrder() {

    const customer = prompt("Enter customer name:");
    if (!customer) return;

    const amount = prompt("Enter order amount:");
    if (!amount) return;

    const table = document.getElementById("ordersTableBody");

    const orderId = "ORD-" + Math.floor(Math.random() * 9000 + 1000);

    const today = new Date().toLocaleDateString("en-IN");

    table.innerHTML += `
        <tr>
            <td>${orderId}</td>
            <td>${customer}</td>
            <td>${today}</td>
            <td>₹${amount}</td>
            <td><span class="status in-stock">Completed</span></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editOrder(this)">✏️</button>
                    <button class="delete-btn" onclick="deleteOrder(this)">🗑️</button>
                </div>
            </td>
        </tr>
    `;
}

function editOrder(btn) {

    const row = btn.closest("tr");

    // Current values
    const currentCustomer = row.cells[1].innerText;
    const currentAmount = row.cells[3].innerText.replace("₹", "");
    const currentStatus = row.cells[4].innerText.trim();

    // Edit customer
    const customer = prompt("Edit customer name:", currentCustomer);
    if (!customer) return;

    // Edit amount
    const amount = prompt("Edit amount:", currentAmount);
    if (!amount) return;

    // Edit status
    let status = prompt(
        "Enter status (Completed or Pending):",
        currentStatus
    );

    if (!status) return;

    status = status.trim();

    // Validate status
    if (status.toLowerCase() !== "completed" &&
        status.toLowerCase() !== "pending") {

        alert("Please enter only Completed or Pending");
        return;
    }

    // Update values
    row.cells[1].innerText = customer;
    row.cells[3].innerText = "₹" + amount;

    // Update status with proper color
    if (status.toLowerCase() === "completed") {

        row.cells[4].innerHTML =
            '<span class="status in-stock">Completed</span>';

    } else {

        row.cells[4].innerHTML =
            '<span class="status low-stock">Pending</span>';
    }

    alert("Order updated successfully!");
}


// =================================
// SUPPLIERS FUNCTIONS
// =================================

function addSupplier() {

    const name = prompt("Enter supplier name:");
    if (!name) return;

    const email = prompt("Enter supplier email:");
    if (!email) return;

    const phone = prompt("Enter supplier phone:");
    if (!phone) return;

    const products = prompt("Enter supplied products:");
    if (!products) return;

    const table = document.getElementById("suppliersTableBody");

    table.innerHTML += `
        <tr>
            <td>${name}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td>${products}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editSupplier(this)">✏️</button>
                    <button class="delete-btn" onclick="deleteSupplier(this)">🗑️</button>
                </div>
            </td>
        </tr>
    `;
}

function editSupplier(btn) {

    const row = btn.closest("tr");

    const name = prompt("Edit supplier name:", row.cells[0].innerText);
    if (!name) return;

    const email = prompt("Edit email:", row.cells[1].innerText);
    if (!email) return;

    const phone = prompt("Edit phone:", row.cells[2].innerText);
    if (!phone) return;

    const products = prompt("Edit products:", row.cells[3].innerText);
    if (!products) return;

    row.cells[0].innerText = name;
    row.cells[1].innerText = email;
    row.cells[2].innerText = phone;
    row.cells[3].innerText = products;

    alert("Supplier updated successfully!");
}

function deleteSupplier(btn) {

    if (confirm("Delete this supplier?")) {
        btn.closest("tr").remove();
    }
}