# Guide de Contribution

Merci de votre intérêt pour contribuer à Poker Planning! Ce document décrit les processus et conventions pour contribuer au projet.

## 🌟 Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les Issues
2. Créez une nouvelle Issue avec:
   - Un titre descriptif
   - Les étapes pour reproduire le bug
   - Le comportement attendu vs le comportement observé
   - Votre environnement (OS, Node version, navigateur)
   - Des screenshots si applicable

### Proposer une fonctionnalité

1. Ouvrez une Issue pour discuter de la fonctionnalité
2. Décrivez le cas d'usage et les bénéfices
3. Attendez les retours avant de commencer le développement

### Soumettre du code

1. Forkez le repository
2. Créez une branche depuis `main`:
   ```bash
   git checkout -b feature/ma-fonctionnalite
   # ou
   git checkout -b fix/mon-correctif
   ```
3. Faites vos modifications
4. Testez vos changements
5. Committez avec des messages clairs
6. Poussez vers votre fork
7. Ouvrez une Pull Request

## 🏗️ Setup de développement

### Installation

```bash
# Cloner votre fork
git clone https://github.com/VOTRE-USERNAME/poc-er-planning.git
cd poc-er-planning

# Installer les dépendances
pnpm install

# Installer Playwright
pnpm exec playwright install chromium
```

### Lancement

```bash
# Terminal 1 - Serveur SSE
pnpm run dev:server

# Terminal 2 - Frontend
pnpm run dev
```

### Tests

Avant de soumettre du code, assurez-vous que tous les tests passent:

```bash
# Lancer tous les tests
pnpm test

# Tests avec UI pour debug
pnpm test:ui
```

## 📝 Conventions de code

### TypeScript

- Utilisez TypeScript strict
- Définissez des types explicites pour les interfaces publiques
- Évitez `any`, préférez `unknown` si nécessaire
- Utilisez des noms descriptifs pour les variables et fonctions

### React

- Composants fonctionnels avec hooks uniquement
- Utilisez `useMemo` et `useCallback` judicieusement pour la performance
- Props typées avec des interfaces
- Pas de composants inline dans le JSX

### Styling

- Tailwind CSS uniquement (pas de CSS custom sauf nécessaire)
- Classes utilitaires dans l'ordre: layout → spacing → colors → effects
- Utilisez les variantes responsive: `sm:`, `md:`, `lg:`
- Extrayez les patterns répétitifs en composants

### Nommage

**Fichiers:**
- Composants: `PascalCase.tsx` (ex: `PlanningCard.tsx`)
- Hooks: `camelCase.ts` avec préfixe `use` (ex: `usePlanningSession.ts`)
- Utilitaires: `camelCase.ts` (ex: `teamConfig.ts`)
- Types: `camelCase.ts` (ex: `team.ts`)

**Code:**
- Composants: `PascalCase`
- Fonctions/variables: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Git

**Messages de commit:**

Suivez le format conventionnel:

```
type(scope): description courte

Description plus détaillée si nécessaire

Fixes #123
```

**Types:**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, pas de changement de code
- `refactor`: Refactoring sans changement de fonctionnalité
- `test`: Ajout/modification de tests
- `chore`: Maintenance, dépendances

**Exemples:**
```
feat(voting): add ability to change vote
fix(sse): reconnect on connection loss
docs(readme): update installation instructions
test(planning): add multi-user scenario
```

## 🧪 Tests

### Écrire des tests

Les tests Playwright doivent:
- Tester des scénarios utilisateur complets
- Simuler plusieurs utilisateurs si nécessaire
- Vérifier la synchronisation temps réel
- Utiliser le Page Object Pattern (voir `tests/helpers/`)

**Exemple:**

```typescript
test('nouveau scénario', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  const planning = new PlanningPage(page)

  await page.goto('/')
  await planning.selectUser('John Doe')
  await planning.vote(5)

  // Assertions...

  await context.close()
})
```

### Règles pour les tests

- Un test = un scénario utilisateur
- Tests indépendants (pas d'état partagé)
- Noms descriptifs expliquant le scénario
- Reset du serveur avant chaque test si nécessaire
- Timeouts généreux pour la synchronisation SSE

## 🏛️ Architecture

### Structure des dossiers

```
server/          # Backend Hono + SSE
src/
  components/    # Composants UI React
  hooks/         # Custom React hooks
  lib/           # Fonctions utilitaires
  types/         # Définitions TypeScript
tests/
  helpers/       # Page Objects pour Playwright
  *.spec.ts      # Fichiers de test
```

### Patterns

**State Management:**
- État local avec `useState` pour l'UI
- SSE pour l'état partagé entre utilisateurs
- Pas de Redux/Zustand pour l'instant

**API Communication:**
- SSE pour recevoir les mises à jour (read)
- Fetch POST pour envoyer les actions (write)
- Pas de polling

**Error Handling:**
- Try/catch dans les appels API
- Console.error pour le debug
- Messages utilisateur pour les erreurs critiques

## 📋 Checklist avant PR

- [ ] Le code compile sans erreurs TypeScript
- [ ] Tous les tests passent (`pnpm test`)
- [ ] Le code suit les conventions du projet
- [ ] Les nouveaux fichiers ont les imports/exports appropriés
- [ ] La documentation est à jour si nécessaire
- [ ] Les messages de commit suivent les conventions
- [ ] Pas de console.log oubliés (sauf pour debug intentionnel)
- [ ] L'accessibilité est maintenue (aria-labels, etc.)

## 🤔 Questions?

N'hésitez pas à:
- Ouvrir une Issue pour discuter
- Demander des clarifications dans votre PR
- Proposer des améliorations à ce guide

## 📄 Code de Conduite

- Respectez les autres contributeurs
- Acceptez les critiques constructives
- Focalisez sur ce qui est meilleur pour le projet
- Faites preuve d'empathie

Merci de contribuer! 🎉