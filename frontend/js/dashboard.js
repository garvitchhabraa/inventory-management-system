const API_URL = "http://localhost:5000/api/products";

let allProducts = [];

// ================================
// USER & INITIALIZATION
// ================================

document.addEventListener("DOMContentLoaded", () => {
    initUserInfo();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadProducts();
});

// Calculate user initials
function getUserInitials(name, email) {
    if (name && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    }
    if (email && email.trim()) {
        return email.trim()[0].toUpperCase();
    }
    return "U";
}

// Populate authenticated user info across UI
function initUserInfo() {
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    const displayName = userName || userEmail || "User";
    const displayEmail = userEmail || "user@example.com";
    const initials = getUserInitials(userName, userEmail);

    const sidebarNameElem = document.getElementById("sidebarUserName");
    const userEmailElem = document.getElementById("userEmail");
    const sidebarAvatarElem = document.getElementById("sidebarAvatar");
    const headerAvatarElem = document.getElementById("headerAvatar");
    const welcomeHeadingElem = document.getElementById("welcomeHeading");

    if (sidebarNameElem) sidebarNameElem.textContent = displayName;
    if (userEmailElem) userEmailElem.textContent = displayEmail;
    if (sidebarAvatarElem) sidebarAvatarElem.textContent = initials;
    if (headerAvatarElem) headerAvatarElem.textContent = initials;
    if (welcomeHeadingElem) welcomeHeadingElem.textContent = `Welcome back, ${displayName} 👋`;
}

// ================================
// DATE & TIME
// ================================

function updateDateTime() {
    const now = new Date();
    const currentDateElem = document.getElementById("currentDate");
    const currentTimeElem = document.getElementById("currentTime");

    if (currentDateElem) {
        currentDateElem.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    if (currentTimeElem) {
        currentTimeElem.textContent = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }
}

// ================================
// LOGOUT
// ================================

function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "login.html";
}

// ================================
// LOAD PRODUCTS FROM BACKEND
// ================================

async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        allProducts = data.products || data;
        if (!Array.isArray(allProducts)) {
            allProducts = [];
        }

        populateFilterDropdowns(allProducts);
        applyProductFilters();
        updateStatistics(allProducts);
        updateDashboardInsights(allProducts);

    } catch (error) {
        console.error("Error loading products:", error);

        const tableBody = document.getElementById("productTableBody");
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="color:var(--red);padding:25px;text-align:center;">
                        ❌ Failed to load products from server: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

// ================================
// POPULATE DYNAMIC FILTER DROPDOWNS
// ================================

function populateFilterDropdowns(products) {
    const categorySelect = document.getElementById("categoryFilter");
    const supplierSelect = document.getElementById("supplierFilter");

    if (!categorySelect || !supplierSelect) return;

    const currentCat = categorySelect.value || "All";
    const currentSup = supplierSelect.value || "All";

    const categories = new Set();
    const suppliers = new Set();

    products.forEach(p => {
        if (p.category && p.category.trim() !== "") categories.add(p.category.trim());
        if (p.supplier && p.supplier.trim() !== "") suppliers.add(p.supplier.trim());
    });

    // Populate Categories
    categorySelect.innerHTML = `<option value="All">All Categories</option>`;
    Array.from(categories).sort().forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        if (cat === currentCat) opt.selected = true;
        categorySelect.appendChild(opt);
    });

    // Populate Suppliers
    supplierSelect.innerHTML = `<option value="All">All Suppliers</option>`;
    Array.from(suppliers).sort().forEach(sup => {
        const opt = document.createElement("option");
        opt.value = sup;
        opt.textContent = sup;
        if (sup === currentSup) opt.selected = true;
        supplierSelect.appendChild(opt);
    });
}

// ================================
// PRODUCT SEARCH & DYNAMIC FILTERING
// ================================

function applyProductFilters() {
    const searchInput = document.getElementById("searchInput");
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (clearSearchBtn) {
        clearSearchBtn.style.display = searchVal.length > 0 ? "inline-block" : "none";
    }

    const categoryVal = document.getElementById("categoryFilter")?.value || "All";
    const supplierVal = document.getElementById("supplierFilter")?.value || "All";

    let filtered = allProducts.filter(product => {
        // 1. Search Query (Name, SKU, Category, Supplier)
        if (searchVal) {
            const nameMatch = String(product.name || "").toLowerCase().includes(searchVal);
            const skuMatch = String(product.sku || "").toLowerCase().includes(searchVal);
            const catMatch = String(product.category || "").toLowerCase().includes(searchVal);
            const supMatch = String(product.supplier || "").toLowerCase().includes(searchVal);
            if (!nameMatch && !skuMatch && !catMatch && !supMatch) {
                return false;
            }
        }

        // 2. Category Filter
        if (categoryVal !== "All" && String(product.category).trim() !== categoryVal) {
            return false;
        }

        // 3. Supplier Filter
        if (supplierVal !== "All" && String(product.supplier || "").trim() !== supplierVal) {
            return false;
        }

        return true;
    });

    renderProducts(filtered);
    updateResultsCount(filtered.length, allProducts.length);
}

