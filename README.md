# Stroboscope Lab · Explorez le mouvement

Simulation scientifique interactive en français, développée avec **React, TypeScript et Vite**. Un disque tourne à vitesse constante dans le sens antihoraire ; un stroboscope observe un point rouge sur sa périphérie.

Interface claire et sombre avec typographie système, deux disques synchronisés, commandes au clavier, ralenti, expériences guidées et graphique scientifique. Aucun logo ni police propriétaire n’est distribué.

## Site public avec GitHub Pages

Les fichiers de production du site sont publiés séparément dans la branche **`gh-pages`**. Le code source reste dans **`application-stroboscope`**. Les URL relatives des fichiers permettent de servir l’application sous `/simulation-stroboscope/`.

Activation initiale par le propriétaire du dépôt :

1. Ouvrir <https://github.com/adammouatacime1/simulation-stroboscope/settings/pages>.
2. Dans **Build and deployment → Source**, choisir **Deploy from a branch**.
3. Choisir **gh-pages**, puis **/ (root)**, et cliquer sur **Save**.
4. Attendre la fin du déploiement GitHub Pages et utiliser l’URL affichée par GitHub. L’adresse habituelle, sans domaine personnalisé, est `https://adammouatacime1.github.io/simulation-stroboscope/`.

Une fois activé, le site est hébergé par GitHub : il reste accessible lorsque votre PC est éteint. Les visiteurs n’ont besoin que d’un navigateur, sans Node.js ni téléchargement. Le site ne collecte pas de compte utilisateur ; le thème est mémorisé localement sur l’appareil.

Cette activation dépend des permissions et de l’offre GitHub du dépôt. Rendre le site public ne demande pas de publier des clés ni des identifiants. Si GitHub exige de changer la visibilité du dépôt, examiner ce choix séparément avant de modifier la visibilité du code.

Une nouvelle version du code doit être compilée puis republiée dans `gh-pages` pour mettre à jour le site. La branche de publication contient seulement `dist/` compilé et un fichier `.nojekyll` ; il ne faut pas y copier `node_modules`, des fichiers `.env` ou des identifiants.

## Ouvrir l’application sur votre ordinateur

### Windows : un raccourci sur le Bureau

1. Installez **Node.js 24 LTS** si ce n’est pas déjà fait.
2. Téléchargez le ZIP du projet, faites **Extraire tout**, puis placez le dossier extrait à un emplacement où vous souhaitez le conserver (par exemple Documents). Ouvrez le dossier contenant `package.json`.
3. Double-cliquez sur **`Creer-raccourci.cmd`**. Un raccourci **Stroboscope** est créé sur votre Bureau. Si Windows masque les extensions, le fichier apparaît simplement sous le nom `Creer-raccourci`.
4. Double-cliquez sur **Stroboscope** sur votre Bureau. Le serveur démarre et le navigateur s’ouvre automatiquement, dès que l’application est prête. Les composants sont installés automatiquement au premier démarrage si nécessaire ; Internet est requis pour cette première installation.

Aucune commande à taper. Après un redémarrage du PC, double-cliquez à nouveau sur le raccourci. Vous pouvez aussi démarrer directement avec **`Demarrer-Stroboscope.cmd`** dans le dossier de l’application.

La fenêtre du serveur reste réduite dans la barre des tâches quand vous utilisez le raccourci. Laissez-la ouverte pendant l’utilisation ; fermez-la pour arrêter le serveur. Fermer seulement l’onglet du navigateur n’arrête pas le serveur. Le lanceur limite l’accès à votre ordinateur (`127.0.0.1`). Si le port habituel est occupé, Vite choisit un port libre et ouvre l’adresse correspondante.

Gardez le dossier de l’application à son emplacement : le raccourci pointe vers ce dossier. Si vous le déplacez, supprimez l’ancien raccourci et relancez `Creer-raccourci.cmd` depuis le nouvel emplacement. Aucun droit administrateur n’est nécessaire pour créer le raccourci. Vous pouvez aussi le créer manuellement par clic droit sur `Demarrer-Stroboscope.cmd` → **Afficher plus d’options → Envoyer vers → Bureau (créer un raccourci)**.

### Lancement manuel (Windows, macOS ou Linux)

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

