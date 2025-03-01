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
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    // Make entire project card clickable
    document.querySelectorAll(".project").forEach(project => {
        project.addEventListener("click", () => {
            const projectPage = project.getAttribute("data-url");
            if (projectPage) {
                window.location.href = projectPage;
            }
        });
    });
});
