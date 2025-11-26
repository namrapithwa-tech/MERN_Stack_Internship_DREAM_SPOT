const phrases = [
  "Full Stack Developer",
  "Teaching Assistant",
  "DevOps Enthusiast",
  "AI/ML Learner",
];

const typedText = document.querySelector(".typed-text");

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
  const currentPhrase = phrases[phraseIndex];
  const currentText = currentPhrase.substring(0, charIndex);

  typedText.textContent = currentText;

  if (!isDeleting && charIndex < currentPhrase.length) {
    charIndex++;
    setTimeout(type, 50);
  } else if (isDeleting && charIndex > 0) {
    charIndex--;
    setTimeout(type, 40);
  } else {
    isDeleting = !isDeleting;
    if (!isDeleting) {
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(type, 1000);
  }
}

type();
