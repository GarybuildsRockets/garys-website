const toggleButton = document.getElementById("dark-mode-toggle");
const body = document.body;

// Apply dark mode if previously enabled
if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    toggleButton.textContent = "☀️ Light Mode";
}

// Toggle dark mode on click
toggleButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        toggleButton.textContent = "☀️ Light Mode";
    } else {
        localStorage.setItem("darkMode", "disabled");
        toggleButton.textContent = "🌙 Dark Mode";
    }
});

