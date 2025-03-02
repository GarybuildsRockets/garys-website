document.addEventListener("DOMContentLoaded", function() {
    // Typewriter Effect for Headers
    function typeWriterEffect(elementId, text, speed = 100) {
        let index = 0;
        function type() {
            if (index < text.length) {
                document.getElementById(elementId).innerHTML = text.substring(0, index + 1);
                index++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    typeWriterEffect("typewriter", "Hello, I'm Gary Kanyuh", 100);
    typeWriterEffect("aboutTypewriter", "About Me", 100);
    typeWriterEffect("skillsTypewriter", "My Skills", 100);
    typeWriterEffect("projectsTypewriter", "My Projects", 100);
    typeWriterEffect("contactTypewriter", "Contact Me", 100);

    // Smooth Scrolling for Navbar Links
    document.querySelectorAll("nav ul li a").forEach(anchor => {
        anchor.addEventListener("click", function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            document.getElementById(targetId).scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    // Project Filter System - Fixing Issue
    const filters = document.querySelectorAll(".filter");
    const projects = document.querySelectorAll(".project-card");

    filters.forEach(filter => {
        filter.addEventListener("click", function() {
            const category = this.getAttribute("data-category");
            projects.forEach(project => {
                if (project.classList.contains(category) || category === "all") {
                    project.style.display = "flex";
                } else {
                    project.style.display = "none";
                }
            });
        });
    });

    // Flip Animation for Project Cards
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach(card => {
        card.addEventListener("mouseenter", function() {
            this.style.transform = "rotateY(180deg)";
            this.style.boxShadow = "0 0 15px white";
        });
        card.addEventListener("mouseleave", function() {
            this.style.transform = "rotateY(0deg)";
            this.style.boxShadow = "none";
        });
    });

    // Navigate to Project Details Page
    const detailButtons = document.querySelectorAll(".details-btn");
    detailButtons.forEach(button => {
        button.addEventListener("click", function() {
            const projectName = this.closest(".project-card").getAttribute("data-project");
            window.location.href = `projects/${projectName}.html`;
        });
    });

    // Contact Form Submission Animation
    const contactForm = document.querySelector(".contact-form");
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();
        alert("Message sent successfully!");
        contactForm.reset();
    });
});




