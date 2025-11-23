document.addEventListener("DOMContentLoaded", function () {
    /* ===========================
       TYPEWRITER EFFECT
       =========================== */
    function typeWriterEffect(elementId, text, speed = 75) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let index = 0;
        function type() {
            if (index <= text.length) {
                element.textContent = text.slice(0, index);
                index++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    typeWriterEffect("typewriter", "Hello, I'm Gary Kanyuh", 70);
    typeWriterEffect("aboutTypewriter", "About Me", 80);
    typeWriterEffect("skillsTypewriter", "My Skills", 80);
    typeWriterEffect("projectsTypewriter", "My Projects", 80);
    typeWriterEffect("contactTypewriter", "Contact Me", 80);

    /* ===========================
       SMOOTH SCROLLING
       =========================== */
    const navLinks = document.querySelectorAll("a[href^='#']");
    navLinks.forEach(anchor => {
        anchor.addEventListener("click", function (event) {
            const targetId = this.getAttribute("href").slice(1);
            const target = document.getElementById(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    /* ===========================
       PROJECT FILTERING
       =========================== */
    const filters = document.querySelectorAll(".filter");
    const projects = document.querySelectorAll(".project-card");

    filters.forEach(filter => {
        filter.addEventListener("click", function () {
            const category = this.getAttribute("data-category");

            filters.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");

            projects.forEach(project => {
                if (category === "all" || project.classList.contains(category)) {
                    project.style.display = "flex";
                } else {
                    project.style.display = "none";
                }
            });
        });
    });

    /* ===========================
       PROJECT DETAILS NAVIGATION
       =========================== */
    const detailButtons = document.querySelectorAll(".details-btn");
    detailButtons.forEach(button => {
        button.addEventListener("click", function () {
            const card = this.closest(".project-card");
            if (!card) return;
            const titleEl = card.querySelector(".project-title");
            if (!titleEl) return;

            const title = titleEl.textContent.trim();
            const projectName = title.toLowerCase().replace(/\s+/g, "-");
            window.location.href = `${projectName}.html`;
        });
    });

    /* ===========================
       EMAILJS CONTACT FORM
       =========================== */
    if (window.emailjs) {
        emailjs.init("RJjkCv0cGDLXCi-70"); // keep your existing public key

        const form = document.querySelector(".contact-form");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                const firstName = document.getElementById("firstName")?.value.trim() || "";
                const lastName = document.getElementById("lastName")?.value.trim() || "";
                const email = document.getElementById("email")?.value.trim() || "";
                const message = document.getElementById("message")?.value.trim() || "";

                if (!firstName || !lastName || !email || !message) {
                    alert("Please fill out all fields before sending.");
                    return;
                }

                const formData = {
                    to_name: "Gary",
                    from_name: `${firstName} ${lastName}`,
                    from_email: email,
                    message: message
                };

                emailjs
                    .send("service_bno468q", "template_9bicqod", formData)
                    .then(function () {
                        alert("Message sent successfully!");
                        form.reset();
                    })
                    .catch(function (error) {
                        console.error("Error sending email:", error);
                        alert("Failed to send message. Please try again.");
                    });
            });
        }
    } else {
        console.warn("EmailJS library not found. Contact form will not send emails.");
    }

    /* ===========================
       MOBILE NAV TOGGLE
       =========================== */
    const hamburger = document.querySelector(".hamburger");
    const mobileOverlay = document.querySelector(".mobile-nav-overlay");
    const mobileLinks = document.querySelectorAll(".mobile-nav-links a");
    const body = document.body;

    if (hamburger && mobileOverlay) {
        const toggleNav = () => {
            hamburger.classList.toggle("open");
            mobileOverlay.classList.toggle("active");
            body.style.overflow = mobileOverlay.classList.contains("active") ? "hidden" : "";
        };

        hamburger.addEventListener("click", toggleNav);

        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("open");
                mobileOverlay.classList.remove("active");
                body.style.overflow = "";
            });
        });
    }

    /* ===========================
       FOOTER YEAR
       =========================== */
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});


