document.addEventListener("DOMContentLoaded", function() {
    // Typewriter Effect
    const text = "Hello, I'm Gary Kanyuh";
    let index = 0;
    function typeWriter() {
        if (index < text.length) {
            document.getElementById("typewriter").innerHTML += text.charAt(index);
            index++;
            setTimeout(typeWriter, 100);
        }
    }
    typeWriter();

    // Navbar Scroll Effect
    window.addEventListener("scroll", function() {
        let navbar = document.getElementById("navbar");
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
});
