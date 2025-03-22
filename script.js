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

    // Project Filter System Fix
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
            this.querySelector(".project-title").style.display = "none";
            this.querySelector(".project-description").style.display = "block";
            this.style.boxShadow = "0 0 15px white";
        });
        card.addEventListener("mouseleave", function() {
            this.querySelector(".project-title").style.display = "block";
            this.querySelector(".project-description").style.display = "none";
            this.style.boxShadow = "none";
        });
    });

    // Navigate to Project Details Page
    const detailButtons = document.querySelectorAll(".details-btn");
    detailButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Use the project title to generate a URL-friendly name
            const title = this.closest(".project-card").querySelector(".project-title").innerText;
            const projectName = title.toLowerCase().replace(/\s+/g, '-');
            window.location.href = `${projectName}.html`;
        });
    });

    // Initialize EmailJS and setup contact form submission
    emailjs.init("RJjkCv0cGDLXCi-70"); // Replace with your EmailJS Public Key

    document.querySelector(".contact-form").addEventListener("submit", function (event) {
        event.preventDefault();

        // Collect form data using placeholder attributes
        const formData = {
            to_name: "Gary", // Your name
            from_name: document.querySelector("input[placeholder='First Name']").value + " " +
                       document.querySelector("input[placeholder='Last Name']").value,
            from_email: document.querySelector("input[placeholder='Email']").value,
            message: document.querySelector("textarea[placeholder='Your Message']").value
        };

        // Send email using EmailJS
        emailjs.send("service_bno468q", "template_grfkhha", formData)
            .then(function () {
                alert("Message sent successfully!");
                document.querySelector(".contact-form").reset();
            })
            .catch(function (error) {
                console.error("Error sending email:", error);
                alert("Failed to send message. Please try again.");
            });
    });
});


