function myportfolio_animation() {
    const cards = document.querySelectorAll('.portfolio-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            let centerX = rect.width / 2;
            let centerY = rect.height / 2;

            let rotateX = ((y - centerY) / centerY) * 7;
            let rotateY = ((centerX - x) / centerX) * 7;

            card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = "perspective(700px) rotateX(0) rotateY(0) scale(1)";
        });
    });
}

export default myportfolio_animation;