const phrases = [
    "Full Stack Developer",
    "Teaching Assistant",
    "DevOps Enthusiast",
    "AI/ML Learner",
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeanimation() {
    const typedText = document.querySelector(".typed-text");
    if (!typedText) return; // avoid null error

    const currentPhrase = phrases[phraseIndex];
    const currentText = currentPhrase.substring(0, charIndex);

    typedText.textContent = currentText;

    if (!isDeleting && charIndex < currentPhrase.length) {
        charIndex++;
        setTimeout(typeanimation, 50);
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(typeanimation, 40);
    } else {
        isDeleting = !isDeleting;
        if (!isDeleting) {
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }
        setTimeout(typeanimation, 1000);
    }
}

export default typeanimation;
