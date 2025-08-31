import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lester's Arcade - GTA-Style Minigames",
    short_name: "Lester's Arcade",
    description: "Play GTA/NoPixel-style hacking minigames in your browser",
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#22c55e',
    orientation: 'portrait-primary',
    categories: ['games', 'entertainment'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon.svg', 
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Casino Heist',
        short_name: 'Casino',
        description: 'Start Casino Fingerprint hack',
        url: '/?game=casino',
        icons: [{ src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' }]
      },
      {
        name: 'Cayo Perico',
        short_name: 'Cayo',
        description: 'Start Cayo Perico breach',
        url: '/?game=cayo', 
        icons: [{ src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' }]
      },
      {
        name: 'Number Finder',
        short_name: 'Numbers',
        description: 'Start Number Finder challenge',
        url: '/?game=number',
        icons: [{ src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' }]
      }
    ]
  }
}
