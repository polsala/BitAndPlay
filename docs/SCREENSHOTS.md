# 📸 Screenshot Guide

This document provides instructions for capturing high-quality screenshots of BitAndPlay to enhance the documentation.

---

## 🎯 Purpose

Screenshots help users:
- Understand the UI layout and features
- Visualize what each mode and scene looks like
- Follow step-by-step tutorials more easily
- Get excited about the project's visual appeal

---

## 📋 Required Screenshots

### High Priority

| File Name | Description | Dimensions | Used In |
|-----------|-------------|------------|---------|
| `hero-playground.png` | Full Playground mode view | 1920x1080 | README.md (hero) |
| `hero-studio.png` | Full Studio mode view | 1920x1080 | README.md (hero) |
| `playground-generate-tab.png` | Generate tab with sliders | 800x600 | README.md |
| `studio-timeline.png` | Timeline with multiple tracks/clips | 1600x900 | studio.md |
| `piano-roll.png` | Piano roll editor open | 1200x700 | studio.md |
| `step-sequencer.png` | Drum step sequencer | 1200x700 | studio.md |
| `visualizer-tunnel-spectrum.png` | Tunnel Spectrum scene | 1920x1080 | visualizer.md |
| `visualizer-neon-grid.png` | Neon Grid scene | 1920x1080 | visualizer.md |
| `visualizer-orbit-bars.png` | Orbit Bars scene | 1920x1080 | visualizer.md |
| `visualizer-black-hole.png` | Black Hole scene | 1920x1080 | visualizer.md |
| `visualizer-interactive-bubbles.png` | Interactive Bubbles scene | 1920x1080 | visualizer.md |

### Medium Priority

| File Name | Description | Dimensions | Used In |
|-----------|-------------|------------|---------|
| `export-dialog.png` | Export tab with options | 600x800 | README.md |
| `mix-tab.png` | Mix tab with controls | 600x800 | README.md |
| `cinema-mode.png` | Fullscreen visualizer (cinema) | 1920x1080 | visualizer.md |
| `track-management.png` | Add track menu/interface | 800x600 | studio.md |
| `clip-resize.png` | Clip being resized | 1000x500 | studio.md |
| `loop-region.png` | Loop region set on timeline | 1600x400 | studio.md |

### Low Priority (Nice to Have)

| File Name | Description | Dimensions | Used In |
|-----------|-------------|------------|---------|
| `preset-selector.png` | Preset dropdown open | 400x600 | README.md |
| `bpm-swing-controls.png` | Transport bar controls | 800x200 | README.md |
| `visualizer-quality-settings.png` | Quality selector | 400x300 | visualizer.md |
| `mobile-view.png` | Mobile browser layout | 414x896 | README.md |

---

## 🛠️ Capture Instructions

### Setup

1. **Run BitAndPlay locally**:
   ```bash
   npm ci
   npm run dev
   ```

2. **Use a clean browser profile** (no extensions, default zoom 100%)

3. **Set up the environment**:
   - Resolution: 1920x1080 (for hero shots) or as specified
   - Browser: Chrome (latest) for consistency
   - Dark theme: Default (already in app)
   - Audio enabled: Yes (click "Enable Audio" overlay)

### General Guidelines

- **Timing**: Capture when visualizer is mid-animation (not static)
- **Clarity**: Ensure text is sharp and readable
- **Composition**: Center key elements; leave breathing room
- **Lighting**: Use the app's built-in dark theme (no external overlays)
- **Consistency**: Use the same browser window size and zoom level for related shots

### Tools

**Recommended**:
- **macOS**: Cmd+Shift+4, then Space to capture window (or Cmd+Shift+5 for controls)
- **Windows**: Win+Shift+S (Snipping Tool) or Win+PrtScn
- **Linux**: Flameshot, GNOME Screenshot, or Spectacle
- **Browser Extension**: Nimbus Screenshot, Awesome Screenshot (for full-page captures)

**Post-Processing** (optional):
- Crop to specified dimensions
- Compress with ImageOptim, TinyPNG, or Squoosh
- Save as PNG for UI shots; JPEG for full-scene visualizer shots (if file size is large)

---

## 📷 Detailed Capture Steps

### Hero Shots (Playground & Studio)

**Playground**:
1. Open BitAndPlay in Playground mode
2. Select "Arcade Hero" preset
3. Generate a song
4. Ensure visualizer is active (Tunnel Spectrum, High quality)
5. Capture full browser window at 1920x1080

**Studio**:
1. Switch to Studio mode
2. Add 3–4 tracks (Pulse, Saw, Sine, Noise)
3. Draw multiple clips across timeline (varied colors)
4. Set loop region around bars 4–8
5. Open piano roll on one clip (show some notes)
6. Capture full browser window at 1920x1080

### Visualizer Scenes

For each scene:
1. Switch to the scene in Visualizer tab
2. Set quality to High
3. Start playback (audio must be active for reactivity)
4. Wait for scene to reach an **interesting moment** (e.g., peak bass hit, colorful swirl)
5. Pause playback (if capturing static) or use burst mode to capture animation
6. Crop to 1920x1080 (fullscreen visualizer canvas)

