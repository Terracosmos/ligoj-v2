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

**Statut actuel** : Prototype fonctionnel (~70-80%) — toutes les pages principales sont opérationnelles et connectées à la même API backend que la v1.

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

### Étape 1 — Récupérer le projet

```bash
# Cloner ou copier le dossier du projet
cd "Ligoj Converter"
```

Le dossier contient :
```
Ligoj Converter/
├── docker-compose.yml        # Orchestration des 3 conteneurs
├── ligoj/
│   ├── app-api/              # Code source API (Java, inchangé)
│   └── app-ui/               # Code source UI (Vue 3 = v2)
│       ├── Dockerfile        # Build multi-stage Node + Maven + Java
│       └── src/main/webapp/
│           ├── src/           # ← Code Vue 3 (nouveau)
│           ├── main/          # ← Code legacy v1 (conservé)
│           └── package.json   # Dépendances Vue 3
└── GUIDE-INSTALLATION-V2.md  # Ce document
```

### Étape 2 — Lancer l'environnement

```bash
docker compose up -d
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

### Étape 4 — Accéder à l'application

| URL                                   | Description         |
|---------------------------------------|---------------------|
| `http://localhost:8080/ligoj/v-login.html` | **Login v2 (Vue 3)** |
| `http://localhost:8080/ligoj/v-index.html` | Application v2      |
| `http://localhost:8080/ligoj/login.html`   | Login v1 (legacy)   |
| `http://localhost:8080/ligoj/index.html`   | Application v1      |

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

| Couche         | Technologie     | Version | Rôle                        |
|----------------|-----------------|---------|-----------------------------|
| Framework UI   | Vue.js          | 3.5     | Composants réactifs         |
| Build tool     | Vite            | 6.0     | Bundling ultra-rapide       |
| UI Library     | Vuetify         | 3.7     | Composants Material Design  |
| State Manager  | Pinia           | 2.2     | Store global réactif        |
| Router         | Vue Router      | 4.5     | Navigation SPA              |
| Icons          | MDI (Material)  | 7.4     | Icônes vectorielles         |

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
| Tests unitaires         | Aucun framework frontend        | Vitest (prévu)                 |
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

### Pages fonctionnelles en v2

| Page             | Route v2           | Données           | Statut        |
|------------------|--------------------|--------------------|---------------|
| Login            | `/v-login.html`    | API auth           | Fonctionnel   |
| Dashboard        | `/#/`              | Statistiques API   | Fonctionnel   |
| Projects         | `/#/home/project`  | API live (4 projets)| Fonctionnel  |
| Delegates        | `/#/id/delegate`   | API live (5 entrées)| Fonctionnel  |
| Users            | `/#/id/user`       | Données démo (8)   | Fonctionnel   |
| Groups           | `/#/id/group`      | Données démo (5)   | Fonctionnel   |
| Companies        | `/#/id/company`    | Données démo (3)   | Fonctionnel   |
| Profile          | `/#/profile`       | Session API        | Fonctionnel   |
| About            | `/#/about`         | Metadata API       | Fonctionnel   |

> **Note sur les données démo** : Les pages Identity (Users, Groups, Companies) utilisent des données démo côté client car aucun fournisseur d'identité (LDAP/AD) n'est configuré. Les pages Projects et Delegates utilisent les vraies données de l'API.

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

### Ce qui reste à faire

| Fonctionnalité                | Priorité | Complexité |
|-------------------------------|----------|------------|
| CRUD Projets (créer/éditer)   | Haute    | Moyenne    |
| CRUD Users (créer/éditer)     | Haute    | Moyenne    |
| Page Subscriptions            | Haute    | Haute      |
| Système de plugins frontend   | Haute    | Haute      |
| Page Administration système   | Moyenne  | Moyenne    |
| Notifications                 | Basse    | Faible     |
| Tests unitaires frontend      | Moyenne  | Moyenne    |
| Migration complète NLS/i18n   | Basse    | Moyenne    |

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

### Comparer v1 et v2

Pour comparer les deux versions côte à côte :

1. Ouvrez un onglet sur `http://localhost:8080/ligoj/v-login.html` (v2)
2. Ouvrez un autre onglet sur `http://localhost:8080/ligoj/login.html` (v1)
3. Connectez-vous avec `admin`/`admin` dans les deux
4. Naviguez dans les mêmes sections pour comparer

---

## 8. Structure du code source

### Arborescence Vue 3 (nouveau code v2)

