# Agent Notes for BitAndPlay

This file is for operators/automation working on the project. Users don’t need it for normal use.

## Stack and conventions
- Frontend-only: React + Vite + TypeScript (strict). No backend.
- Audio: Tone.js for transport/scheduling; OfflineAudioContext + custom WAV encoder for HQ export.
- 3D: three.js via @react-three/fiber (+ minimal @react-three/drei use). Visualizer renders continuously (`frameloop="always"`).
- State: Zustand store (`src/store/useAppStore.ts`), no routing.
- Styling: Tailwind + lightweight shadcn-style primitives in `src/ui/components`. Dark palette defined in `src/index.css` and `tailwind.config.js`.
- Lint/format/test: `npm run lint`, `npm run format`, `npm run test` (Vitest). Build: `npm run build`.
- **Quality enforcement:** always keep tests passing, maintain strict types, prefer reusable, composable components/hooks, and leave concise comments only where non-obvious. Avoid quick hacks; refactor if adding complexity. Treat UX/visual polish as non-negotiable.

## Audio engine tips
- Entry points: `src/audio/engine.ts` (Transport, master chain), `src/audio/instruments.ts` (Tone graph), `src/audio/generator/*` (seeded song creation), `src/audio/render/*` (fast export via MediaRecorder stream; HQ offline WAV via OfflineAudioContext).
- To avoid Tone “start time must be greater” errors, the instrument triggers monotonic-safe times. Parts schedule seconds directly; keep monotonic guards if adjusting scheduling.
- “Apply on next bar” defers `loadSong` via Transport schedule; respect that when changing song state.

## Visualizer tips
- Canvas in `src/viz/VisualizerCanvas.tsx`; scenes in `src/viz/scenes/*`; analyser hook in `src/viz/useAudioBands.ts`.
- Idle motion fallback keeps visuals alive when audio is silent; analyser output drives low/mid/high + energy otherwise.
- WebGL fallback: shows message if context unavailable.

## UI layout
- Top bar: file/load/share actions; transport bar bottom; right panel tabs. Cinema mode hides the right panel; handle on the right edge toggles visibility.
- Mode toggle (Playground/Studio) also switches tab (Generate vs Mix) and changes background palette.

## GitHub Pages deploy
- Vite `base` set by `GITHUB_PAGES` env; workflow at `.github/workflows/deploy.yml` builds on push to `main`.

## Known edges
- MediaRecorder MIME varies by browser; HQ export always works (WAV).
- Visualizer idle motion is synthetic when audio silent; real FFT drives it once audio flows.
- Tone start-time assertions can reappear if new scheduling bypasses the monotonic guards—keep them if editing triggers.
- If changing global state or UI patterns, verify Studio/Playground flows and visualizer still animate after enabling audio.

## Quick commands
```bash
npm ci
npm run dev          # local dev
npm run build        # typecheck + prod build
npm run test         # Vitest unit tests
```
