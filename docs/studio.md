# Studio (Arrangement View)

The Studio view is a DAW‑style arrangement for BitAndPlay. It schedules the same Tone.js engine that powers the Playground, but with clips, tracks, and editors.

## Tracks
- Add a track: left panel → **Add track** (choose instrument: Pulse, Triangle, Saw, Sine, Noise, PCM). Tracks get unique IDs and mixer state (mute/solo).
- Remove a track: trash icon per track. Removes its clips/patterns safely.
- Mute/Solo: per-track buttons; solo wins over mute.

## Clips & timeline
- Grid unit: steps (default 1/16). Snap buttons at top change quantize.
- Create: click-drag in a track lane to draw a new clip at that position/length; or use **Add clip** on the lane.
- Move: drag clip horizontally (snaps to grid).
- Resize: drag left/right edge (snaps); pattern length auto-resizes to match clip.
- Loop: set start/end bars and enable Loop in the header.
- Zoom: slider top-right. Horizontal scroll bar appears when zoomed in.
- Playhead: blue line follows Transport.
- Apply on next bar (settings/transport) defers schedule swaps to avoid clicks.

## Clip editor
- Select a clip to open the drawer:
  - Melodic tracks → Piano roll: click to toggle notes, quantize button, transpose ±12, snap respected.
  - Drum/noise tracks → Step grid with lanes (Kick/Snare/Hat/Perc/FX), Clear/Fill buttons.
- Note lengths auto-clamp to the clip; resizing a clip trims/extends pattern data safely.

## Transport in Studio
- Play/Pause/Stop buttons in the Studio header control the same Tone.Transport.
- BPM/Swing live in the global transport footer; changes update the project.
- Cinema mode hides the right panel; an “Exit cinema” button appears in the canvas corner to restore panels.
