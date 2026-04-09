// ── Floating Particles ──────────────────────────────────────
const particlesContainer = document.getElementById('particles');

const particleConfig = [
  { size: 8, color: '#fcd34d', left: '10%', top: '60%', duration: '7s', delay: '0s' },
  { size: 5, color: '#93c5fd', left: '25%', top: '75%', duration: '9s', delay: '1s' },
  { size: 6, color: '#f9a8d4', left: '75%', top: '65%', duration: '8s', delay: '2s' },
  { size: 4, color: '#a78bfa', left: '85%', top: '55%', duration: '11s', delay: '0.5s' },
  { size: 7, color: '#6ee7b7', left: '60%', top: '80%', duration: '6s', delay: '3s' },
  { size: 5, color: '#fcd34d', left: '40%', top: '70%', duration: '10s', delay: '1.5s' },
  { size: 9, color: '#f9a8d4', left: '15%', top: '45%', duration: '8s', delay: '4s' },
  { size: 4, color: '#93c5fd', left: '90%', top: '40%', duration: '12s', delay: '2.5s' }
];

if (particlesContainer) {
  particleConfig.forEach(({ size, color, left, top, duration, delay }) => {
    const el = document.createElement('div');
    el.className = 'p';
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.background = color;
    el.style.left = left;
    el.style.top = top;
    el.style.animationDuration = duration;
    el.style.animationDelay = delay;
    particlesContainer.appendChild(el);
  });
}

// ── Elements ────────────────────────────────────────────────
const astronaut = document.getElementById('astronaut');
const astronautBody = document.getElementById('astronaut-body');
const astroBubble = document.getElementById('astro-bubble');
const girlScene = document.getElementById('girl-scene');
const girlBubble = document.getElementById('girl-bubble');
const btn = document.getElementById('start-btn');

// ── State / Timers ──────────────────────────────────────────
let girlTriggered = false;

let greetTimer = null;
let triggerTimer = null;
let hideTimer = null;
let lookTransitionTimer = null;
let girlTypeDelayTimer = null;
let joaoLookAtGirlTimer = null;

let joaoTypingTimer = null;
let girlTypingTimer = null;

let typingToken = 0;

// ── Helpers ─────────────────────────────────────────────────
function clearJoaoTimers() {
  clearTimeout(greetTimer);
  clearTimeout(triggerTimer);
  clearTimeout(hideTimer);
  clearTimeout(lookTransitionTimer);
  clearInterval(joaoTypingTimer);
  if (astronautBody) {
    astronautBody.style.transition = '';
    astronautBody.style.transform = '';
    astronautBody.style.animation = '';
  }
}

function smoothStartLooking(currentToken) {
  if (!astronautBody) return;

  // Capture the current animated rotation so we can freeze there without a jump
  const matrix = new DOMMatrix(getComputedStyle(astronautBody).transform);
  const angle = Math.round(Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI));

  // Freeze at current position and stop the idle animation
  astronautBody.style.transform = `rotate(${angle}deg)`;
  astronautBody.style.animation = 'none';

  // On the next frame, ease smoothly to 0deg (where look-body-scan begins)
  requestAnimationFrame(() => {
    if (currentToken !== typingToken) {
      astronautBody.style.transform = '';
      astronautBody.style.animation = '';
      return;
    }
    astronautBody.style.transition = 'transform 0.45s ease-in-out';
    astronautBody.style.transform = 'rotate(0deg)';

    lookTransitionTimer = setTimeout(() => {
      if (currentToken !== typingToken) {
        astronautBody.style.transition = '';
        astronautBody.style.transform = '';
        astronautBody.style.animation = '';
        return;
      }
      // Clear inline overrides — CSS class animation now takes over at 0deg
      astronautBody.style.transition = '';
      astronautBody.style.transform = '';
      astronautBody.style.animation = '';
      astronautBody.classList.add('looking');
    }, 470);
  });
}

function clearGirlTimers() {
  clearTimeout(girlTypeDelayTimer);
  clearTimeout(joaoLookAtGirlTimer);
  clearInterval(girlTypingTimer);
}