// Backward compatibility alias for legacy call
function searchProducts() {
    applyProductFilters();
}

function clearSearchInput() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.value = "";
    }
    applyProductFilters();
}

function clearAllFilters() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    const categorySelect = document.getElementById("categoryFilter");
    if (categorySelect) categorySelect.value = "All";

    const supplierSelect = document.getElementById("supplierFilter");
    if (supplierSelect) supplierSelect.value = "All";

    applyProductFilters();
}

function updateResultsCount(count, total) {
    const resultsCountElem = document.getElementById("resultsCount");
    if (resultsCountElem) {
        if (count === total) {
            resultsCountElem.innerHTML = `Showing <strong>${count}</strong> products`;
        } else {
            resultsCountElem.innerHTML = `Showing <strong>${count}</strong> of <strong>${total}</strong> products`;
        }
    }
}

// ================================
// RENDER PRODUCT TABLE
// ================================

function renderProducts(products) {
    const tableBody = document.getElementById("productTableBody");
    if (!tableBody) return;

    // Empty state
    if (!products || products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <h3>No Products Found</h3>
                        <p>No products match your search or filter criteria. Try adjusting your search term or clearing filters.</p>
                        <button class="clear-filters-btn" onclick="clearAllFilters()">Clear Filters</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = "";

    products.forEach(product => {
        const quantity = Number(product.quantity) || 0;
        const price = Number(product.price) || 0;

        let statusClass = "in-stock";
        let statusText = "In Stock";

        if (quantity === 0) {
            statusClass = "out-stock";
            statusText = "Out of Stock";
        } else if (quantity < 10) {
            statusClass = "low-stock";
            statusText = "Low Stock";
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="product-cell">
                    <div class="product-icon">📦</div>
                    <div>
                        <strong class="product-name">${escapeHTML(product.name)}</strong>
                        <div class="product-description">${escapeHTML(product.description || "No description")}</div>
                    </div>
                </div>
            </td>
            <td><strong>${escapeHTML(product.sku || "-")}</strong></td>
            <td>${escapeHTML(product.category || "-")}</td>
            <td>${escapeHTML(product.supplier || "-")}</td>
            <td>₹${price.toLocaleString("en-IN")}</td>
            <td><strong>${quantity}</strong></td>
            <td>
                <span class="status ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editProduct(${product.id})" title="Edit Product">✏️ Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})" title="Delete Product">🗑️ Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Backward compatibility alias for legacy call
function displayProducts(products) {
    renderProducts(products);
}

// ================================
// DASHBOARD STATISTICS & INSIGHTS
// ================================

function updateStatistics(products) {
    let totalStock = 0;
    let inventoryValue = 0;
    let lowStockCount = 0;

    products.forEach(product => {
        const quantity = Number(product.quantity) || 0;
        const price = Number(product.price) || 0;

        totalStock += quantity;
        inventoryValue += quantity * price;

        if (quantity < 10) {
            lowStockCount++;
        }
    });

    const totalProductsElem = document.getElementById("totalProducts");
    const totalStockElem = document.getElementById("totalStock");
    const inventoryValueElem = document.getElementById("inventoryValue");
    const lowStockElem = document.getElementById("lowStock");
    const reportLowStockElem = document.getElementById("reportLowStock");

    if (totalProductsElem) totalProductsElem.textContent = products.length;
    if (totalStockElem) totalStockElem.textContent = totalStock.toLocaleString("en-IN");
    if (inventoryValueElem) inventoryValueElem.textContent = "₹" + inventoryValue.toLocaleString("en-IN");
    if (lowStockElem) lowStockElem.textContent = lowStockCount;
    if (reportLowStockElem) reportLowStockElem.textContent = lowStockCount;
}

function updateDashboardInsights(products) {
    const inventoryValue = products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.quantity || 0)), 0);
    const monthlyRevenue = Math.round(inventoryValue * 0.18);

    const revenueElement = document.getElementById("monthlyRevenue");
    if (revenueElement) {
        revenueElement.textContent = "₹" + monthlyRevenue.toLocaleString("en-IN");
    }

    const attentionList = document.getElementById("attentionList");
    if (!attentionList) return;

    const lowStockProducts = products.filter(p => Number(p.quantity) < 10);

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
                    <strong>${escapeHTML(product.name)}</strong>
                    <small>${escapeHTML(product.category)}</small>
                </div>
                <span class="stock-badge">
                    ${product.quantity} left
                </span>
            </div>
        `;
    });
}

// ================================
// ADD PRODUCT MODAL & SUBMIT
// ================================

function openModal() {
    const modal = document.getElementById("productModal");
    if (modal) modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("productModal");
    if (modal) modal.style.display = "none";
}

window.addEventListener("click", function (event) {
    const modal = document.getElementById("productModal");
    if (event.target === modal) {
        closeModal();
    }
});

const productForm = document.getElementById("productForm");
if (productForm) {
    productForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const product = {
            name: document.getElementById("productName").value.trim(),
            category: document.getElementById("productCategory").value.trim(),
            sku: document.getElementById("productSku").value.trim(),
            supplier: document.getElementById("productSupplier").value.trim(),
            price: Number(document.getElementById("productPrice").value),
            quantity: Number(document.getElementById("productQuantity").value),
            description: document.getElementById("productDescription").value.trim()
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to add product");
            }

            alert("Product added successfully!");
            document.getElementById("productForm").reset();
            closeModal();
            loadProducts();

        } catch (error) {
            console.error("Add Product Error:", error);
            alert("Failed to add product: " + error.message);
        }
    });
}

// ================================
// EDIT PRODUCT MODAL & SUBMIT
// ================================

function editProduct(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) {
        alert("Product not found");
        return;
    }

    const editId = document.getElementById("editId");
    const editName = document.getElementById("editName");
    const editCategory = document.getElementById("editCategory");
    const editSku = document.getElementById("editSku");
    const editSupplier = document.getElementById("editSupplier");
    const editPrice = document.getElementById("editPrice");
    const editQuantity = document.getElementById("editQuantity");
    const editDescription = document.getElementById("editDescription");

    if (editId) editId.value = product.id;
    if (editName) editName.value = product.name;
    if (editCategory) editCategory.value = product.category;
    if (editSku) editSku.value = product.sku;
    if (editSupplier) editSupplier.value = product.supplier || "";
    if (editPrice) editPrice.value = product.price;
    if (editQuantity) editQuantity.value = product.quantity;
    if (editDescription) editDescription.value = product.description || "";

    const editModal = document.getElementById("editModal");
    if (editModal) editModal.style.display = "flex";
}

function closeEditModal() {
    const editModal = document.getElementById("editModal");
    if (editModal) editModal.style.display = "none";
}

const editForm = document.getElementById("editForm");
if (editForm) {
    editForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = document.getElementById("editId").value;
        const updatedProduct = {
            name: document.getElementById("editName").value.trim(),
            category: document.getElementById("editCategory").value.trim(),
            sku: document.getElementById("editSku").value.trim(),
            supplier: document.getElementById("editSupplier").value.trim(),
            price: Number(document.getElementById("editPrice").value),
            quantity: Number(document.getElementById("editQuantity").value),
            description: document.getElementById("editDescription").value.trim()
        };

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
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
            console.error("Update Product Error:", error);
            alert("Failed to update product: " + error.message);
        }
    });
}

// ================================
// DELETE PRODUCT
// ================================

async function deleteProduct(id) {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        alert("Product deleted successfully!");
        loadProducts();

    } catch (error) {
        console.error("Delete Product Error:", error);
        alert("Failed to delete product: " + error.message);
    }
}

// ================================
// SECTION NAVIGATION
// ================================

function showSection(sectionName, event) {
    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.remove("active-section");
    });

    const targetSection = document.getElementById(sectionName + "-section");
    if (targetSection) {
        targetSection.classList.add("active-section");
    }

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }
}

// ================================
// ORDERS FUNCTIONS
// ================================

function addOrder() {
    const customer = prompt("Enter customer name:");
    if (!customer) return;

    const amount = prompt("Enter order amount:");
    if (!amount) return;

    const table = document.getElementById("ordersTableBody");
    if (!table) return;

    const orderId = "ORD-" + Math.floor(Math.random() * 9000 + 1000);
    const today = new Date().toLocaleDateString("en-IN");

    table.innerHTML += `
        <tr>
            <td>${orderId}</td>
            <td>${escapeHTML(customer)}</td>
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
    if (!row) return;

    const currentCustomer = row.cells[1].innerText;
    const currentAmount = row.cells[3].innerText.replace("₹", "");
    const currentStatus = row.cells[4].innerText.trim();

    const customer = prompt("Edit customer name:", currentCustomer);
    if (!customer) return;

    const amount = prompt("Edit amount:", currentAmount);
    if (!amount) return;

    let status = prompt("Enter status (Completed or Pending):", currentStatus);
    if (!status) return;

    status = status.trim();

    if (status.toLowerCase() !== "completed" && status.toLowerCase() !== "pending") {
        alert("Please enter only Completed or Pending");
        return;
    }

    row.cells[1].innerText = customer;
    row.cells[3].innerText = "₹" + amount;

    if (status.toLowerCase() === "completed") {
        row.cells[4].innerHTML = '<span class="status in-stock">Completed</span>';
    } else {
        row.cells[4].innerHTML = '<span class="status low-stock">Pending</span>';
    }

    alert("Order updated successfully!");
}

function deleteOrder(btn) {
    if (confirm("Delete this order?")) {
        btn.closest("tr").remove();
    }
}

// ================================
// SUPPLIERS FUNCTIONS
// ================================

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
    if (!table) return;

    table.innerHTML += `
        <tr>
            <td>${escapeHTML(name)}</td>
            <td>${escapeHTML(email)}</td>
            <td>${escapeHTML(phone)}</td>
            <td>${escapeHTML(products)}</td>
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
    if (!row) return;

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

// ================================
// HTML SAFETY UTILITY
// ================================

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : value;
    return div.innerHTML;
}