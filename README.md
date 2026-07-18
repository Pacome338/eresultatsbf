# eRésultatsbf — MVP

Plateforme de centralisation des résultats d'examens du Burkina Faso
(CEP, BEPC, BAC général — périmètre MVP).

Basé sur le cahier des charges v1.0 (juin 2026).

> **Important :** eRésultatsbf est une plateforme d'information
> **indépendante**. Elle n'est pas éditée par le Ministère de l'Éducation
> ni par l'OCECOS, et ne délivre aucun document officiel. Le logo utilisé
> est générique — les armoiries officielles du Burkina Faso ne doivent
> pas être utilisées sans autorisation.

## Installation

Prérequis : [Node.js](https://nodejs.org/) version 18 ou plus, installé sur ta machine.

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'espace admin
#    Copie .env.local.example vers .env.local, puis édite les valeurs
#    (mot de passe admin + clé de signature des sessions)
cp .env.local.example .env.local

# 3. Créer et remplir la base de données avec des données d'exemple
npm run seed

# 4. Lancer le serveur de développement
npm run dev
```

Le site est ensuite accessible sur **http://localhost:3000**.
L'espace admin est accessible sur **http://localhost:3000/admin** (mot de
passe défini dans `.env.local`).

## Espace admin

L'espace admin (`/admin`) a 5 sections (navigation en haut de chaque page) :

### Résultats (`/admin`)

1. **Importer un fichier Excel ou CSV** — colonnes attendues :
   `numero_table, nom, prenom, decision, moyenne, mention, serie,
   etablissement, province, region`. Le champ `decision` prend exactement
   3 valeurs : `admis`, `second_tour` (moyenne 8,00-9,99, résultat pas
   encore final) ou `non_admis`. Les en-têtes sont reconnues même avec
   des variantes (majuscules, accents, "Décision du jury", etc.). Un
   modèle est téléchargeable directement depuis la page.
2. **Extraire le texte brut d'un PDF** — pour référence uniquement.
   L'extraction automatique de *tableaux* depuis un PDF n'est pas
   fiable (mise en page trop variable selon les structures), donc le
   site ne tente pas de deviner la structure : il affiche le texte brut
   pour que l'admin puisse recopier manuellement les lignes via le
   bouton "Ajouter une ligne". Pour un gros volume, mieux vaut convertir
   le PDF en Excel avec un outil dédié avant import.
3. **Vérifier et corriger** chaque ligne dans un tableau éditable avant
   import — aucune ligne n'est insérée en base sans passer par cette
   étape de relecture (cf. section 7 du cahier des charges : vérification
   manuelle obligatoire).
4. **Gérer les résultats existants** — liste des 100 derniers résultats,
   avec suppression en cas d'erreur d'import.

### Statistiques (`/admin/statistiques`)

Ajouter/modifier/supprimer des lignes de statistiques (national ou par
région), affichées ensuite sur la page publique `/statistiques`.

### Établissements (`/admin/etablissements`)

Gérer une liste d'établissements (nom, type, province, région) — sert
de base pour uniformiser la saisie et pour une future recherche par
établissement.

### Annuaire (`/admin/annuaire`)

Gérer les structures affichées sur `/annuaire` (nom, rôle, contact).

### Calendrier (`/admin/calendrier`)

Gérer les dates d'examens affichées sur `/calendrier`.

## Sécurité de l'espace admin

L'authentification reste volontairement simple (un seul compte, pas de
base d'utilisateurs), proportionné au périmètre MVP, mais inclut :

- **Comparaison en temps constant** du mot de passe et de la signature
  de session (`crypto.timingSafeEqual`), pour ne pas laisser fuir
  d'information via le temps de réponse.
- **Blocage anti-brute-force** : après 5 mots de passe erronés depuis la
  même IP, les tentatives suivantes sont bloquées 15 minutes
  (`lib/rateLimit.js`). En mémoire, donc réinitialisé à chaque
  redémarrage du serveur — suffisant pour un seul admin, mais à
  remplacer par un stockage partagé (Redis) si le site est déployé sur
  plusieurs instances.
- **Refus de démarrer avec les valeurs par défaut** : si `ADMIN_PASSWORD`
  est encore `change-moi`, ou si `ADMIN_SECRET` fait moins de 32
  caractères, la connexion admin refuse de fonctionner et affiche un
  message clair plutôt que de tourner avec des identifiants faibles.
- **En-têtes de sécurité HTTP** (`next.config.js`) : `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`.
- **Cookie de session** : `httpOnly`, `sameSite=lax`, et `secure` en
  production (nécessite HTTPS pour fonctionner une fois déployé).

**Reste à faire avant une mise en production avec plusieurs
administrateurs ou un vrai volume de données sensibles :** comptes
individuels avec mots de passe hashés (bcrypt), HTTPS obligatoire côté
hébergeur, et un stockage partagé pour le blocage anti-brute-force si
le site tourne sur plusieurs serveurs.

## Déploiement en production (Railway)

Le site utilise SQLite (fichier local), ce qui ne fonctionne pas sur des
plateformes "serverless" comme Vercel (système de fichiers non
persistant). **Railway** convient car il fournit un disque persistant.

### 1. Pousser le projet sur GitHub

```bash
git init
git add .
git commit -m "eRésultatsbf - MVP"
```
Crée un nouveau dépôt (vide, sans README) sur GitHub, puis :
```bash
git remote add origin https://github.com/TON-COMPTE/eresultatsbf.git
git branch -M main
git push -u origin main
```
`.env.local` et `data/*.db` sont exclus automatiquement (`.gitignore`) —
ton mot de passe et tes données locales ne partent pas sur GitHub.

### 2. Créer le projet sur Railway

1. Sur [railway.app](https://railway.app), "New Project" → "Deploy from GitHub repo" → sélectionne ton dépôt.
2. Railway détecte Next.js et lance un premier build. **Ce premier
   build va échouer** tant que les étapes suivantes ne sont pas faites
   — c'est normal.

### 3. Ajouter un disque persistant

Dans l'onglet du service → **Settings → Volumes** → "New Volume" :
- **Mount path :** `/app/storage`

C'est un dossier séparé de `data/` (qui contient du code source,
`contenu.js`) pour ne jamais l'écraser.

### 4. Configurer les variables d'environnement

Dans **Settings → Variables**, ajoute :
```
ADMIN_PASSWORD=<un vrai mot de passe>
ADMIN_SECRET=<une chaîne d'au moins 32 caractères aléatoires>
DATABASE_PATH=/app/storage/resultats.db
NODE_ENV=production
```

### 5. Redéployer

Après ces changements, relance un déploiement ("Redeploy"). Le fichier
`nixpacks.toml` à la racine du projet garantit que Python/gcc/make sont
disponibles pendant le build (nécessaires pour compiler `better-sqlite3`,
un module natif — sans ça, le build échoue avec une erreur "python not
found").

### 6. Premier accès

Une fois déployé, Railway donne une URL du type
`eresultatsbf-production.up.railway.app` (un nom de domaine personnalisé
peut être ajouté ensuite dans Settings → Networking). Va sur `/admin`
avec ton mot de passe, et importe tes premiers résultats — la base sur
le disque persistant survivra aux prochains déploiements.

**Mises à jour futures :** à chaque `git push` sur `main`, Railway
redéploie automatiquement la nouvelle version, sans toucher aux données
du disque persistant.

## Stack

- **Next.js 14** (pages router) — frontend + API dans un seul projet
- **SQLite** via `better-sqlite3` — base de données locale, aucun serveur à installer
- **CSS simple** — pas de framework, styles dans `styles/globals.css`
- **Espace admin** — `xlsx` (lecture Excel/CSV), `pdf-parse` (extraction texte PDF), `formidable` (upload de fichiers), cookie de session signé (`cookie` + `crypto`)

## Structure du projet

```
resultats-bf/
├── components/       Header, Footer, AdminNav (layout commun)
├── data/             Contenu de référence : EXAMENS, REGIONS, FICHES_PRATIQUES,
│                     FAQ, + contenu initial repris par lib/db.js au 1er lancement
├── lib/
│   ├── db.js             Connexion SQLite + migrations + pré-remplissage initial
│   ├── auth.js           Session admin (cookie signé)
│   └── requireAdmin.js   Protection des routes API admin
├── pages/
│   ├── index.js               Accueil + recherche (Module 1)
│   ├── attestations.js        Fiches pratiques (Module 2, statique)
│   ├── faq.js                 FAQ démarches (Module 2, statique)
│   ├── calendrier.js          Calendrier (Module 3, lit la base — gérable en admin)
│   ├── annuaire.js            Annuaire (Module 3, lit la base — gérable en admin)
│   ├── statistiques.js        Statistiques (lit la base — gérable en admin)
│   ├── etablissements.js      Placeholder V2 (recherche par établissement)
│   ├── admin/
│   │   ├── login.js           Connexion admin
│   │   ├── index.js           Résultats : import + gestion
│   │   ├── statistiques.js    Gestion des statistiques
│   │   ├── etablissements.js  Gestion des établissements
│   │   ├── annuaire.js        Gestion de l'annuaire
│   │   └── calendrier.js      Gestion du calendrier
│   └── api/
│       ├── resultats.js           Endpoint de recherche public (GET)
│       └── admin/
│           ├── login.js / logout.js
│           ├── parse-excel.js     Lecture Excel/CSV
│           ├── extract-pdf.js     Extraction texte PDF
│           ├── import.js          Insertion des résultats en base
│           ├── resultats.js       Liste / suppression des résultats
│           ├── statistiques.js    CRUD statistiques
│           ├── etablissements.js  CRUD établissements
│           ├── annuaire.js        CRUD annuaire
│           └── calendrier.js      CRUD calendrier
├── public/modele-import.csv   Modèle de fichier pour l'import
├── scripts/seed.js   Remplit la table resultats avec des résultats fictifs
├── .env.local.example
└── styles/globals.css
```

## Le champ "Décision du jury"

Chaque résultat individuel a un champ unique `decision` avec exactement
3 valeurs possibles :
- **`admis`** — moyenne ≥ 10,00
- **`second_tour`** — moyenne entre 8,00 et 9,99, résultat pas encore
  final (en attente des épreuves de rattrapage)
- **`non_admis`** — moyenne < 8,00

Si un candidat en "second tour" passe les épreuves de rattrapage, il
faut **mettre à jour** sa ligne (passer `decision` à `admis` ou
`non_admis`) plutôt que d'en créer une nouvelle.

## Données actuelles

Les résultats affichés viennent de **données fictives** générées par
`scripts/seed.js` (voir section 7 du cahier des charges : la vraie
stratégie de collecte — récupération des communiqués officiels, scripts
d'extraction PDF/Excel, vérification manuelle — reste à construire dans
une prochaine étape).

Numéros de table d'exemple à tester une fois le serveur lancé :

| Examen | Session | Numéro de table | Nom |
|---|---|---|---|
| CEP | 2026 | 001234 | OUEDRAOGO |
| CEP | 2026 | 001235 | KABORE |
| BEPC | 2026 | 084521 | SAWADOGO |
| BAC (séries générales) | 2026 | 210987 | ZONGO |

## Prochaines étapes suggérées

1. Brancher une vraie source de données (import PDF/Excel → script de
   structuration → vérification manuelle → base).
2. Ajouter BAC pro / CAP / BEP (V2).
3. Ajouter les statistiques par établissement / province (V2).
4. Ajouter les alertes SMS / e-mail (V2, Phase 3).
5. Passer d'une palette CSS simple à un vrai design system si le projet
   grandit.

## Notes pour un développeur débutant

- Chaque page dans `pages/` correspond à une URL (`pages/faq.js` → `/faq`).
- Le contenu éditorial (fiches, FAQ, calendrier) est dans `data/contenu.js`
  pour que tu puisses le modifier sans toucher au design.
- La base SQLite est un simple fichier (`data/resultats.db`), pratique
  pour développer sans installer de serveur de base de données.
