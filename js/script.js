let assistMode = false;


const editorEl = document.getElementById('editor');
const challengePreview = document.getElementById('challengePreview');
const preview = document.getElementById('preview');
const challengeDesc = document.getElementById('challengeDesc');
const levelBadge = document.getElementById('levelBadge');
const hintBox = document.getElementById('hintBox');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const levelNum = document.getElementById('levelNum');
const hintsLeftDisplay = document.getElementById('hintsLeft');
const progressFill = document.getElementById('progressFill');
const feedback = document.getElementById('feedback');
const feedbackTitle = document.getElementById('feedbackTitle');
const feedbackText = document.getElementById('feedbackText');
const comparisonView = document.getElementById('comparisonView');
const achievementsContainer = document.getElementById('achievements');
const levelCounter = document.getElementById('levelCounter');
const timerDisplay = document.getElementById('timerDisplay');
const resultMessage = document.getElementById('resultMessage');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const colorPalette = document.getElementById('colorPalette');
const compareBtn = document.getElementById('compareBtn'); 
const assistToggle = document.getElementById('holo-check');

if (assistToggle) {
  assistToggle.addEventListener('change', () => {
    assistMode = assistToggle.checked;
  });
}



const MAX_HINTS = 3;



// Flag pour la comparaison
let canCompare = false;
let lastCorrectCode = '';

// État du jeu
let gameState = {
  mode: 'css',
  difficulty: 'easy',
  levelIndex: 0,
  score: 0,
  streak: 0,
  hintsLeft: MAX_HINTS,
  totalLevels: 0,
  achievements: [],
  startTime: null
};

// Variables globales
let currentMode = 'css';
let currentDifficulty = 'easy';
let currentLevelIndex = 0;
let score = 0;
let hintsUsed = 0;
let startTime;
let timerInterval;
let gameStarted = false;

// Suivi de la progression (en mémoire uniquement, pas de localStorage)
let progress = {
  css: { easy: 0, medium: 0, hard: 0 },     // nombre de niveaux TERMINÉS
  html: { easy: 0, medium: 0, hard: 0 },
  htmlcss: { easy: 0, medium: 0, hard: 0 }
};

// Système de succès
const achievementsList = [
  { id: 'first_win', icon: '🎉', name: 'Première Victoire', condition: () => score >= 100 },
  { id: 'streak_5', icon: '🔥', name: 'Série de 5', condition: () => gameState.streak >= 5 },
  { id: 'no_hints', icon: '🧠', name: 'Aucun Indice', condition: () => gameState.hintsLeft === MAX_HINTS && currentLevelIndex > 0 },
  { id: 'perfectionist', icon: '💎', name: 'Perfectionniste', condition: () => gameState.perfectMatch }
];


// Levels database
const levels = {
    css: {
      easy: [
        { desc: "Blue square, 100x100px (perfect square)", css: "width:100px; height:100px; background:#1CCAE8;", hint: "Set the width, height, and background color" },
        { desc: "Perfect lime green circle (about 120px diameter)", css: "width:120px; height:120px; background:#91E413; border-radius:50%;", hint: "Use border-radius: 50% for circles" },
        { desc: "Wide red rectangle, around 200px wide and 80px tall", css: "width:200px; height:80px; background:#FF006E;", hint: "Width must be greater than height" },
        { desc: "Turquoise rectangle with rounded corners (150px x 100px, visible radius)", css: "width:150px; height:100px; background:#56D9BA; border-radius:20px;", hint: "border-radius adds rounded corners" },
        { desc: "Small yellow square (100x100px) with a thin, visible border", css: "width:100px; height:100px; background:#FFBE0B; border:4px solid #CCCCCC;", hint: "Add a border property" },
        { desc: "Purple oval, wider (180px) than tall (100px)", css: "width:180px; height:100px; background:#9D4EDD; border-radius:50%;", hint: "Oval = different width/height with border-radius at 50%" },
        { desc: "Tiny cyan circle (around 40px diameter)", css: "width:40px; height:40px; background:#06FFA5; border-radius:50%;", hint: "A small circle with a bright color" },
        { desc: "Orange pill shape (150px wide, 60px tall, fully rounded ends)", css: "width:150px; height:60px; background:#FF6B35; border-radius:30px;", hint: "Pill = height/2 for border-radius" }
      ],
      medium: [
        { desc: "150x150px square with a blue → purple gradient (135° angle)", css: "width:150px; height:150px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);", hint: "Use linear-gradient()" },
        { desc: "Light blue box 120x120px with a strong drop shadow", css: "width:120px; height:120px; background:#1CCAE8; box-shadow:0 10px 30px rgba(0,0,0,0.5);", hint: "box-shadow: x y blur color" },
        { desc: "Green square (100x100px) rotated by 45°", css: "width:100px; height:100px; background:#91E413; transform:rotate(45deg);", hint: "Use transform: rotate()" },
        { desc: "Small pink circle (80px) visually enlarged with scale 1.5", css: "width:80px; height:80px; background:#FF006E; border-radius:50%; transform:scale(1.5);", hint: "transform: scale() increases the size" },
        { desc: "Turquoise box 130x130px semi-transparent (opacity around 0.5)", css: "width:130px; height:130px; background:#56D9BA; opacity:0.5;", hint: "opacity goes from 0 to 1" },
        { desc: "Yellow square 100x100px with a thick pink border and cyan outline offset", css: "width:100px; height:100px; background:#FFBE0B; border:5px solid #FF006E; outline:3px solid #1CCAE8; outline-offset:3px;", hint: "Use both border and outline" },
        { desc: "Purple rectangle (140x90px) slightly skewed to the left", css: "width:140px; height:90px; background:#9D4EDD; transform:skewX(-10deg);", hint: "transform: skewX() tilts horizontally" },
        { desc: "Neon green glowing box (120x120px) with a strong outer glow", css: "width:120px; height:120px; background:#06FFA5; box-shadow:0 0 20px #06FFA5, 0 0 40px #06FFA5;", hint: "Multiple box-shadows create a glow effect" }
      ],
      hard: [
        { desc: "150x150px square with a complex 3-color gradient (blue, purple, pink)", css: "width:150px; height:150px; background:linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%);", hint: "Use multiple color stops in the gradient" },
        { desc: "Small pink circle (100px) with a smooth pulsing animation", css: "width:100px; height:100px; background:#FF006E; border-radius:50%; animation:pulse 2s infinite; @keyframes pulse { 0%, 100% { transform:scale(1); } 50% { transform:scale(1.1); } }", hint: "Define @keyframes and use the animation property" },
        { desc: "Light blue 120x120px square with a 3D perspective rotation", css: "width:120px; height:120px; background:#1CCAE8; transform:perspective(500px) rotateY(25deg) rotateX(25deg);", hint: "Use perspective() combined with rotations" },
        { desc: "Soft neumorphism block 140x140px (20px radius, subtle opposite shadows)", css: "width:140px; height:140px; background:#e0e5ec; border-radius:20px; box-shadow:9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff;", hint: "Soft shadows in opposite directions" },
        { desc: "Green hexagon (around 150x150px) using clip-path polygon", css: "width:150px; height:150px; background:#91E413; clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);", hint: "Use clip-path: polygon()" },
        { desc: "Dark banner (180x100px) with glowing green text (font-size ~24px)", css: "width:180px; height:100px; background:#161330; color:#06FFA5; display:flex; align-items:center; justify-content:center; font-size:24px; text-shadow:0 0 10px #06FFA5; &::before { content:\"LUEUR\"; }", hint: "Use text-shadow and the ::before pseudo-element" }
      ]
    },
    html: {
      easy: [
        { desc: 'Simple button with text "Click me"', html: "<button>Click me</button>", hint: "Use the <button> tag" },
        { desc: 'Heading level 2 with the word "Welcome"', html: "<h2>Welcome</h2>", hint: "Use heading tags like <h1>, <h2>" },
        { desc: "Simple text paragraph", html: "<p>This is a text paragraph.</p>", hint: "Use the <p> tag" },
        { desc: 'Clickable link with empty href', html: '<a href="">Link</a>', hint: "Use the <a> tag with an href attribute" },
        { desc: 'Image with src "image.jpg" and alt text', html: '<img src="image.jpg" alt="Image">', hint: "Use the <img> tag with src" },
        { desc: "Unordered list with two items", html: "<ul><li>Item 1</li><li>Item 2</li></ul>", hint: "Use <ul> and <li> tags" },
        { desc: 'Text input field with placeholder "Type here"', html: '<input type="text" placeholder="Type here">', hint: "Use the <input> tag" },
        { desc: 'Checkbox with label "Accept"', html: '<input type="checkbox"> <label>Accept</label>', hint: 'Use input type="checkbox"' }
      ],
      medium: [
        { desc: 'Form with label "Name:" and a text input', html: "<form><label>Name:</label><input type=\"text\"></form>", hint: "Wrap with <form> and use <label>" },
        { desc: "Text block with one colored word using <span>", html: '<div>Text with a <span style="color:#91E413;">colored</span> word</div>', hint: "Use <div> and <span>" },
        { desc: "Nested list (one parent item with a child list inside)", html: "<ul><li>Parent<ul><li>Child</li></ul></li></ul>", hint: "Nest <ul> inside a <li>" },
        { desc: "Small table with one row and two cells", html: "<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>", hint: "Use <table>, <tr>, <td>" },
        { desc: "Dropdown menu with two visible options", html: "<select><option>Option 1</option><option>Option 2</option></select>", hint: "Use <select> and <option>" },
        { desc: "Multi-line textarea (3 visible rows)", html: '<textarea rows="3">Type here...</textarea>', hint: "Use <textarea> with rows" },
        { desc: "Article with a header and one paragraph of content", html: "<article><header><h3>Title</h3></header><p>Content</p></article>", hint: "Use semantic tags like <article> and <header>" }
      ],
      hard: [
        { desc: "Form with fieldset, legend, required email, and submit button", html: '<form><fieldset><legend>Info</legend><label>Email:</label><input type="email" required><button type="submit">Submit</button></fieldset></form>', hint: "Use fieldset, legend, and the required attribute" },
        { desc: "Navigation bar with a list of anchor links", html: '<nav><ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li></ul></nav>', hint: "Use <nav> with a list of links" },
        { desc: "Div with data attributes (data-user, data-role)", html: '<div data-user="123" data-role="admin">User card</div>', hint: "Add data-* attributes" },
        { desc: "Inline SVG containing a centered circle", html: '<svg width="80" height="80"><circle cx="40" cy="40" r="35" fill="#1CCAE8"/></svg>', hint: "Create an inline SVG with shapes" },
        { desc: "Details block with hidden content revealed on click", html: "<details><summary>Click to expand</summary><p>Hidden content revealed!</p></details>", hint: "Use <details> and <summary>" }
      ]
    },
    htmlcss: {
      easy: [
        { desc: "Styled button with generous padding (12px vertical, 24px horizontal)", html: "<button>Click</button>", css: "button { background:#56D9BA; color:#161330; padding:12px 24px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }", hint: "Style the button with colors and padding" },
        { desc: 'Centered text "Centered" inside a div, font size ~20px', html: "<div>Centered</div>", css: "div { text-align:center; font-size:20px; color:#91E413; }", hint: "Use text-align: center" },
        { desc: "Dark card layout with rounded corners and about 20px inner padding", html: '<div class="card">Card content</div>', css: ".card { background:#1a1a2e; padding:20px; border-radius:10px; color:white; }", hint: "Create a card with padding and border-radius" },
        { desc: "Button with hover effect (10x20px padding, slight scale and color change)", html: "<button>Hover me</button>", css: "button { background:#1CCAE8; color:white; padding:10px 20px; border:none; border-radius:5px; transition:0.3s; } button:hover { background:#91E413; transform:scale(1.05); }", hint: "Add a :hover state with transition" }
      ],
      medium: [
        { desc: "200x150px container centered with Flexbox, green text (~18px) in the middle", html: '<div class="container"><span>Centered</span></div>', css: ".container { display:flex; align-items:center; justify-content:center; width:200px; height:150px; background:#161330; } span { color:#91E413; font-size:18px; }", hint: "Use Flexbox properties" },
        { desc: "2x2 grid (200px wide) with 4 turquoise boxes, spaced with ~10px gap", html: '<div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div></div>', css: ".grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; width:200px; } .grid div { background:#56D9BA; padding:20px; text-align:center; border-radius:5px; }", hint: "Use CSS Grid" },
        { desc: 'Small pink badge with text "New" (light padding and rounded corners)', html: '<span class="badge">New</span>', css: ".badge { background:#FF006E; color:white; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold; display:inline-block; }", hint: "Create a small badge component" },
        { desc: "Gradient button with star icon, 12x20px padding and a shadow effect", html: "<button>⭐ Star</button>", css: "button { background:linear-gradient(135deg, #667eea, #764ba2); color:white; border:none; padding:12px 20px; border-radius:8px; font-size:16px; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.2); }", hint: "Use a gradient background" }
      ],
      hard: [
        { desc: 'Glassmorphism card with 30px padding and rounded corners ("glass" effect)', html: '<div class="glass">Glass effect</div>', css: ".glass { background:rgba(255,255,255,0.1); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.2); border-radius:15px; padding:30px; color:white; box-shadow:0 8px 32px rgba(0,0,0,0.3); }", hint: "Use backdrop-filter and transparency" },
        { desc: "Circular loader (50x50px) with colored top border rotating infinitely", html: '<div class="loader"></div>', css: ".loader { width:50px; height:50px; border:5px solid #333; border-top-color:#1CCAE8; border-radius:50%; animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }", hint: "Create a rotation animation" },
        { desc: "Green button with tooltip above it on hover (centered tooltip)", html: '<button data-tooltip="This is a tooltip">Hover</button>', css: "button { position:relative; background:#91E413; color:#161330; padding:10px 20px; border:none; border-radius:5px; cursor:pointer; } button::after { content:attr(data-tooltip); position:absolute; bottom:120%; left:50%; transform:translateX(-50%); background:#161330; color:white; padding:8px 12px; border-radius:5px; font-size:12px; white-space:nowrap; opacity:0; pointer-events:none; transition:0.3s; } button:hover::after { opacity:1; }", hint: "Use the ::after pseudo-element with attr()" },
        { desc: "Complex card (~250px wide) with gradient header, text body, and full-width footer button", html: '<div class="card"><div class="header">Title</div><div class="body">Content text here</div><div class="footer"><button>Action</button></div></div>', css: ".card { background:#1a1a2e; border-radius:12px; overflow:hidden; width:250px; box-shadow:0 10px 30px rgba(0,0,0,0.5); } .header { background:linear-gradient(135deg, #1CCAE8, #56D9BA); padding:20px; color:white; font-weight:bold; } .body { padding:20px; color:#ccc; } .footer { padding:15px; background:#161330; } .footer button { background:#91E413; color:#161330; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; width:100%; font-weight:bold; }", hint: "Combine multiple styling techniques" }
      ]
    }
  };
  
  

