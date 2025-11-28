// Luxury Mouse Effect
document.addEventListener('DOMContentLoaded', () => {
    const watchImage = document.querySelector('.floating-watch-image');
    const bannerSection = document.querySelector('.banner-section'); // The area where the effect is active

    if (watchImage && bannerSection) {
        bannerSection.addEventListener('mousemove', (e) => {
            // Get the bounding rectangle of the banner section
            const rect = bannerSection.getBoundingClientRect();

            // Calculate mouse position relative to the banner section
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate the percentage of mouse position within the banner section
            const xPercent = (mouseX / rect.width) - 0.5; // -0.5 to 0.5
            const yPercent = (mouseY / rect.height) - 0.5; // -0.5 to 0.5

            // Adjust these values to control how much the image moves
            const moveStrengthX = 30; // Max pixels to move horizontally
            const moveStrengthY = 20; // Max pixels to move vertically

            // Apply a subtle movement to the watch image
            watchImage.style.transform = `translate(calc(-50% + ${xPercent * moveStrengthX}px), calc(-50% + ${yPercent * moveStrengthY}px))`;
        });

        // Optional: Reset position when mouse leaves the banner section
        bannerSection.addEventListener('mouseleave', () => {
            watchImage.style.transform = 'translate(-50%, -50%)'; // Reset to center
        });
    }
});

// Back to Top Button
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling effect
    });
}

// Optional: Hide/Show the button only when scrolling down past a certain point
document.addEventListener('DOMContentLoaded', function () {
    const backToTopButton = document.getElementById('backToTop');

    window.onscroll = function () {
        if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
            // Show the button when scrolling past 400px (optional, as per original UI it's always there)
            // backToTopButton.style.display = "flex";
        } else {
            // backToTopButton.style.display = "none";
        }
    };
});