function typeText(element, text, speed = 30, timerRefName = 'joao') {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    if (timerRefName === 'joao') {
      clearInterval(joaoTypingTimer);
    } else {
      clearInterval(girlTypingTimer);
    }

    element.textContent = '';
    let index = 0;

    const intervalId = setInterval(() => {
      element.textContent += text.charAt(index);
      index += 1;

      if (index >= text.length) {
        clearInterval(intervalId);

        if (timerRefName === 'joao') {
          joaoTypingTimer = null;
        } else {
          girlTypingTimer = null;
        }

        resolve();
      }
    }, speed);

    if (timerRefName === 'joao') {
      joaoTypingTimer = intervalId;
    } else {
      girlTypingTimer = intervalId;
    }
  });
}

function resetGirlBubble() {
  if (!girlBubble) return;
  girlBubble.classList.remove('show');
  girlBubble.textContent = '';
  clearInterval(girlTypingTimer);
  girlTypingTimer = null;
}

function restartGirlAnimation() {
  if (!girlScene || !girlBubble || !astronautBody) return;

  girlTriggered = true;

  girlScene.classList.remove('visible');
  void girlScene.offsetWidth;
  girlScene.classList.add('visible');

  resetGirlBubble();
  clearGirlTimers();

  girlTypeDelayTimer = setTimeout(() => {
    if (!girlScene.classList.contains('visible')) return;

    girlBubble.classList.add('show');
    typeText(girlBubble, 'Heeyy... I need some help 🍦', 45, 'girl');
  }, 2000);
}

// ── Hover Logic ─────────────────────────────────────────────
async function onHoverStart() {
  if (!astronaut || !astronautBody || !astroBubble || !girlScene) return;

  clearJoaoTimers();
  typingToken += 1;
  const currentToken = typingToken;

  astroBubble.classList.add('visible');
  astronautBody.classList.remove('looking');

  if (!girlTriggered) {
    astronautBody.classList.remove('look-at-girl');
    girlScene.classList.remove('visible');
    resetGirlBubble();
  }

  await typeText(astroBubble, 'Hi! I am Joao!', 30, 'joao');
if (currentToken !== typingToken) return;

greetTimer = setTimeout(async () => {
  if (currentToken !== typingToken) return;

  // Gently fade out the first bubble before the second message appears
  astroBubble.classList.remove('visible');
  await new Promise(resolve => setTimeout(resolve, 320));
  if (currentToken !== typingToken) return;

  smoothStartLooking(currentToken);

  // Fire Elina as Joao starts asking
  triggerTimer = setTimeout(() => {
    if (currentToken !== typingToken) return;
    restartGirlAnimation();
  }, 0);

  // Fade bubble back in while typing starts
  astroBubble.classList.add('visible');
  await typeText(astroBubble, 'Where is my Bichilin?', 30, 'joao');
}, 680);
}

function onHoverEnd() {
  if (!astronautBody || !astroBubble || !girlScene) return;

  clearJoaoTimers();
  typingToken += 1;

  astronautBody.classList.remove('looking');

  hideTimer = setTimeout(() => {
    astroBubble.classList.remove('visible');

    setTimeout(() => {
      astroBubble.textContent = '';
    }, 300);
  }, 200);
}

// ── First Hover Anywhere On Screen ──────────────────────────
let introStarted = false;

if (astronaut && astronautBody && astroBubble && girlScene) {
  document.addEventListener('mousemove', () => {
    if (introStarted) return;

    introStarted = true;
    onHoverStart();
  }, { once: true });

  girlScene.addEventListener('animationend', (e) => {
    if (e.target !== girlScene) return;
    if (e.animationName !== 'girl-drift-across') return;

    girlScene.classList.remove('visible');
    girlTriggered = false;

    resetGirlBubble();
    clearGirlTimers();

    astronautBody.classList.remove('look-at-girl');
    astronautBody.classList.remove('looking');
  });
}

// ── Begin Journey Button ────────────────────────────────────
if (btn) {
  btn.addEventListener('click', () => {
    document.querySelector('.home').style.display = 'none';
    window.startGame();
  });
}
