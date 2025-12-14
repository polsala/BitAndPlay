# BitAndPlay

BitAndPlay is a browser-only 8/16-bit chiptune workstation: deterministic seeded generation, a Studio arrangement view, Tone.js transport, a rhythm-reactive 3D visualizer, and dual export paths (live capture + HQ offline WAV). The repo is ready for GitHub Pages deployment out of the box.

## Quick start

```bash
npm ci
npm run dev
```

Open the provided URL and click **Enable audio** to start the audio context (required by browsers).

### Scripts
- `npm run dev` – Vite dev server
- `npm run build` – typecheck + production build
- `npm run lint` – ESLint
- `npm run test` – Vitest unit tests
- `npm run preview` – preview the production build locally

## Features
- **Seeded generator**: reproducible songs with presets, key/scale, energy/density/syncopation/complexity sliders, and variation reroll.
- **Studio (arrangement)**: tracks you can add/remove, clip lanes with snap/zoom, drag/resize clips, piano roll & drum step editors, loop region, playhead follow. Apply-on-next-bar keeps updates click-free. See `docs/studio.md`.
- **Tone.js engine**: per-track synths (pulse, triangle, saw, sine, noise, PCM), limiter + analyser, swing/quantize, bar-aligned updates to avoid clicks.
- **Transport**: play/pause/stop, BPM + swing controls, regenerate/variation, “apply on next bar” safety, cinema toggle (with in-canvas exit button).
- **3D visualizer**: five scenes (Tunnel Spectrum, Neon Grid, Orbit Bars, Black Hole, Interactive Bubbles) built with @react-three/fiber + Three.js; low/mid/high band mapping and quality selector. See `docs/visualizer.md`.
- **Export**: fast capture via `MediaRecorder` + HQ offline WAV render with OfflineAudioContext + WAV encoder; JSON import/export; shareable URL query params.
- **Persistence**: optional localStorage save/restore; share links (`?seed=...&preset=...`).
- **UI**: minimal dark Ableton-style skin with shadcn/ui building blocks and Tailwind utilities.

## Architecture

```
src/
  app/             App shell, layout, overlay wiring
  audio/
    engine.ts      Tone.js transport, master bus, scheduling
    instruments.ts Track synth definitions + master chain
    generator/     Deterministic song builder (rng/theory/patterns)
    render/        Offline render + WAV encoder helpers
  store/           Zustand global store (transport/UI/export/studio state)
  ui/              Top bar, transport, right panel tabs, shadcn components
  viz/             Visualizer canvas + scenes + analyser hook
  studio/          Arrangement view components and defaults
  types/           Song and project types
```

- **Audio engine**: `engine.ts` initializes Tone, master limiter, analyser, and media stream for fast export. Track parts are scheduled with `Tone.Part`, looping per song length; updates optionally defer to the next bar for click-free changes.
- **Generator**: `generate.ts` builds chord progressions, melody/bass arps, and drum grids on a 16-step/bar lattice. Mulberry32 RNG (`rng.ts`) ensures repeatable output from a seed.
- **Visualizer**: `useAudioBands` samples the analyser without React re-renders; scenes animate via `useFrame` in r3f at 60fps where possible. Quality toggles change instance counts / DPR.
- **Export**: fast export uses `MediaRecorder` on the master media stream; HQ export uses `OfflineAudioContext` with simple oscillators/noise and encodes 16-bit PCM WAV via `audioBufferToWav`.

## Deployment (GitHub Pages)
1) Push to `main` with Actions enabled.  
2) In repo settings → Pages, choose “GitHub Actions” as the source.  
3) The workflow `.github/workflows/deploy.yml` builds with `GITHUB_PAGES=true` (sets Vite `base` to `/BitAndPlay/`) and publishes `dist` via `actions/deploy-pages`.

## Troubleshooting
- **No sound**: click the “Enable audio” overlay; browsers block AudioContext until a user gesture.
- **Choppy visuals**: switch visualizer quality to Medium/Low; `prefers-reduced-motion` is respected by reduced animation intensities.
- **Fast export missing**: some browsers lack `MediaRecorder` for Web Audio; use HQ WAV instead.
- **Clicks on regenerate**: keep “Apply on next bar” enabled to reschedule pattern updates.

## Known limitations
- MediaRecorder MIME support depends on the browser (`audio/webm` preferred, falls back to `audio/ogg`).
- Offline render uses simplified oscillators/noise (not the live Tone graph) to guarantee deterministic WAV output in all browsers.
- No backend; large localStorage saves can be cleared by the browser.

## Performance tips
- Lower visualizer quality on integrated GPUs.
- Keep swing modest (<15%) to maintain tight drums.
- Shorter songs (8–16 bars) render and export faster.

## Testing
- Deterministic RNG and generator coverage lives in `src/audio/generator/*.test.ts`.  
Run `npm run test` to execute Vitest in node environment.
