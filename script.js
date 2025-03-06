document.addEventListener("DOMContentLoaded", function() {
    // Ensure EmailJS is available
    if (typeof emailjs === "undefined") {
        console.error("❌ EmailJS library failed to load. Make sure to include the script in index.html");
        return;
    }

    emailjs.init("RJjkCv0cGDLXCi-70"); // Replace with your actual Public Key

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

    // Smooth Scrolling Fix
    document.querySelectorAll("nav ul li a").forEach(anchor => {
        anchor.addEventListener("click", function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // Project Filter System Fix
    const filters = document.querySelectorAll(".filter");
    const projects = document.querySelectorAll(".project-card");

    filters.forEach(filter => {
        filter.addEventListener("click", function() {
            const category = this.getAttribute("data-category");

            projects.forEach(project => {
                if (category === "all" || project.classList.contains(category)) {
                    project.style.display = "flex";
                } else {
                    project.style.display = "none";
                }
            });

            filters.forEach(f => f.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // EmailJS Contact Form Fix
    document.querySelector(".contact-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get form values
        const firstName = document.querySelector("input:nth-of-type(1)").value;
        const lastName = document.querySelector("input:nth-of-type(2)").value;
        const email = document.querySelector("input:nth-of-type(3)").value;
        const message = document.querySelector("textarea").value;

        if (!firstName || !lastName || !email || !message) {
            alert("Please fill in all fields.");
            return;
        }

        const formData = {
            to_name: "Gary",
            from_name: `${firstName} ${lastName}`,
            message: message
        };

        console.log("🚀 Sending Email with data:", formData);

        emailjs.send("service_bno468q", "template_9bicqod", formData)
            .then(function(response) {
                console.log("✅ Email sent successfully:", response);
                alert("Message sent successfully!");
                document.querySelector(".contact-form").reset();
            })
            .catch(function(error) {
                console.error("❌ Error sending email:", error);
                alert("Failed to send message. Check console for errors.");
            });
    });
});





