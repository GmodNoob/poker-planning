# Poker Planning

Application web de poker planning collaboratif pour l'estimation agile en équipe utilisant la suite de Fibonacci.

## 🎯 Fonctionnalités

- **Session de planning en temps réel** avec synchronisation SSE (Server-Sent Events)
- **Votes anonymes** jusqu'à la révélation collective
- **Suite de Fibonacci** pour l'estimation (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?)
- **Statistiques automatiques** (moyenne, mode, nombre de votes)
- **Configuration d'équipe** via fichier JSON
- **Interface moderne** avec animations et effets visuels
- **Multi-utilisateurs** - plusieurs personnes peuvent voter simultanément

## 🛠️ Stack Technique

### Frontend
- **React 19** avec TypeScript
- **Vite 7** pour le build et le dev server
- **Tailwind CSS 4** pour le styling
- **TanStack** (Query, Router, Table)

### Backend
- **Hono** - Framework web léger pour le serveur SSE
- **Server-Sent Events** pour la synchronisation temps réel
- **Node.js** avec TypeScript

### Tests
- **Playwright** pour les tests end-to-end multi-utilisateurs

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Cloner le repository
git clone <url>
cd poc-er-planning

# Installer les dépendances
pnpm install

# Installer les navigateurs Playwright (pour les tests)
pnpm exec playwright install chromium
```

### Lancement en développement

L'application nécessite 2 serveurs en parallèle:

```bash
# Terminal 1 - Serveur SSE
pnpm run dev:server

# Terminal 2 - Frontend Vite
pnpm run dev
```

Puis ouvrir plusieurs navigateurs/onglets sur:
- **Frontend**: http://localhost:5173
- **API SSE**: http://localhost:3001

### Configuration de l'équipe

Éditez le fichier `team.config.json` pour définir les membres de votre équipe:

```json
{
  "team": {
    "name": "Équipe Dev",
    "members": [
      {
        "id": "1",
        "name": "John Doe",
        "role": "Developer"
      },
      {
        "id": "2",
        "name": "Jane Smith",
        "role": "Tech Lead"
      }
    ],
    "currentUserId": "1"
  }
}
```

## 🧪 Tests

```bash
# Lancer tous les tests
pnpm test

# Mode interactif avec UI
pnpm test:ui

# Avec navigateur visible
pnpm test:headed

# Voir le rapport HTML
pnpm test:report
```

Les tests simulent des sessions complètes avec plusieurs utilisateurs votant simultanément et vérifient la synchronisation en temps réel.

## 📁 Structure du projet

```
poc-er-planning/
├── server/              # Serveur SSE Hono
│   └── index.ts        # API endpoints et gestion SSE
├── src/
│   ├── components/     # Composants React
│   │   ├── PlanningSession.tsx
│   │   └── PlanningCard.tsx
│   ├── hooks/          # Custom hooks
│   │   └── usePlanningSession.ts
│   ├── lib/            # Utilitaires
│   │   └── teamConfig.ts
│   ├── types/          # Types TypeScript
│   │   └── team.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/              # Tests Playwright
│   ├── helpers/
│   │   └── planning-page.ts
│   └── planning-session.spec.ts
├── team.config.json    # Configuration d'équipe
└── playwright.config.ts
```

## 🔄 Flux d'utilisation

1. **Sélection d'utilisateur**: Chaque membre ouvre l'app et sélectionne son nom
2. **Vote**: Chaque membre clique sur une carte Fibonacci pour voter
3. **Synchronisation**: Les votes sont synchronisés en temps réel via SSE
4. **Révélation**: N'importe qui peut révéler les votes (même si tous n'ont pas voté)
5. **Statistiques**: Affichage automatique de la moyenne, mode et nombre de votes
6. **Nouvelle estimation**: Reset de la session pour une nouvelle tâche

## 🏗️ Architecture SSE

Le système utilise Server-Sent Events pour la synchronisation:

- **Serveur Hono** maintient l'état partagé en mémoire
- **Broadcast** automatique à tous les clients connectés
- **Reconnexion automatique** en cas de perte de connexion
- **Ping régulier** pour maintenir la connexion active

### Endpoints API

- `GET /events` - Connexion SSE pour les mises à jour
- `POST /vote` - Enregistrer un vote
- `POST /init-votes` - Initialiser les votes pour un utilisateur
- `POST /reveal` - Révéler tous les votes
- `POST /reset` - Réinitialiser la session
- `GET /state` - Obtenir l'état actuel

## 🎨 Design

L'interface utilise:
- Fond dégradé violet/rose/ardoise
- Effets de verre dépoli (backdrop blur)
- Animations fluides avec Tailwind
- Cartes de poker interactives avec effets au survol
- Design responsive

## 📝 Scripts disponibles

```bash
pnpm run dev          # Lance Vite dev server
pnpm run dev:server   # Lance le serveur SSE
pnpm run build        # Build production
pnpm run preview      # Preview du build
pnpm test            # Lance les tests Playwright
pnpm test:ui         # Tests en mode UI interactif
pnpm test:headed     # Tests avec navigateur visible
pnpm test:report     # Affiche le rapport de tests
```

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines de contribution.

## 📄 Licence

ISC