// Mission Valentine - script.js
// Clean, readable, commented. Handles all game logic and UI.

const gameContainer = document.getElementById('game-container');

// Utility: sleep
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Utility: random item
function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Game state
let state = {
  level: 0,
  flowersCollected: 0,
  noTries: 0,
  heartRainActive: false
};

// LEVELS FLOW
function startGame() {
  state.level = 0;
  state.flowersCollected = 0;
  state.noTries = 0;
  state.heartRainActive = false;
  showStartScreen();
}

function showStartScreen() {
  gameContainer.innerHTML = `
    <h1>💘 Mission Valentine</h1>
    <p class="game-text">Bevor ich dir heute eine wichtige Frage stelle…<br>musst du eine kleine Mission erfüllen.<br><br>Keine Sorge.<br>Es wird nicht schwer.<br>Nur ein bisschen… gemein 😌</p>
    <button class="button" id="start-btn">👉 Mission starten</button>
  `;
  document.getElementById('start-btn').onclick = () => showLevel1();
}

// ──────────────── LEVEL 1 – Catch the Heart ❤️ ────────────────
function showLevel1() {
  state.level = 1;
  gameContainer.innerHTML = `
    <h2>Level 1 – Fang das Herz ❤️</h2>
    <p class="game-text">Alles beginnt mit einem Herz.<br><br>Fang es ein…<br>wenn du kannst 😏</p>
    <div id="heart-area" style="position:relative;width:100vw;height:60vh;"></div>
  `;
  spawnHeart();
}

function spawnHeart() {
  const area = document.getElementById('heart-area');
  area.innerHTML = '';
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.textContent = '❤️';
  area.appendChild(heart);

  // Größe des Bereichs bestimmen
  const areaRect = area.getBoundingClientRect();
  const areaW = areaRect.width;
  const areaH = areaRect.height;
  const heartSize = 64; // geschätzt, kann ggf. angepasst werden

  // Initialposition in px
  let x = Math.random() * (areaW - heartSize);
  let y = Math.random() * (areaH - heartSize);
  heart.style.left = x + 'px';
  heart.style.top = y + 'px';

  // Bewegung in px pro Frame (sehr langsam)
  let vx = (Math.random() - 0.5) * 0.3;
  let vy = (Math.random() - 0.5) * 0.3;
  let dodgeCooldown = 0;
  let dodgeTexts = ["Zu langsam 😜", "Fast!", "Haha, nope"];
  let dodgeTextDiv = null;

  function moveHeart() {
    x += vx;
    y += vy;
    // Begrenzungen
    if (x < 0) { x = 0; vx *= -1; }
    if (x > areaW - heartSize) { x = areaW - heartSize; vx *= -1; }
    if (y < 0) { y = 0; vy *= -1; }
    if (y > areaH - heartSize) { y = areaH - heartSize; vy *= -1; }
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
  }

  // Dodge logic
  area.onmousemove = e => {
    if (dodgeCooldown > 0) return;
    const rect = area.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hx = x + heartSize / 2;
    const hy = y + heartSize / 2;
    const dist = Math.hypot(mx - hx, my - hy);
    if (dist < 80) {
      // Dodge (sehr langsam)
      vx = (Math.random() - 0.5) * 1.2;
      vy = (Math.random() - 0.5) * 1.2;
      dodgeCooldown = 20;
      showDodgeText();
    }
  };

  function showDodgeText() {
    if (dodgeTextDiv) dodgeTextDiv.remove();
    dodgeTextDiv = document.createElement('div');
    dodgeTextDiv.textContent = rand(dodgeTexts);
    dodgeTextDiv.style.position = 'absolute';
    dodgeTextDiv.style.left = (x + heartSize + 10) + 'px';
    dodgeTextDiv.style.top = (y - 30) + 'px';
    dodgeTextDiv.style.fontSize = '1.2em';
    dodgeTextDiv.style.color = '#b23a48';
    dodgeTextDiv.style.background = 'rgba(255,255,255,0.8)';
    dodgeTextDiv.style.borderRadius = '1em';
    dodgeTextDiv.style.padding = '0.2em 0.8em';
    dodgeTextDiv.style.pointerEvents = 'none';
    area.appendChild(dodgeTextDiv);
    setTimeout(() => { if (dodgeTextDiv) dodgeTextDiv.remove(); }, 900);
  }

  // Animation loop
  let running = true;
  function loop() {
    if (!running) return;
    moveHeart();
    if (dodgeCooldown > 0) dodgeCooldown--;
    requestAnimationFrame(loop);
  }
  loop();

  // Click to catch
  heart.onclick = () => {
    running = false;
    area.onmousemove = null;
    area.innerHTML = `<p class="game-text">Okay okay…<br>Das war ein guter Anfang 💖<br>Aber wir sind noch nicht fertig.</p><button class="button" id="l1-next">Weiter →</button>`;
    document.getElementById('l1-next').onclick = showLevel2;
  };
}

