(function () {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    window.addEventListener("DOMContentLoaded", () => {
        updateThemeUI(savedTheme);
    });
})();

function getTheme() {
    return localStorage.getItem("theme") || "light";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    updateThemeUI(theme);
}

function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
}

function updateThemeUI(theme) {
    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
        if (theme === "dark") {
            btn.innerHTML = `<span class="theme-icon">☀️</span> <span class="theme-text">Light Mode</span>`;
            btn.setAttribute("title", "Switch to Light Mode");
            btn.setAttribute("aria-label", "Switch to Light Mode");
        } else {
            btn.innerHTML = `<span class="theme-icon">🌙</span> <span class="theme-text">Dark Mode</span>`;
            btn.setAttribute("title", "Switch to Dark Mode");
            btn.setAttribute("aria-label", "Switch to Dark Mode");
        }
    });
}
