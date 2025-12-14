# 🏗️ Architecture Deep Dive

This document provides a comprehensive technical overview of BitAndPlay's architecture, design decisions, and implementation details.

---

## 📋 Table of Contents

- [High-Level Overview](#high-level-overview)
- [Technology Stack](#technology-stack)
- [Application Structure](#application-structure)
- [Audio Engine](#audio-engine)
- [Music Generation System](#music-generation-system)
- [Studio Mode Architecture](#studio-mode-architecture)
- [Visualizer System](#visualizer-system)
- [State Management](#state-management)
- [Export Pipeline](#export-pipeline)
- [Performance Considerations](#performance-considerations)
- [Design Patterns](#design-patterns)

---

## 🎯 High-Level Overview

BitAndPlay is a **client-side-only** web application with three major subsystems:

1. **Audio Engine**: Tone.js-based music playback and synthesis
2. **Generator**: Deterministic, seed-based music composition
3. **Visualizer**: WebGL-based 3D audio-reactive graphics

The application follows a **unidirectional data flow** pattern with Zustand for state management, and uses React's component model to organize UI and audio/visual systems.

### Key Architectural Principles

- **No backend**: All logic runs in the browser (Web Audio API, WebGL)
- **Deterministic generation**: Same seed always produces same song
- **Real-time performance**: Target 60 FPS for visualizer; low-latency audio
- **Type safety**: Strict TypeScript throughout
- **Modular design**: Clear separation between audio, UI, and visualization

---

## 🛠️ Technology Stack

### Core Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 | UI components and reactivity |
| **Language** | TypeScript 5.9 | Type safety and developer experience |
| **Build Tool** | Vite 7 | Fast dev server and optimized builds |
| **Audio** | Tone.js 15 | Web Audio abstraction and scheduling |
| **3D Graphics** | Three.js + R3F | WebGL rendering and scene management |
| **State** | Zustand 5 | Global state management |
| **UI Primitives** | Radix UI | Accessible, unstyled components |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Testing** | Vitest 4 | Unit tests for logic and utilities |

### Key Libraries

- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful Three.js helpers (minimal usage)
- **lucide-react**: Icon library
- **zod**: Runtime type validation (for export/import)
- **class-variance-authority**: Variant-based component styling

---

## 🏛️ Application Structure

```
src/
├── app/                    # Application shell
│   ├── App.tsx                 # Root component
│   ├── Layout.tsx              # Main layout (top/bottom/right panels)
│   └── AudioEnableOverlay.tsx  # Initial audio context gate
│
├── audio/                  # Audio subsystem
│   ├── engine.ts               # Tone.js transport, master bus
│   ├── instruments.ts          # Per-track synth definitions
│   ├── generator/              # Music generation logic
│   │   ├── generate.ts             # Main entry point
│   │   ├── rng.ts                  # Mulberry32 seeded RNG
│   │   ├── theory.ts               # Scales, chords, progressions
│   │   ├── patterns.ts             # Melody, bass, drum generation
│   │   └── *.test.ts               # Unit tests
│   └── render/                 # Export logic
│       ├── fastExport.ts           # MediaRecorder capture
│       ├── offlineRender.ts        # OfflineAudioContext WAV
│       └── audioBufferToWav.ts     # WAV encoder
│
├── store/                  # State management
│   └── useAppStore.ts          # Zustand store (single source of truth)
│
├── ui/                     # UI components
│   ├── components/             # shadcn/ui-style primitives
│   │   ├── Button.tsx
│   │   ├── Slider.tsx
│   │   ├── Select.tsx
│   │   └── ...
│   ├── tabs/                   # Right panel content
│   │   ├── GenerateTab.tsx
│   │   ├── MixTab.tsx
│   │   ├── VisualizerTab.tsx
│   │   ├── EffectsTab.tsx
│   │   └── ExportTab.tsx
│   ├── TopBar.tsx
│   └── TransportBar.tsx
│
├── viz/                    # Visualizer subsystem
│   ├── VisualizerCanvas.tsx    # R3F canvas setup
│   ├── useAudioBands.ts        # Audio analysis hook
│   └── scenes/                 # Visualizer scenes
│       ├── TunnelSpectrum.tsx
│       ├── NeonGrid.tsx
│       ├── OrbitBars.tsx
│       ├── BlackHole.tsx
│       └── InteractiveBubbles.tsx
│
├── studio/                 # Studio mode subsystem
│   ├── StudioView.tsx          # Main studio container
│   ├── Timeline.tsx            # Clip arrangement timeline
│   ├── ClipEditor.tsx          # Piano roll / step sequencer
│   ├── TrackLane.tsx           # Individual track lane
│   └── defaults.ts             # Default clip/track settings
│
├── types/                  # TypeScript definitions
│   ├── song.ts                 # Song, Track, Pattern types
│   └── project.ts              # Project, Clip, UI state types
│
└── utils/                  # Shared utilities
    ├── cn.ts                   # Tailwind class merger
    └── ...
```

---

## 🎹 Audio Engine

### Transport & Scheduling

**File**: `src/audio/engine.ts`

The audio engine is built on **Tone.js** and manages:

- **Tone.Transport**: Global timing clock (BPM, swing, playback state)
- **Master Bus**: Limiter → Analyzer → Destination
- **Track Scheduling**: `Tone.Part` instances per track
- **MediaRecorder Stream**: For fast export

**Initialization**:

```typescript
export async function initAudio() {
  await Tone.start();
  
  // Master limiter prevents clipping
  const limiter = new Tone.Limiter(-1).toDestination();
  
  // Analyzer for visualizer
  const analyser = new Tone.Analyser('fft', 2048);
  limiter.connect(analyser);
  
  // MediaRecorder destination
  const mediaStreamDest = Tone.context.createMediaStreamDestination();
  limiter.connect(mediaStreamDest);
  
  return { limiter, analyser, mediaStreamDest };
}
```

**Monotonic Time Guards**:

To prevent Tone's "start time must be greater than previous start time" error, the engine uses `Math.max(Tone.now(), lastScheduledTime)` when scheduling notes.

### Instruments

**File**: `src/audio/instruments.ts`

Each track type maps to a Tone.js synth:

| Instrument | Tone.js Synth | Waveform | Use Case |
|-----------|--------------|----------|----------|
| **Pulse** | `Tone.Synth` | `square` | Leads, arps |
| **Triangle** | `Tone.Synth` | `triangle` | Mellow melodies |
| **Saw** | `Tone.Synth` | `sawtooth` | Bright, buzzy tones |
| **Sine** | `Tone.Synth` | `sine` | Bass, sub-bass |
| **Noise** | `Tone.NoiseSynth` | `white` | Drums, FX |
| **PCM** | `Tone.Synth` | `pulse` | Flexible waveform |

**Envelope Settings**:

```typescript
{
  envelope: {
    attack: 0.01,   // Fast attack for chip sounds
    decay: 0.1,
    sustain: 0.5,
    release: 0.1,
  }
}
```

### Apply-on-Next-Bar

**Problem**: Updating patterns mid-bar causes clicks.  
**Solution**: Defer `loadSong` calls to the next bar boundary using `Tone.Transport.schedule`.

```typescript
const nextBar = Math.ceil(Tone.Transport.seconds / barDuration) * barDuration;
Tone.Transport.schedule((time) => {
  loadSongImmediate(song);
}, nextBar);
```

---

## 🎲 Music Generation System

### Deterministic RNG

**File**: `src/audio/generator/rng.ts`

Uses **Mulberry32**, a simple, fast, seedable PRNG:

```typescript
export function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

**Properties**:
- Same seed → same sequence
- Fast (no crypto overhead)
- Good distribution for music generation

### Music Theory

**File**: `src/audio/generator/theory.ts`

Defines scales, chords, and progressions:

**Scales**:
```typescript
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  // ...
};
```

**Chord Progressions**:
```typescript
const PROGRESSIONS = {
  'I-V-vi-IV': [0, 4, 5, 3],  // Pop progression
  'i-VII-VI-VII': [0, 6, 5, 6], // Minor progression
  // ...
};
```

**Chord Construction**:
- Triads: root, third (major/minor), fifth
- Extensions: 7th, 9th (optional)

### Pattern Generation

**File**: `src/audio/generator/patterns.ts`

Generates melody, bass, and drum patterns:

**Melody**:
1. Pick scale degrees from the current chord
2. Add passing tones with probability based on density
3. Apply syncopation via rhythmic displacement
4. Quantize to 16th-note grid

**Bass**:
1. Use chord root as primary note
2. Add fifth or octave jumps
3. Simpler rhythm than melody (usually on beats 1 and 3)

**Drums**:
1. Kick: Accent beats 1 and 3 (or all beats for dance)
2. Snare: Beats 2 and 4
3. Hi-hat: 8th or 16th notes based on energy
4. Fills: Random variations based on complexity

**Parameters**:
- **Energy**: Overall note density and rhythm intensity
- **Density**: Probability of adding notes
- **Syncopation**: Off-beat placement likelihood
- **Complexity**: Harmonic extensions and variations

---

## 🎛️ Studio Mode Architecture

### Data Model

**Track**:
```typescript
interface Track {
  id: string;
  name: string;
  instrument: 'pulse' | 'triangle' | 'saw' | 'sine' | 'noise' | 'pcm';
  clips: Clip[];
  muted: boolean;
  solo: boolean;
}
```

**Clip**:
```typescript
interface Clip {
  id: string;
  trackId: string;
  startBar: number;
  lengthBars: number;
  pattern: Pattern;  // Notes or drum hits
}
```

**Pattern**:
```typescript
interface Pattern {
  notes: Note[];  // For melodic tracks
  drums?: DrumHit[];  // For drum tracks
}

interface Note {
  pitch: number;  // MIDI note number
  time: number;   // Position in bars
  duration: number;
}
```

### Timeline Rendering

**File**: `src/studio/Timeline.tsx`

- **Horizontal scroll**: Canvas-style virtual scrolling
- **Snap-to-grid**: Calculated via `Math.round(x / gridSize) * gridSize`
- **Drag & drop**: Mouse events + state updates
- **Playhead**: Synced to `Tone.Transport.seconds`

**Zoom**:
- Zoom level multiplies pixel-per-bar ratio
- Canvas re-renders on zoom change
- Scroll position preserved

### Clip Editors

**Piano Roll** (`src/studio/ClipEditor.tsx`):
- 2D grid: time (x-axis) × pitch (y-axis)
- Click to toggle notes
- Transpose: Shift all notes by N semitones
- Quantize: Snap notes to nearest grid line

**Step Sequencer**:
- 2D grid: time (x-axis) × drum lane (y-axis)
- Click to toggle hits
- Fill: Add hit to every step
- Clear: Remove all hits

---

## 🌌 Visualizer System

### Audio Analysis

**File**: `src/viz/useAudioBands.ts`

Samples the Tone.js analyzer at 60 FPS without triggering React re-renders:

```typescript
export function useAudioBands() {
  const bandsRef = useRef({ low: 0, mid: 0, high: 0, energy: 0 });
  
  useFrame(() => {
    const fft = analyser.getValue();  // Float32Array of FFT bins
    
    bandsRef.current.low = averageBins(fft, 0, 10);   // 20-250 Hz
    bandsRef.current.mid = averageBins(fft, 10, 40);  // 250-2000 Hz
    bandsRef.current.high = averageBins(fft, 40, 100); // 2000+ Hz
    bandsRef.current.energy = averageBins(fft, 0, 100);
  });
  
  return bandsRef.current;
}
```

**Why `useRef`?**  
Updating state at 60 FPS would cause massive re-renders. `useRef` allows scenes to read values without triggering React.

### Scene Architecture

Each scene is a React Three Fiber component:

```typescript
export function MyScene() {
  const { low, mid, high, energy } = useAudioBands();
  const meshRef = useRef<THREE.Mesh>();
  
  // Update every frame
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Map audio to visuals
    meshRef.current.scale.y = 1 + low * 2;
    meshRef.current.rotation.y += mid * 0.01;
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="cyan" />
    </mesh>
  );
}
```

### Instancing

For performance, repeated geometry uses `THREE.InstancedMesh`:

```typescript
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

// Update each instance's transform
const matrix = new THREE.Matrix4();
matrix.setPosition(x, y, z);
instancedMesh.setMatrixAt(index, matrix);
instancedMesh.instanceMatrix.needsUpdate = true;
```

---

## 📦 State Management

**File**: `src/store/useAppStore.ts`

BitAndPlay uses a **single Zustand store** for all global state:

```typescript
interface AppState {
  // Transport
  isPlaying: boolean;
  bpm: number;
  swing: number;
  
  // Generator
  seed: number;
  preset: string;
  generatorParams: GeneratorParams;
  
  // Studio
  tracks: Track[];
  clips: Clip[];
  selectedClipId: string | null;
  
  // UI
  mode: 'playground' | 'studio';
  activeTab: string;
  cinemaMode: boolean;
  
  // Visualizer
  visualizerScene: string;
  visualizerQuality: 'low' | 'medium' | 'high';
  
  // Actions
  play: () => void;
  pause: () => void;
  setBPM: (bpm: number) => void;
  generateSong: () => void;
  // ...
}
```

**Why Zustand?**
- Minimal boilerplate vs. Redux
- No provider wrapping needed
- TypeScript-friendly
- Fast updates (no context diffing)

**Selectors**:

```typescript
const bpm = useAppStore((state) => state.bpm);
const setBPM = useAppStore((state) => state.setBPM);
```

---

## 💾 Export Pipeline

### Fast Export (MediaRecorder)

**File**: `src/audio/render/fastExport.ts`

1. Connect Tone limiter to `MediaStreamDestination`
2. Create `MediaRecorder` with preferred MIME type (`audio/webm` or `audio/ogg`)
3. Start playback and recording simultaneously
4. Stop at song end; download the Blob

**Pros**: Real-time (no waiting)  
**Cons**: Browser-dependent codec; may not match live sound exactly

### HQ Offline Render (WAV)

**File**: `src/audio/render/offlineRender.ts`

1. Create `OfflineAudioContext` with song duration
2. Recreate song with **simplified oscillators** (not Tone.js):
   - Pulse → `OscillatorNode` with `square` waveform
   - Triangle → `OscillatorNode` with `triangle`
   - Noise → `AudioBufferSourceNode` with white noise buffer
3. Schedule all notes precisely
4. Render to `AudioBuffer`
5. Encode to WAV via `audioBufferToWav`

**Why simplified oscillators?**  
OfflineAudioContext doesn't support Tone.js graph consistently across browsers. Simplified oscillators guarantee deterministic output.

**WAV Encoding**:

```typescript
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2; // 16-bit
  
  const wavBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(wavBuffer);
  
  // Write WAV header (RIFF, fmt, data chunks)
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  // ... (full implementation in audioBufferToWav.ts)
  
  return new Blob([wavBuffer], { type: 'audio/wav' });
}
```

---

## ⚡ Performance Considerations

### Audio

- **Scheduling ahead**: Notes scheduled 0.1s in advance to prevent glitches
- **Limiter**: Prevents clipping on loud passages
- **Memoized synths**: Synth instances reused per track

### Visualizer

- **Instancing**: 100+ objects with 1 draw call
- **Frustum culling**: Three.js removes off-screen objects
- **DPR scaling**: Quality settings adjust Device Pixel Ratio
- **Idle motion**: Simplified animations when audio is silent

### React

- **Memoization**: `useMemo` for expensive calculations
- **Refs over state**: For 60 FPS updates (visualizer, playhead)
- **Lazy loading**: Scenes loaded on-demand (potential future optimization)

---

## 🎨 Design Patterns

### Separation of Concerns

- **Audio logic** lives in `src/audio/`
- **UI logic** lives in `src/ui/` and `src/app/`
- **State** centralized in `src/store/`
- **Types** defined in `src/types/`

### Composition over Inheritance

- Small, reusable components
- Hooks extract shared logic
- No class components or inheritance chains

### Immutability

- Zustand updates use `immer` under the hood
- State is never mutated directly

### Type Safety

- Strict TypeScript throughout
- No `any` (use `unknown` and narrow with guards)
- Zod schemas for runtime validation (export/import)

---

## 🔗 Related Documentation

- [Main README](../README.md) – Project overview
- [Studio Guide](studio.md) – Studio mode usage
- [Visualizer Guide](visualizer.md) – Visualizer scenes
- [Contributing](CONTRIBUTING.md) – How to contribute

---

<div align="center">

**Ready to dive deeper into the code?**

[🏠 Back to Main Docs](../README.md) | [🤝 Contributing Guide →](CONTRIBUTING.md)

</div>
