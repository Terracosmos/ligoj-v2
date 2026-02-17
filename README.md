<p align="center">
  <img src="https://ligoj.io/img/ligoj-light.png" alt="Ligoj" width="200">
</p>

<h1 align="center">Ligoj v2</h1>

<p align="center">
  <strong>Frontend Vue 3 moderne pour la plateforme Ligoj</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Vuetify-3.7-1867C0?logo=vuetify&logoColor=white" alt="Vuetify">
  <img src="https://img.shields.io/badge/Pinia-2.2-FFD859?logo=pinia&logoColor=black" alt="Pinia">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white" alt="Java 21">
  <img src="https://img.shields.io/badge/Tests-194-brightgreen?logo=vitest&logoColor=white" alt="194 tests">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

<p align="center">
  Fork de <a href="https://github.com/ligoj/ligoj">ligoj/ligoj</a> avec le frontend entierement reecrit.<br>
  Le backend Java (API REST, plugins, MySQL) reste <strong>identique et 100% compatible</strong>.
</p>

---

## Demarrage rapide

> **Prerequis** : [Docker](https://docs.docker.com/get-docker/) 20.10+ et [Docker Compose](https://docs.docker.com/compose/install/) v2+, 4 Go de RAM.
> Aucune installation de Java, Node.js ou MySQL requise.

```bash
git clone https://github.com/Terracosmos/ligoj-v2.git
cd ligoj-v2
git checkout vue3-migration
docker compose up -d --build
```

Attendre ~3 min que les 3 conteneurs soient `healthy` (`docker compose ps`), puis ouvrir :

**http://localhost:8080/ligoj/** &mdash; Login : `admin` / `admin`

---

## Architecture

```
                     :8080                    :8081
 Navigateur  ──────>  ligoj-ui  ──────────>  ligoj-api  ──────>  ligoj-db
 (Vue 3 SPA)         Spring Boot             Spring Boot          MySQL 8
                     + fichiers Vue          REST API
                     + proxy REST            + plugins Java
```

| Service | Image | Port | Description |
|:--------|:------|:----:|:------------|
| **ligoj-db** | `mysql:8.0` | &mdash; | Base de donnees |
| **ligoj-api** | `ligoj/ligoj-api:4.0.1` | 8081 | API REST backend + plugins |
| **ligoj-ui** | Build local (Dockerfile) | 8080 | Frontend Vue 3 + proxy Spring |

---

## Stack technique

| Couche | Technologie | Version | |
|:-------|:------------|:-------:|:-|
| Framework UI | Vue.js | 3.5 | Composition API, `<script setup>` |
| Build | Vite | 6.0 | HMR < 100ms, build < 2s |
| UI Library | Vuetify | 3.7 | Material Design 3 |
| State | Pinia | 2.2 | Stores reactifs |
| Router | Vue Router | 4.5 | Hash mode, guards auth |
| Icons | MDI | 7.4 | 7 000+ icones Material |
| Tests unitaires | Vitest | 4.0 | 141 tests |
| Tests e2e | Playwright | 1.58 | 53 tests |
| Runtime | Java 21 Temurin | 21 | Spring Boot |
| Build Docker | Node 22 + Maven 3.9 | &mdash; | Multi-stage |

---

## Tests

| Suite | Framework | Tests | Temps |
|:------|:----------|------:|------:|
| Stores & composables | Vitest | 50 | ~0.1s |
| Plugin system | Vitest | 16 | ~0.1s |
| Plugin formatters | Vitest | 37 | ~0.1s |
| Plugin API & contracts | Vitest | 40 | ~0.1s |
| Views | Vitest | 3 | ~0.1s |
| **Unitaires (total)** | **Vitest** | **141** | **~2s** |
| End-to-end | Playwright | 53 | ~18s |
| **Total** | | **194** | |

---

## Pages disponibles (18 vues)

| Page | Route | Donnees |
|:-----|:------|:--------|
| Login | `/v-login.html` | API auth |
| Dashboard | `/#/` | Cartes de navigation |
| Projects (liste) | `/#/home/project` | 4 projets (MySQL) |
| Project (detail) | `/#/home/project/:id` | Souscriptions |
| Project (edit) | `/#/home/project/:id/edit` | Formulaire CRUD |
| Users | `/#/id/user` | API live |
| Groups | `/#/id/group` | API live |
| Companies | `/#/id/company` | API live |
| Delegates | `/#/id/delegate` | 5 delegations (MySQL) |
| Container Scopes | `/#/id/container-scope` | Onglets group/company |
| Administration | `/#/admin` | 15 plugins actifs |
| Profile | `/#/profile` | Session, roles |
| About | `/#/about` | Version, features |

> Sans plugin IAM (LDAP/AD), le systeme utilise `feature:iam:empty`. Les pages Identity affichent les donnees retournees par l'API (qui peuvent etre vides). Les pages Projects et Delegates utilisent les vraies donnees MySQL.

### Fonctionnalites transversales

| | Fonctionnalite | | Fonctionnalite |
|:--|:--------------|:--|:--------------|
| **&check;** | Authentification / Logout | **&check;** | Dark mode |
| **&check;** | Session persistante | **&check;** | Responsive mobile |
| **&check;** | Sidebar navigation | **&check;** | Breadcrumbs |
| **&check;** | Recherche dans les tables | **&check;** | Tri des colonnes |
| **&check;** | Pagination serveur | **&check;** | Import/Export CSV |
| **&check;** | Bulk select/delete | **&check;** | Form guards (dirty state) |
| **&check;** | Gestion d'erreurs (snackbar) | **&check;** | Loading skeletons |
| **&check;** | i18n FR/EN | **&check;** | RBAC (autorisations UI) |

---

## Comparatif v1 vs v2

### Stack

| | v1 (Legacy) | v2 (Moderne) |
|:--|:------------|:-------------|
| **Framework** | jQuery 3 | Vue 3 (Composition API) |
| **UI** | Bootstrap 3 | Vuetify 3 (Material Design) |
| **Templates** | Handlebars (.html) | Single File Components (.vue) |
| **Modules** | RequireJS (AMD) | Vite (ES Modules natifs) |
| **State** | Variables globales / DOM | Pinia (stores reactifs) |
| **Build** | Minification manuelle (r.js) | Vite (tree-shaking, HMR) |
| **Tests** | Aucun | 194 (Vitest + Playwright) |

### Experience utilisateur

| | v1 | v2 |
|:--|:---|:---|
| **Design** | Bootstrap 3 (date) | Material Design 3 (moderne) |
| **Navigation** | Rechargement page par page | SPA fluide |
| **Dark mode** | Non | Oui |
| **Responsive** | Partiel | Complet (mobile-first) |
| **Hot reload** | Non | Oui (< 100ms) |
| **Build** | ~30s | ~2s |

> Le backend (API REST, plugins Java, base MySQL, authentification, URLs) est **strictement identique** entre v1 et v2.

---

## Structure du code

```
app-ui/src/main/webapp/
├── src/
│   ├── main.js                    Point d'entree application
│   ├── login.js                   Point d'entree login (leger, sans Vuetify)
│   ├── App.vue                    Composant racine
│   ├── LoginApp.vue               Page de login
│   ├── composables/               8 composables
│   │   ├── useApi.js              Appels API (fetch natif)
│   │   ├── useDataTable.js        Tables paginées server-side
│   │   ├── useFormGuard.js        Protection formulaires
│   │   ├── useImportExport.js     Import/export CSV
│   │   └── ...
│   ├── layouts/AppLayout.vue      Sidebar + toolbar + breadcrumbs
│   ├── plugins/                   Systeme de plugins
│   │   ├── registry.js            Registre reactif
│   │   ├── loader.js              Chargement dynamique
│   │   ├── nls-adapter.js         Adaptateur i18n legacy
│   │   ├── prov/                  Plugin provisioning (charts, terraform)
│   │   ├── bt-jira/               Plugin JIRA
│   │   ├── build-jenkins/         Plugin Jenkins
│   │   ├── scm-git/               Plugin Git
│   │   ├── km-confluence/         Plugin Confluence
│   │   ├── vm/                    Plugin VM
│   │   └── inbox-sql/             Plugin Inbox
│   ├── router/index.js            Routes Vue Router
│   ├── stores/                    4 stores Pinia
│   │   ├── auth.js                Session, login/logout, roles
│   │   ├── app.js                 Titre, breadcrumbs, sidebar
│   │   ├── error.js               File d'erreurs, auto-dismiss
│   │   └── i18n.js                Locale, messages, t(key)
│   ├── views/                     18 vues
│   └── i18n/                      Traductions EN + FR
├── e2e/                           53 tests Playwright
├── src/__tests__/                 141 tests Vitest
├── vite.config.js
├── playwright.config.js
└── package.json
```

---

## Developpement local

**Prerequis** : Node.js 20+, npm 10+. Docker doit tourner pour le backend.

```bash
cd app-ui/src/main/webapp
npm install

npm run dev         # Dev server Vite (http://localhost:5173) avec HMR
npm test            # 141 tests unitaires Vitest (~2s)
npm run test:e2e    # 53 tests e2e Playwright (~18s)
npm run build       # Build production (~2s)
```

---

## Commandes Docker

```bash
docker compose up -d --build           # Demarrer (premier build ~3 min)
docker compose ps                      # Verifier l'etat (attendre "healthy")
docker compose logs -f ligoj-ui        # Logs du frontend
docker compose logs -f ligoj-api       # Logs de l'API

docker compose build --no-cache ligoj-ui && docker compose up -d ligoj-ui
                                       # Reconstruire l'UI apres modification

docker compose down                    # Arreter (donnees conservees)
docker compose down -v                 # Arreter et supprimer les donnees
```

---

## FAQ

<details>
<summary><strong>Le premier demarrage est lent</strong></summary>

C'est normal. L'API met 1-2 minutes a initialiser la base et charger les plugins. Attendez que `docker compose ps` affiche `(healthy)` pour les 3 conteneurs.
</details>

<details>
<summary><strong>L'API retourne <code>{"code":"internal"}</code> pour les identites</strong></summary>

C'est attendu. Sans plugin IAM (LDAP/AD), le systeme utilise `feature:iam:empty`. Le frontend affiche les donnees retournees par l'API (qui peuvent etre vides).
</details>

<details>
<summary><strong>Je ne vois pas le menu Identity / Users</strong></summary>

Cliquez sur **"Identity"** dans la sidebar — c'est un menu depliable qui contient Users, Groups, Companies et Delegates.
</details>

<details>
<summary><strong>Comment voir la v1 originale ?</strong></summary>

Le code legacy a ete supprime de ce fork. Pour voir la v1 :

```bash
docker run --rm -p 9080:8080 ligoj/ligoj-ui:4.0.1
```

Puis ouvrir `http://localhost:9080/ligoj/`.
</details>

<details>
<summary><strong>Donnees pre-configurees</strong></summary>

| Donnee | Quantite | Source |
|:-------|:--------:|:-------|
| Projets | 4 | MySQL |
| Delegues | 5 | MySQL |
| Plugins | 15 | MySQL |

Sans plugin IAM, les pages Users/Groups/Companies sont vides. Installez `plugin-id` + `plugin-id-ldap` pour gerer les identites.
</details>

---

## Documentation

| Document | Description |
|:---------|:------------|
| [RAPPORT-MIGRATION-V2.md](RAPPORT-MIGRATION-V2.md) | Compte-rendu de migration (respect du cahier des charges, parcours de test) |
| [AUDIT.md](app-ui/src/main/webapp/AUDIT.md) | Audit de securite et architecture |

---

<p align="center">
  <strong>Upstream</strong> : <a href="https://github.com/ligoj/ligoj">github.com/ligoj/ligoj</a>
  &nbsp;&bull;&nbsp;
  <strong>Branche</strong> : <code>vue3-migration</code>
  &nbsp;&bull;&nbsp;
  <strong>License</strong> : <a href="LICENSE">MIT</a>
</p>