// ──────────────── LEVEL 2 – Flower Bouquet 🌸 ────────────────
function showLevel2() {
  state.level = 2;
  state.flowersCollected = 0;
  gameContainer.innerHTML = `
    <h2>Level 2 – Blumenstrauß 🌸</h2>
    <p class="game-text">Ein Valentinstag ohne Blumen?<br>Unmöglich.<br><br>Sammle 3 Blumen für den perfekten Strauß 🌸</p>
    <div id="flower-area" style="position:relative;width:100vw;height:60vh;"></div>
    <div id="flower-progress" style="text-align:center;font-size:1.2em;margin-top:1em;">0 / 3</div>
  `;
  spawnFlowers();
}

function spawnFlowers() {
  const area = document.getElementById('flower-area');
  area.innerHTML = '';
  // Nur Blumen sind korrekt, Bäume immer falsch
  const correctFlowers = ["🌷", "🌹", "🌸", "🌻", "💐", "🌼", "🌺", "🥀"];
  const wrongFlowers = ["🌲", "🌳", "🌵", "🍀", "🍁", "🍂"];
  let allFlowers = [];
  // Place 3 correct, 5 falsch (nur Bäume etc.)
  for (let i = 0; i < 3; i++) {
    allFlowers.push({emoji: rand(correctFlowers), correct: true});
  }
  for (let i = 0; i < 5; i++) {
    allFlowers.push({emoji: rand(wrongFlowers), correct: false});
  }
  // Shuffle
  allFlowers = allFlowers.sort(() => Math.random() - 0.5);

  let wrongTexts = ["Das zählt nicht 😅", "Schön… aber nein.", "Fast romantisch."];
  let correctText = "Diese ist perfekt 🌷";

  allFlowers.forEach((f, idx) => {
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.textContent = f.emoji;
    // Random position
    flower.style.left = (Math.random() * 80 + 5) + 'vw';
    flower.style.top = (Math.random() * 40 + 10) + 'vh';
    area.appendChild(flower);
    flower.onclick = () => {
      if (f.correct) {
        flower.classList.add('correct');
        showFlowerFeedback(correctText, flower);
        state.flowersCollected++;
        document.getElementById('flower-progress').textContent = state.flowersCollected + ' / 3';
        flower.style.pointerEvents = 'none';
        if (state.flowersCollected >= 3) {
          setTimeout(() => {
            area.innerHTML = `<p class=\"game-text\">Sieht gut aus…<br>Wirklich gut 💐<br>Jetzt fehlt nur noch eine Sache.</p><button class=\"button\" id=\"l2-next\">Weiter →</button>`;
            document.getElementById('l2-next').onclick = showLevel3;
          }, 800);
        }
      } else {
        flower.classList.add('wrong');
        showFlowerFeedback(rand(wrongTexts), flower);
        setTimeout(() => flower.remove(), 600);
      }
    };
  });
}

function showFlowerFeedback(text, flower) {
  const fb = document.createElement('div');
  fb.textContent = text;
  fb.style.position = 'absolute';
  fb.style.left = (flower.offsetLeft + 30) + 'px';
  fb.style.top = (flower.offsetTop - 20) + 'px';
  fb.style.fontSize = '1em';
  fb.style.color = '#b23a48';
  fb.style.background = 'rgba(255,255,255,0.9)';
  fb.style.borderRadius = '1em';
  fb.style.padding = '0.2em 0.8em';
  fb.style.pointerEvents = 'none';
  flower.parentElement.appendChild(fb);
  setTimeout(() => fb.remove(), 900);
}

// ──────────────── LEVEL 3 – Save the Chocolate Heart 🍫 ────────────────
function showLevel3() {
  state.level = 3;
  gameContainer.innerHTML = `
    <h2>Level 3 – Rette das Schokoherz 🍫</h2>
    <p class="game-text">Schokolade gehört einfach dazu.<br><br>Aber Vorsicht…<br>die Schokoherzen schmelzen 🍫<br><br>Rette eins!</p>
    <div id="choco-area" style="position:relative;width:100vw;height:60vh;"></div>
  `;
  spawnChocoHearts();
}

