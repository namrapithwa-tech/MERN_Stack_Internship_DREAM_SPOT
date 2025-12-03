function rightCardAnimation() {
    const cards = document.querySelectorAll('.right-card');
    if (!cards.length) return; // prevent errors if element not found

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 10;
            const rotateY = ((centerX - x) / centerX) * 10;

            card.style.transform = `
                perspective(600px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.03)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `
                perspective(600px)
                rotateX(0deg)
                rotateY(0deg)
                scale(1)
            `;
        });
    });
}

export default rightCardAnimation;
