const API_URL = "http://localhost:5000/api/auth/login";


// ===============================
// LOGIN
// ===============================

document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const errorBox =
            document.getElementById("loginError");

        errorBox.textContent = "";


        if (!email || !password) {

            errorBox.textContent =
                "Please enter email and password.";

            return;
        }


        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });


            const data = await response.json();

            console.log("LOGIN RESPONSE:", data);


            if (!response.ok) {

                errorBox.textContent =
                    data.message ||
                    "Invalid email or password.";

                return;
            }


            // Save login information
            localStorage.setItem("isLoggedIn", "true");
            
            const userObj = data.user || {};
            const userEmailVal = userObj.email || email;
            const userNameVal = userObj.name || "";

            localStorage.setItem("userEmail", userEmailVal);
            if (userNameVal) {
                localStorage.setItem("userName", userNameVal);
            } else {
                localStorage.removeItem("userName");
            }

            // Go to dashboard
            window.location.href = "dashboard.html";


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            errorBox.textContent =
                "Server error. Make sure your backend is running.";
        }

    });


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

function togglePassword() {

    const password =
        document.getElementById("password");

    const button =
        document.querySelector(".show-password");


    if (password.type === "password") {

        password.type = "text";

        button.textContent = "Hide";

    } else {

        password.type = "password";

        button.textContent = "Show";
    }
}