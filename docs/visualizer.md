# 🌌 Visualizer Guide

BitAndPlay's **3D Visualizer** brings your chiptune music to life with stunning, rhythm-reactive WebGL scenes. Powered by Three.js and React Three Fiber, each scene responds in real-time to audio frequencies, creating a mesmerizing audiovisual experience.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Scene Gallery](#scene-gallery)
- [Controls & Settings](#controls--settings)
- [Technical Details](#technical-details)
- [Performance Optimization](#performance-optimization)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The visualizer features:

- **Five Unique Scenes**: From retro grids to interactive particle systems
- **Real-Time Audio Reactivity**: Responds to bass, mids, highs, and overall energy
- **Quality Settings**: Low/Medium/High to match your hardware
- **Cinema Mode**: Fullscreen visualizer with minimal UI
- **Smooth Performance**: Targets 60 FPS with WebGL optimization
- **Accessibility**: Respects `prefers-reduced-motion` for reduced animation intensity

The visualizer runs continuously in the background, syncing with the audio engine's analyzer. Even when audio is silent, scenes display subtle idle motion to keep the experience engaging.

---

## 🎨 Scene Gallery

### 1. Tunnel Spectrum

**Description**: Cascading rings of torus shapes create a hypnotic tunnel effect.

**Audio Mapping**:
- **Low frequencies** (bass): Ring scale and pulsation
- **Mid frequencies**: Rotation speed
- **High frequencies** (treble): Color shifts (purple → cyan → magenta)
- **Energy**: Forward/backward movement through the tunnel

**Visual Style**: Neon wireframes with emissive glow; vibrant colors pulse to the beat.

**Best For**: Energetic, fast-paced tracks with strong bass

> **Screenshot Placeholder**: `docs/images/visualizer-tunnel-spectrum.png`  
> *TODO: Capture screenshot of Tunnel Spectrum scene in action*

---

### 2. Neon Grid

**Description**: A retro 80s-inspired grid horizon reminiscent of Tron and synthwave aesthetics.

**Audio Mapping**:
- **Low frequencies**: Grid line height undulation (waves)
- **Mid frequencies**: Grid color intensity
- **High frequencies**: Background color cycling (blue → pink → purple)
- **Energy**: Overall brightness and contrast

**Visual Style**: Flat-shaded grid with horizontal lines; minimal geometry for performance.

**Best For**: Chill, ambient, or retro-themed tracks

> **Screenshot Placeholder**: `docs/images/visualizer-neon-grid.png`  
> *TODO: Capture screenshot of Neon Grid scene in action*

---

### 3. Orbit Bars

**Description**: Orbiting cylindrical bars with glowing particle rings at their centers.

**Audio Mapping**:
- **Low frequencies**: Bar height (taller bars for heavy bass)
- **Mid frequencies**: Orbit rotation speed
- **High frequencies**: Particle glow intensity
- **Energy**: Bar count and spacing

**Visual Style**: Clean geometric bars with soft emissive cores; circular orbit pattern.

**Best For**: Balanced, mid-heavy tracks with rhythmic structure

> **Screenshot Placeholder**: `docs/images/visualizer-orbit-bars.png`  
> *TODO: Capture screenshot of Orbit Bars scene in action*

---

### 4. Black Hole

**Description**: A swirling vortex of particles spiraling around a dark core, with layered rings and subtle rotation for dynamic perspectives.

**Audio Mapping**:
- **Low frequencies**: Vortex rotation speed
- **Mid frequencies**: Particle swirl intensity
- **High frequencies**: Ring layer glow and color shifts
- **Energy**: Particle count and vortex depth

**Visual Style**: Dark, cosmic theme with gradient particles (black → purple → blue); layered depth for immersion.

**Best For**: Deep, atmospheric, or complex tracks

> **Screenshot Placeholder**: `docs/images/visualizer-black-hole.png`  
> *TODO: Capture screenshot of Black Hole scene in action*

---

### 5. Interactive Bubbles

**Description**: Floating emissive spheres that you can grab, drag, and fling. Other bubbles react to collisions and momentum.

**Audio Mapping**:
- **Low frequencies**: Bubble size pulsation
- **Mid frequencies**: Bubble color (hue shift)
- **High frequencies**: Emissive glow intensity
- **Energy**: Number of active bubbles

**Visual Style**: Soft, glowing spheres with physics-based movement; interactive cursor feedback.

**Best For**: Playful, experimental, or interactive sessions

**Interaction**:
1. **Click and hold** a bubble to grab it
2. **Drag** to move the bubble in 3D space
3. **Release** to fling it toward other bubbles
4. Other bubbles continue moving until impacted

> **Screenshot Placeholder**: `docs/images/visualizer-interactive-bubbles.png`  
> *TODO: Capture screenshot of Interactive Bubbles scene in action*

---

## 🎛️ Controls & Settings

### Scene Selection

1. Open the **right panel** (Visualizer tab)
2. Select a scene from the dropdown:
   - Tunnel Spectrum
   - Neon Grid
   - Orbit Bars
   - Black Hole
   - Interactive Bubbles
3. The scene changes instantly without interrupting audio

### Quality Settings

**Low**:
- Reduced instance counts (fewer objects)
- Lower DPR (Device Pixel Ratio: 1)
- Simplified lighting
- Best for: Integrated GPUs, mobile devices, or battery saving

**Medium** (Default):
- Balanced instance counts
- DPR: 1.5
- Full lighting with soft shadows
- Best for: Most laptops and mid-range desktops

**High**:
- Maximum instance counts (richest visuals)
- DPR: 2 (crisp on high-DPI displays)
- Enhanced post-processing (bloom, anti-aliasing)
- Best for: Dedicated GPUs, gaming PCs, high-refresh displays

**How to Change**:
1. Open the **Visualizer tab** (right panel)
2. Select a quality preset from the dropdown
3. The scene re-renders with new settings

### Cinema Mode

**Cinema Mode** hides the right panel and maximizes the visualizer canvas.

**How to Enable**:
- Click the **Cinema** toggle in the **FX tab** (right panel)
- Or click the **fullscreen icon** in the transport bar

**How to Exit**:
- An **"Exit Cinema"** button appears in the top-right corner of the canvas
- Click it to restore the right panel

**Use Cases**:
- Presentations or live performances
- Recording video captures
- Immersive listening sessions

---

## 🔧 Technical Details

### Audio Analysis

The visualizer uses the `useAudioBands` hook to extract frequency data from the audio engine's analyzer:

- **Low Band** (20–250 Hz): Bass, kick drums
- **Mid Band** (250–2000 Hz): Melody, snares, vocals
- **High Band** (2000–20000 Hz): Hi-hats, cymbals, brightness
- **Energy**: Overall amplitude across all bands

**Sampling Rate**: 60 FPS (synced with `requestAnimationFrame`)  
**FFT Size**: 2048 bins for precise frequency resolution

### Rendering Pipeline

1. **Audio Engine** → Analyzer node (Tone.js)
2. **useAudioBands** → Samples analyzer at 60 FPS
3. **Scene Components** → Read band data via `useFrame` (React Three Fiber)
4. **Three.js** → Updates geometry, materials, and transforms
5. **WebGL** → Renders to canvas

**Optimizations**:
- Instanced meshes for repeated geometry (e.g., bars, bubbles)
- Frustum culling removes off-screen objects
- Dirty checking prevents unnecessary re-renders
- DPR scaling reduces pixel load on lower settings

### Idle Motion Fallback

When audio is silent or paused, scenes display **idle motion** to avoid a static image:

- Slow rotations
- Gentle oscillations
- Reduced intensity versions of audio-reactive effects

This keeps the visualizer alive without distracting from the main content.

---

## ⚡ Performance Optimization

### Recommended Settings by Hardware

| Hardware | Quality | Expected FPS | Notes |
|----------|---------|--------------|-------|
| Integrated GPU (Intel UHD) | **Low** | 30–60 | Disable cinema mode for better panel responsiveness |
| Mid-range GPU (GTX 1060) | **Medium** | 60 | Balanced visuals and performance |
| High-end GPU (RTX 3070+) | **High** | 60+ | Full visual fidelity with headroom |
| Mobile (iPad Pro, iPhone) | **Low–Medium** | 30–60 | Use Safari for best WebGL support |

### Performance Tips

1. **Lower Quality First**: Start with Low and increase if performance is smooth
2. **Close Other Tabs**: WebGL competes for GPU resources
3. **Update Drivers**: Ensure GPU drivers are current for best WebGL performance
4. **Disable Cinema Mode**: If editing, panels reduce GPU load by shrinking the canvas
5. **Use Firefox or Chrome**: Best WebGL support and debugging tools

### Monitoring Performance

- Open browser DevTools (F12) → Performance tab
- Look for consistent 60 FPS frame times (~16ms)
- If frames drop below 30 FPS, lower quality or switch scenes

**Heaviest Scenes** (by GPU load):
1. Black Hole (particle system + layered rings)
2. Interactive Bubbles (physics + collision detection)
3. Orbit Bars (multiple instances + lighting)
4. Tunnel Spectrum (many torus geometries)
5. Neon Grid (minimal geometry, most performant)

---

## ♿ Accessibility

### Reduced Motion Support

BitAndPlay respects the `prefers-reduced-motion` CSS media query:

- **Effect**: Reduces animation intensity by 50%
- **Applies To**: All scenes automatically
- **How to Enable**: Set "Reduce motion" in your OS accessibility settings

**On macOS**: System Preferences → Accessibility → Display → Reduce motion  
**On Windows**: Settings → Ease of Access → Display → Show animations  
**On Linux**: Depends on DE (GNOME/KDE settings)

### Visual Considerations

- **High Contrast**: Scenes use emissive materials for visibility
- **Color Blindness**: Color shifts are supplemented by motion and brightness changes
- **Photosensitivity**: No rapid flashing or strobing effects; smooth transitions only

> **Note**: If you experience discomfort, switch to Neon Grid (most subdued) or disable the visualizer entirely via the right panel.

---

## 🐛 Troubleshooting

### Visualizer Shows "WebGL Not Supported"

**Cause**: Browser or GPU doesn't support WebGL.  
**Solutions**:
- Update your browser to the latest version
- Enable hardware acceleration in browser settings
- Try a different browser (Chrome/Firefox recommended)
- Check if GPU drivers are up to date

### Low Frame Rate / Stuttering

**Cause**: GPU is overloaded or quality is too high.  
**Solutions**:
- Lower quality to Medium or Low
- Switch to a less demanding scene (Neon Grid, Orbit Bars)
- Close other GPU-intensive applications or browser tabs
- Reduce screen resolution if using an external display

### Visualizer Doesn't React to Audio

**Cause**: Audio context not initialized, or analyzer not connected.  
**Solutions**:
- Click "Enable Audio" if the overlay is still visible
- Refresh the page and try again
- Check browser console for errors (F12 → Console)

### Cinema Mode Button Not Visible

**Cause**: Canvas might be too small or hidden by other UI.  
**Solution**: 
- Ensure you've enabled cinema mode first (FX tab → Cinema toggle)
- Look in the top-right corner of the visualizer canvas
- Hover over the canvas to reveal the button

### Colors Look Washed Out

**Cause**: Monitor calibration or browser color management.  
**Solutions**:
- Adjust monitor brightness/contrast
- Try a different scene (some have more saturated colors)
- Ensure HDR is disabled if not properly supported

---

## 🎓 Advanced: Customizing Scenes

Want to create your own visualizer scene? Here's a quick overview:

### Scene Structure

Each scene is a React component in `src/viz/scenes/`:

```typescript
export function MyScene() {
  // Use useAudioBands to get frequency data
  const { low, mid, high, energy } = useAudioBands();

  // Use useFrame to update on every render frame
  useFrame(() => {
    // Map audio data to visual properties
    // e.g., scale, position, color
  });

  return (
    <group>
      {/* Your Three.js meshes here */}
    </group>
  );
}
```

### Tips for Scene Development

- **Test Without Audio**: Implement idle motion first
- **Use Instancing**: For repeated objects (spheres, boxes, etc.)
- **Smooth Transitions**: Use lerp or easing functions for audio reactivity
- **Profile Early**: Check FPS in DevTools; optimize if below 60
- **Add Quality Tiers**: Support Low/Medium/High settings via instance count

📚 [Architecture Guide →](ARCHITECTURE.md) for deeper technical details

---

## 🔗 Related Documentation

- [Studio Mode Guide](studio.md) – Multi-track arrangement
- [Architecture Deep Dive](ARCHITECTURE.md) – Codebase structure
- [Troubleshooting](TROUBLESHOOTING.md) – Common issues
- [Main README](../README.md) – Project overview

---

<div align="center">

**Ready to explore the visual dimension?**

[🏠 Back to Main Docs](../README.md) | [🎚️ Studio Guide →](studio.md)

</div>
