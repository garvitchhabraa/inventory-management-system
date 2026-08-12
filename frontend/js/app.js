// REGISTER FORM

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        // Check passwords

        if (password !== confirmPassword) {

            alert("Passwords do not match!");

            return;
        }


        // Temporary test

        alert(
            "Registration form is working!\n\n" +
            "Name: " + name +
            "\nEmail: " + email
        );

    });

}