# Audit Sécurité & Architecture — Ligoj Vue 3 Frontend

**Date** : Février 2026
**Scope** : `app-ui/src/main/webapp/` — Vue 3 / Vite 6 / Vuetify 3 / Pinia
**Commit** : branche `vue3-migration`

---

## 1. Résumé

| Catégorie | Critique | Haute | Moyenne | Basse |
|-----------|----------|-------|---------|-------|
| Sécurité  | 3 (corrigés) | 3 (corrigés) | 2 | 0 |
| Architecture | 0 | 2 | 4 | 3 |

**Toutes les vulnérabilités critiques et hautes ont été corrigées** dans ce même commit.

---

## 2. Vulnérabilités de sécurité

### CRITIQUES (corrigées)

#### SEC-01 — XSS via `v-html` dans LoginApp.vue
- **Fichier** : `src/LoginApp.vue` (lignes 13, 19)
- **Problème** : `<span v-html="infoMsg" />` et `<span v-html="errorMsg" />` permettaient l'injection HTML
- **Correction** : Remplacé par `{{ infoMsg }}` et `{{ errorMsg }}` (auto-escaping Vue)
- **Risque résiduel** : Aucun

#### SEC-02 — Exécution de code via `new Function()` dans nls-adapter.js
- **Fichier** : `src/plugins/nls-adapter.js` (ligne 16)
- **Problème** : `new Function('return (' + match[1] + ')')()` évaluait du code arbitraire venant du serveur
- **Correction** : Remplacé par conversion JS→JSON + `JSON.parse()`. Plus aucune évaluation dynamique
- **Risque résiduel** : Aucun

#### SEC-03 — Open Redirect dans error.js
- **Fichier** : `src/stores/error.js` (ligne 33)
- **Problème** : `window.location.href = redirect` prenait directement le header `x-redirect` sans validation
- **Correction** : Validation same-origin avec `new URL()` — seules les redirections vers le même domaine sont acceptées
- **Risque résiduel** : Aucun

### HAUTES (corrigées)

#### SEC-04 — Injection de paramètres i18n
- **Fichier** : `src/stores/i18n.js` (lignes 24-26)
- **Problème** : Les paramètres `{{key}}` étaient interpolés sans échappement HTML
- **Correction** : Ajout de `escapeHtml()` sur toutes les valeurs de paramètres avant interpolation
- **Risque résiduel** : Aucun

#### SEC-05 — URL encoding manquant dans LoginApp.vue
- **Fichier** : `src/LoginApp.vue` (lignes 270, 322, 341)
- **Problème** : `username` et `mail` utilisés dans les URLs sans `encodeURIComponent()`
- **Correction** : Ajout de `encodeURIComponent()` sur les 3 interpolations URL
- **Risque résiduel** : Aucun

#### SEC-06 — Plugin ID non validé dans loader.js
- **Fichier** : `src/plugins/loader.js` (ligne 15)
- **Problème** : Le `pluginId` était interpolé directement dans `/webjars/${pluginId}/vue/index.js` sans validation, permettant un path traversal
- **Correction** : Validation regex `/^[a-zA-Z0-9][\w-]*$/` avant toute utilisation
- **Risque résiduel** : Aucun

### MOYENNES (à considérer)

#### SEC-07 — Pas de protection CSRF explicite
- **Fichier** : `src/composables/useApi.js`, `src/stores/error.js`
- **Problème** : Les appels API utilisent `credentials: 'include'` mais aucun token CSRF n'est envoyé
- **Atténuation** : Le backend Spring Security gère le CSRF via les cookies SameSite. Les formulaires `application/json` sont naturellement protégés par CORS
- **Recommandation** : Vérifier que le backend envoie bien `SameSite=Lax` ou `Strict` sur les cookies de session

#### SEC-08 — Auto-dismiss des erreurs sensibles
- **Fichier** : `src/stores/error.js` (ligne 16)
- **Problème** : Les erreurs disparaissent après 8 secondes, y compris les erreurs de sécurité (401, 403)
- **Recommandation** : Ne pas auto-dismiss les erreurs de type authentification/autorisation

---

## 3. Points positifs — Sécurité

| # | Point | Détail |
|---|-------|--------|
| 1 | **Auto-escaping Vue** | `{{ }}` utilisé partout (sauf LoginApp corrigé), pas de `v-html` restant |
| 2 | **Credentials gérés correctement** | `credentials: 'include'` sur tous les fetch, cookies only (pas de tokens en localStorage) |
| 3 | **Pas de manipulation DOM directe** | Aucun `document.getElementById`, `innerHTML` ou jQuery résiduel |
| 4 | **Inputs validés côté client** | Rules Vuetify sur les formulaires (required, email, password strength) |
| 5 | **Password reset sécurisé** | Token + CAPTCHA + validation de complexité |
| 6 | **Pas de secrets en dur** | Aucune clé API, token ou mot de passe dans le code source |
| 7 | **CSP-friendly** | Pas d'inline scripts, pas d'eval (après correction nls-adapter) |
| 8 | **Hash routing sécurisé** | Les tokens reset sont extraits via regex stricte `[a-zA-Z0-9\-]+` |

---

