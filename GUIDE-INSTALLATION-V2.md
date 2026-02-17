# Ligoj v2 — Guide d'installation et comparatif avec la v1

## Table des matières

1. [Introduction](#1-introduction)
2. [Prérequis](#2-prérequis)
3. [Installation rapide (5 minutes)](#3-installation-rapide)
4. [Architecture technique](#4-architecture-technique)
5. [Comparatif v1 vs v2](#5-comparatif-v1-vs-v2)
6. [Pages et fonctionnalités disponibles](#6-pages-et-fonctionnalités-disponibles)
7. [Guide d'utilisation](#7-guide-dutilisation)
8. [Structure du code source](#8-structure-du-code-source)
9. [Développement local](#9-développement-local)
10. [FAQ et dépannage](#10-faq-et-dépannage)

---

## 1. Introduction

Ligoj v2 est une réécriture complète du frontend de l'application Ligoj. Le backend Java (API) reste identique — seul le frontend a été modernisé.

**Objectif** : Remplacer la stack legacy (jQuery + Bootstrap 3 + Handlebars + RequireJS) par une stack moderne (Vue 3 + Vite + Vuetify 3 + Pinia), afin d'améliorer la maintenabilité, les performances et l'expérience développeur.

**Statut actuel** : Production-ready — 18 vues, 8 composables, 4 stores Pinia, 8 plugins metier migres. 101 tests automatises (48 Vitest + 53 Playwright). Build Docker multi-stage operationnel.

---

## 2. Prérequis

| Logiciel       | Version minimale | Vérification                |
|----------------|------------------|-----------------------------|
| Docker         | 20.10+           | `docker --version`          |
| Docker Compose | 2.0+             | `docker compose version`    |
| Espace disque  | ~2 Go            | Pour les images Docker      |
| RAM            | 4 Go minimum     | L'API Java consomme ~1-2 Go |

> **Note** : Aucune installation de Java, Node.js ou MySQL n'est requise — tout est containerisé.

---

## 3. Installation rapide

### Etape 1 — Recuperer le projet

```bash
git clone https://github.com/Terracosmos/ligoj-v2.git
cd ligoj-v2
git checkout vue3-migration
```

Le depot contient :
```
ligoj-v2/
├── docker-compose.yml          # Orchestration des 3 conteneurs
├── README.md                   # Documentation rapide
├── GUIDE-INSTALLATION-V2.md    # Ce document
├── app-api/                    # Code source API (Java, inchange)
└── app-ui/                     # Code source UI (Vue 3 = v2)
    ├── Dockerfile              # Build multi-stage Node 22 + Maven + Java 21
    └── src/main/webapp/
        ├── src/                # Code Vue 3 (18 vues, 8 composables, 4 stores)
        ├── e2e/                # 53 tests Playwright
        ├── __tests__/          # 48 tests Vitest
        └── package.json        # Dependances Vue 3
```

### Etape 2 — Lancer l'environnement

```bash
docker compose up -d --build
```

Cette commande démarre 3 conteneurs :

| Conteneur    | Image                 | Port  | Rôle                              |
|--------------|-----------------------|-------|-----------------------------------|
| `ligoj-db`   | `mysql:8.0`           | —     | Base de données MySQL             |
| `ligoj-api`  | `ligoj/ligoj-api:4.0.1` | 8081 | Backend REST API (Java/Spring)    |
| `ligoj-ui`   | Build local           | 8080  | Frontend UI (Java/Spring + Vue 3) |

Le premier démarrage prend environ **2-3 minutes** (téléchargement des images, initialisation de la base, build du frontend).

### Étape 3 — Vérifier le démarrage

```bash
# Vérifier que les 3 conteneurs sont "healthy"
docker compose ps
```

Attendez que les 3 conteneurs affichent `(healthy)` dans la colonne STATUS.

### Etape 4 — Acceder a l'application

Ouvrir : **http://localhost:8080/ligoj/**

L'URL par defaut redirige automatiquement vers la v2 Vue 3.

| URL                                        | Description          |
|--------------------------------------------|----------------------|
| `http://localhost:8080/ligoj/`             | **Redirection auto vers v2** |
| `http://localhost:8080/ligoj/v-login.html` | Login v2 (Vue 3)     |
| `http://localhost:8080/ligoj/v-index.html` | Application v2       |

**Identifiants de connexion :**

| Utilisateur | Mot de passe | Rôle  |
|-------------|--------------|-------|
| `admin`     | `admin`      | ADMIN |

> Les deux versions (v1 et v2) coexistent et utilisent la même API backend et la même base de données. Vous pouvez basculer de l'une à l'autre à tout moment.

### Étape 5 — Arrêter l'environnement

```bash
docker compose down          # Arrête les conteneurs (données conservées)
docker compose down -v       # Arrête ET supprime les données MySQL
```

---

## 4. Architecture technique

### Vue d'ensemble

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Navigateur  │────▶│  ligoj-ui    │────▶│  ligoj-api   │────▶ ligoj-db
│              │     │  :8080       │     │  :8081       │     (MySQL 8)
│  Vue 3 SPA  │     │  Spring Boot │     │  Spring Boot │
│              │     │  + Proxy REST│     │  REST API    │
└─────────────┘     └──────────────┘     └──────────────┘
```

- **ligoj-ui** : Sert les fichiers statiques (HTML/JS/CSS) et proxie les appels REST vers l'API
- **ligoj-api** : API REST backend, gestion des plugins, accès base de données
- **ligoj-db** : Stockage persistant MySQL

### Stack technique v2

| Couche         | Technologie     | Version | Role                        |
|----------------|-----------------|---------|-----------------------------|
| Framework UI   | Vue.js          | 3.5     | Composants reactifs         |
| Build tool     | Vite            | 6.0     | Bundling ultra-rapide       |
| UI Library     | Vuetify         | 3.7     | Composants Material Design  |
| State Manager  | Pinia           | 2.2     | Store global reactif        |
| Router         | Vue Router      | 4.5     | Navigation SPA              |
| Icons          | MDI (Material)  | 7.4     | Icones vectorielles         |
| Tests unit.    | Vitest          | 4.0     | 48 tests unitaires          |
| Tests e2e      | Playwright      | 1.58    | 53 tests end-to-end         |

---

## 5. Comparatif v1 vs v2

### Stack frontend

| Aspect              | v1 (Legacy)                    | v2 (Moderne)                    |
|---------------------|--------------------------------|---------------------------------|
| Framework JS        | jQuery 3.x                     | Vue 3 (Composition API)        |
| UI Framework        | Bootstrap 3                    | Vuetify 3 (Material Design)    |
| Templates           | Handlebars (.html)             | Single File Components (.vue)  |
| Module loader       | RequireJS (AMD)                | Vite (ES Modules natifs)       |
| State management    | Variables globales / DOM       | Pinia (stores réactifs)        |
| Routing             | Hash-based custom              | Vue Router 4                   |
| CSS                 | CSS/LESS global                | Scoped CSS par composant       |
| Build               | Minification manuelle          | Vite (tree-shaking, HMR)      |
| Internationalisation| cascade.js / NLS custom        | Système i18n intégré           |

### Expérience développeur

| Aspect                  | v1                              | v2                              |
|-------------------------|---------------------------------|---------------------------------|
| Hot reload              | Non (rechargement complet)      | Oui (HMR Vite < 100ms)        |
| Temps de build          | ~30s (Maven + minify)           | ~5s (Vite)                     |
| Debug                   | Difficile (code minifié)        | Source maps natifs             |
| Tests unitaires         | Aucun framework frontend        | 48 tests Vitest + 53 tests Playwright |
| Taille du code UI       | ~150+ fichiers JS/HTML/CSS      | ~30 fichiers Vue/JS            |
| Courbe d'apprentissage  | Connaissance cascade.js requise | Standards Vue.js bien documentés|

### Expérience utilisateur

| Aspect              | v1                              | v2                              |
|----------------------|---------------------------------|---------------------------------|
| Design              | Bootstrap 3 (daté)              | Material Design 3 (moderne)    |
| Navigation          | Rechargement page par page      | SPA fluide (pas de rechargement)|
| Dark mode           | Non                             | Oui (toggle dans la barre)     |
| Responsive          | Partiel                         | Complet (mobile-first)         |
| Sidebar             | Menu horizontal                 | Sidebar verticale Material     |
| Tables de données   | DataTables jQuery               | v-data-table-server Vuetify    |
| Feedback loading    | Minimal                         | Indicateurs de chargement      |
| Breadcrumbs         | Basique                         | Intégré dans chaque page       |

### Ce qui ne change PAS

| Aspect               | Détail                                       |
|-----------------------|----------------------------------------------|
| Backend API           | Identique — même WAR Java, mêmes endpoints   |
| Base de données       | Même schéma MySQL, mêmes données              |
| Authentification      | Même mécanisme (Rest auth provider + session) |
| Système de plugins    | Même architecture de plugins                  |
| Docker Compose        | Même orchestration 3 conteneurs               |
| URL de l'API          | `/ligoj/rest/*` — inchangé                   |

---

## 6. Pages et fonctionnalités disponibles

### Pages fonctionnelles en v2 (18 vues)

| Page               | Route v2                   | Donnees              | Statut      |
|--------------------|----------------------------|----------------------|-------------|
| Login              | `/v-login.html`            | API auth             | Fonctionnel |
| Dashboard          | `/#/`                      | Statistiques API     | Fonctionnel |
| Projects (liste)   | `/#/home/project`          | API live (4 projets) | Fonctionnel |
| Project (detail)   | `/#/home/project/:id`      | API live             | Fonctionnel |
| Project (edit)     | `/#/home/project/:id/edit` | API live             | Fonctionnel |
| Users (liste)      | `/#/id/user`               | API live             | Fonctionnel |
| User (edit)        | `/#/id/user/:id`           | API live             | Fonctionnel |
| Groups (liste)     | `/#/id/group`              | API live             | Fonctionnel |
| Group (edit)       | `/#/id/group/:id`          | API live             | Fonctionnel |
| Companies (liste)  | `/#/id/company`            | API live             | Fonctionnel |
| Company (edit)     | `/#/id/company/:id`        | API live             | Fonctionnel |
| Delegates (liste)  | `/#/id/delegate`           | API live (5 entrees) | Fonctionnel |
| Delegate (edit)    | `/#/id/delegate/:id`       | API live             | Fonctionnel |
| Container Scopes   | `/#/id/container-scope`    | API live             | Fonctionnel |
| Administration     | `/#/admin`                 | 15 plugins actifs    | Fonctionnel |
| Profile            | `/#/profile`               | Session API          | Fonctionnel |
| About              | `/#/about`                 | Metadata API         | Fonctionnel |

> **Note** : Sans plugin IAM (LDAP/AD), le systeme utilise `feature:iam:empty`. Les pages Identity (Users, Groups, Companies) affichent les donnees retournees par l'API (qui peuvent etre vides sans IAM). Les pages Projects et Delegates utilisent les vraies donnees MySQL.

### Fonctionnalités transversales

| Fonctionnalité           | Statut       |
|--------------------------|--------------|
| Authentification/Logout  | Fonctionnel  |
| Session persistante      | Fonctionnel  |
| Sidebar navigation       | Fonctionnel  |
| Dark mode                | Fonctionnel  |
| Breadcrumbs              | Fonctionnel  |
| Recherche dans les tables| Fonctionnel  |
| Tri des colonnes         | Fonctionnel  |
| Pagination serveur       | Fonctionnel  |
| Gestion des erreurs API  | Fonctionnel  |
| Autorisations UI (RBAC)  | Fonctionnel  |

### Ameliorations possibles

| Fonctionnalite                     | Priorite | Note                                    |
|------------------------------------|----------|-----------------------------------------|
| Tests unitaires plugins metier     | Moyenne  | 8 plugins migres, 0 tests specifiques   |
| Migration i18n complete (NLS)      | Basse    | Traductions FR/EN partielles            |
| Split ProvPlugin (~600 lignes)     | Basse    | Refactoring pour maintenabilite         |

---

## 7. Guide d'utilisation

### Se connecter

1. Ouvrez `http://localhost:8080/ligoj/v-login.html`
2. Entrez `admin` / `admin`
3. Vous êtes redirigé vers le dashboard

### Naviguer

- La **sidebar gauche** contient les menus principaux
- **Home** : Dashboard avec statistiques
- **Identity** : Cliquez pour déplier → Users, Groups, Companies, Delegates
- **Projects** : Liste des projets
- Le bouton **hamburger** en haut à gauche ouvre/ferme la sidebar
- Le **toggle soleil/lune** en haut à droite bascule le dark mode

### Comparer avec la v1

Pour comparer avec la v1 originale, utiliser l'image Docker officielle upstream :

```bash
docker run --rm -p 9080:8080 ligoj/ligoj-ui:4.0.1
```

Puis ouvrir `http://localhost:9080/ligoj/` dans un second onglet.

---

## 8. Structure du code source

### Arborescence Vue 3

```
app-ui/src/main/webapp/
├── src/
│   ├── main.js                    # Point d'entree application
│   ├── login.js                   # Point d'entree login
│   ├── App.vue                    # Composant racine
│   ├── LoginApp.vue               # Page de login
│   ├── composables/               # 8 composables (hooks)
│   │   ├── useApi.js              # Appels API REST
│   │   ├── useDataTable.js        # Tables de donnees paginees
│   │   ├── useI18n.js             # Internationalisation
│   │   ├── useFormGuard.js        # Protection formulaires
│   │   ├── useImportExport.js     # Import/export donnees
│   │   └── ...
│   ├── layouts/AppLayout.vue      # Layout (sidebar + toolbar)
│   ├── plugins/                   # 8 plugins metier + config
│   │   ├── vuetify.js             # Configuration Vuetify + themes
│   │   ├── registry.js            # Registre plugins
│   │   ├── prov/                  # Plugin provisioning
│   │   ├── bt-jira/               # Plugin JIRA
│   │   ├── build-jenkins/         # Plugin Jenkins
│   │   ├── scm-git/               # Plugin Git
│   │   ├── km-confluence/         # Plugin Confluence
│   │   └── ...
│   ├── router/index.js            # Routes Vue Router
│   ├── stores/                    # 4 stores Pinia
│   │   ├── auth.js                # Session, autorisations
│   │   ├── app.js                 # Etat global (titre, breadcrumbs)
│   │   ├── error.js               # Gestion erreurs
│   │   └── i18n.js                # Traductions
│   └── views/                     # 18 vues
│       ├── HomeView.vue           # Dashboard
│       ├── ProjectListView.vue    # Liste projets
│       ├── ProjectDetailView.vue  # Detail projet + souscriptions
│       ├── ProjectEditView.vue    # Edition projet
│       ├── UserListView.vue       # Liste utilisateurs
│       ├── UserEditView.vue       # Edition utilisateur
│       ├── GroupListView.vue      # Liste groupes
│       ├── GroupEditView.vue      # Edition groupe
│       ├── CompanyListView.vue    # Liste entreprises
│       ├── CompanyEditView.vue    # Edition entreprise
│       ├── DelegateListView.vue   # Liste delegues
│       ├── DelegateEditView.vue   # Edition delegue
│       ├── ContainerScopeView.vue # Container scopes
│       ├── AdminView.vue          # Administration
│       ├── ProfileView.vue        # Profil utilisateur
│       ├── AboutView.vue          # Page A propos
│       └── ...
├── e2e/                           # 53 tests Playwright
├── __tests__/                     # 48 tests Vitest
├── vite.config.js
├── vitest.config.js
├── playwright.config.js
└── package.json
```

### Fichiers d'entree HTML

| Fichier          | Role                                    |
|------------------|-----------------------------------------|
| `v-login.html`   | Page de login Vue 3                    |
| `v-index.html`   | Application Vue 3                      |
| `login.html`     | Redirection vers `v-login.html`        |
| `index.html`     | Redirection vers `v-index.html`        |

Les fichiers `login.html` et `index.html` redirigent automatiquement vers la v2. Le code legacy a ete supprime.

---

## 9. Développement local

### Prérequis développement

| Logiciel  | Version |
|-----------|---------|
| Node.js   | 20+     |
| npm       | 10+     |

### Lancer le serveur de developpement Vite

```bash
cd app-ui/src/main/webapp

# Installer les dependances
npm install

# Lancer le dev server avec hot reload
npm run dev
```

Le serveur Vite demarre sur `http://localhost:5173` avec :
- **Hot Module Replacement** : les modifications sont refletees instantanement
- **Proxy automatique** : les appels REST sont proxies vers l'API Docker (port 8080)

> **Prerequis** : Les conteneurs `ligoj-db` et `ligoj-api` doivent tourner via Docker Compose.

### Lancer les tests

```bash
# Tests unitaires (48 tests)
npm test

# Tests e2e (53 tests — necessite Docker en marche)
npm run test:e2e

# Tests e2e avec interface graphique
npm run test:e2e:ui
```

### Build de production

```bash
npm run build
```

Genere les fichiers optimises dans `vue-dist/` (integres automatiquement dans le WAR par le Dockerfile).

---

## 10. FAQ et dépannage

### Le premier démarrage est lent

C'est normal. Le conteneur API met 1-2 minutes à initialiser la base de données et charger les plugins. Attendez que `docker compose ps` affiche `(healthy)` pour les 3 conteneurs.

### L'API retourne `{"code":"internal"}` pour les identités

C'est attendu. Sans plugin IAM (LDAP/AD), le système utilise `feature:iam:empty` qui ne gère pas les identités. Le frontend v2 affiche des données de démonstration dans ce cas.

### Je ne vois pas le menu Identity / Users

Cliquez sur **"Identity"** dans la sidebar gauche — c'est un menu dépliable qui contient Users, Groups, Companies et Delegates. Le menu se déplie automatiquement si vous êtes déjà sur une de ces pages.

### Comment voir la v1 originale ?

Le code legacy a ete supprime de ce fork. Pour voir la v1, utiliser l'image Docker officielle :

```bash
docker run --rm -p 9080:8080 ligoj/ligoj-ui:4.0.1
```

### Comment reconstruire l'UI après une modification ?

```bash
docker compose build --no-cache ligoj-ui
docker compose up -d ligoj-ui
```

### Comment réinitialiser complètement ?

```bash
docker compose down -v       # Supprime tout, y compris les données
docker compose up -d         # Redémarre de zéro
```

### Les donnees

L'environnement contient des donnees pre-configurees dans MySQL :

| Donnee     | Quantite | Source      |
|------------|----------|-------------|
| Projets    | 4        | API (MySQL) |
| Delegues   | 5        | API (MySQL) |
| Plugins    | 15       | API (MySQL) |

> **Note** : Sans plugin IAM (LDAP/AD), les pages Users/Groups/Companies affichent des donnees vides. Installez `plugin-id` + `plugin-id-ldap` pour gerer les identites.

---

## Resume

La v2 de Ligoj est production-ready avec 18 vues, 101 tests automatises et un build Docker multi-stage. Elle offre une experience utilisateur modernisee (Material Design, dark mode, SPA fluide) tout en conservant 100% de compatibilite avec le backend existant (API REST, plugins Java, base MySQL).