**Scenes to Capture**:
- Tunnel Spectrum: Capture when rings are brightly colored and pulsing
- Neon Grid: Capture when grid waves are visible
- Orbit Bars: Capture mid-rotation with bars at varied heights
- Black Hole: Capture when vortex is swirling (particle trails visible)
- Interactive Bubbles: Capture while dragging a bubble (show interaction)

### Studio Mode Details

**Timeline**:
1. Create a project with 4 tracks, 8 bars total
2. Add clips at varied positions (not perfectly aligned)
3. Set loop region around bars 2–6
4. Zoom to show all clips clearly
5. Capture timeline area (1600x900)

**Piano Roll**:
1. Select a melodic track clip
2. Open piano roll editor (drawer at bottom)
3. Add notes forming a recognizable melody (C major scale)
4. Ensure notes span different octaves (C3–C6)
5. Capture editor + timeline (1200x700)

**Step Sequencer**:
1. Select a drum/noise track clip
2. Open step sequencer
3. Add a basic pattern:
   - Kick on 1, 5, 9, 13
   - Snare on 5, 13
   - Hi-hats on every 2 steps
4. Capture editor + timeline (1200x700)

### UI Elements

**Export Dialog**:
1. Open Export tab (right panel)
2. Ensure both "Fast Export" and "HQ WAV" buttons are visible
3. Show quality slider and format info
4. Capture just the Export tab panel (600x800)

**Mix Tab**:
1. Open Mix tab
2. Show BPM, Swing, and Apply-on-next-bar controls
3. Capture just the Mix tab panel (600x800)

**Cinema Mode**:
1. Enable Cinema mode (FX tab toggle)
2. Wait for right panel to hide
3. Visualizer should fill most of screen
4. Capture with "Exit Cinema" button visible in top-right (1920x1080)

---

## 🎨 Post-Processing

### Optimization

1. **Crop** to exact dimensions specified
2. **Compress** to reduce file size (aim for <500 KB per screenshot)
3. **Rename** to match file naming convention (lowercase, hyphens)

### Quality Checks

Before saving:
- [ ] Text is crisp and readable (no blur)
- [ ] Colors look accurate (not washed out)
- [ ] No personal info visible (bookmarks, extensions, etc.)
- [ ] Screenshot matches the described feature
- [ ] File size is reasonable (<1 MB for PNGs, <500 KB for JPEGs)

---

## 📂 File Management

### Naming Convention

Use lowercase with hyphens:
- ✅ `studio-timeline.png`
- ✅ `visualizer-neon-grid.png`
- ❌ `StudioTimeline.PNG`
- ❌ `visualizer_neon_grid.jpg`

### Directory Structure

```
docs/
  images/
    hero-playground.png
    hero-studio.png
    studio-timeline.png
    piano-roll.png
    step-sequencer.png
    visualizer-tunnel-spectrum.png
    visualizer-neon-grid.png
    visualizer-orbit-bars.png
    visualizer-black-hole.png
    visualizer-interactive-bubbles.png
    export-dialog.png
    mix-tab.png
    cinema-mode.png
    (other screenshots...)
```

### Adding to Documentation

Once screenshots are captured:

1. **Save to `docs/images/`**
2. **Update markdown files** to reference them:
   ```markdown
   ![Playground Mode](images/hero-playground.png)
   ```
3. **Remove placeholder comments**:
   ```markdown
   <!-- OLD: -->
   > **Screenshot Placeholder**: `docs/images/hero-playground.png`  
   > *TODO: Capture screenshot of Playground mode*
   
   <!-- NEW: -->
   ![Playground Mode](images/hero-playground.png)
   *BitAndPlay Playground mode with generator settings*
   ```

---

## ✅ Checklist

Use this checklist when capturing screenshots:

### Before Capturing
- [ ] Local dev server running (`npm run dev`)
- [ ] Browser at 100% zoom, default settings
- [ ] "Enable Audio" clicked (audio context initialized)
- [ ] No browser extensions visible
- [ ] Screen resolution appropriate for shot (1920x1080 for heroes)

### During Capture
- [ ] Feature is in the correct state (e.g., clip selected, visualizer animated)
- [ ] Capture tool ready (screenshot hotkey or tool open)
- [ ] Timing is right (visualizer mid-animation, not static)

### After Capture
- [ ] Screenshot saved to correct location (`docs/images/`)
- [ ] File named correctly (lowercase, hyphens)
- [ ] Image cropped and optimized
- [ ] Markdown files updated with image references
- [ ] Placeholder comments removed

---

## 🙏 Contributing Screenshots

Have access to BitAndPlay and want to help?

1. **Follow this guide** to capture screenshots
2. **Fork the repository** and add images to `docs/images/`
3. **Update markdown files** to reference the new screenshots
4. **Submit a PR** with a description of what you added

Your contributions are greatly appreciated! 📸

---

<div align="center">

[🏠 Back to Docs Index](README.md) | [🤝 Contributing Guide](CONTRIBUTING.md)

</div>