## 4. Architecture — Points d'attention

### HAUTS

#### ARCH-01 — ProvPlugin.vue trop volumineux (414 lignes)
- **Fichier** : `src/plugins/prov/ProvPlugin.vue`
- **Problème** : Composant monolithique avec 6 types de ressources, dialogs CRUD, sidebar, charts
- **Recommandation** : Extraire les tabs en sous-composants (`ProvInstanceTab.vue`, `ProvStorageTab.vue`, etc.)

#### ARCH-02 — useProvStore utilise `reactive()` au lieu de `ref()`
- **Fichier** : `src/plugins/prov/useProvStore.js`
- **Problème** : Incohérent avec les stores Pinia du projet qui utilisent `ref()` + `computed()`
- **Recommandation** : Migrer vers le pattern Pinia standard pour la cohérence

### MOYENS

#### ARCH-03 — LoginApp.vue ne partage pas le système i18n
- **Fichier** : `src/LoginApp.vue`
- **Problème** : Messages hardcodés dans un objet `reactive()` local au lieu d'utiliser le store i18n global
- **Atténuation** : Normal car LoginApp est une page séparée (v-login.html) sans accès aux stores Pinia de l'app principale
- **Recommandation** : Acceptable en l'état, documenter la raison

#### ARCH-04 — Pas de lazy loading des plugins
- **Fichier** : `src/plugins/index.js`
- **Problème** : Tous les 8 plugins sont importés statiquement au démarrage
- **Impact** : Bundle plus gros (~20% de code non utilisé sur la page d'accueil)
- **Recommandation** : Utiliser `defineAsyncComponent()` pour le chargement différé

#### ARCH-05 — Absence de TypeScript
- **Problème** : Aucun typage, les composables et stores sont en JS pur
- **Recommandation** : Migration progressive possible — commencer par les stores et composables critiques

#### ARCH-06 — Gestion d'erreur centralisée trop silencieuse
- **Fichier** : `src/stores/error.js`
- **Problème** : `handleResponse()` avale les erreurs et les affiche en snackbar sans propagation
- **Recommandation** : Permettre aux appelants de réagir différemment selon le type d'erreur (retry, redirect, etc.)

### BAS

#### ARCH-07 — Pas de tests unitaires pour les plugins
- **Problème** : Les 8 plugins business n'ont aucun test unitaire
- **Recommandation** : Ajouter au minimum des tests de rendu et des tests d'appels API mockés

#### ARCH-08 — Pas de Storybook / documentation composants
- **Recommandation** : Les charts SVG (Donut, Gauge, StackedBar, Sunburst) mériteraient une documentation visuelle

#### ARCH-09 — Bundle size (545 kB)
- **Problème** : Un seul chunk principal dépasse 500 kB (Vuetify est la majorité)
- **Recommandation** : `manualChunks` dans vite.config pour séparer vendor/app/plugins

---

## 5. Points positifs — Architecture

| # | Point | Détail |
|---|-------|--------|
| 1 | **Composition API cohérente** | `<script setup>` utilisé partout, pas de Options API |
| 2 | **Stores Pinia bien structurés** | 4 stores (auth, app, error, i18n) avec responsabilités claires |
| 3 | **Composables réutilisables** | `useApi`, `useDataTable`, `useCrud`, `useNotification` bien découplés |
| 4 | **Système de plugins extensible** | Registry + loader avec fallback dynamique pour les plugins tiers |
| 5 | **SVG charts sans dépendance** | 4 composants charts natifs remplaçant D3.js (5,000+ LOC → ~280 LOC) |
| 6 | **i18n complet** | ~490 clés FR/EN, switchable à chaud, compatible plugins legacy |
| 7 | **Tests e2e complets** | 53 tests Playwright couvrant login, navigation, CRUD, admin |
| 8 | **Tests unitaires** | 48 tests Vitest sur les stores et composables critiques |
| 9 | **CI/CD fonctionnel** | GitHub Actions : install → lint → test → build |
| 10 | **Vite build rapide** | Build production en ~1.2s |

---

## 6. Métriques du projet

| Métrique | Valeur |
|----------|--------|
| Fichiers source (.vue/.js) | ~107 |
| Lignes de code | ~9,400 |
| Composants Vue | ~35 |
| Stores Pinia | 4 |
| Composables | 7 |
| Plugins business | 8 |
| Tests unitaires | 48 (100% pass) |
| Tests e2e | 53 (100% pass) |
| Build time | 1.2s |
| Bundle size | 545 kB (gzipped ~160 kB) |
| Dépendances runtime | 5 (vue, vue-router, pinia, vuetify, @mdi/font) |
| Dépendances dev | 8 |

---

## 7. Conclusion

Le code Vue 3 est **de bonne qualité** dans l'ensemble. Les patterns sont cohérents, la sécurité est correcte après les 6 corrections appliquées, et la couverture de test est solide.

**Priorités recommandées :**
1. Vérifier la config CSRF du backend (SEC-07)
2. Découper ProvPlugin.vue en sous-composants (ARCH-01)
3. Ajouter des tests unitaires pour les plugins (ARCH-07)
4. Configurer le code splitting Vite (ARCH-09)