// Pas de stockage persistant : fonctions vides
async function loadProgress() {
  // rien : la progression est en mémoire seulement (réinitialisée au rechargement)
}

async function saveProgress() {
  // rien : pas de localStorage
}

// Initialiser le jeu
async function init() {
  await loadProgress(); // fait rien mais garde la structure
  updateProgressDisplay();
  updateAchievements();
  loadLevel();
}

// Sélection mode (CSS / HTML / HTML+CSS)
function selectMode(mode, btn) {
  currentMode = mode;
  currentDifficulty = 'easy';

  // Boutons de sélection de mode
  document.querySelectorAll('.level-selection button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Mettre Facile comme difficulté par défaut (visuel)
  document.querySelectorAll('.difficulty-btn').forEach(b => {
    if (b.textContent.trim() === 'Facile') {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Reprendre au premier niveau NON terminé pour ce mode + difficulté
  const levelArray = levels[currentMode][currentDifficulty];
  const completed = progress[currentMode][currentDifficulty] || 0; // nb de niveaux terminés
  currentLevelIndex = Math.min(completed, levelArray.length - 1);

  loadLevel();
}

// Changer de difficulté
function setDifficulty(diff, btn) {
  currentDifficulty = diff;

  document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Reprendre au premier niveau NON terminé pour ce mode + difficulté
  const levelArray = levels[currentMode][currentDifficulty];
  const completed = progress[currentMode][currentDifficulty] || 0;
  currentLevelIndex = Math.min(completed, levelArray.length - 1);

  loadLevel();
}

// Chargement d'un niveau
function loadLevel() {
  const levelArray = levels[currentMode][currentDifficulty];
  if (!levelArray || currentLevelIndex >= levelArray.length) {
    showCompletionMessage();
    return;
  }

  const level = levelArray[currentLevelIndex];

  // Réinitialiser indices pour ce niveau
  hintsUsed = 0;
  gameState.hintsLeft = MAX_HINTS;
  hintsLeftDisplay.textContent = MAX_HINTS;

  // Réinitialiser l'UI
  editorEl.value = '';
  resultMessage.textContent = '';
  resultMessage.className = 'result-message';
  hintBox.style.display = 'none';
  hintBox.textContent = '';
  feedback.style.display = 'none';

  // Reset des previews
  challengePreview.innerHTML = '';
  challengePreview.style.cssText = '';
  preview.innerHTML = '';
  preview.style.cssText = '';

  // Comparaison désactivée au début
  comparisonView.style.display = 'none';
  canCompare = false;
  lastCorrectCode = '';
  if (compareBtn) {
    compareBtn.disabled = true;
    compareBtn.style.opacity = '0.6';
    compareBtn.style.cursor = 'not-allowed';
  }

  // Mettre à jour la description
  challengeDesc.textContent = level.desc;

  // Configurer l'aperçu du défi selon le mode
 if (currentMode === 'css') {
  // On nettoie l’ancien style dynamique s’il existe
  let dynStyle = document.getElementById('level-keyframes-style');
  if (dynStyle) dynStyle.remove();

  let css = level.css || '';

  // On cherche un bloc @keyframes (simple version : on prend tout à partir de @keyframes)
  const keyframesIndex = css.indexOf('@keyframes');
  if (keyframesIndex !== -1) {
    const keyframesBlock = css.slice(keyframesIndex).trim();
    css = css.slice(0, keyframesIndex).trim(); // seulement les déclarations

    // On injecte les keyframes dans un <style> global
    dynStyle = document.createElement('style');
    dynStyle.id = 'level-keyframes-style';
    dynStyle.textContent = keyframesBlock;
    document.head.appendChild(dynStyle);
  }

  // On applique les déclarations normales en inline
  challengePreview.style.cssText = css;
}
else {
    const html = level.html || '';
    const css = level.css || '';
  
    // On vide d'abord la cible
    challengePreview.innerHTML = '';
  
    // On crée un iframe pour isoler le CSS attendu
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin');
    iframe.style.width = '100%';
    iframe.style.height = '180px';
    iframe.style.border = 'none';
  
    challengePreview.appendChild(iframe);
  
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; display:flex; align-items:center; justify-content:center; height:100vh; background:transparent; color: white; }
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    doc.close();
  }
  
  

  // Mettre à jour le compteur de niveau
  const totalLevels = levelArray.length;
  levelCounter.textContent = `Level ${currentLevelIndex + 1}/${totalLevels}`;
  levelBadge.textContent = `Level ${currentLevelIndex + 1}`;
  levelNum.textContent = currentLevelIndex + 1;

  // Placeholder éditeur
  if (currentMode === 'css') {
    editorEl.placeholder = 'Write your CSS here...';
  } else if (currentMode === 'html') {
    editorEl.placeholder = 'Write your HTML here...';
    
  } else {
    editorEl.placeholder = 'Write your structure as: <div class="container">...</div>\nWrite your CSS in <style>...</style>';
  }

  // Palette de couleurs dynamique (uniquement couleurs du niveau)
  updateColorPaletteForLevel(level);

  updateProgressDisplay();
  updateLivePreview();
}

// Timer (uniquement après clic sur Start)
function startTimer() {
  clearInterval(timerInterval);
  stopBtn.style.display = 'block';
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

function endGame() {
    if (!gameStarted) return;

    stopBtn.style.display = 'none';
    
  
    gameStarted = false;
    clearInterval(timerInterval);
  
    // On récupère le temps final affiché
    const finalTime = timerDisplay.textContent || '00:00';
  
    // Message de fin avec score + temps
    resultMessage.textContent = `Session ended – Score : ${score} pts | Time : ${finalTime}`;
    resultMessage.className = 'result-message correct';
  
    // On remet le bouton Start cliquable
    startBtn.textContent = 'Restart';
    startBtn.disabled = false;
  }
  



// Sépare le CSS (dans <style>...</style>) et le HTML du reste
function splitHtmlAndCss(code) {
    let htmlPart = code;
    let cssPart = '';
  
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
    const match = code.match(styleRegex);
  
    if (match) {
      cssPart = match[1].trim(); // contenu du <style> ... </style>
      // on enlève le <style> complet de la partie HTML
      htmlPart = (code.slice(0, match.index) + code.slice(match.index + match[0].length)).trim();
    }
  
    return { html: htmlPart, css: cssPart };
  }
  
  
// Aperçu en direct
function updateLivePreview() {
    const level = levels[currentMode][currentDifficulty][currentLevelIndex];
  
    try {
      if (currentMode === 'css') {
        // Mode CSS : ton CSS direct sur la preview
        preview.innerHTML = '';
        preview.style.cssText = editorEl.value;
      } else if (currentMode === 'html') {
        // Mode HTML : on affiche ton HTML tel quel
        preview.style.cssText = '';
        preview.innerHTML = editorEl.value;
      } else {
        // Mode HTML+CSS : le joueur écrit HTML + CSS
        const userCode = editorEl.value.trim();
  
        // On reset la zone de preview
        preview.innerHTML = '';
        preview.style.cssText = '';
  
        if (userCode === '') {
          // Rien tapé → preview vide
          return;
        }
  
        // On récupère html + css du joueur
        const { html, css } = splitHtmlAndCss(userCode);
  
        // On isole tout ça dans un iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute('sandbox', 'allow-same-origin');
        iframe.style.width = '100%';
        iframe.style.height = '180px';
        iframe.style.border = 'none';
  
        preview.appendChild(iframe);
  
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  background: transparent;
                }
                ${css || ''}
              </style>
            </head>
            <body>
              ${html || ''}
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (e) {
      console.error("Error in live preview:", e);
    }
  }
  

  
  

  function checkAnswer() {
    if (!gameStarted) {
      alert('First click on “Start” to begin the game. 🙂');
      return;
    }
  
    const level = levels[currentMode][currentDifficulty][currentLevelIndex];
    const userCode = editorEl.value.trim();
  
    let isCorrect = false;
  
    if (currentMode === 'css') {
      // Mode CSS Only → on compare uniquement les déclarations CSS
      isCorrect = compareCSSFlexible(userCode, level.css);
  
    } else if (currentMode === 'html') {
      // Mode HTML Only → comparaison stricte (comme tu l'avais)
      isCorrect = compareHTML(userCode, level.html);
  
    } else if (currentMode === 'htmlcss') {
      // Mode HTML + CSS → le joueur doit écrire HTML + CSS
      const parts = splitHtmlAndCss(userCode);
      const userHtml = parts.html;
      const userCss = parts.css;
  
      if (!userHtml || !userCss) {
        isCorrect = false;
      } else {
        const okHtml = compareHTMLFlexible(userHtml, level.html);   // souple
        const okCss  = compareCSSFlexible(userCss, level.css);      // déjà souple
        isCorrect = okHtml && okCss;
      }
    }
  
    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  }
  
  

/* ===== COMPARAISON CSS PLUS FLEXIBLE ===== */

function extractDeclarations(css) {
  const map = new Map();
  if (!css) return map;

  // On enlève les @keyframes et autres blocs pour éviter le bruit
  const withoutAt = css.replace(/@keyframes[\s\S]*?{[\s\S]*?}/gi, '');

  const regex = /([a-z-]+)\s*:\s*([^;{}]+);/gi;
  let match;
  while ((match = regex.exec(withoutAt)) !== null) {
    let prop = match[1].trim().toLowerCase();
    let value = match[2].trim().toLowerCase();

    // Normalisation background vs background-color si simple couleur
    const isSimpleColor = value.startsWith('#');
    if (isSimpleColor && (prop === 'background-color' || prop === 'background')) {
      prop = 'background'; // clé unifiée
    }

    map.set(prop, value);
  }
  return map;
}

function compareCSSFlexible(user, expected) {
  if (!user || !expected) return false;

  const userDecl = extractDeclarations(user);
  const expectedDecl = extractDeclarations(expected);

  if (expectedDecl.size === 0) return false;

  // On valide si TOUTES les props attendues sont présentes avec la même valeur
  for (const [prop, val] of expectedDecl.entries()) {
    if (!userDecl.has(prop)) return false;
    if (userDecl.get(prop) !== val) return false;
  }

  return true;
}

/* ===== COMPARAISON HTML ===== */

function compareHTML(user, expected) {
  if (!user || !expected) return false;

  const normalize = (html) => {
    const container = document.createElement('div');
    container.innerHTML = html.trim();
    return container.innerHTML
    .replace(/>\s+</g, '><')
    .trim()
    .toLowerCase();

  };

  return normalize(user) === normalize(expected);
}

function compareHTMLFlexible(user, expected) {
    if (!user || !expected) return false;
  
    const normalize = (html) => {
      return html
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim()
        .toLowerCase();
    };
  
    const u = normalize(user);
    const e = normalize(expected);
  
    // 1) Exactement pareil → ok
    if (u === e) return true;
  
    // 2) L'HTML attendu est contenu dans le code du joueur → ok
    return u.includes(e);
  }
  

  function handleCorrectAnswer() {
    showResult(true);
  

    // base points = comme avant
let points = Math.max(20, 100 - (hintsUsed * 20)); // min 20 pts

// 🎯 Bonus selon la difficulté
if (currentDifficulty === 'medium') {
  points = Math.round(points * 1.3);   // +30%
} else if (currentDifficulty === 'hard') {
  points = Math.round(points * 1.6);   // +60%
}

// 🧠 impact du mode assisté
if (assistMode) {
  // Mode assisté → moins de points
  points = Math.round(points * 0.7); // -30%
}

  
    score += points;
    gameState.score = score;
    gameState.streak++;
    scoreDisplay.textContent = score;
    streakDisplay.textContent = gameState.streak;
  
    // Autoriser la comparaison…
    canCompare = true;
    lastCorrectCode = editorEl.value.trim();
    if (compareBtn) {
      compareBtn.disabled = false;
      compareBtn.style.opacity = '1';
      compareBtn.style.cursor = 'pointer';
    }
  
    progress[currentMode][currentDifficulty] = Math.max(
      progress[currentMode][currentDifficulty],
      currentLevelIndex + 1
    );
    saveProgress();
    updateAchievements();
  
    setTimeout(() => {
      currentLevelIndex++;
      loadLevel();
    }, 1500);
  }
  

function handleIncorrectAnswer() {
  showResult(false);
  gameState.streak = 0;
  streakDisplay.textContent = gameState.streak;
}

function showResult(isCorrect) {
  if (isCorrect) {
    resultMessage.textContent = '✓ Correct ! Bien joué !';
    resultMessage.className = 'result-message correct';
    confetti();
  } else {
    resultMessage.textContent = '✗ Pas tout à fait correct. Réessayez !';
    resultMessage.className = 'result-message incorrect';
  }
}

function getHint() {
  if (!gameStarted) {
    alert('La partie n’a pas commencé. Clique sur "Démarrer" avant d’utiliser un indice.');
    return;
  }

  if (hintsUsed >= MAX_HINTS) {
    alert('Vous avez utilisé tous vos indices !');
    return;
  }

  const level = levels[currentMode][currentDifficulty][currentLevelIndex];
  hintBox.textContent = level.hint;
  hintBox.style.display = 'block';
  hintsUsed++;
  gameState.hintsLeft = MAX_HINTS - hintsUsed;
  hintsLeftDisplay.textContent = gameState.hintsLeft;
}

function resetCode() {
  editorEl.value = '';
  updateLivePreview();
}

function skipLevel() {
  if (!gameStarted) {
    alert('Start the game with “Start” before moving on to the next level.');
    return;
  }

  if (confirm("Pass this level? You won't earn any points.")) {
    currentLevelIndex++;
    loadLevel();
  }
}

function toggleComparison() {
  if (!canCompare) {
    alert('Tu pourras comparer ton code une fois le niveau validé 😉');
    return;
  }

  comparisonView.style.display =
    comparisonView.style.display === 'none' || comparisonView.style.display === ''
      ? 'block'
      : 'none';

  if (comparisonView.style.display === 'block') {
    const level = levels[currentMode][currentDifficulty][currentLevelIndex];
    let expectedCode = '';
    let userCode = lastCorrectCode || editorEl.value.trim();

    if (currentMode === 'css') {
      expectedCode = level.css || '';
    } else if (currentMode === 'html') {
      expectedCode = level.html || '';
    } else {
      expectedCode = level.css || '';
    }

    comparisonView.innerHTML = `
      <h4>Comparaison</h4>
      <div class="comparison-row">
        <div>
          <strong>Attendu :</strong>
          <pre>${expectedCode}</pre>
        </div>
        <div>
          <strong>Ton code :</strong>
          <pre>${userCode || 'Aucun code'}</pre>
        </div>
      </div>
    `;
  }
}

function nextLevel() {
  feedback.style.display = 'none';
  currentLevelIndex++;
  loadLevel();
}

function updateProgressDisplay() {
  const totalLevels = levels[currentMode][currentDifficulty].length;
  const completed = currentLevelIndex;
  const progressPercent = (completed / totalLevels) * 100;
  progressFill.style.width = `${progressPercent}%`;
}

function showCompletionMessage() {
    const modeOrder = ['html', 'htmlcss', 'css'];
    const difficultyOrder = ['easy', 'medium', 'hard'];
  
    const modeIdx = modeOrder.indexOf(currentMode);
    const diffIdx = difficultyOrder.indexOf(currentDifficulty);
  
    // Sécurité : si jamais on tombe sur un mode/diff inconnu → ancien comportement
    if (modeIdx === -1 || diffIdx === -1) {
      resultMessage.textContent = '🎉 Félicitations ! Vous avez terminé tous les niveaux de cette difficulté !';
      resultMessage.className = 'result-message correct';
      confetti();
      setTimeout(() => {
        currentLevelIndex = 0;
        loadLevel();
      }, 4000);
      return;
    }
  
    let nextMode = currentMode;
    let nextDifficulty = null;
  
    // 1) On passe à la difficulté suivante dans le même mode si possible
    if (diffIdx < difficultyOrder.length - 1) {
      nextDifficulty = difficultyOrder[diffIdx + 1];
    } else {
      // 2) Sinon on est en HARD → on passe au mode suivant en EASY
      if (modeIdx < modeOrder.length - 1) {
        nextMode = modeOrder[modeIdx + 1];
        nextDifficulty = difficultyOrder[0];
      } else {
        // 3) Dernier mode + dernière difficulté → tout est fini
        resultMessage.textContent = '🏆 Tu as terminé tous les niveaux de tous les modes ! Boucle complète terminée.';
        resultMessage.className = 'result-message correct';
        confetti();
  
        setTimeout(() => {
          // On remet tout au début de la boucle
          currentMode = modeOrder[0];        // 'html'
          currentDifficulty = difficultyOrder[0]; // 'easy'
          currentLevelIndex = 0;
          loadLevel();
        }, 4000);
        return;
      }
    }
  
    // Message "transition" vers le prochain bloc
    const labelDiff = {
      easy: 'Facile',
      medium: 'Medium',
      hard: 'Hard'
    };
  
    resultMessage.textContent =
      `🎉 GG ! Tu as fini ${currentMode.toUpperCase()} – ${currentDifficulty.toUpperCase()}. ` +
      `Prochain bloc : ${nextMode.toUpperCase()} – ${labelDiff[nextDifficulty]}.`;
    resultMessage.className = 'result-message correct';
    confetti();
  
    setTimeout(() => {
      // On met à jour le mode + la difficulté
      currentMode = nextMode;
      // On utilise ta fonction existante pour gérer l’UI + le niveau à charger
      setDifficulty(nextDifficulty);
  
      // (Optionnel) mise à jour visuelle des boutons de mode si tu en as
      const modeButtons = document.querySelectorAll('.level-selection button');
      modeButtons.forEach(btn => {
        const modeAttr = btn.dataset?.mode || btn.getAttribute('data-mode');
        if (modeAttr) {
          if (modeAttr === currentMode) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        }
      });
    }, 2500);
  }
  

function updateAchievements() {
  achievementsContainer.innerHTML = '';

  achievementsList.forEach(achievement => {
    if (achievement.condition() && !gameState.achievements.includes(achievement.id)) {
      gameState.achievements.push(achievement.id);
      const achievementEl = document.createElement('div');
      achievementEl.className = 'achievement';
      achievementEl.innerHTML = `${achievement.icon} ${achievement.name}`;
      achievementsContainer.appendChild(achievementEl);
    }
  });
}

function confetti() {
  for (let i = 0; i < 50; i++) {
    const confetto = document.createElement('div');
    confetto.className = 'confetti';
    confetto.style.left = Math.random() * 100 + '%';
    confetto.style.animationDelay = Math.random() * 0.5 + 's';
    confetto.style.background = ['#91E413', '#1CCAE8', '#56D9BA', '#FF006E', '#FFBE0B'][Math.floor(Math.random() * 5)];
    document.body.appendChild(confetto);
    setTimeout(() => confetto.remove(), 3000);
  }
}

// --- Gestion des couleurs du niveau ---

function extractHexColors(str) {
  const colors = new Set();
  if (!str) return colors;

  const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;
  let match;
  while ((match = hexRegex.exec(str)) !== null) {
    colors.add(('#' + match[1]).toUpperCase());
  }
  return colors;
}

function updateColorPaletteForLevel(level) {
  if (!colorPalette) return;

  colorPalette.innerHTML = '';

  const allColors = new Set();
  const parts = [level.css, level.html];
  parts.forEach(part => {
    const set = extractHexColors(part || '');
    set.forEach(c => allColors.add(c));
  });

  if (allColors.size === 0) {
    colorPalette.innerHTML = '<span style="opacity:0.6;font-size:0.85rem;">Aucune couleur spécifique pour ce niveau.</span>';
    return;
  }

  allColors.forEach(code => {
    const item = document.createElement('div');
    item.className = 'color-item';
    item.innerHTML = `
      <div class="color-swatch" style="background:${code};"></div>
      <span class="color-code">${code}</span>
      <button class="btn-copy" type="button">Copier</button>
    `;
    const btn = item.querySelector('.btn-copy');
    btn.addEventListener('click', () => copyColor(code, btn));
    colorPalette.appendChild(item);
  });
}

function copyColor(code, btn) {
  if (!navigator.clipboard) {
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  } else {
    navigator.clipboard.writeText(code);
  }

  const oldText = btn.textContent;
  btn.textContent = 'Copié !';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = oldText;
    btn.disabled = false;
  }, 1200);
}

// Start game
function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  score = 0;
  gameState.score = 0;
  gameState.streak = 0;
  scoreDisplay.textContent = '0';
  streakDisplay.textContent = '0';
  startTime = Date.now();
  startTimer();

  startBtn.textContent = 'En cours...';
  startBtn.disabled = true;
}

// Écouteurs d'événements
// Small autocomplete dictionary for CSS (can be extended)
const CSS_SNIPPETS = {
    /* ========== Layout / Display ========== */
    db: 'display:block;',
    di: 'display:inline;',
    dib: 'display:inline-block;',
    df: 'display:flex;',
    dg: 'display:grid;',
    dn: 'display:none;',
    dif: 'display:inline-flex;',
    dig: 'display:inline-grid;',
    dt: 'display:table;',
    dtc: 'display:table-cell;',
    dfx: 'display:flex; align-items:center; justify-content:center;',
    dfcol: 'display:flex; flex-direction:column;',
    dfrow: 'display:flex; flex-direction:row;',

    /* ========== Positioning ========== */
    posa: 'position:absolute;',
    posr: 'position:relative;',
    posf: 'position:fixed;',
    poss: 'position:static;',
    posst: 'position:sticky;',
    top0: 'top:0;',
    top50: 'top:50%;',
    top100: 'top:100%;',
    left0: 'left:0;',
    left50: 'left:50%;',
    left100: 'left:100%;',
    right0: 'right:0;',
    right50: 'right:50%;',
    right100: 'right:100%;',
    bottom0: 'bottom:0;',
    bottom50: 'bottom:50%;',
    bottom100: 'bottom:100%;',
    inset0: 'top:0; right:0; bottom:0; left:0;',
    t0: 'top:0;',
    l0: 'left:0;',
    r0: 'right:0;',
    b0: 'bottom:0;',

    /* ========== Sizing ========== */
    /* Width */
    w: 'width:;',
    w0: 'width:0;',
    w10: 'width:10px;',
    w20: 'width:20px;',
    w25: 'width:25px;',
    w30: 'width:30px;',
    w40: 'width:40px;',
    w50: 'width:50px;',
    w60: 'width:60px;',
    w70: 'width:70px;',
    w80: 'width:80px;',
    w90: 'width:90px;',
    w100: 'width:100px;',
    w120: 'width:120px;',
    w150: 'width:150px;',
    w180: 'width:180px;',
    w200: 'width:200px;',
    w250: 'width:250px;',
    w300: 'width:300px;',
    w350: 'width:350px;',
    w400: 'width:400px;',
    w500: 'width:500px;',
    wfull: 'width:100%;',
    wscreen: 'width:100vw;',
    wauto: 'width:auto;',
    wmin: 'width:min-content;',
    wmax: 'width:max-content;',
    
    /* Height */
    h: 'height:;',
    h0: 'height:0;',
    h10: 'height:10px;',
    h20: 'height:20px;',
    h25: 'height:25px;',
    h30: 'height:30px;',
    h40: 'height:40px;',
    h50: 'height:50px;',
    h60: 'height:60px;',
    h70: 'height:70px;',
    h80: 'height:80px;',
    h90: 'height:90px;',
    h100: 'height:100px;',
    h120: 'height:120px;',
    h150: 'height:150px;',
    h180: 'height:180px;',
    h200: 'height:200px;',
    h250: 'height:250px;',
    h300: 'height:300px;',
    h400: 'height:400px;',
    h500: 'height:500px;',
    hfull: 'height:100%;',
    hscreen: 'height:100vh;',
    hauto: 'height:auto;',
    hmin: 'height:min-content;',
    hmax: 'height:max-content;',

    /* Min/Max */
    minw0: 'min-width:0;',
    minwfull: 'min-width:100%;',
    maxwfull: 'max-width:100%;',
    maxw500: 'max-width:500px;',
    maxw800: 'max-width:800px;',
    maxw1200: 'max-width:1200px;',
    minh0: 'min-height:0;',
    minhfull: 'min-height:100%;',
    maxhfull: 'max-height:100%;',
    maxh500: 'max-height:500px;',

    /* ========== Spacing (margin / padding) ========== */
    /* Margin */
    m:'margin:;',
    m0: 'margin:0;',
    m5: 'margin:5px;',
    m10: 'margin:10px;',
    m15: 'margin:15px;',
    m20: 'margin:20px;',
    m30: 'margin:30px;',
    mauto: 'margin:auto;',
    
    mt0: 'margin-top:0;',
    mt5: 'margin-top:5px;',
    mt10: 'margin-top:10px;',
    mt15: 'margin-top:15px;',
    mt20: 'margin-top:20px;',
    mt30: 'margin-top:30px;',
    
    mb0: 'margin-bottom:0;',
    mb5: 'margin-bottom:5px;',
    mb10: 'margin-bottom:10px;',
    mb15: 'margin-bottom:15px;',
    mb20: 'margin-bottom:20px;',
    mb30: 'margin-bottom:30px;',
    
    ml0: 'margin-left:0;',
    ml5: 'margin-left:5px;',
    ml10: 'margin-left:10px;',
    ml15: 'margin-left:15px;',
    ml20: 'margin-left:20px;',
    ml30: 'margin-left:30px;',
    
    mr0: 'margin-right:0;',
    mr5: 'margin-right:5px;',
    mr10: 'margin-right:10px;',
    mr15: 'margin-right:15px;',
    mr20: 'margin-right:20px;',
    mr30: 'margin-right:30px;',
    
    mx0: 'margin-left:0; margin-right:0;',
    mx5: 'margin-left:5px; margin-right:5px;',
    mx10: 'margin-left:10px; margin-right:10px;',
    mx20: 'margin-left:20px; margin-right:20px;',
    mxauto: 'margin-left:auto; margin-right:auto;',
    
    my0: 'margin-top:0; margin-bottom:0;',
    my5: 'margin-top:5px; margin-bottom:5px;',
    my10: 'margin-top:10px; margin-bottom:10px;',
    my20: 'margin-top:20px; margin-bottom:20px;',

    /* Padding */
    p0: 'padding:0;',
    p5: 'padding:5px;',
    p8: 'padding:8px;',
    p10: 'padding:10px;',
    p12: 'padding:12px;',
    p15: 'padding:15px;',
    p16: 'padding:16px;',
    p20: 'padding:20px;',
    p24: 'padding:24px;',
    p30: 'padding:30px;',
    
    pt0: 'padding-top:0;',
    pt5: 'padding-top:5px;',
    pt10: 'padding-top:10px;',
    pt15: 'padding-top:15px;',
    pt20: 'padding-top:20px;',
    pt30: 'padding-top:30px;',
    
    pb0: 'padding-bottom:0;',
    pb5: 'padding-bottom:5px;',
    pb10: 'padding-bottom:10px;',
    pb15: 'padding-bottom:15px;',
    pb20: 'padding-bottom:20px;',
    pb30: 'padding-bottom:30px;',
    
    pl0: 'padding-left:0;',
    pl5: 'padding-left:5px;',
    pl10: 'padding-left:10px;',
    pl15: 'padding-left:15px;',
    pl20: 'padding-left:20px;',
    pl30: 'padding-left:30px;',
    
    pr0: 'padding-right:0;',
    pr5: 'padding-right:5px;',
    pr10: 'padding-right:10px;',
    pr15: 'padding-right:15px;',
    pr20: 'padding-right:20px;',
    pr30: 'padding-right:30px;',
    
    px0: 'padding-left:0; padding-right:0;',
    px5: 'padding-left:5px; padding-right:5px;',
    px8: 'padding-left:8px; padding-right:8px;',
    px10: 'padding-left:10px; padding-right:10px;',
    px15: 'padding-left:15px; padding-right:15px;',
    px20: 'padding-left:20px; padding-right:20px;',
    px30: 'padding-left:30px; padding-right:30px;',
    
    py0: 'padding-top:0; padding-bottom:0;',
    py5: 'padding-top:5px; padding-bottom:5px;',
    py8: 'padding-top:8px; padding-bottom:8px;',
    py10: 'padding-top:10px; padding-bottom:10px;',
    py15: 'padding-top:15px; padding-bottom:15px;',
    py20: 'padding-top:20px; padding-bottom:20px;',
    py30: 'padding-top:30px; padding-bottom:30px;',

    /* ========== Borders / Radius ========== */
    b0: 'border:none;',
    b1: 'border:1px solid #e5e5e5;',
    b2: 'border:2px solid #e5e5e5;',
    b3: 'border:3px solid #e5e5e5;',
    b1d: 'border:1px solid #333;',
    b2d: 'border:2px solid #333;',
    bwhite: 'border:1px solid #fff;',
    bblack: 'border:1px solid #000;',
    bprimary: 'border:1px solid #1CCAE8;',
    bsecondary: 'border:1px solid #56D9BA;',
    
    bt0: 'border-top:none;',
    bb0: 'border-bottom:none;',
    bl0: 'border-left:none;',
    br0: 'border-right:none;',
    

    bt1: 'border-top:1px solid #e5e5e5;',
    bb1: 'border-bottom:1px solid #e5e5e5;',
    bl1: 'border-left:1px solid #e5e5e5;',
    br1: 'border-right:1px solid #e5e5e5;',

    /* Border Radius */
    br: 'border-radius:;',
    br0: 'border-radius:0;',
    br2: 'border-radius:2px;',
    br4: 'border-radius:4px;',
    br6: 'border-radius:6px;',
    br8: 'border-radius:8px;',
    br10: 'border-radius:10px;',
    br12: 'border-radius:12px;',
    br16: 'border-radius:16px;',
    br20: 'border-radius:20px;',
    br24: 'border-radius:24px;',
    br30: 'border-radius:30px;',
    br50: 'border-radius:50%;',
    brfull: 'border-radius:9999px;',
    
    brtl0: 'border-top-left-radius:0;',
    brtr0: 'border-top-right-radius:0;',
    brbl0: 'border-bottom-left-radius:0;',
    brbr0: 'border-bottom-right-radius:0;',
    
    brtl4: 'border-top-left-radius:4px;',
    brtr4: 'border-top-right-radius:4px;',
    brbl4: 'border-bottom-left-radius:4px;',
    brbr4: 'border-bottom-right-radius:4px;',

    /* ========== Colors (text + background) ========== */
    /* Text Colors */
    cwhite: 'color:#ffffff;',
    cblack: 'color:#000000;',
    cgray: 'color:#888888;',
    cgraylight: 'color:#cccccc;',
    cgraydark: 'color:#333333;',
    cred: 'color:#FF006E;',
    cgreen: 'color:#91E413;',
    ccyan: 'color:#1CCAE8;',
    cyellow: 'color:#FFBE0B;',
    corange: 'color:#FF6B35;',
    cpink: 'color:#FF0080;',
    cpurple: 'color:#8A2BE2;',
    cprimary: 'color:#1CCAE8;',
    csecondary: 'color:#56D9BA;',
    ccurrent: 'color:currentColor;',
    cinherit: 'color:inherit;',
    ctransparent: 'color:transparent;',

    /* Background Colors */
    bgwhite: 'background:#ffffff;',
    bgblack: 'background:#000000;',
    bggray: 'background:#1a1a2e;',
    bggraylight: 'background:#f5f5f5;',
    bggraydark: 'background:#2d2d2d;',
    bgdark: 'background:#161330;',
    bgpanel: 'background:#1a1a2e;',
    bgprimary: 'background:#1CCAE8;',
    bgsecondary: 'background:#56D9BA;',
    bgaccent: 'background:#FF006E;',
    bgyellow: 'background:#FFBE0B;',
    bgglass: 'background:rgba(255,255,255,0.1);',
    bgglassdark: 'background:rgba(0,0,0,0.1);',
    bgtransparent: 'background:transparent;',
    bginherit: 'background:inherit;',
    bgcurrent: 'background:currentColor;',
    bgc: 'background-color:;', 
    bg: 'background:;',
    c: 'color:;',

    /* Opacity */
    op0: 'opacity:0;',
    op25: 'opacity:0.25;',
    op50: 'opacity:0.5;',
    op75: 'opacity:0.75;',
    op100: 'opacity:1;',

    /* ========== Typography ========== */
    /* Font Size */
    fs10: 'font-size:10px;',
    fs12: 'font-size:12px;',
    fs14: 'font-size:14px;',
    fs16: 'font-size:16px;',
    fs18: 'font-size:18px;',
    fs20: 'font-size:20px;',
    fs24: 'font-size:24px;',
    fs28: 'font-size:28px;',
    fs32: 'font-size:32px;',
    fs36: 'font-size:36px;',
    fs40: 'font-size:40px;',
    fs48: 'font-size:48px;',
    fs64: 'font-size:64px;',
    
    /* Font Weight */
    fw100: 'font-weight:100;',
    fw200: 'font-weight:200;',
    fw300: 'font-weight:300;',
    fw400: 'font-weight:400;',
    fw500: 'font-weight:500;',
    fw600: 'font-weight:600;',
    fw700: 'font-weight:700;',
    fw800: 'font-weight:800;',
    fw900: 'font-weight:900;',
    fwb: 'font-weight:bold;',
    fwl: 'font-weight:lighter;',
    fwn: 'font-weight:normal;',

    /* Text Align */
    tcenter: 'text-align:center;',
    tleft: 'text-align:left;',
    tright: 'text-align:right;',
    tjustify: 'text-align:justify;',
    
    /* Text Transform */
    ttup: 'text-transform:uppercase;',
    ttlow: 'text-transform:lowercase;',
    ttcap: 'text-transform:capitalize;',
    ttnone: 'text-transform:none;',
    
    /* Text Decoration */
    tdu: 'text-decoration:underline;',
    tdn: 'text-decoration:none;',
    tdlt: 'text-decoration:line-through;',
    tdo: 'text-decoration:overline;',
    
    /* Line Height */
    lh0: 'line-height:0;',
    lh1: 'line-height:1;',
    lh12: 'line-height:1.2;',
    lh15: 'line-height:1.5;',
    lh18: 'line-height:1.8;',
    lhn: 'line-height:normal;',
    
    /* Letter Spacing */
    ls0: 'letter-spacing:0;',
    ls1: 'letter-spacing:1px;',
    ls2: 'letter-spacing:2px;',
    lsn: 'letter-spacing:normal;',
    
    /* White Space */
    wsnowrap: 'white-space:nowrap;',
    wspre: 'white-space:pre;',
    wsn: 'white-space:normal;',
    wswrap: 'white-space:wrap;',
    
    /* Word Break */
    wbbreak: 'word-break:break-all;',
    wbkeep: 'word-break:keep-all;',
    wbnormal: 'word-break:normal;',

    /* ========== Flexbox helpers ========== */
    jcstart: 'justify-content:flex-start;',
    jcend: 'justify-content:flex-end;',
    jcc: 'justify-content:center;',
    jcsb: 'justify-content:space-between;',
    jcsa: 'justify-content:space-around;',
    jcse: 'justify-content:space-evenly;',
    
    aistart: 'align-items:flex-start;',
    aiend: 'align-items:flex-end;',
    aic: 'align-items:center;',
    aib: 'align-items:baseline;',
    aistretch: 'align-items:stretch;',
    
    asstart: 'align-self:flex-start;',
    asend: 'align-self:flex-end;',
    asc: 'align-self:center;',
    asb: 'align-self:baseline;',
    asstretch: 'align-self:stretch;',
    
    frow: 'flex-direction:row;',
    frowr: 'flex-direction:row-reverse;',
    fcol: 'flex-direction:column;',
    fcolr: 'flex-direction:column-reverse;',
    
    fwrap: 'flex-wrap:wrap;',
    fwrapr: 'flex-wrap:wrap-reverse;',
    fnowrap: 'flex-wrap:nowrap;',
    
    fg0: 'flex-grow:0;',
    fg1: 'flex-grow:1;',
    fs0: 'flex-shrink:0;',
    fs1: 'flex-shrink:1;',
    fbauto: 'flex-basis:auto;',
    fb0: 'flex-basis:0;',
    
    fcenter: 'display:flex; align-items:center; justify-content:center;',
    fcentercol: 'display:flex; flex-direction:column; align-items:center; justify-content:center;',
    
    /* Gap */
    gap0: 'gap:0;',
    gap4: 'gap:4px;',
    gap5: 'gap:5px;',
    gap8: 'gap:8px;',
    gap10: 'gap:10px;',
    gap12: 'gap:12px;',
    gap16: 'gap:16px;',
    gap20: 'gap:20px;',
    gap24: 'gap:24px;',
    gap32: 'gap:32px;',
    
    rowgap10: 'row-gap:10px;',
    colgap10: 'column-gap:10px;',

    /* ========== Grid helpers ========== */
    grid2: 'display:grid; grid-template-columns:1fr 1fr;',
    grid3: 'display:grid; grid-template-columns:1fr 1fr 1fr;',
    grid4: 'display:grid; grid-template-columns:1fr 1fr 1fr 1fr;',
    gridauto: 'display:grid; grid-auto-flow:row;',
    gridautocol: 'display:grid; grid-auto-flow:column;',
    gridminmax: 'display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));',
    
    gtc1: 'grid-template-columns:1fr;',
    gtc2: 'grid-template-columns:1fr 1fr;',
    gtc3: 'grid-template-columns:1fr 1fr 1fr;',
    gtcauto: 'grid-template-columns:auto;',
    gtcminmax: 'grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));',
    
    gtr1: 'grid-template-rows:1fr;',
    gtr2: 'grid-template-rows:1fr 1fr;',
    gtr3: 'grid-template-rows:1fr 1fr 1fr;',
    
    garea: 'grid-template-areas:;',
    gcolstart: 'grid-column-start:;',
    gcolend: 'grid-column-end:;',
    growstart: 'grid-row-start:;',
    growend: 'grid-row-end:;',
    
    gridgap5: 'grid-gap:5px;',
    gridgap10: 'grid-gap:10px;',
    gridgap15: 'grid-gap:15px;',
    gridgap20: 'grid-gap:20px;',
    gapgrid10: 'gap:10px;',

    /* ========== Shadows / Effects ========== */
    shadownone: 'box-shadow:none;',
    shadowsoft: 'box-shadow:0 4px 10px rgba(0,0,0,0.2);',
    shadowmedium: 'box-shadow:0 6px 20px rgba(0,0,0,0.3);',
    shadowstrong: 'box-shadow:0 10px 30px rgba(0,0,0,0.5);',
    shadowinner: 'box-shadow:inset 0 0 10px rgba(0,0,0,0.3);',
    shadowxl: 'box-shadow:0 20px 50px rgba(0,0,0,0.5);',
    
    glowgreen: 'box-shadow:0 0 20px #06FFA5, 0 0 40px #06FFA5;',
    glowcyan: 'box-shadow:0 0 20px #1CCAE8, 0 0 40px #1CCAE8;',
    glowred: 'box-shadow:0 0 20px #FF006E, 0 0 40px #FF006E;',
    glowblue: 'box-shadow:0 0 20px #0066FF, 0 0 40px #0066FF;',
    glowyellow: 'box-shadow:0 0 20px #FFBE0B, 0 0 40px #FFBE0B;',
    
    textshadow: 'text-shadow:0 2px 4px rgba(0,0,0,0.5);',
    textshadowlight: 'text-shadow:0 1px 2px rgba(0,0,0,0.3);',

    /* ========== Background / Gradient ========== */
    bggradbp: 'background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    bggrad3: 'background:linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%);',
    bggradcyan: 'background:linear-gradient(135deg, #1CCAE8, #56D9BA);',
    bggradgreen: 'background:linear-gradient(135deg, #91E413, #06FFA5);',
    bggradred: 'background:linear-gradient(135deg, #FF006E, #FF6B35);',
    bggradpurple: 'background:linear-gradient(135deg, #8A2BE2, #FF0080);',
    bggraddark: 'background:linear-gradient(135deg, #161330, #1a1a2e);',
    
    bggradt: 'background:linear-gradient(transparent, rgba(0,0,0,0.5));',
    bggradb: 'background:linear-gradient(rgba(0,0,0,0.5), transparent);',
    
    bgnr: 'background-repeat:no-repeat;',
    bgr: 'background-repeat:repeat;',
    bgcover: 'background-size:cover;',
    bgcontain: 'background-size:contain;',
    bgcenter: 'background-position:center;',
    bgtop: 'background-position:top;',
    bgbottom: 'background-position:bottom;',
    bgleft: 'background-position:left;',
    bgright: 'background-position:right;',

    /* ========== Transform / Animation ========== */
    scale0: 'transform:scale(0);',
    scale50: 'transform:scale(0.5);',
    scale75: 'transform:scale(0.75);',
    scale100: 'transform:scale(1);',
    scale105: 'transform:scale(1.05);',
    scale110: 'transform:scale(1.1);',
    scale125: 'transform:scale(1.25);',
    scale150: 'transform:scale(1.5);',
    
    rotate0: 'transform:rotate(0deg);',
    rotate45: 'transform:rotate(45deg);',
    rotate90: 'transform:rotate(90deg);',
    rotate180: 'transform:rotate(180deg);',
    rotate360: 'transform:rotate(360deg);',
    
    translate0: 'transform:translate(0, 0);',
    translatex0: 'transform:translateX(0);',
    translatey0: 'transform:translateY(0);',
    translatex50: 'transform:translateX(50%);',
    translatey50: 'transform:translateY(50%);',
    translate50: 'transform:translate(50%, 50%);',
    
    skewx0: 'transform:skewX(0);',
    skewx10: 'transform:skewX(-10deg);',
    skewy10: 'transform:skewY(-10deg);',
    
    center3d: 'transform:perspective(500px) rotateY(25deg) rotateX(25deg);',
    transform3d: 'transform-style:preserve-3d;',
    
    transall: 'transition:all 0.3s ease;',
    transall5: 'transition:all 0.5s ease;',
    transall1: 'transition:all 0.1s ease;',
    transbg: 'transition:background 0.3s ease;',
    transcol: 'transition:color 0.3s ease;',
    transop: 'transition:opacity 0.3s ease;',
    transtransform: 'transition:transform 0.3s ease;',
    transnone: 'transition:none;',
    
    animspin: 'animation:spin 1s linear infinite;',
    animpulse: 'animation:pulse 2s infinite;',
    animbounce: 'animation:bounce 2s infinite;',
    animping: 'animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;',

    /* ========== Cursor / Misc ========== */
    cursp: 'cursor:pointer;',
    curst: 'cursor:text;',
    cursd: 'cursor:default;',
    cursm: 'cursor:move;',
    cursg: 'cursor:grab;',
    cursng: 'cursor:not-allowed;',
    cursw: 'cursor:wait;',
    cursh: 'cursor:help;',
    curszi: 'cursor:zoom-in;',
    curszo: 'cursor:zoom-out;',
    
    ovhidden: 'overflow:hidden;',
    ovscroll: 'overflow:auto;',
    ovvisible: 'overflow:visible;',
    ovxhidden: 'overflow-x:hidden;',
    ovxscroll: 'overflow-x:auto;',
    ovyhidden: 'overflow-y:hidden;',
    ovyscroll: 'overflow-y:auto;',
    
    usnone: 'user-select:none;',
    ustext: 'user-select:text;',
    usall: 'user-select:all;',
    
    pn: 'pointer-events:none;',
    pa: 'pointer-events:auto;',
    
    vsvisible: 'visibility:visible;',
    vshidden: 'visibility:hidden;',
    
    z0: 'z-index:0;',
    z1: 'z-index:1;',
    z10: 'z-index:10;',
    z20: 'z-index:20;',
    z30: 'z-index:30;',
    z40: 'z-index:40;',
    z50: 'z-index:50;',
    z100: 'z-index:100;',
    zauto: 'z-index:auto;',
    zmax: 'z-index:9999;',

    /* ========== HTML Elements ========== */

    style: '<style></style>',
    script: '<script></script>',
    link: '<link rel="stylesheet" href="">',
    meta: '<meta charset="UTF-8">',
    div: '<div></div>',
    span: '<span></span>',
    p: '<p></p>',
    h1: '<h1></h1>',
    h2: '<h2></h2>',
    h3: '<h3></h3>',
    h4: '<h4></h4>',
    h5: '<h5></h5>',
    h6: '<h6></h6>',
    a: '<a></a>',
    ul: '<ul></ul>',
    ol: '<ol></ol>',
    li: '<li></li>',
    img: '<img src="" alt="">',
    table: '<table></table>',
    tr: '<tr></tr>',
    td: '<td></td>',
    th: '<th></th>',
    form: '<form></form>',
    input: '<input type="text">',
    inputemail: '<input type="email">',
    inputpassword: '<input type="password">',
    inputnumber: '<input type="number">',
    inputdate: '<input type="date">',
    inputfile: '<input type="file">',
    inputcheckbox: '<input type="checkbox">',
    inputradio: '<input type="radio">',
    button: '<button></button>',
    buttonsubmit: '<button type="submit"></button>',
    buttonreset: '<button type="reset"></button>',
    label: '<label></label>',
    textarea: '<textarea></textarea>',
    select: '<select></select>',
    option: '<option></option>',
    nav: '<nav></nav>',
    header: '<header></header>',
    footer: '<footer></footer>',
    section: '<section></section>',
    article: '<article></article>',
    aside: '<aside></aside>',
    main: '<main></main>',
    figure: '<figure></figure>',
    figcaption: '<figcaption></figcaption>',
    blockquote: '<blockquote></blockquote>',
    pre: '<pre></pre>',
    code: '<code></code>',
    abbr: '<abbr></abbr>',
    strong: '<strong></strong>',
    em: '<em></em>',
    mark: '<mark></mark>',
    small: '<small></small>',
    del: '<del></del>',
    ins: '<ins></ins>',
    sub: '<sub></sub>',
    sup: '<sup></sup>',
    time: '<time></time>',
    progress: '<progress></progress>',
    meter: '<meter></meter>',
    output: '<output></output>',
    canvas: '<canvas></canvas>',
    svg: '<svg></svg>',
    audio: '<audio></audio>',
    video: '<video></video>',
    source: '<source></source>',
    track: '<track></track>',
    embed: '<embed></embed>',
    object: '<object></object>',
    param: '<param></param>',
    details: '<details></details>',
    summary: '<summary></summary>',
    menu: '<menu></menu>',
    dialog: '<dialog></dialog>',
    slot: '<slot></slot>',
    template: '<template></template>',

    /* ========== HTML Attributes ========== */
    class: 'class=""',
    id: 'id=""',
    src: 'src=""',
    href: 'href=""',
    alt: 'alt=""',
    title: 'title=""',
    type: 'type=""',
    value: 'value=""',
    placeholder: 'placeholder=""',
    required: 'required',
    disabled: 'disabled',
    checked: 'checked',
    selected: 'selected',
    readonly: 'readonly',
    multiple: 'multiple',
    autofocus: 'autofocus',
    autocomplete: 'autocomplete=""',
    target: 'target=""',
    rel: 'rel=""',
    for: 'for=""',
    name: 'name=""',
    rows: 'rows=""',
    cols: 'cols=""',
    min: 'min=""',
    max: 'max=""',
    step: 'step=""',
    pattern: 'pattern=""',
    accept: 'accept=""',
    enctype: 'enctype=""',
    method: 'method=""',
    action: 'action=""',
    role: 'role=""',
    arialabel: 'aria-label=""',
    ariahidden: 'aria-hidden="true"',
    data: 'data-=""',
    tabindex: 'tabindex=""',

    /* ========== CSS Variables ========== */
    var: 'var(--)',
    root: ':root { }',
    
    /* ========== Media Queries ========== */
    mqsm: '@media (max-width: 640px) { }',
    mqmd: '@media (max-width: 768px) { }',
    mqlg: '@media (max-width: 1024px) { }',
    mqxl: '@media (max-width: 1280px) { }',
    mqdark: '@media (prefers-color-scheme: dark) { }',
    
    /* ========== Pseudo-classes ========== */
    hover: ':hover { }',
    focus: ':focus { }',
    active: ':active { }',
    visited: ':visited { }',
    firstchild: ':first-child { }',
    lastchild: ':last-child { }',
    nthchild: ':nth-child() { }',
    before: '::before { }',
    after: '::after { }',
    placeholder: '::placeholder { }',
    
    /* ========== CSS Functions ========== */
    calc: 'calc()',
    min: 'min()',
    max: 'max()',
    clamp: 'clamp()',
    rgb: 'rgb()',
    rgba: 'rgba()',
    hsl: 'hsl()',
    hsla: 'hsla()',
    url: 'url()',
    linear: 'linear-gradient()',
    radial: 'radial-gradient()',
    
    /* ========== CSS Units ========== */
    px: 'px',
    rem: 'rem',
    em: 'em',
    percent: '%',
    vw: 'vw',
    vh: 'vh',
    vmin: 'vmin',
    vmax: 'vmax',
    
    /* ========== CSS Important ========== */
    important: '!important',
    
    /* ========== CSS Reset ========== */
    reset: 'margin:0; padding:0; box-sizing:border-box;',
    boxborder: 'box-sizing:border-box;',
    boxcontent: 'box-sizing:content-box;',
    
    /* ========== CSS Filters ========== */
    filterblur: 'filter:blur()',
    filterbright: 'filter:brightness()',
    filtercontrast: 'filter:contrast()',
    filtergrayscale: 'filter:grayscale()',
    filterhue: 'filter:hue-rotate()',
    filtersaturate: 'filter:saturate()',
    filternone: 'filter:none;',
    
    /* ========== CSS Backdrop ========== */
    backdrop: 'backdrop-filter:blur(10px);',
    
    /* ========== CSS Clip-path ========== */
    clipcircle: 'clip-path:circle()',
    cliprect: 'clip-path:rect()',
    clippoly: 'clip-path:polygon()',
    
    /* ========== CSS Mask ========== */
    mask: 'mask-image:;',
    masklinear: 'mask-image:linear-gradient();',
    
    /* ========== CSS Blend ========== */
    blendmultiply: 'mix-blend-mode:multiply;',
    blendscreen: 'mix-blend-mode:screen;',
    blendoverlay: 'mix-blend-mode:overlay;',
    
    /* ========== CSS Scroll ========== */
    scrollsmooth: 'scroll-behavior:smooth;',
    scrollx: 'overflow-x:auto;',
    scrolly: 'overflow-y:auto;',
    
    /* ========== CSS Aspect Ratio ========== */
    aspect169: 'aspect-ratio:16/9;',
    aspect43: 'aspect-ratio:4/3;',
    aspect11: 'aspect-ratio:1/1;',
    aspectauto: 'aspect-ratio:auto;',

    /* ========== CSS Selectors & Combinators ========== */
    selchild: '> ',
    selsibling: '+ ',
    selsiblingall: '~ ',
    selattr: '[]',
    selclass: '.',
    selid: '#',
    selhover: ':hover',
    selfocus: ':focus',
    selactive: ':active',
    selbefore: '::before',
    selafter: '::after',
    selnot: ':not()',
    selnth: ':nth-child()',
    selfirst: ':first-child',
    sellast: ':last-child',
    selonly: ':only-child',

    /* ========== HTML Structure & Multipliers ========== */
    container: '<div class="container"></div>',
    wrapper: '<div class="wrapper"></div>',
    row: '<div class="row"></div>',
    col: '<div class="col"></div>',
    box: '<div class="box"></div>',
    card: '<div class="card"></div>',
    btn: '<button class="btn"></button>',
    inputg: '<div class="input-group"></div>',
    navitem: '<li class="nav-item"></li>',
    navlink: '<a class="nav-link"></a>',
    
    /* Multiplicateurs et sélecteurs avancés */
    star: '*',
    dot: '.',
    hash: '#',
    gt: '>',
    plus: '+',
    tilde: '~',
    bracketl: '[',
    bracketr: ']',
    parenl: '(',
    parenr: ')',
    /* ========== CSS Selectors & Combinators ========== */
    selchild: '> ',
    selsibling: '+ ',
    selsiblingall: '~ ',
    selattr: '[]',
    selclass: '.',
    selid: '#',
    selhover: ':hover',
    selfocus: ':focus',
    selactive: ':active',
    selbefore: '::before',
    selafter: '::after',
    selnot: ':not()',
    selnth: ':nth-child()',
    selfirst: ':first-child',
    sellast: ':last-child',
    selonly: ':only-child',

    /* ========== HTML Structure & Multipliers ========== */
    container: '<div class="container"></div>',
    wrapper: '<div class="wrapper"></div>',
    row: '<div class="row"></div>',
    col: '<div class="col"></div>',
    box: '<div class="box"></div>',
    card: '<div class="card"></div>',
    btn: '<button class="btn"></button>',
    inputg: '<div class="input-group"></div>',
    navitem: '<li class="nav-item"></li>',
    navlink: '<a class="nav-link"></a>',
    
    /* Multiplicateurs et sélecteurs avancés */
    star: '*',
    dot: '.',
    hash: '#',
    gt: '>',
    plus: '+',
    tilde: '~',
    bracketl: '[',
    bracketr: ']',
    parenl: '(',
    parenr: ')',
    bracel: '{',
    bracer: '}',
    
    /* ========== Emmet-like Abbreviations ========== */
    /* Multiplicateurs */
    mult1: '*1',
    mult2: '*2', 
    mult3: '*3',
    mult4: '*4',
    mult5: '*5',
    mult6: '*6',
    mult10: '*10',
    
    /* Numérotation */
    num1: '$1',
    num2: '$2',
    num3: '$3',
    num4: '$4',
    num5: '$5',
    
    /* Structures courantes */
    nav: 'nav>ul>li*3>a',
    formgroup: 'div.form-group>label+input',
    grid3: 'div.grid>div.col*3',
    cardgrid: 'div.card*3>img+h3+p',
    listgroup: 'ul.list-group>li.list-group-item*5',
    
    /* ========== CSS Specificity & Important ========== */
    important: '!important',
    imp: '!important',
    
    /* ========== CSS Custom Properties ========== */
    prop: '--',
    var: 'var(--)',
    root: ':root',
    
    /* ========== CSS Functions Extended ========== */
    attr: 'attr()',
    counter: 'counter()',
    counters: 'counters()',
    env: 'env()',
    fitcontent: 'fit-content()',
    minmax: 'minmax()',
    repeat: 'repeat()',
    
    /* ========== CSS Transforms Extended ========== */
    matrix: 'matrix()',
    matrix3d: 'matrix3d()',
    rotate3d: 'rotate3d()',
    rotatex: 'rotateX()',
    rotatey: 'rotateY()',
    rotatez: 'rotateZ()',
    scale3d: 'scale3d()',
    scalex: 'scaleX()',
    scaley: 'scaleY()',
    scalez: 'scaleZ()',
    translate3d: 'translate3d()',
    translatez: 'translateZ()',
    
    /* ========== CSS Animations Extended ========== */
    animname: 'animation-name:;',
    animdur: 'animation-duration:;',
    animdelay: 'animation-delay:;',
    animiter: 'animation-iteration-count:;',
    animdir: 'animation-direction:;',
    animfill: 'animation-fill-mode:;',
    animplay: 'animation-play-state:;',
    
    /* ========== CSS Transitions Extended ========== */
    transprop: 'transition-property:;',
    transdur: 'transition-duration:;',
    transdelay: 'transition-delay:;',
    transtiming: 'transition-timing-function:;',
    
    /* ========== CSS Flexbox Extended ========== */
    order: 'order:;',
    flex: 'flex:;',
    flexgrow: 'flex-grow:;',
    flexshrink: 'flex-shrink:;',
    flexbasis: 'flex-basis:;',
    aligncontent: 'align-content:;',
    
    /* ========== CSS Grid Extended ========== */
    gridcol: 'grid-column:;',
    gridrow: 'grid-row:;',
    gridarea: 'grid-area:;',
    justifyitems: 'justify-items:;',
    alignself: 'align-self:;',
    justifyself: 'justify-self:;',
    gridautocol: 'grid-auto-columns:;',
    gridautorow: 'grid-auto-rows:;',
    gridautoflow: 'grid-auto-flow:;',
    
    /* ========== CSS Background Extended ========== */
    bgorigin: 'background-origin:;',
    bgclip: 'background-clip:;',
    bgattach: 'background-attachment:;',
    bglayer: 'background-image:;',
    
    /* ========== CSS Border Extended ========== */
    borderstyle: 'border-style:;',
    bordercolor: 'border-color:;',
    borderwidth: 'border-width:;',
    outline: 'outline:;',
    outlinestyle: 'outline-style:;',
    outlinecolor: 'outline-color:;',
    outlinewidth: 'outline-width:;',
    outlineoffset: 'outline-offset:;',
    
    /* ========== CSS List & Counters ========== */
    liststyle: 'list-style:;',
    listtype: 'list-style-type:;',
    listpos: 'list-style-position:;',
    listimage: 'list-style-image:;',
    counterreset: 'counter-reset:;',
    counterinc: 'counter-increment:;',
    
    /* ========== CSS Table ========== */
    tablelayout: 'table-layout:;',
    bordercollapse: 'border-collapse:;',
    borderspacing: 'border-spacing:;',
    captionside: 'caption-side:;',
    emptycells: 'empty-cells:;',
    
    /* ========== CSS Content & Quotes ========== */
    content: 'content:;',
    quotes: 'quotes:;',
    
    /* ========== CSS Generated Content ========== */
    pagebreak: 'page-break-:;',
    orphans: 'orphans:;',
    widows: 'widows:;',
    
    /* ========== CSS Writing Modes ========== */
    writingmode: 'writing-mode:;',
    textorient: 'text-orientation:;',
    direction: 'direction:;',
    unicodebidi: 'unicode-bidi:;',
    
    /* ========== CSS Logical Properties ========== */
    marginblock: 'margin-block:;',
    margininline: 'margin-inline:;',
    paddingblock: 'padding-block:;',
    paddinginline: 'padding-inline:;',
    borderblock: 'border-block:;',
    borderinline: 'border-inline:;',
    
    /* ========== CSS Scroll Snap ========== */
    scrollsnap: 'scroll-snap-type:;',
    scrollalign: 'scroll-snap-align:;',
    scrollstop: 'scroll-snap-stop:;',
    scrollmargin: 'scroll-margin:;',
    scrollpadding: 'scroll-padding:;',
    
    /* ========== CSS Viewport ========== */
    vw: 'vw',
    vh: 'vh',
    vmin: 'vmin',
    vmax: 'vmax',
    
    /* ========== CSS Containment ========== */
    contain: 'contain:;',
    contentvis: 'content-visibility:;',
    
    /* ========== CSS Subgrid ========== */
    subgrid: 'subgrid',
    
    /* ========== CSS Masonry ========== */
    masonry: 'masonry',
    
    /* ========== HTML5 Semantic Extended ========== */
    banner: '<header role="banner"></header>',
    mainnav: '<nav role="navigation"></nav>',
    maincontent: '<main role="main"></main>',
    complementary: '<aside role="complementary"></aside>',
    contentinfo: '<footer role="contentinfo"></footer>',
    
    /* ========== ARIA & Accessibility ========== */
    arialabel: 'aria-label=""',
    arialabelledby: 'aria-labelledby=""',
    ariadescribedby: 'aria-describedby=""',
    ariahidden: 'aria-hidden="true"',
    arialive: 'aria-live="polite"',
    ariatomic: 'aria-atomic="true"',
    ariabusy: 'aria-busy="true"',
    ariacontrols: 'aria-controls=""',
    ariacurrent: 'aria-current="page"',
    ariarequired: 'aria-required="true"',
    ariainvalid: 'aria-invalid="true"',
    
    /* ========== Meta Tags & SEO ========== */
    metacharset: '<meta charset="UTF-8">',
    metaviewport: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    metadesc: '<meta name="description" content="">',
    metakeywords: '<meta name="keywords" content="">',
    metaauthor: '<meta name="author" content="">',
    metarobots: '<meta name="robots" content="index, follow">',
    metathemecolor: '<meta name="theme-color" content="">',
    
    /* ========== Favicon & Icons ========== */
    favicon: '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
    appleicon: '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    
    /* ========== Open Graph ========== */
    ogtitle: '<meta property="og:title" content="">',
    ogdesc: '<meta property="og:description" content="">',
    ogimage: '<meta property="og:image" content="">',
    ogurl: '<meta property="og:url" content="">',
    ogtype: '<meta property="og:type" content="website">',
    
    /* ========== Twitter Card ========== */
    twittercard: '<meta name="twitter:card" content="summary">',
    twittertitle: '<meta name="twitter:title" content="">',
    twitterdesc: '<meta name="twitter:description" content="">',
    twitterimage: '<meta name="twitter:image" content="">',
    
    /* ========== Performance & Optimization ========== */
    preload: '<link rel="preload" href="" as="">',
    prefetch: '<link rel="prefetch" href="">',
    preconnect: '<link rel="preconnect" href="">',
    dns: '<link rel="dns-prefetch" href="">',
    
    /* ========== Security ========== */
    csrftoken: '<input type="hidden" name="csrf_token" value="">',
    nonce: 'nonce=""',
    
    /* ========== Forms Extended ========== */
    fieldset: '<fieldset></fieldset>',
    legend: '<legend></legend>',
    optgroup: '<optgroup label=""></optgroup>',
    datalist: '<datalist id=""></datalist>',
    
    /* ========== Input Types Extended ========== */
    inputtel: '<input type="tel">',
    inputurl: '<input type="url">',
    inputsearch: '<input type="search">',
    inputrange: '<input type="range">',
    inputcolor: '<input type="color">',
    inputtime: '<input type="time">',
    inputmonth: '<input type="month">',
    inputweek: '<input type="week">',
    inputdatetime: '<input type="datetime-local">',
    
    /* ========== HTML5 Validation ========== */
    pattern: 'pattern=""',
    minlength: 'minlength=""',
    maxlength: 'maxlength=""',
    novalidate: 'novalidate',
    formnovalidate: 'formnovalidate',
    
    /* ========== Microdata & Structured Data ========== */
    itemscope: 'itemscope',
    itemtype: 'itemtype=""',
    itemprop: 'itemprop=""',
    
    /* ========== Web Components ========== */
    shadowroot: 'attachShadow({ mode: \'open\' })',
    slot: '<slot></slot>',
    template: '<template></template>',
    
    /* ========== SVG Elements ========== */
    svgrect: '<rect x="" y="" width="" height="">',
    svgcircle: '<circle cx="" cy="" r="">',
    svgellipse: '<ellipse cx="" cy="" rx="" ry="">',
    svgline: '<line x1="" y1="" x2="" y2="">',
    svgpolygon: '<polygon points="">',
    svgpolyline: '<polyline points="">',
    svgpath: '<path d="">',
    svgtext: '<text x="" y="">',
    svgg: '<g></g>',
    svgdefs: '<defs></defs>',
    svguse: '<use xlink:href="">',
    
    /* ========== MathML ========== */
    math: '<math xmlns="http://www.w3.org/1998/Math/MathML"></math>',
    mrow: '<mrow></mrow>',
    mfrac: '<mfrac></mfrac>',
    msqrt: '<msqrt></msqrt>',
    mroot: '<mroot></mroot>',
    
    /* ========== Internationalization ========== */
    lang: 'lang=""',
    dir: 'dir=""',
    
    /* ========== Performance Attributes ========== */
    loading: 'loading="lazy"',
    decoding: 'decoding="async"',
    fetchpriority: 'fetchpriority="high"',
    
    /* ========== Modern CSS Features ========== */
    containerq: '@container',
    layer: '@layer',
    scope: '@scope',
    
    /* ========== CSS Nesting ========== */
    nest: '&',
    
    /* ========== Utility Classes ========== */
    sronly: 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;',
    visuallyhidden: 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;',
    
    /* ========== Common Patterns ========== */
    centerabs: 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);',
    centerflex: 'display:flex;align-items:center;justify-content:center;',
    centergrid: 'display:grid;place-items:center;',
    
    /* ========== CSS Reset Extended ========== */
    resetbox: 'box-sizing:border-box;',
    resetmargin: 'margin:0;',
    resetpadding: 'padding:0;',
    resetlist: 'list-style:none;',
    resetbutton: 'background:none;border:none;padding:0;',
    resetlink: 'text-decoration:none;color:inherit;',
    
    /* ========== Dark Mode ========== */
    darkmode: '@media (prefers-color-scheme: dark)',
    dark: '@media (prefers-color-scheme: dark)',
    
    /* ========== Print Styles ========== */
    print: '@media print',
    
    /* ========== CSS Houdini ========== */
    property: '@property',
    
    /* ========== CSS Modules ========== */
    module: ':local()',
    
    /* ========== CSS-in-JS Patterns ========== */
    styled: 'styled.',
    cssprop: 'css={{ }}',
    
    /* ========== Tailwind-like Utilities ========== */
    mxauto: 'margin-left:auto;margin-right:auto;',
    myauto: 'margin-top:auto;margin-bottom:auto;',
    absolutecenter: 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);',
    fullscreen: 'width:100vw;height:100vh;',
    aspectvideo: 'aspect-ratio:16/9;',
    aspectsquare: 'aspect-ratio:1/1;',
    
    /* ========== Bootstrap-like Classes ========== */
    dblock: 'display:block;',
    dinline: 'display:inline;',
    dflex: 'display:flex;',
    dhide: 'display:none;',
    textcenter: 'text-align:center;',
    textleft: 'text-align:left;',
    textright: 'text-align:right;',
    
    /* ========== Animation Keyframes ========== */
    keyframes: '@keyframes ',
    from: 'from { }',
    to: 'to { }',
    
    /* ========== CSS Custom Properties Extended ========== */
    propcolor: '--color: ',
    propbg: '--bg: ',
    propfont: '--font: ',
    propsize: '--size: ',
    propradius: '--radius: ',
    propshadow: '--shadow: ',
    
    /* ========== CSS Layers ========== */
    layerbase: '@layer base { }',
    layercomponents: '@layer components { }',
    layerutilities: '@layer utilities { }',
    
    /* ========== Container Queries ========== */
    container: '@container',
    cqw: 'cqw',
    cqh: 'cqh',
    cqi: 'cqi',
    cqb: 'cqb',
    cqmin: 'cqmin',
    cqmax: 'cqmax',
    
    /* ========== Modern Selectors ========== */
    selwhere: ':where()',
    selis: ':is()',
    selhas: ':has()',
    
    /* ========== Logical Properties Extended ========== */
    start: 'start',
    end: 'end',
    block: 'block',
    inline: 'inline',
    
    /* ========== CSS Math Functions ========== */
    sign: 'sign()',
    abs: 'abs()',
    round: 'round()',
    mod: 'mod()',
    rem: 'rem()',
    
    /* ========== Color Functions ========== */
    color: 'color()',
    lab: 'lab()',
    lch: 'lch()',
    oklab: 'oklab()',
    oklch: 'oklch()',
    
    /* ========== Viewport Units Extended ========== */
    svw: 'svw',
    lvw: 'lvw',
    dvw: 'dvw',
    svh: 'svh',
    lvh: 'lvh',
    dvh: 'dvh',
    vi: 'vi',
    vb: 'vb',
    
    /* ========== CSS Anchor Positioning ========== */
    anchor: 'anchor-name: --',
    positionanchor: 'position-anchor: --',
    positionarea: 'position-area: ',
    
    /* ========== CSS Scroll-driven Animations ========== */
    animationrange: 'animation-range: ',
    viewprogress: 'view()',
    scrollprogress: 'scroll()',
    
    /* ========== CSS Trigonometric Functions ========== */
    sin: 'sin()',
    cos: 'cos()',
    tan: 'tan()',
    asin: 'asin()',
    acos: 'acos()',
    atan: 'atan()',
    atan2: 'atan2()',
  };
   
  editorEl.addEventListener('input', updateLivePreview);
  editorEl.addEventListener('keydown', function (e) {
    if (!assistMode) return;              // 🔒 autocomplete only if assist is ON
    if (e.key !== 'Tab' && e.key !== 'Enter') return; // trigger on Tab key
  
    const value = editorEl.value;
    const cursorPos = editorEl.selectionStart;
  
    // find the start of the current "word"
    let start = cursorPos - 1;
    while (start >= 0 && !/\s/.test(value[start])) {
      start--;
    }
    start++;
  
    const abbr = value.slice(start, cursorPos);
  
    if (!abbr || !CSS_SNIPPETS[abbr]) {
      return; // nothing to expand
    }
  
    e.preventDefault(); // prevent focus jump
  
    const snippet = CSS_SNIPPETS[abbr];
    const before = value.slice(0, start);
    const after = value.slice(cursorPos);
  
    editorEl.value = before + snippet + after;
  
    const newPos = before.length + snippet.length;
    editorEl.selectionStart = editorEl.selectionEnd = newPos;
  
    // update live preview with new content
    updateLivePreview();
  });
  
startBtn.addEventListener('click', startGame); 
if (stopBtn) {
    stopBtn.addEventListener('click', endGame); // 🆕
  }




// Initialiser le jeu
init();
