// script.js
const questionEl = document.getElementById("question");
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const buttonsWrap = document.getElementById("buttons");
const hint = document.getElementById("hint");
const celebration = document.getElementById("celebration");

const messages = [
  "კარგად დაფიქრდი",
  "ცუდად ფიქრობ",
  "ჰე ახლა დათანხმდი",
  "ახლა ატრაკებ მაინც ჩემი ხარ"
];

let tries = 0;
let firstNo = true;

// scaling (YES grows, NO shrinks)
let yesScale = 1;
let noScale = 1;

// keeps "არა" side-by-side at the beginning
let hasPlacedStart = false;

// ---------- helpers ----------
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Place "არა" to the right of "კი" with a big gap (initial state)
function placeButtonsSideBySide() {
  const wrapRect = buttonsWrap.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  const gap = 140; // BIG SPACE so they never touch
  const centerY = (wrapRect.height - noRect.height) / 2;

  // put NO to the right of YES
  // yesBtn is in normal flow, so we position NO based on wrapper center + YES width + gap
  const noX = (wrapRect.width / 2) + (yesRect.width / 2) + gap;

  noBtn.style.left = `${clamp(noX, 0, wrapRect.width - noRect.width)}px`;
  noBtn.style.top = `${clamp(centerY, 0, wrapRect.height - noRect.height)}px`;
  noBtn.style.transform = `scale(${noScale}) rotate(0deg)`;

  hasPlacedStart = true;
}

// Move "არა" randomly inside wrapper, but keep distance from "კი"
function moveNoAwayFromYes() {
  const wrapRect = buttonsWrap.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();

  // YES position relative to wrapper
  const yesLeft = yesRect.left - wrapRect.left;
  const yesTop = yesRect.top - wrapRect.top;

  const padding = 10;
  const maxX = wrapRect.width - noRect.width - padding;
  const maxY = wrapRect.height - noRect.height - padding;

  // "safe zone" around YES so they don't touch
  const safeX = yesRect.width + 90;
  const safeY = yesRect.height + 60;

  let x = padding, y = padding;
  let attempts = 0;

  while (attempts < 80) {
    x = padding + Math.random() * maxX;
    y = padding + Math.random() * maxY;

    const tooCloseX = Math.abs(x - yesLeft) < safeX;
    const tooCloseY = Math.abs(y - yesTop) < safeY;

    if (!(tooCloseX && tooCloseY)) break;
    attempts++;
  }

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  const rotate = (Math.random() * 12) - 6;
  noBtn.style.transform = `scale(${noScale}) rotate(${rotate}deg)`;
}

// Update the question: first question disappears after first NO attempt
function updateQuestionAfterNo() {
  questionEl.textContent = messages[tries % messages.length];
  tries++;
}

// Celebration hearts (runs after YES)
let celebrationInterval = null;

function createHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = "💖";

  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 3 + Math.random() * 3 + "s";
  heart.style.fontSize = 20 + Math.random() * 25 + "px";

  celebration.appendChild(heart);
  setTimeout(() => heart.remove(), 6000);
}

// ---------- main logic ----------
function noAttempt(e) {
  e.preventDefault();

  if (firstNo) {
    firstNo = false;
    tries = 0;
  }

  // question switches to options only
  updateQuestionAfterNo();

  // YES grows
  yesScale += 0.12;
  yesBtn.style.transform = `scale(${yesScale})`;

  // NO shrinks (min 0.35 so it doesn't disappear totally)
  noScale = Math.max(0.35, noScale - 0.08);

  hint.textContent = "😈 მაინც ერთი არჩევანი გაქვს...";

  // move NO away, keeping distance from YES
  moveNoAwayFromYes();
}

// Make NO basically impossible
["mouseenter", "mousemove", "pointerdown", "click"].forEach((evt) => {
  noBtn.addEventListener(evt, noAttempt);
});

// YES click result
yesBtn.addEventListener("click", () => {
  questionEl.textContent = "რათქმაუნდა ეჭვიც არ მეპარებოდა";
  hint.textContent = "";
  buttonsWrap.style.display = "none";

  // start celebration
  if (!celebrationInterval) {
    celebrationInterval = setInterval(createHeart, 200);
  }
});

// Initial: show buttons side-by-side
// Wait a tick so layout is calculated
requestAnimationFrame(() => {
  placeButtonsSideBySide();
});

// If window resizes, re-place start position (only if NO hasn't been chased yet)
window.addEventListener("resize", () => {
  if (hasPlacedStart && firstNo) placeButtonsSideBySide();
});