- **T** est la durée d’un tour réel. **Te** est la durée entre deux éclairs. Les réglages sont indépendants, de **0,001 à 10 secondes**, avec un pas de 0,001 s (1 milliseconde) ; changer une période arrête et réinitialise l’expérience. Pour une petite période, saisissez directement sa valeur dans le champ numérique, par exemple `0.01` pour 0,01 s.
- **Démarrer / Pause / Reprendre** pilote l’animation. La simulation se met en pause lorsque l’onglet est masqué. Le réglage **Vitesse de simulation**, de ×0,1 à ×2, fait varier le temps simulé sans modifier les périodes ni les mesures physiques.
- **Réinitialiser** revient à l’observation initiale à t = 0 et conserve vos réglages.
- **Éclair suivant** arrête l’animation et se place exactement au prochain éclair. C’est le meilleur moyen d’étudier les très petites périodes.
- La vue **Mouvement réel** suit le point en continu. La vue **Observation stroboscopique** montre les positions échantillonnées. **Rémanence** conserve la dernière position entre les éclairs ; si elle est désactivée, le point s’affiche au bref indicateur d’éclair. En pause exactement sur un éclair, sa position reste visible pour l’étude.
- **Positions successives** montre les huit dernières observations et l’arc du dernier déplacement minimal. Le tableau affiche l’angle et le temps de chaque observation. L’observation n = 0 est comprise dans le compteur.
- Les expériences rapides règlent **T = 0,05 s** avec **Tₑ = 0,095 s** (inverse, −36°), **0,055 s** (direct, +36°), **0,1 s** (stationnaire) ou **0,075 s** (ambigu, ±180°). **Configuration libre** permet de modifier les valeurs sans les remplacer.
- Les curseurs utilisent une **échelle logarithmique** pour rendre les petites périodes accessibles. Les flèches du clavier ajustent la période de 0,001 s, Page haut/bas de 0,01 s, et Début/Fin sélectionnent les limites.
- Le bouton soleil/lune change le **thème**, mémorisé sur cet appareil. Au premier lancement, le thème suit le système. **Aide** explique les conventions scientifiques ; Échap ferme cette fenêtre. Le bouton de remise à zéro de la barre supérieure restaure l’expérience initiale (T = 1 s, Tₑ = 1,9 s, vitesse ×1 et aides activées), en conservant le thème.

### Lire le graphique

**Analyse temporelle** affiche l’angle modulo 360° en fonction du temps simulé. La courbe réelle théorique est coupée à chaque tour : aucune ligne ne relie artificiellement 360° à 0°. Elle peut s’étendre au-delà du temps courant car le modèle à vitesse constante est connu ; seuls les éclairs déjà atteints ont des points observés.

Les traits verticaux repèrent les éclairs affichés. Le pointillé orange montre seulement le trajet minimal **entre les deux dernières observations** ; il est facultatif et ne reconstitue pas le mouvement réel. À ±180°, aucun trajet apparent unique n’est dessiné. Passez la souris sur un point, touchez-le ou utilisez Tab pour lire son instant et son angle.

La fenêtre peut couvrir **6 intervalles d’éclair** ou **2 tours réels**. Au-delà de 128 passages de tour, la courbe réelle est masquée avec une explication plutôt que remplacée par une courbe fausse ; le zoom sur deux tours la rend lisible. Si une fenêtre contient plus de 60 éclairs, certains marqueurs sont masqués avec une indication explicite ; les calculs et le compteur conservent tous les éclairs.

Pour explorer une rotation rapide, essayez **T = 0,01 s** et **Te = 0,019 s** : le déplacement apparent minimal reste **−36°**. À ces fréquences, utilisez le mode **Éclair suivant** : un écran ne peut pas montrer chaque rotation ou chaque éclair en temps réel. Les temps des observations sont affichés avec une précision à la milliseconde.

L’application fonctionne sans compte, sans clé API et sans service externe. Elle utilise les polices du système. Les effets de transparence ont un style de remplacement ; les préférences de réduction des animations, de réduction de transparence et de contraste élevé sont prises en compte. Les noms et valeurs restent visibles indépendamment des couleurs.

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

Les tests navigateur vérifient les réglages, le démarrage, la pause, la reprise, le pas à pas, les remises à zéro, les traces, la rémanence, le ralenti, les expériences, les thèmes et leur mémorisation, l’aide au clavier, le graphique et l’affichage sur mobile. GitHub Actions exécute les tests et la compilation à chaque push et pull request.

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
- `src/useSimulation.ts` : horloge partagée, vitesse du temps simulé et lecture.
- `src/chartModel.ts` et son test : segments scientifiques du graphique, avec coupures modulo 360°.
- `src/components/` : navigation, disques SVG, commandes, mesures, expériences, graphique et historique.
- `src/useTheme.ts` : préférences de thème et mémorisation locale.
- `src/App.tsx` : composition et synchronisation des composants.
- `src/styles.css` : design system et interface adaptative pour ordinateur et téléphone.
- `tests/simulation.spec.ts` : tests de l’application dans Chromium.
