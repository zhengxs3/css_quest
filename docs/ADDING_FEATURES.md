# Guide d'extension

Ce guide explique comment ajouter des niveaux, de nouvelles difficultés ou modes, et des éléments d'interface, tout en respectant les conventions du projet.

## Sommaire
- Ajouter un niveau
- Ajouter une option de difficulté
- Ajouter un mode
- Ajouter un élément d'interface
- Conventions de contribution
- Checklist de tests
- Améliorations recommandées

## Ajouter un niveau
- Où: `js/script.js`, objet `levels`
- Structure par mode:
  - css: `{ desc: "description", css: "règles CSS", hint: "indice" }`
  - html: `{ desc: "description", html: "markup HTML", hint: "indice" }`
  - htmlcss: `{ desc, html, css, hint }`

### Étapes
1. Choisissez le mode et la difficulté (`easy` / `medium` / `hard`)
2. Ajoutez un objet au tableau correspondant
3. Vérifiez que les règles/markup sont valides et auto-suffisants (largeur/hauteur/affichage si nécessaire)
4. Testez en jeu: chargez le niveau, utilisez Vérifier, Indice, Comparer

### Exemple (css/easy)
```js
levels.css.easy.push({
  desc: "Carré noir, 80x80px avec bord arrondi",
  css: "width:80px; height:80px; background:#000; border-radius:10px;",
  hint: "Largeur/hauteur + couleur + coins arrondis"
});
```

## Ajouter une option de difficulté
Exemple: ajouter "expert".
1. Étendre `progress`: `progress[mode].expert = 0` pour chaque mode concerné
2. Ajouter `levels[mode].expert = []` et remplir avec de nouveaux défis
3. UI (dans `test.html`): ajouter un bouton "Expert" dans `.difficulty-selector`
4. JS: `setDifficulty` accepte "expert"; mise à jour des bascules `.active`; vérifier la charge correcte dans `loadLevel`

## Ajouter un mode
Exemple: ajouter le mode "svg".
1. Étendre `progress` avec `svg: { easy: 0, medium: 0, hard: 0 }`
2. Ajouter `levels.svg = { easy:[], medium:[], hard:[] }`
3. UI (dans `test.html`): ajouter un bouton dans `.level-selection` (`selectMode('svg')`)
4. JS: `selectMode` gère le nouveau mode; `loadLevel` lit `levels.svg[diff]`

## Ajouter un élément d'interface
Exemple: bouton "Réinitialiser progression".
1. HTML: dans `.header` ou près des stats, ajouter
```html
<button class="btn btn-warning" onclick="resetProgress()">Reset Progression</button>
```
2. JS: implémenter `resetProgress()`
```js
function resetProgress(){
  progress = {
    css:{easy:0,medium:0,hard:0},
    html:{easy:0,medium:0,hard:0},
    htmlcss:{easy:0,medium:0,hard:0}
  };
  saveProgress();
  updateProgressDisplay();
  resultMessage.textContent = "Progression réinitialisée";
  resultMessage.className = "result-message correct";
}
```
3. CSS: les styles `.btn-warning` existent déjà

## Conventions de contribution
- Respecter le format des niveaux et la cohérence des couleurs/typographies
- Préférer des défis atomiques, clairs et testables rapidement
- CSS: utiliser des unités explicites (px/em/rem), éviter les propriétés non supportées; pour animations, inclure `@keyframes` si nécessaire
- HTML: limiter aux balises sûres; éviter scripts/événements inline dans les niveaux HTML si `innerHTML` est utilisé

## Checklist de tests
- Navigation: changement de mode/difficulté bascule correctement l'UI (`.active`) et charge les niveaux
- Éditeur/aperçu: le rendu de `#preview` reflète votre code; Comparer affiche les deux côtés
- Vérification: `checkAnswer` déclenche messages, score/streak, confetti sur succès; NextLevel fonctionne
- Indices: `getHint` affiche et décrémente les indices; `hintsLeft` visible
- Progression: `progress` mis à jour et sauvegardé; rechargement récupère l'état
- Succès: conditions évaluées; affichage dans `#achievements`

## Améliorations recommandées
- Remplacer `onclick` inline par `addEventListener` pour gérer `event.target` explicitement
- Normaliser la comparaison CSS/HTML (parser/sanitiser) et gérer équivalences (espaces, ordre des propriétés)
- Ajouter JSDoc aux fonctions clés (`init`, `loadLevel`, `checkAnswer`, `getHint`, etc.) et des commentaires aux variables `:root` du CSS