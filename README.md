<div align="center">

# 🎵 BitAndPlay

### Browser-Based Chiptune Workstation & Visualizer

*Create, arrange, and visualize 8/16-bit music with deterministic generation, professional DAW tools, and stunning 3D graphics—all in your browser.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff)](https://vitejs.dev/)

[✨ Live Demo](https://polsala.github.io/BitAndPlay/) | [📖 Documentation](docs/) | [🐛 Report Bug](https://github.com/polsala/BitAndPlay/issues) | [💡 Request Feature](https://github.com/polsala/BitAndPlay/issues)

</div>

---

## 🎯 Overview

**BitAndPlay** is a complete chiptune music production environment that runs entirely in your browser—no installation, no server, no dependencies. Powered by cutting-edge web technologies, it combines:

- **🎼 Deterministic Music Generation** – Create reproducible, seed-based chiptune compositions
- **🎚️ Professional Studio Mode** – Full-featured DAW with multi-track arrangement, piano roll, and step sequencer
- **🎮 Retro Sound Engine** – Authentic 8/16-bit synthesis via Tone.js (pulse, triangle, saw, noise, PCM)
- **🌌 Reactive 3D Visualizer** – Five stunning WebGL scenes that dance to your music
- **💾 High-Quality Export** – Capture live or render offline WAV with perfect fidelity
- **🔗 Shareable Sessions** – Export/import projects or share via URL parameters

Whether you're a musician, developer, or chiptune enthusiast, BitAndPlay delivers a polished, performant experience with the aesthetic and workflow of professional DAWs—entirely client-side.

---

## ✨ Key Features

### 🎲 Seeded Generation (Playground Mode)
- **Reproducible Compositions**: Same seed always produces the same song
- **Smart Presets**: Eight genre-inspired starting points (Arcade, Dance, Chill, etc.)
- **Musical Control**: Adjust key, scale, energy, density, syncopation, and complexity
- **Instant Variations**: Reroll arrangements while keeping the core vibe
- **Theory-Aware**: Generates chord progressions, melodies, bass lines, and drums using music theory

### 🎛️ Studio Mode (Arrangement View)
- **Multi-Track Editor**: Add/remove tracks with different instruments (Pulse, Triangle, Saw, Sine, Noise, PCM)
- **Clip-Based Workflow**: Drag, resize, and arrange clips on a timeline with snap-to-grid
- **Piano Roll & Step Sequencer**: Edit melodic tracks with a piano roll; drum tracks with a step grid
- **Mute/Solo & Mixer**: Per-track volume and routing controls
- **Loop Region**: Set loop points for seamless playback
- **Apply-on-Next-Bar**: Click-free updates synchronized to the beat

📚 [Studio Documentation →](docs/studio.md)

### 🎨 3D Visualizer
Five distinct, rhythm-reactive scenes built with Three.js and React Three Fiber:

1. **Tunnel Spectrum**: Cascading torus rings that pulse and rotate
2. **Neon Grid**: Retro grid horizon with height-driven waves
3. **Orbit Bars**: Orbiting bars with inner glow particles
4. **Black Hole**: Swirling particle vortex with dynamic perspective
5. **Interactive Bubbles**: Grabbable, throwable spheres you can fling around

- **Quality Settings**: Low/Medium/High for different hardware
- **Accessibility**: Respects `prefers-reduced-motion`
- **Cinema Mode**: Fullscreen visualizer with in-canvas controls

📚 [Visualizer Documentation →](docs/visualizer.md)

### 🎹 Audio Engine
- **Tone.js Transport**: Professional scheduling, swing, and quantization
- **Authentic Synthesis**: Multiple oscillator types + noise channels for classic chip sounds
- **Master Processing**: Limiter and analyzer for consistent levels and visualization
- **Click-Free Updates**: Bar-aligned scheduling prevents audio glitches

### 💾 Export & Sharing
- **Fast Capture**: Real-time export via MediaRecorder (WebM/Ogg)
- **HQ Offline Render**: Deterministic WAV encoding via OfflineAudioContext
- **Project Files**: Save/load JSON projects with full session state
- **URL Sharing**: Share compositions via query parameters (`?seed=...&preset=...`)
- **Local Persistence**: Optional localStorage auto-save

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm (or any package manager)
- Modern browser with Web Audio API support (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/polsala/BitAndPlay.git
cd BitAndPlay

# Install dependencies
npm ci

# Start development server
npm run dev
```

Open your browser to the provided URL (usually `http://localhost:5173`) and click **Enable Audio** to initialize the audio context.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with hot reload |
| `npm run build` | Type-check and build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on the codebase |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run Vitest unit tests |

---

## 📖 Usage Guide

### Getting Started

1. **Enable Audio**: Click the overlay button—browsers require a user gesture to start audio
2. **Choose Your Mode**:
   - **Playground**: Generate songs with sliders and presets
   - **Studio**: Arrange tracks manually like a DAW
3. **Adjust Settings**: Use the right panel tabs (Generate/Mix/Visualizer/Effects/Export)
4. **Play & Export**: Hit play and export when ready (fast or HQ WAV)

### Playground Workflow

1. Select a **Preset** (e.g., "Arcade Hero", "Synth Dance")
2. Adjust **Musical Settings**:
   - Key & Scale (C major, A minor, etc.)
   - Energy, Density, Syncopation, Complexity sliders
3. Click **Generate** to create a new song
4. Use **Variation** to reroll while keeping the core structure
5. Fine-tune with **BPM** and **Swing** controls
6. Switch to **Studio** mode to manually edit the result

### Studio Workflow

1. Click **Add Track** and choose an instrument
2. **Draw Clips**: Click-drag in the timeline to create new clips
3. **Edit Patterns**:
   - Select a clip to open the editor drawer
   - Melodic tracks: piano roll with transpose/quantize
   - Drum tracks: step grid with kick/snare/hat/perc/fx lanes
4. **Arrange**: Move and resize clips to build your song structure
5. **Mix**: Mute/solo tracks; adjust global BPM/swing
6. **Loop & Playback**: Set loop region and enable "Apply on next bar" for smooth edits

### Visualizer

- Switch scenes in the **Visualizer** tab
- Adjust **Quality** based on your GPU (Low for integrated, High for dedicated)
- Enable **Cinema Mode** to hide panels and maximize the visualizer
- The visualizer responds to audio frequencies: lows, mids, highs, and overall energy

---

## 🏗️ Architecture

BitAndPlay follows a modular, type-safe architecture:

```
src/
├── app/              # Application shell, layout, overlays
├── audio/
│   ├── engine.ts         # Tone.js transport, master bus, scheduling
│   ├── instruments.ts    # Synth definitions per track type
│   ├── generator/        # Seeded song generation (RNG, theory, patterns)
│   └── render/           # Export logic (MediaRecorder, offline WAV)
├── store/            # Zustand global state (transport, UI, projects)
├── ui/
│   ├── components/       # shadcn/ui-style primitives
│   └── tabs/             # Right panel tab content
├── viz/
│   ├── VisualizerCanvas.tsx  # Three.js canvas setup
│   ├── scenes/               # Five visualizer scenes
│   └── useAudioBands.ts      # Audio analysis hook
├── studio/           # Studio mode components (timeline, clips, editors)
└── types/            # TypeScript definitions (Song, Project, Track, Clip)
```

### Key Technologies

- **Frontend**: React 19 + TypeScript (strict mode)
- **Build Tool**: Vite 7
- **Audio**: Tone.js 15 + Web Audio API
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand
- **UI Components**: Radix UI primitives + Tailwind CSS
- **Testing**: Vitest

📚 [Architecture Deep Dive →](docs/ARCHITECTURE.md)

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/BitAndPlay.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** and write tests if applicable
5. **Test**: Run `npm run test` and `npm run lint`
6. **Commit**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
7. **Push** and open a **Pull Request**

### Development Guidelines

- Maintain strict TypeScript types
- Write concise, non-obvious comments only
- Keep components small and reusable
- Respect the existing code style (Prettier + ESLint)
- Add unit tests for new generator logic or utilities
- Update documentation for user-facing changes

📚 [Contributing Guide →](docs/CONTRIBUTING.md)

---

## 🚢 Deployment

### GitHub Pages (Recommended)

BitAndPlay is designed for zero-config deployment to GitHub Pages:

1. **Enable GitHub Actions** in your repository settings
2. **Push to `main`** branch
3. **Configure Pages**: Repo Settings → Pages → Source: "GitHub Actions"
4. The workflow `.github/workflows/deploy.yml` automatically builds and deploys

The build process sets `GITHUB_PAGES=true`, which configures Vite's `base` path to `/BitAndPlay/`.

### Other Platforms

BitAndPlay is a static site and can be deployed anywhere:

```bash
npm run build
# Upload the `dist/` folder to your hosting provider
```

Supports: Vercel, Netlify, Cloudflare Pages, AWS S3, etc.

---

## 🐛 Troubleshooting

### No Sound

**Cause**: Browsers block AudioContext until user interaction.  
**Solution**: Click the "Enable Audio" overlay button.

### Choppy Visuals

**Cause**: Integrated GPU or heavy scene at high quality.  
**Solution**: Switch visualizer quality to Medium or Low in the Visualizer tab.

### Fast Export Missing

**Cause**: Some browsers don't support MediaRecorder for Web Audio.  
**Solution**: Use "HQ WAV" export instead (slower but always works).

### Clicks or Pops on Regenerate

**Cause**: Audio updates mid-bar can cause glitches.  
**Solution**: Enable "Apply on next bar" in settings (default: on).

📚 [Full Troubleshooting Guide →](docs/TROUBLESHOOTING.md)

---

## 📝 Known Limitations

- **MediaRecorder MIME**: Browser-dependent; prefers `audio/webm`, falls back to `audio/ogg`
- **Offline Render Accuracy**: Uses simplified oscillators (not the live Tone.js graph) for deterministic output
- **No Backend**: All data is client-side; large localStorage saves may be cleared by the browser
- **PCM Sample Playback**: Limited to basic waveforms; no custom sample upload yet

---

## ⚡ Performance Tips

- **Lower Visualizer Quality**: Use Low/Medium on integrated GPUs
- **Modest Swing**: Keep swing below 15% for tight timing
- **Shorter Songs**: 8–16 bars render and export faster
- **Disable Cinema Mode**: When editing, panels provide better workflow

---

## 🧪 Testing

BitAndPlay includes unit tests for core logic:

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:ui     # Vitest UI
```

**Coverage**: Deterministic RNG, music theory, pattern generation  
**Location**: `src/audio/generator/*.test.ts`

---

## 📜 License

BitAndPlay is open source software licensed under the [MIT License](LICENSE).

Copyright (c) 2025 PSala

---

## 🙏 Acknowledgments

- **Tone.js** – Powerful Web Audio framework
- **Three.js** & **React Three Fiber** – 3D graphics engine
- **Radix UI** – Accessible UI primitives
- **shadcn/ui** – Design system inspiration
- **Tailwind CSS** – Utility-first styling

---

## 📬 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/polsala/BitAndPlay/issues)
- **Discussions**: [GitHub Discussions](https://github.com/polsala/BitAndPlay/discussions)
- **Pull Requests**: Always welcome!

---

<div align="center">

**Built with ❤️ by the BitAndPlay community**

[⭐ Star us on GitHub](https://github.com/polsala/BitAndPlay) | [🍴 Fork](https://github.com/polsala/BitAndPlay/fork) | [📖 Docs](docs/)

</div>
