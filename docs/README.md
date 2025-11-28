# CSS Match — Ultimate Edition

## Vue d'ensemble
CSS Match est un jeu d'apprentissage interactif pour pratiquer CSS et HTML en reproduisant des défis visuels et structurels.

- Trois modes: CSS Only, HTML Only, HTML + CSS
- Trois niveaux de difficulté par mode: Facile, Moyen, Difficile
- Éditeur intégré, aperçu en direct, comparaison, indices, score, streak, progression, succès, timer, feedback et confetti

## Sommaire
- Démarrage
- Structure des fichiers
- Architecture ([ARCHITECTURE.md](./ARCHITECTURE.md))
- Fonctionnalités clés
- Flux utilisateur
- Données et persistance
- Conventions CSS
- Conventions JS
- Limitations connues
- Aller plus loin

## Démarrage
- Ouvrez `test.html` dans un navigateur moderne (Chrome, Firefox, Edge).
- Aucun build ni dépendance externe: HTML/CSS/JS vanilla.

## Structure des fichiers
```
english-game/
├─ test.html
├─ css/
│  └─ styles.css
└─ js/
   └─ script.js
```

## Fonctionnalités clés
- Sélecteur de mode: `css` / `html` / `htmlcss`
- Sélecteur de difficulté: `facile` / `moyen` / `difficile`
- Barre de progression et compteur de niveau (ex: "Niveau 1/8")
- Éditeur de code (textarea) et aperçu en direct
- Boutons d'action: Vérifier, Indice, Réinitialiser, Passer, Comparer, Niveau Suivant
- Système d'indices (décrément du stock), score et streak, message de résultat, feedback overlay avec confetti
- Succès affichés via icônes et noms

## Flux utilisateur
1. Choisir un mode et une difficulté
2. Lire la description du challenge et observer la cible (challengePreview)
3. Écrire le code (CSS et/ou HTML selon le mode)
4. Cliquer sur Vérifier pour valider; utiliser Indice si besoin; Passer pour aller au suivant; Comparer pour voir la différence; Niveau Suivant après succès

## Données et persistance
- Progression: stockée dans `localStorage` sous la clé `cssMatchProgress` (structure d'objets par mode/difficulté)
- État de jeu en mémoire: mode, difficulté, index du niveau, score, streak, indices restants, achievements et temps démarré

## Conventions CSS
- Thème via variables `:root` (primary, secondary, accent, background, card-bg, text, success, warning)
- Composants stylisés cohérents (`.btn`, `.panel`, `.stats`, `.level-selection`) avec transitions et ombres
- Responsive: `.game-container` passe de 3 colonnes à 1 colonne sous 1100px

## Conventions JS
- Mise en cache des éléments DOM en tête de fichier
- Données des niveaux: `levels[mode][difficulty]` = tableau d'objets niveau
  - Mode css: `{ desc, css, hint }`
  - Mode html: `{ desc, html, hint }`
  - Mode htmlcss: `{ desc, html, css, hint }`
- Fonctions (appelées depuis `test.html`): `selectMode`, `setDifficulty`, `checkAnswer`, `getHint`, `resetCode`, `skipLevel`, `toggleComparison`, `nextLevel`, `init`, `loadLevel`, `loadProgress`, `saveProgress`

## Limitations connues
- `selectMode`/`setDifficulty` utilisent `event.target` depuis `onclick` inline: selon les navigateurs, l'objet event implicite peut être absent; préférez passer `this` ou l'événement explicitement
- `achievementsList` référence `gameState.perfectMatch`, propriété absente dans `gameState`; à clarifier/ajouter côté logique
- Comparaison CSS: l'équivalence sémantique est délicate; la logique doit normaliser/évaluer (espaces, casse, ordre)

## Aller plus loin
- Voir `docs/ARCHITECTURE.md` pour le détail technique et les flux
- Voir `docs/ADDING_FEATURES.md` pour l'ajout de niveaux, options et UI