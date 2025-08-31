# Lester's Arcade

> A browser arcade of GTA/NoPixel-style minigames, built with Next.js + TypeScript

[![Deploy Status](https://img.shields.io/badge/deploy-live-green)](https://gta-hack-clone.vercel.app/)
[![TypeScript](https://img.shields.io/badge/typescript-96%25-blue)](https://github.com/AnuragVatash/Lesters-Arcade)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎮 Featured Games

**Casino Fingerprint** - Navigate through fingerprint patterns to crack the vault  
**Cayo Perico Breach** - Decode security protocols in this hacking minigame  
**Number Finder** - Find hidden sequences under time pressure

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

## ✨ Features

- **Real-time Leaderboards** - Compete with other players across all games
- **Responsive Design** - Play on desktop, tablet, or mobile
- **User Authentication** - Track your progress and high scores
- **Keyboard & Mouse Controls** - Optimized input handling for each game
- **Sound Effects** - Immersive audio feedback (toggleable)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: React Hooks, Zustand (for global state)
- **Storage**: LocalStorage (leaderboards), Vercel KV (planned)
- **Deployment**: Vercel
- **Testing**: Playwright E2E (planned)

## 🎯 Game Controls

- **Arrow Keys** - Navigate between carousel items
- **Enter** - Submit/Execute actions
- **ESC** - Return to menu
- **Space** - Pause/Resume (where applicable)

## 📊 Analytics & Performance

- Vercel Analytics integrated for usage tracking
- Performance monitoring for smooth 60fps gameplay
- PWA support for offline play (planned)

## 🏆 Leaderboards

Scores are stored locally with plans for Redis-compatible storage via Vercel KV. Features basic validation and rate limiting.

## 🎨 Prior Art & Inspirations

This project draws inspiration from:

- NoPixel GTA-V RP server minigames
- Browser-based hacking simulators
- Retro arcade interfaces

**Note**: This project is not affiliated with Rockstar Games, Take-Two Interactive, or the NoPixel server.

## 🧪 Development

```bash
# Run tests (when implemented)
pnpm test

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

PRs welcome! Please check issues for current development priorities.

---

**Live Demo**: [gta-hack-clone.vercel.app](https://gta-hack-clone.vercel.app/)  
**Repository**: [github.com/AnuragVatash/Lesters-Arcade](https://github.com/AnuragVatash/Lesters-Arcade)
