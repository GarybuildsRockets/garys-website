document.addEventListener("DOMContentLoaded", function() {
    // Typewriter Effect for Headers
    function typeWriterEffect(elementId, text, speed = 100) {
        let index = 0;
        function type() {
            if (index < text.length) {
                document.getElementById(elementId).innerHTML += text.charAt(index);
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

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById("darkMode");
    darkModeToggle.addEventListener("change", function() {
        document.body.classList.toggle("dark-mode");
    });

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

    // Animated Skill Progress Bars
    const skillBars = document.querySelectorAll(".progress-bar span");
    window.addEventListener("scroll", function() {
        skillBars.forEach(bar => {
            const position = bar.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.5;
            if (position < screenPosition) {
                bar.style.width = bar.getAttribute("style").split(":")[1];
            }
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

