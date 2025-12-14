# Visualizer Scenes

BitAndPlay ships multiple @react-three/fiber scenes. Quality (low/med/high) changes instance counts and DPR. `prefers-reduced-motion` softens animation.

## Scenes
- **Tunnel Spectrum**: cascading torus rings; bands drive scale/rotation/color.
- **Neon Grid**: static horizon with height pulses; color cycles to highs.
- **Orbit Bars**: orbiting bars with inner glow rings; energy drives height.
- **Black Hole**: swirling particle vortex around a dark core with layered rings; rotates subtly for different perspectives.
- **Interactive Bubbles**: floating emissive bubbles you can grab and fling. Click/drag a bubble to hold; others keep moving until you throw into them.

## Controls
- Scene selector: Right panel → Visualizer tab.
- Quality selector: low/med/high in the same tab.
- Cinema mode: Right panel → FX tab toggle; hides side panel. An “Exit cinema” button appears in the canvas top-right to restore panels.
