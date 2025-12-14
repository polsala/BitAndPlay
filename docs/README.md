# 📚 BitAndPlay Documentation

Welcome to the BitAndPlay documentation! This directory contains comprehensive guides for users, developers, and contributors.

---

## 📖 Documentation Index

### For Users

| Document | Description |
|----------|-------------|
| [**Main README**](../README.md) | Project overview, quick start, and key features |
| [**Studio Guide**](studio.md) | Complete guide to Studio mode (multi-track arrangement) |
| [**Visualizer Guide**](visualizer.md) | 3D visualizer scenes, controls, and optimization |
| [**Troubleshooting**](TROUBLESHOOTING.md) | Solutions to common issues and problems |

### For Developers

| Document | Description |
|----------|-------------|
| [**Architecture**](ARCHITECTURE.md) | Technical deep dive into codebase structure and design |
| [**Contributing**](CONTRIBUTING.md) | Guidelines for contributing code, docs, and features |

---

## 🚀 Quick Links

### Getting Started
- [Installation & Quick Start](../README.md#quick-start)
- [Usage Guide](../README.md#usage-guide)
- [Playground Workflow](../README.md#playground-workflow)
- [Studio Workflow](../README.md#studio-workflow)

### Features
- [Seeded Generation](../README.md#seeded-generation-playground-mode)
- [Studio Mode](studio.md)
- [3D Visualizer](visualizer.md)
- [Export & Sharing](../README.md#export--sharing)

### Help & Support
- [Common Issues](TROUBLESHOOTING.md)
- [Performance Optimization](TROUBLESHOOTING.md#performance-issues)
- [Browser Compatibility](TROUBLESHOOTING.md#browser-compatibility)

### Contributing
- [How to Contribute](CONTRIBUTING.md#how-can-i-contribute)
- [Development Workflow](CONTRIBUTING.md#development-workflow)
- [Code Guidelines](CONTRIBUTING.md#code-guidelines)

---

## 🎯 Documentation by Topic

### 🎵 Audio & Music

- **Music Generation**
  - [Generator Overview](../README.md#seeded-generation-playground-mode)
  - [Deterministic RNG](ARCHITECTURE.md#deterministic-rng)
  - [Music Theory System](ARCHITECTURE.md#music-theory)
  - [Pattern Generation](ARCHITECTURE.md#pattern-generation)

- **Audio Engine**
  - [Tone.js Integration](ARCHITECTURE.md#transport--scheduling)
  - [Instruments](ARCHITECTURE.md#instruments)
  - [Apply-on-Next-Bar](ARCHITECTURE.md#apply-on-next-bar)

- **Studio Mode**
  - [Getting Started with Studio](studio.md#getting-started)
  - [Track Management](studio.md#track-management)
  - [Clip Editing](studio.md#clip-editors)
  - [Piano Roll](studio.md#piano-roll-melodic-tracks)
  - [Step Sequencer](studio.md#step-sequencer-drum-tracks)

### 🌌 Visualizer

- [Scene Gallery](visualizer.md#scene-gallery)
- [Controls & Settings](visualizer.md#controls--settings)
- [Audio Analysis](ARCHITECTURE.md#audio-analysis)
- [Performance Optimization](visualizer.md#performance-optimization)
- [Creating Custom Scenes](visualizer.md#advanced-customizing-scenes)

### 💾 Export & Sharing

- [Fast Export (MediaRecorder)](ARCHITECTURE.md#fast-export-mediarecorder)
- [HQ Offline Render (WAV)](ARCHITECTURE.md#hq-offline-render-wav)
- [Project Files](../README.md#export--sharing)
- [URL Sharing](../README.md#export--sharing)

### 🛠️ Development

- **Architecture**
  - [High-Level Overview](ARCHITECTURE.md#high-level-overview)
  - [Technology Stack](ARCHITECTURE.md#technology-stack)
  - [Application Structure](ARCHITECTURE.md#application-structure)
  - [State Management](ARCHITECTURE.md#state-management)
  - [Performance Considerations](ARCHITECTURE.md#performance-considerations)

- **Contributing**
  - [Getting Started](CONTRIBUTING.md#getting-started)
  - [Code Guidelines](CONTRIBUTING.md#code-guidelines)
  - [Testing](CONTRIBUTING.md#testing)
  - [Submitting Changes](CONTRIBUTING.md#submitting-changes)

### 🐛 Troubleshooting

- [Audio Issues](TROUBLESHOOTING.md#audio-issues)
- [Visualizer Issues](TROUBLESHOOTING.md#visualizer-issues)
- [Studio Mode Issues](TROUBLESHOOTING.md#studio-mode-issues)
- [Export Issues](TROUBLESHOOTING.md#export-issues)
- [Performance Issues](TROUBLESHOOTING.md#performance-issues)
- [Browser Compatibility](TROUBLESHOOTING.md#browser-compatibility)

---

## 🖼️ Screenshots & Visuals

> **Note**: Screenshot placeholders have been added throughout the documentation. To add actual screenshots:
>
> 1. Run BitAndPlay locally: `npm run dev`
> 2. Capture screenshots of key features:
>    - Playground mode with generator settings
>    - Studio mode with tracks and clips
>    - Each visualizer scene in action
>    - Piano roll editor
>    - Step sequencer
>    - Export dialog
> 3. Save screenshots to `docs/images/` with descriptive names
> 4. Update placeholder references in markdown files

### Recommended Screenshots

| File Name | Description | Used In |
|-----------|-------------|---------|
| `playground-overview.png` | Playground mode with controls | Main README |
| `studio-timeline.png` | Studio timeline with clips | studio.md |
| `piano-roll.png` | Piano roll editor | studio.md |
| `step-sequencer.png` | Drum step sequencer | studio.md |
| `visualizer-tunnel-spectrum.png` | Tunnel Spectrum scene | visualizer.md |
| `visualizer-neon-grid.png` | Neon Grid scene | visualizer.md |
| `visualizer-orbit-bars.png` | Orbit Bars scene | visualizer.md |
| `visualizer-black-hole.png` | Black Hole scene | visualizer.md |
| `visualizer-interactive-bubbles.png` | Interactive Bubbles scene | visualizer.md |
| `export-dialog.png` | Export options | Main README |
| `cinema-mode.png` | Cinema mode fullscreen | visualizer.md |

---

## 📝 Improving Documentation

Found a typo, unclear explanation, or missing information? We welcome documentation contributions!

### How to Contribute

1. **Small fixes**: Edit directly on GitHub via the "Edit" button
2. **Larger changes**: Follow the [Contributing Guide](CONTRIBUTING.md)
3. **New sections**: Open an issue to discuss first

### Documentation Standards

- Use clear, concise language
- Include code examples where helpful
- Add screenshots for visual features
- Keep sections scannable with headers and lists
- Cross-reference related docs with links

---

## 🌐 External Resources

### Learning Resources

- **Web Audio API**: [MDN Web Audio Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **Tone.js**: [Official Tone.js Docs](https://tonejs.github.io/)
- **Three.js**: [Three.js Documentation](https://threejs.org/docs/)
- **React Three Fiber**: [R3F Docs](https://docs.pmnd.rs/react-three-fiber/)
- **Music Theory**: [musictheory.net](https://www.musictheory.net/)

### Similar Projects

- **Beepbox**: Online chiptune editor
- **LMMS**: Free, open-source DAW
- **Ableton Live**: Professional DAW (inspiration for UI)

---

## 📬 Feedback

Have suggestions for improving the documentation?

- [Open an issue](https://github.com/polsala/BitAndPlay/issues) for specific problems
- [Start a discussion](https://github.com/polsala/BitAndPlay/discussions) for ideas and questions
- [Submit a PR](CONTRIBUTING.md#submitting-changes) to contribute directly

---

<div align="center">

**Ready to dive deeper?**

[🏠 Main README](../README.md) | [🎚️ Studio Guide](studio.md) | [🌌 Visualizer Guide](visualizer.md) | [🤝 Contributing](CONTRIBUTING.md)

</div>
