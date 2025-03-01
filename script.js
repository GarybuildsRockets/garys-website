document.addEventListener("DOMContentLoaded", () => {
    console.log("JavaScript is running!");

    const menuBtn = document.querySelector(".menu-btn");
    const dropdown = document.querySelector(".dropdown");

    if (!menuBtn || !dropdown) {
        console.error("Menu button or dropdown not found!");
        return;
    }

    // Toggle dropdown menu
    menuBtn.addEventListener("click", () => {
        dropdown.classList.toggle("show-dropdown");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!menuBtn.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove("show-dropdown");
        }
    });

    // Make project cards clickable
    document.querySelectorAll(".project").forEach(project => {
        project.addEventListener("click", () => {
            const projectPage = project.getAttribute("data-url");
            if (projectPage) {
                window.location.href = projectPage;
            }
        });
    });
});
