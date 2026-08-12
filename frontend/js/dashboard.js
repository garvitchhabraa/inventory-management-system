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

    const tableBody =
        document.getElementById("productTableBody");

    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                Loading products...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "API returned status " + response.status
            );
        }

        const data =
            await response.json();

        console.log("API DATA:", data);


        // IMPORTANT:
        // Your API returns { success:true, products:[...] }

        if (!data.success || !Array.isArray(data.products)) {

            throw new Error(
                "Invalid products response"
            );
        }


        allProducts = data.products;

        displayProducts(allProducts);

        updateStatistics(allProducts);


    } catch (error) {

        console.error(
            "PRODUCT LOADING ERROR:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    ❌ Unable to load products.
                    <br>
                    <small>
                        Make sure backend is running on
                        localhost:5000
                    </small>
                </td>
            </tr>
        `;
    }
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