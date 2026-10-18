# Stroboscope · Laboratoire du mouvement

Simulation scientifique interactive en français, développée avec **React, TypeScript et Vite**. Un disque tourne à vitesse constante dans le sens antihoraire ; un stroboscope observe un point rouge sur sa périphérie.

## Ouvrir l’application sur votre ordinateur

1. Installez **Node.js 24 LTS**, qui inclut npm, depuis <https://nodejs.org>.
2. Récupérez le dépôt avec Git ou avec **Code → Download ZIP** sur GitHub, puis décompressez-le.
3. Ouvrez un terminal dans le dossier `simulation-stroboscope`.
4. Exécutez les commandes suivantes, l’une après l’autre :

```sh
npm ci
npm run dev
```

5. Gardez le terminal ouvert et saisissez `http://localhost:5173` dans votre navigateur. Si ce port est occupé, utilisez le port indiqué par Vite dans le terminal.

Pour fermer le serveur, utilisez **Ctrl+C** dans le terminal. Pour le relancer ensuite, `npm run dev` suffit ; réinstallez avec `npm ci` si les dépendances ont changé.

Dans un environnement cloud, le serveur écoute sur toutes les interfaces. Si votre interface propose un aperçu ou une redirection de port, choisissez **5173**. L’adresse `localhost` de votre ordinateur ne désigne pas la machine cloud : sans redirection de port, utilisez la procédure locale ci-dessus. Ne partagez pas un serveur de développement sur un réseau public.

## Utiliser le laboratoire

- **T** est la durée d’un tour réel. **Te** est la durée entre deux éclairs. Les réglages sont indépendants, de 0,05 à 10 secondes ; changer une période arrête et réinitialise l’expérience.
- **Démarrer / Arrêter / Reprendre** pilote l’animation en temps réel. La simulation se met en pause lorsque l’onglet est masqué.
- **Réinitialiser** revient à l’observation initiale à t = 0 et conserve vos réglages.
- **Avancer d’un éclair** arrête l’animation et se place exactement au prochain éclair. C’est le meilleur moyen d’étudier les très petites périodes.
- La vue **Rotation réelle** suit le point en continu. La vue **Mouvement apparent** affiche la dernière position échantillonnée et la conserve jusqu’à l’éclair suivant pour faciliter la lecture.
- Les **traces** montrent les huit dernières observations et l’arc du dernier déplacement minimal. Le tableau affiche l’angle et le temps de chaque observation. L’observation n = 0 est comprise dans le compteur.
- Les quatre préréglages permettent de comparer le recul, l’immobilité, le sens direct et le demi-tour ambigu.

L’application fonctionne sans compte, sans clé API et sans service externe. Les polices sont incluses dans les fichiers de l’application.

## Physique et limites d’interprétation

Angles positifs dans le sens antihoraire ; vitesse réelle constante ; éclairs idéaux instantanés ; point initial à 0°.

```text
θ(t) = (360° × t / T) modulo 360°
t_n = n × Te, n = 0, 1, 2, …
θ_n = (360° × n × Te / T) modulo 360°
Δθ_réel = 360° × Te / T
Δθ_min = représentant de Δθ_réel modulo 360° dans [−180°, +180°]
f_app = Δθ_min / (360° × Te)
```

À **T = 1 s** et **Te = 1,9 s**, le disque parcourt **684°** entre deux éclairs. Les positions observées sont 0°, 324°, 288°, 252°… Le déplacement minimal est donc **−36°**, alors que le disque tourne réellement en sens positif. La fréquence apparente minimale est −1/19 Hz.

Les positions échantillonnées seules ne déterminent pas le mouvement entre les éclairs. Tous les déplacements **Δθ_min + 360° × k**, pour k entier, donnent les mêmes observations. De même, les fréquences compatibles diffèrent d’un multiple de **1/Te**. Le mouvement minimal est une interprétation ; il ne prouve ni la vitesse ni le sens réels. Une reconstruction unique demande des hypothèses supplémentaires sur la vitesse.

- **Te/T entier** : immobilité apparente, malgré la rotation réelle.
- **Te/T demi-entier** : les deux déplacements **+180° et −180°** sont également courts ; le sens est indéterminé. Les deux arcs sont affichés.
- Une immobilité apparente ne signifie pas que le disque est à l’arrêt.
- L’affichage ne simule ni la rétine, ni la persistance visuelle, ni une durée physique d’éclair. La petite icône lumineuse est un indicateur visuel ; les observations sont calculées à des instants exacts. La position conservée et les traces sont des aides de lecture.
- À haute fréquence, l’écran et le navigateur peuvent eux-mêmes sous-échantillonner la rotation et masquer des éclairs. Les angles sont calculés à partir du temps écoulé, sans intégration angulaire cumulative. Le mode éclair par éclair permet d’étudier ces cas.

## Vérifier et construire

```sh
npm test          # Tests du modèle physique
npm run build    # Vérification TypeScript et version de production dans dist/
npm run preview  # Serveur local pour examiner la version construite
```

Tests du navigateur (à installer une seule fois sur votre ordinateur) :

```sh
npx playwright install chromium
npm run test:browser
```

Sous Linux, les bibliothèques système peuvent aussi être nécessaires : `npx playwright install --with-deps chromium`.
Si Chromium est déjà installé, vous pouvez le réutiliser, par exemple dans cet environnement cloud :

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

Les tests navigateur vérifient les réglages, le démarrage, la pause, la reprise, le pas à pas, la remise à zéro, les traces et l’affichage sur mobile. GitHub Actions exécute les tests et la compilation à chaque push et pull request.

## Enregistrer sur GitHub

Les fichiers sont prêts à être enregistrés dans le dépôt. Depuis le dossier du projet :

```sh
git add .
git commit -m "Créer la simulation interactive du stroboscope"
git push -u origin HEAD
```

Cette commande publie la branche courante. Si elle porte un autre nom que `main` (par exemple `work` dans l’environnement cloud), ouvrez ensuite une **pull request** sur GitHub pour proposer son intégration dans `main`.

La connexion GitHub de votre ordinateur doit autoriser l’écriture dans le dépôt. Aucun mot de passe ni jeton ne doit être placé dans les fichiers du projet. Cette procédure enregistre le code ; elle ne publie pas automatiquement un site web.

## Organisation

- `src/physics.ts` : calculs indépendants de l’interface.
- `src/physics.test.ts` : tests scientifiques et numériques.
- `src/App.tsx` : commandes, animation et disques SVG.
- `src/styles.css` : interface adaptative pour ordinateur et téléphone.
- `tests/simulation.spec.ts` : tests de l’application dans Chromium.
