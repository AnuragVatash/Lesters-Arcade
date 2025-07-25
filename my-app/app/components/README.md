# Components Directory

This directory is for organizing your minigame components.

## Suggested Structure

```
components/
├── ui/                    # Reusable UI components
│   ├── Button.tsx
│   ├── Timer.tsx
│   └── Score.tsx
├── games/                 # Individual minigame components
│   ├── Game1/
│   │   ├── Game1.tsx
│   │   └── Game1Logic.ts
│   ├── Game2/
│   │   ├── Game2.tsx
│   │   └── Game2Logic.ts
│   └── ...
├── shared/                # Shared game components
│   ├── GameContainer.tsx
│   ├── GameOver.tsx
│   └── GameStart.tsx
└── hooks/                 # Custom hooks for game logic
    ├── useGameTimer.ts
    ├── useGameState.ts
    └── useGameScore.ts
```

## Usage

Import components in your pages like this:

```tsx
import { GameContainer } from "@/app/components/shared/GameContainer";
import { Game1 } from "@/app/components/games/Game1/Game1";
```