function spawnChocoHearts() {
  const area = document.getElementById('choco-area');
  area.innerHTML = '';
  let hearts = [];
  let urgencyTexts = ["Beeil dich 😳", "Nicht dieses!", "Oh oh…"];
  let fading = false;
  // Place 4-6 hearts
  let n = Math.floor(Math.random() * 3) + 4;
  for (let i = 0; i < n; i++) {
    const ch = document.createElement('div');
    ch.className = 'choco-heart';
    ch.textContent = '🍫❤️';
    ch.style.left = (Math.random() * 80 + 5) + 'vw';
    ch.style.top = (Math.random() * 40 + 10) + 'vh';
    area.appendChild(ch);
    hearts.push(ch);
  }
  // Nach kurzer Zeit alle bis auf eine Schokolade verschwinden lassen
  setTimeout(() => {
    if (fading) return;
    // Zufällig ein Herz auswählen, das bleibt
    const idx = Math.floor(Math.random() * hearts.length);
    hearts.forEach((h, i) => {
      if (i !== idx) {
        h.classList.add('fading');
        h.style.pointerEvents = 'none';
        setTimeout(() => h.remove(), 700);
      } else {
        // Nur das übrig gebliebene Herz ist klickbar
        h.onclick = () => {
          if (fading) return;
          fading = true;
          h.classList.add('correct');
          area.innerHTML = `<p class=\"game-text\">Gute Wahl 🍫❤️<br>Jetzt ist alles bereit.</p><button class=\"button\" id=\"l3-next\">Letzte Aufgabe →</button>`;
          document.getElementById('l3-next').onclick = showFinal;
        };
      }
    });
  }, 1200);
}

function showChocoFeedback(text, heart) {
  const fb = document.createElement('div');
  fb.textContent = text;
  fb.style.position = 'absolute';
  fb.style.left = (heart.offsetLeft + 30) + 'px';
  fb.style.top = (heart.offsetTop - 20) + 'px';
  fb.style.fontSize = '1em';
  fb.style.color = '#a23e48';
  fb.style.background = 'rgba(255,255,255,0.9)';
  fb.style.borderRadius = '1em';
  fb.style.padding = '0.2em 0.8em';
  fb.style.pointerEvents = 'none';
  heart.parentElement.appendChild(fb);
  setTimeout(() => fb.remove(), 900);
}

// ──────────────── FINAL – Valentine Question 💘 ────────────────
function showFinal() {
  state.level = 4;
  state.noTries = 0;
  gameContainer.innerHTML = `
    <div class="valentine-final">
      <h2>Finale – Die Frage 💘</h2>
      <p class="game-text">Okay.<br><br>Du hast alles gesammelt:<br>Ein Herz.<br>Blumen.<br>Schokolade.<br><br>Es fehlt nur noch eins…</p>
      <h3>Will you be my Valentine?</h3>
      <div class="valentine-buttons" style="position:relative;height:120px;min-width:320px;">
        <button class="valentine-btn yes" id="yes-btn">YES 💖</button>
        <button class="valentine-btn no" id="no-btn" style="left:0;top:0;">NO 💔</button>
      </div>
      <div id="no-feedback" style="margin-top:1.5em;font-size:1.1em;color:#b23a48;"></div>
    </div>
  `;
  setupValentineButtons();
}

function setupValentineButtons() {
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  const feedback = document.getElementById('no-feedback');
  let noTexts = [
    "Nice try 😜",
    "Nein ist heute leider ausverkauft",
    "Unreachable",
    "Haha nope"
  ];
  let failTexts = [
    "Ich glaube…<br>wir wissen beide, wie das endet 😅"
  ];
  let tries = 0;
  let lastNoText = '';
  // NO-Button: Physisches Ausweichen über den ganzen Bildschirm
  noBtn.style.position = 'fixed';
  let bw = noBtn.offsetWidth;
  let bh = noBtn.offsetHeight;
  // Startposition: Mitte rechts
  let winW = window.innerWidth;
  let winH = window.innerHeight;
  let nx = winW / 2 + 120;
  let ny = winH / 2 - bh / 2;
  noBtn.style.left = nx + 'px';
  noBtn.style.top = ny + 'px';
  let lastTextSwitch = 0;
  function moveNoBtnAway(mx, my) {
    let now = Date.now();
    // Button-Mitte
    let rect = noBtn.getBoundingClientRect();
    let bx = rect.left + bw/2;
    let by = rect.top + bh/2;
    // Abstand Maus zu Button-Mitte
    let dx = mx - bx;
    let dy = my - by;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 120) {
      // Richtung berechnen (entgegengesetzt zur Maus)
      let angle = Math.atan2(dy, dx);
      let moveDist = 180 - dist; // je näher, desto weiter weg
      let newX = bx - Math.cos(angle) * moveDist;
      let newY = by - Math.sin(angle) * moveDist;
      // Begrenzung im Fenster
      newX = Math.max(0, Math.min(winW - bw, newX - bw/2));
      newY = Math.max(0, Math.min(winH - bh, newY - bh/2));
      noBtn.style.left = newX + 'px';
      noBtn.style.top = newY + 'px';
      // Text wechseln (max. 1x pro Sekunde)
      if (now - lastTextSwitch > 1000) {
        let t;
        do { t = rand(noTexts); } while (t === lastNoText);
        lastNoText = t;
        noBtn.textContent = t;
        lastTextSwitch = now;
        tries++;
        state.noTries = tries;
        if (tries > 4) feedback.innerHTML = failTexts[0];
      }
    }
  }
  // Über das ganze Fenster reagieren
  window.onmousemove = e => {
    moveNoBtnAway(e.clientX, e.clientY);
  };
  // Klick auf NO verhindert
  noBtn.onclick = e => {
    e.preventDefault();
    moveNoBtnAway(e.clientX, e.clientY);
  };
  // YES-Button
  yesBtn.onclick = () => {
    window.onmousemove = null;
    triggerHeartRain();
    showFinalTextWithMail();
  };
}

