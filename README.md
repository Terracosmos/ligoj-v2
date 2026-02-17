# Ligoj v2 — Frontend Vue 3

> Fork de [ligoj/ligoj](https://github.com/ligoj/ligoj) avec un frontend entierement reecrit en **Vue 3 + Vite + Vuetify 3 + Pinia**.
> Le backend Java (API) reste identique et 100% compatible.

## Demarrage rapide

**Prerequis** : [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/) (v2+).

```bash
git clone https://github.com/Terracosmos/ligoj-v2.git
cd ligoj-v2
git checkout vue3-migration
docker compose up -d --build
```

Attendre ~3 minutes que les 3 conteneurs soient `healthy` :

```bash
docker compose ps
```

Ouvrir : **http://localhost:8080/ligoj/**

| Identifiant | Mot de passe | Role  |
|-------------|--------------|-------|
| `admin`     | `admin`      | ADMIN |

## Architecture

```
Navigateur        ligoj-ui (:8080)      ligoj-api (:8081)      ligoj-db
  Vue 3 SPA  --->  Spring Boot     --->  Spring Boot REST  --->  MySQL 8
                    + proxy REST          + plugins Java
```

3 conteneurs Docker :

| Service    | Image                    | Port | Role                            |
|------------|--------------------------|------|---------------------------------|
| `ligoj-db` | `mysql:8.0`             | -    | Base de donnees                 |
| `ligoj-api`| `ligoj/ligoj-api:4.0.1` | 8081 | API REST backend                |
| `ligoj-ui` | Build local (Dockerfile) | 8080 | Frontend Vue 3 + proxy Spring  |

## Stack technique v2

| Couche        | Technologie    | Version |
|---------------|----------------|---------|
| Framework UI  | Vue.js         | 3.5     |
| Build         | Vite           | 6.0     |
| UI Library    | Vuetify        | 3.7     |
| State         | Pinia          | 2.2     |
| Router        | Vue Router     | 4.5     |
| Tests unit.   | Vitest         | 4.0     |
| Tests e2e     | Playwright     | 1.58    |
| Runtime       | Java 21 (Temurin) | 21   |
| Build image   | Node 22 + Maven 3.9 | -  |

## Couverture de tests

| Type       | Framework  | Tests |
|------------|------------|-------|
| Unitaires  | Vitest     | 48    |
| End-to-end | Playwright | 53    |
| **Total**  |            | **101** |

## Pages disponibles

| Page              | Route              | Statut      |
|-------------------|--------------------|-------------|
| Login             | `/v-login.html`    | Fonctionnel |
| Dashboard         | `/#/`              | Fonctionnel |
| Projects (liste)  | `/#/home/project`  | Fonctionnel |
| Project (detail)  | `/#/home/project/:id` | Fonctionnel |
| Project (edit)    | `/#/home/project/:id/edit` | Fonctionnel |
| Users (liste)     | `/#/id/user`       | Fonctionnel |
| User (edit)       | `/#/id/user/:id`   | Fonctionnel |
| Groups (liste)    | `/#/id/group`      | Fonctionnel |
| Group (edit)      | `/#/id/group/:id`  | Fonctionnel |
| Companies (liste) | `/#/id/company`    | Fonctionnel |
| Company (edit)    | `/#/id/company/:id`| Fonctionnel |
| Delegates (liste) | `/#/id/delegate`   | Fonctionnel |
| Delegate (edit)   | `/#/id/delegate/:id` | Fonctionnel |
| Container Scopes  | `/#/id/container-scope` | Fonctionnel |
| Administration    | `/#/admin`         | Fonctionnel |
| Profile           | `/#/profile`       | Fonctionnel |
| About             | `/#/about`         | Fonctionnel |

## Comparatif v1 vs v2

| Aspect              | v1 (Legacy)                    | v2 (Moderne)                   |
|---------------------|--------------------------------|--------------------------------|
| Framework JS        | jQuery 3.x                     | Vue 3 (Composition API)       |
| UI Framework        | Bootstrap 3                    | Vuetify 3 (Material Design)   |
| Templates           | Handlebars (.html)             | Single File Components (.vue) |
| Module loader       | RequireJS (AMD)                | Vite (ES Modules natifs)      |
| State management    | Variables globales / DOM       | Pinia (stores reactifs)       |
| Build               | Minification manuelle (r.js)   | Vite (tree-shaking, HMR)     |
| Dark mode           | Non                            | Oui                           |
| Tests frontend      | Aucun                          | 101 (Vitest + Playwright)    |
| Hot reload          | Non                            | Oui (HMR < 100ms)            |

Le backend (API REST, plugins, base de donnees) est **identique** entre v1 et v2.

## Structure du code Vue 3

```
app-ui/src/main/webapp/
├── src/
│   ├── main.js                 # Point d'entree app
│   ├── login.js                # Point d'entree login
│   ├── App.vue                 # Composant racine
│   ├── LoginApp.vue            # Page login
│   ├── composables/            # 8 composables (useApi, useDataTable, useI18n...)
│   ├── layouts/AppLayout.vue   # Layout sidebar + toolbar
│   ├── plugins/                # 8 plugins metier migres + config Vuetify
│   ├── router/index.js         # Routes
│   ├── stores/                 # 4 stores Pinia (auth, app, error, i18n)
│   └── views/                  # 18 vues
├── e2e/                        # 53 tests Playwright
├── __tests__/                  # 48 tests Vitest
├── vite.config.js
├── vitest.config.js
├── playwright.config.js
└── package.json
```

## Developpement local

**Prerequis** : Node.js 20+, npm 10+. Les conteneurs `ligoj-db` et `ligoj-api` doivent tourner.

```bash
cd app-ui/src/main/webapp

# Installer les dependances
npm install

# Dev server avec hot reload (http://localhost:5173)
npm run dev

# Tests unitaires
npm test

# Tests e2e (necessite Docker en marche)
npm run test:e2e

# Build production
npm run build
```

## Commandes Docker utiles

```bash
# Demarrer
docker compose up -d --build

# Verifier l'etat
docker compose ps

# Voir les logs UI
docker compose logs -f ligoj-ui

# Voir les logs API
docker compose logs -f ligoj-api

# Reconstruire uniquement l'UI apres modification
docker compose build --no-cache ligoj-ui && docker compose up -d ligoj-ui

# Arreter (donnees conservees)
docker compose down

# Arreter et supprimer les donnees
docker compose down -v
```

## Documentation detaillee

Voir [GUIDE-INSTALLATION-V2.md](GUIDE-INSTALLATION-V2.md) pour :
- Comparatif complet v1 vs v2
- Guide d'utilisation avec captures
- FAQ et depannage
- Structure detaillee du code

## Liens

- **Upstream** : [github.com/ligoj/ligoj](https://github.com/ligoj/ligoj)
- **Branche** : `vue3-migration`
- **License** : [MIT](LICENSE)
