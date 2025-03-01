document.addEventListener("DOMContentLoaded", () => {
    console.log("JavaScript is running!");

    const menuBtn = document.querySelector(".menu-btn");
    const dropdown = document.querySelector(".dropdown");

    // Debug: Check if elements exist
    if (!menuBtn || !dropdown) {
        console.error("Menu button or dropdown not found!");
        return;
    }

    // Toggle dropdown menu
    menuBtn.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    // Debug: Check menu button functionality
    menuBtn.addEventListener("click", () => {
        console.log("Menu button clicked!");
    });

    // Dark mode toggle
    const darkModeToggle = document.createElement("button");
    darkModeToggle.innerText = "Dark Mode";
    darkModeToggle.style.position = "fixed";
    darkModeToggle.style.top = "10px";
    darkModeToggle.style.right = "10px";
    darkModeToggle.style.padding = "5px";

    document.body.appendChild(darkModeToggle);

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        console.log("Dark mode toggled!");
    });
});
