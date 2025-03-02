ddocument.addEventListener("DOMContentLoaded", function() {
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

    // Project Filter System
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
        });
        card.addEventListener("mouseleave", function() {
            this.style.transform = "rotateY(0deg)";
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


