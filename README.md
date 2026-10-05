# Snake 2D in React: Modern Retro Arcade & Audio Engine

[![React](https://img.shields.io/badge/React-17+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Synthesizer-orange?style=flat-square&logo=soundcharts&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> A polished, market-ready React implementation of the classic 2D Snake arcade game featuring smooth 60 FPS HTML5 Canvas rendering, procedural Web Audio sound synthesis, score persistence, and mobile touch swipe controls.

---

## ✨ Key Features & Arcade Polish

- 🎵 **Procedural Web Audio API Sound Synthesizer**:
  - 100% offline, zero external audio asset dependencies, and zero latency.
  - Ascending bite chime scaling with combo multiplier, soft movement step ticks, game-over buzz, and triumphant high-score celebration fanfare.
  - Sound toggle with persistent preference memory in browser `localStorage`.
- 🏆 **Score Management & High Score Persistence**:
  - Real-time Score accumulation (10 points per apple consumed).
  - All-time **Best Score** tracking persisted in browser `localStorage`.
  - Snake Length counter.
  - Progressive speed acceleration: game pace increases dynamically as the snake grows.
- 🎨 **Enhanced Canvas Graphics**:
  - High-DPI crisp rendering on retina and mobile displays.
  - Expressive snake head with dynamic animated eyes that track movement direction.
  - Fading emerald gradient body segments with rounded corners.
  - Juicy radial gradient crimson apple with stem and green leaf.
  - Subtle dark arcade grid background.
- 🛡️ **Anti-Suicide Input Buffer**:
  - Buffered next-direction queue prevents instant 180° reverse collisions during rapid key combinations (e.g., Up then Left).
- 📱 **Multi-Input Controls (Keyboard, Swipe, & Virtual D-Pad)**:
  - Desktop controls: Arrow keys, <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>, <kbd>Space</kbd> to Pause/Resume, and <kbd>R</kbd> to Restart.
  - Touchscreen swipe detection with scroll prevention.
  - On-screen virtual directional D-pad for mobile and tablet players.
- ⏸️ **Pause & Game Over Overlays**:
  - Frosted glassmorphism modal overlays displaying final stats and instant restart options.

---

## 🎮 How to Play

1. **Steer the Snake**: Use Arrow keys, <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>, swipe on mobile, or click the on-screen D-pad.
2. **Eat Apples**: Navigate to the glowing red apple to grow the snake and score points.
3. **Avoid Collisions**: Do not crash into the perimeter walls or into the snake's own body!
4. **Pause Anytime**: Press <kbd>Space</kbd> or click the Pause button to take a break.

---

## 🚀 Quickstart Guide

### 1. Clone the Repository

```bash
git clone https://github.com/aeskafi/snake-react.git
cd snake-react
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Launch Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start playing immediately.

---

## 🏗️ Production Build & Deployment

```bash
npm run build
```

Compiled production assets will be output to `build/`, ready for zero-config deployment to Vercel, Netlify, or GitHub Pages.

---

## 📁 Project Architecture

```
├── public/
│   ├── favicon.png
│   └── index.html           # HTML5 shell (#gameBoard mount root & viewport config)
├── src/
│   ├── styles/
│   │   └── snake.css        # Arcade theme, glassmorphic overlays, & responsive styles
│   ├── utils/
│   │   └── sound.js         # Web Audio API procedural sound synthesizer
│   ├── init.js              # Grid configuration, speeds, and directional mappings
│   ├── snake2d.js           # Core game loop, collision detection, & canvas rendering
│   ├── useInterval.js       # Declarative React game tick interval hook
│   ├── Snake2D.test.js      # Unit tests with Canvas context mock
│   └── index.js             # React DOM mounting entrypoint
├── package.json
└── LICENSE                  # MIT License
```

---

## 👤 Author & Mission

Curated and built with precision by **Arham Eskafi** ([arham.dev](https://arham.dev)) — Rapid MVP Specialist, Full-Stack Architect, and Tech Nomad.

Follow the overland journey of building software while living on the open road at [Walk Cook Live](https://youtube.com/@walkcooklive).

---

## 📄 License

This repository is licensed under the [MIT License](LICENSE).