```
src/main/webapp/src/
├── main.js                    # Point d'entrée application principale
├── login.js                   # Point d'entrée page login
├── App.vue                    # Composant racine
├── LoginApp.vue               # Page de login
├── assets/
│   └── ligoj.svg              # Logo
├── composables/               # Logique réutilisable (hooks)
│   ├── useApi.js              # Appels API REST
│   ├── useDataTable.js        # Tables de données paginées
│   ├── useI18n.js             # Internationalisation
│   └── usePluginContext.js    # Contexte plugins
├── layouts/
│   └── AppLayout.vue          # Layout principal (sidebar + toolbar)
├── plugins/
│   ├── vuetify.js             # Configuration Vuetify + thèmes
│   ├── registry.js            # Registre plugins
│   ├── loader.js              # Chargeur plugins
│   ├── nls-adapter.js         # Adaptateur i18n legacy
│   └── PluginLoader.js        # Chargeur dynamique
├── router/
│   └── index.js               # Routes Vue Router
├── stores/                    # Stores Pinia
│   ├── auth.js                # Session, autorisations, navigation
│   ├── app.js                 # État global (titre, breadcrumbs)
│   ├── error.js               # Gestion erreurs
│   └── i18n.js                # Traductions
└── views/                     # Pages/vues
    ├── HomeView.vue            # Dashboard
    ├── ProjectListView.vue     # Liste projets
    ├── UserListView.vue        # Liste utilisateurs
    ├── GroupListView.vue       # Liste groupes
    ├── CompanyListView.vue     # Liste entreprises
    ├── DelegateListView.vue    # Liste délégués
    ├── ProfileView.vue         # Profil utilisateur
    ├── AboutView.vue           # Page À propos
    ├── SectionView.vue         # Page générique/catch-all
    └── PluginView.vue          # Vue plugin dynamique
```

### Fichiers d'entrée HTML

| Fichier          | Version | Rôle                    |
|------------------|---------|-------------------------|
| `v-login.html`   | v2      | Page de login Vue 3     |
| `v-index.html`   | v2      | Application Vue 3       |
| `login.html`     | v1      | Page de login legacy    |
| `index.html`     | v1      | Application legacy      |

Les deux versions coexistent dans le même WAR grâce à des fichiers HTML séparés.

---

## 9. Développement local

### Prérequis développement

| Logiciel  | Version |
|-----------|---------|
| Node.js   | 20+     |
| npm       | 10+     |

### Lancer le serveur de développement Vite

```bash
cd ligoj/app-ui/src/main/webapp

# Installer les dépendances
npm install

# Lancer le dev server avec hot reload
npm run dev
```

Le serveur Vite démarre sur `http://localhost:5173` avec :
- **Hot Module Replacement** : les modifications sont reflétées instantanément
- **Proxy automatique** : les appels REST sont proxiés vers l'API Docker (port 8081)

> **Prérequis** : Les conteneurs `ligoj-db` et `ligoj-api` doivent tourner via Docker Compose.

### Build de production

```bash
npm run build
```

Génère les fichiers optimisés dans `vue-dist/` (intégrés automatiquement dans le WAR par le Dockerfile).

---

## 10. FAQ et dépannage

### Le premier démarrage est lent

C'est normal. Le conteneur API met 1-2 minutes à initialiser la base de données et charger les plugins. Attendez que `docker compose ps` affiche `(healthy)` pour les 3 conteneurs.

### L'API retourne `{"code":"internal"}` pour les identités

C'est attendu. Sans plugin IAM (LDAP/AD), le système utilise `feature:iam:empty` qui ne gère pas les identités. Le frontend v2 affiche des données de démonstration dans ce cas.

### Je ne vois pas le menu Identity / Users

Cliquez sur **"Identity"** dans la sidebar gauche — c'est un menu dépliable qui contient Users, Groups, Companies et Delegates. Le menu se déplie automatiquement si vous êtes déjà sur une de ces pages.

### Comment revenir à la v1 ?

Changez simplement l'URL :
- v2 : `http://localhost:8080/ligoj/v-index.html`
- v1 : `http://localhost:8080/ligoj/index.html`

Les sessions sont partagées — pas besoin de se reconnecter.

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

### Les données de démonstration

L'environnement contient des données pré-configurées :

| Donnée     | Quantité | Source      |
|------------|----------|-------------|
| Projets    | 4        | API (MySQL) |
| Délégués   | 5        | API (MySQL) |
| Utilisateurs | 8      | Démo client |
| Groupes    | 5        | Démo client |
| Entreprises | 3       | Démo client |

---

## Résumé

La v2 de Ligoj est un prototype fonctionnel qui démontre la faisabilité de la migration frontend. Elle offre une expérience utilisateur modernisée (Material Design, dark mode, SPA fluide) tout en conservant 100% de compatibilité avec le backend existant. Les deux versions coexistent, permettant une migration progressive et une comparaison directe.
