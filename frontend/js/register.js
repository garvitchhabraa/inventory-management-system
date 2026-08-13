const REGISTER_API = "http://localhost:5000/api/auth/register";

document.getElementById("registerForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const errorBox = document.getElementById("registerError");
    errorBox.textContent = "";

    if (password !== confirmPassword) {
        errorBox.textContent = "Passwords do not match.";
        return;
    }

    try {
        const response = await fetch(REGISTER_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorBox.textContent = data.message || "Registration failed.";
            return;
        }

        alert("Account created successfully! Please login.");
        window.location.href = "login.html";

    } catch (error) {
        errorBox.textContent = "Server error. Make sure backend is running.";
    }
});