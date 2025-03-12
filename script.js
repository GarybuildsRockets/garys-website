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
            const projectName = this.closest(".project-card").getAttribute("data-project");
            window.location.href = projects/${projectName}.html;
        });
    });

document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("RJjkCv0cGDLXCi-70"); // Replace with your EmailJS Public Key

    document.querySelector(".contact-form").addEventListener("submit", function (event) {
        event.preventDefault();

        // Collect form data
        const formData = {
    to_name: "Gary", // Your name
    from_name: document.querySelector("input[name='First Name']").value + " " +
               document.querySelector("input[name='Last Name']").value,
    from_email: document.querySelector("input[name='Email']").value,
    message: document.querySelector("textarea[name='Message']").value
};

        // Send email
        emailjs.send("service_bno468q", "template_2eeil47", formData)
            .then(function () {
                alert("Message sent successfully!");
                document.querySelector(".contact-form").reset();
            })
            .catch(function (error) {
                console.error("Error sending email:", error);
                alert("Failed to send message. Please try again.");
            });
    });
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});



