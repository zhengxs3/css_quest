# Architecture

## Table des matières
- Aperçu
- HTML (test.html)
- CSS (css/styles.css)
- JavaScript (js/script.js)
- Cycle d'initialisation & état
- Décisions
- Limites
- Évolutions
- Liens

## Aperçu
- Application front-end mono-page sans bundler.
- test.html structure l'UI; css/styles.css fournit le design system; js/script.js orchestre la logique de jeu.

## HTML (test.html)
- Conteneur principal .container.
- Header avec titre et barre de stats (Score, Streak, Niveau, Indices).
- Sélecteurs: .difficulty-selector (3 boutons), .level-selection (css/html/htmlcss).
- Indicateurs: .progress-bar (.progress-fill), #levelCounter, #timerDisplay, #resultMessage, #achievements.
- Panneaux (.panel) dans .game-container: Challenge (#challengeDesc, #challengePreview, #levelBadge), Éditeur (#editor, actions Vérifier/Indice/Réinitialiser/Passer, #hintBox), Aperçu (#preview, Comparer via #comparisonView).
- Feedback overlay: #feedback avec #feedbackTitle, #feedbackText, bouton Niveau Suivant.

## CSS (css/styles.css)
- Design system via :root (variables de couleurs).
- Reset, typo système, fonds, cartes, ombres.
- Composants: .stats-bar, .difficulty-btn(.active), .level-selection button(.active), .panel, .preview-container/.preview-box, textarea, variantes .btn, .hint-box.
- États: .result-message .correct/.incorrect.
- Animations: .confetti + @keyframes fall.
- Responsive: @media (max-width: 1100px) grille 3→1 colonne.

## JavaScript (js/script.js)
- Cache DOM: getElementById pour les nœuds interactifs.
- État:
  - gameState: mode, difficulty, levelIndex, score, streak, hintsLeft, totalLevels, achievements, startTime.
  - Variables: currentMode, currentDifficulty, currentLevelIndex, score, hintsUsed, timerInterval, gameStarted.
  - progress: avancement par mode/difficulté.
- Succès: achievementsList [{id, icon, name, condition()}]; la condition "perfectionniste" dépend de gameState.perfectMatch (à ajouter/initialiser).
- Base de niveaux: levels[mode][difficulty] avec entrées:
  - css: {desc, css, hint}
  - html: {desc, html, hint}
  - htmlcss: {desc, html, css, hint}
- Persistance: loadProgress()/saveProgress() via localStorage("cssMatchProgress").
- Moteur:
  - init() → loadProgress → updateProgressDisplay → updateAchievements → loadLevel.
  - selectMode(mode) et setDifficulty(diff) basculent l'UI et rechargent le niveau.
  - Fonctions clés: loadLevel(), checkAnswer(), getHint(), resetCode(), skipLevel(), toggleComparison(), nextLevel().
- Timer/animations: startTime + timerInterval pour #timerDisplay; confettis DOM animés par CSS.

## Décisions
- Handlers inline onclick par simplicité; amélioration: addEventListener et passage explicite de l'élément/événement.
- Niveaux data-driven pour ajouter des défis sans toucher au moteur.
- localStorage pour persistance locale d'un jeu solo.

## Limites
- event.target en inline handlers: non fiable; préférer this ou des listeners JS.
- Comparaison CSS: l'égalité textuelle est fragile; normaliser (trim, casse, espaces) ou comparer styles calculés clés.
- Entrée HTML (modes html/htmlcss): si innerHTML utilisateur est injecté, prévoir filtrage/sanitation pour prévenir scripts/attributs dangereux.
- Achievements: définir et renseigner perfectMatch lors d'une validation exacte.

## Évolutions
- Migrer vers addEventListener.
- Normaliser la comparaison (parser, comparer propriétés/structure pertinentes).
- Modulariser script.js (helpers, state, ui, levels) et ajouter JSDoc.
- Ajouter des tests manuels (voir ADDING_FEATURES.md).

## Liens
- README: docs/README.md
- Ajout de fonctionnalités: docs/ADDING_FEATURES.md

```
english-game/
├─ test.html
├─ css/
│  └─ styles.css
├─ js/
│  └─ script.js
└─ docs/
   ├─ README.md
   ├─ ARCHITECTURE.md
   └─ ADDING_FEATURES.md
```