function triggerHeartRain() {
  if (state.heartRainActive) return;
  state.heartRainActive = true;
  const rain = document.createElement('div');
  rain.className = 'heart-rain';
  document.body.appendChild(rain);
  for (let i = 0; i < 32; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'rain-heart';
      h.textContent = rand(["💖", "❤️", "💕", "💘", "💗"]);
      h.style.left = Math.random() * 98 + 'vw';
      h.style.top = '-5vh';
      h.style.fontSize = (Math.random() * 1.2 + 1.2) + 'em';
      rain.appendChild(h);
      setTimeout(() => h.remove(), 2600);
    }, i * 80);
  }
  setTimeout(() => rain.remove(), 3500);
}

function showFinalTextWithMail() {
  // Zeige sofort "Mail wird verschickt..."
  gameContainer.innerHTML = `
    <div class=\"valentine-final\">
      <h2>YAY 💖</h2>
      <p class=\"game-text\">Beste Entscheidung.<br>Happy Valentine’s Day ❤️<br><br>Die Bestätigungsmail wird verschickt...</p>
    </div>
  `;
  // EmailJS: Mail versenden
  if (typeof emailjs !== 'undefined') {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_me: MAIL_TO_ME,
      to_her: MAIL_TO_HER,
      // weitere Template-Variablen nach Bedarf:
      message: 'Bestätigung: Sie hat JA gedrückt! Jetzt gibt es kein Zurück mehr. Happy Valentine!'
    }).then(function(response) {
      gameContainer.innerHTML = `
        <div class=\"valentine-final\">
          <h2>YAY 💖</h2>
          <p class=\"game-text\">Beste Entscheidung.<br>Happy Valentine’s Day ❤️<br><br><b>Die Bestätigungsmail wurde erfolgreich verschickt!</b></p>
        </div>
      `;
    }, function(error) {
      gameContainer.innerHTML = `
        <div class=\"valentine-final\">
          <h2>YAY 💖</h2>
          <p class=\"game-text\">Beste Entscheidung.<br>Happy Valentine’s Day ❤️<br><br><b style=\"color:red\">Fehler beim Mailversand 😢<br>Bitte informiere mich manuell.</b></p>
        </div>
      `;
    });
  } else {
    gameContainer.innerHTML = `
      <div class=\"valentine-final\">
        <h2>YAY 💖</h2>
        <p class=\"game-text\">Beste Entscheidung.<br>Happy Valentine’s Day ❤️<br><br><b style=\"color:red\">EmailJS konnte nicht geladen werden.</b></p>
      </div>
    `;
  }
}

// === KONFIGURATION: EmailJS ===
// Trage hier deine EmailJS-Daten ein:
const EMAILJS_PUBLIC_KEY = '4kRASkzAJCK2OXw3g'; // z.B. public_xxxxxxxxxxxxxxxxx
const EMAILJS_SERVICE_ID = 'service_aeh0nh6'; // z.B. service_xxxxx
const EMAILJS_TEMPLATE_ID = 'template_3nxs3xb'; // z.B. template_xxxxx
const MAIL_TO_ME = 'colin.voehringer@gmx.de'; // <-- Eigene Adresse
const MAIL_TO_HER = 'IHRE-MAIL@EXAMPLE.COM'; // <-- Ihre Adresse

// ──────────────── INIT ────────────────
document.addEventListener('DOMContentLoaded', function() {
  startGame();
});
