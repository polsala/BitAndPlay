# 🎚️ Studio Mode Guide

The **Studio** view transforms BitAndPlay into a professional DAW-style arrangement tool. Build complex multi-track compositions with full control over clips, patterns, and timing—all powered by the same Tone.js engine that drives Playground mode.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Track Management](#track-management)
- [Timeline & Clips](#timeline--clips)
- [Clip Editors](#clip-editors)
- [Transport & Playback](#transport--playback)
- [Tips & Best Practices](#tips--best-practices)
- [Keyboard Shortcuts](#keyboard-shortcuts)

---

## 🎯 Overview

Studio mode provides:

- **Multi-track arrangement** with independent instruments per track
- **Clip-based workflow** for non-destructive editing
- **Piano roll** for melodic tracks (Pulse, Triangle, Saw, Sine, PCM)
- **Step sequencer** for rhythm tracks (Noise, Drums)
- **Loop region** with playhead follow
- **Snap-to-grid** with configurable quantization
- **Mute/Solo** per track with visual feedback
- **Click-free updates** via "Apply on next bar" synchronization

Studio mode shares the same audio engine as Playground—you can generate a song in Playground, then switch to Studio to manually refine it.

---

## 🚀 Getting Started

### Switching to Studio Mode

1. Click the **Mode Toggle** in the top bar (Playground ↔ Studio)
2. The background palette and right panel tabs change to reflect Studio
3. The timeline appears at the bottom with track lanes

### Initial Setup

When you first enter Studio mode:

- The timeline is empty (no tracks or clips)
- Click **Add Track** in the left panel to create your first track
- Choose an instrument type from the menu
- Start drawing clips to create musical patterns

> **Tip**: If you generated a song in Playground, switching to Studio will preserve the arrangement as tracks and clips.

---

## 🎼 Track Management

### Adding Tracks

1. Click **Add Track** in the left panel
2. Select an instrument from the dropdown:
   - **Pulse**: Square wave (classic chip lead)
   - **Triangle**: Smooth triangle wave (mellow tones)
   - **Saw**: Sawtooth wave (bright, buzzy sound)
   - **Sine**: Pure sine wave (soft, sub-bass)
   - **Noise**: White noise (drums, percussion, FX)
   - **PCM**: Pulse-code modulation (flexible waveform)
3. The new track appears in the timeline with a unique color

Each track gets:
- A unique ID
- A dedicated lane in the timeline
- Independent mixer controls (mute/solo/volume)
- An instrument instance in the audio engine

### Removing Tracks

- Click the **trash icon** next to the track name
- All clips and patterns in that track are deleted
- The audio engine releases the instrument instance

⚠️ **Warning**: Track deletion is immediate and cannot be undone. Export your project first if you're unsure.

### Mute & Solo

- **Mute**: Silences the track without removing it
- **Solo**: Plays only the soloed track(s); mutes all others
- Visual indicators: muted tracks are dimmed, soloed tracks are highlighted

> **Tip**: Solo multiple tracks simultaneously to isolate a section of your mix.

---

## 🎬 Timeline & Clips

The timeline is the heart of Studio mode. It's a horizontal grid where clips are arranged in time.

### Grid & Snap

- **Grid Unit**: Steps (default: 1/16th note)
- **Snap Buttons**: Top bar lets you change quantization (1/4, 1/8, 1/16, etc.)
- All clip operations (create, move, resize) snap to the current grid setting

### Creating Clips

**Method 1: Click-Drag**
1. Click and hold in an empty area of a track lane
2. Drag horizontally to define the clip's length
3. Release to create the clip

**Method 2: Add Clip Button**
1. Click **Add Clip** in the track lane header
2. A default-length clip appears at the playhead position

Newly created clips:
- Contain empty patterns (no notes)
- Use the track's instrument
- Can be immediately edited in the clip editor drawer

### Moving Clips

1. Click and hold a clip
2. Drag left/right to reposition (snaps to grid)
3. Release to place

Clips cannot overlap on the same track. They'll "push" adjacent clips or refuse to move if blocked.

### Resizing Clips

1. Hover over the **left or right edge** of a clip
2. The cursor changes to a resize handle
3. Click and drag to extend or shorten the clip
4. The pattern data auto-adjusts:
   - **Extending**: Adds empty steps to the pattern
   - **Shortening**: Trims the pattern (data is lost)

> **Note**: Pattern length always matches clip length. Resizing a clip modifies the underlying note data.

### Loop Region

- Set loop start/end bars using the **Loop** controls in the header
- Enable the **Loop** toggle to repeat playback within the region
- The playhead jumps back to the loop start when it reaches the end
- Perfect for focusing on a specific section while editing

### Zoom & Scroll

- **Zoom Slider**: Top-right corner; adjusts horizontal timeline scale
- **Scroll Bar**: Appears when zoomed in; drag to navigate the timeline
- **Playhead Follow**: Enabled by default; timeline auto-scrolls during playback

---

## ✏️ Clip Editors

Select any clip to open its editor in the **bottom drawer**.

### Piano Roll (Melodic Tracks)

Available for: Pulse, Triangle, Saw, Sine, PCM

**Features**:
- Vertical piano keys (C1–C7)
- Horizontal grid aligned with clip length
- Click to **toggle notes** on/off
- Notes are quantized to the current snap setting

**Controls**:
- **Transpose**: Shift all notes up/down by semitones (±12)
- **Quantize**: Force notes to the nearest grid line
- **Clear**: Remove all notes in the clip
- **Snap**: Follows the global snap setting

**Workflow**:
1. Select a clip to open the piano roll
2. Click grid cells to add notes
3. Click existing notes to remove them
4. Adjust transpose/quantize as needed
5. Close the drawer when done (changes are saved automatically)

> **Tip**: Use transpose to quickly shift a melody to a different octave or experiment with intervals.

### Step Sequencer (Drum Tracks)

Available for: Noise, Drum kits

**Features**:
- Five lanes: **Kick**, **Snare**, **Hat**, **Perc**, **FX**
- Horizontal grid with 16 steps per bar (or more, depending on clip length)
- Click to toggle drum hits on/off

**Controls**:
- **Clear**: Remove all hits across all lanes
- **Fill**: Add hits to every step (useful for rapid hi-hats)
- **Randomize**: Generate a random pattern (coming soon)

**Workflow**:
1. Select a drum clip to open the step sequencer
2. Click cells to place kicks, snares, hats, etc.
3. Build rhythms by layering different lanes
4. Use **Fill** for rapid hi-hats or rolls
5. Close the drawer to save

> **Tip**: Start with a basic kick/snare pattern (kick on 1 and 3, snare on 2 and 4), then add hi-hats and percussion for complexity.

---

## ⏯️ Transport & Playback

Studio mode uses the **global transport** (bottom bar) for playback control.

### Controls

- **Play/Pause**: Start/stop playback
- **Stop**: Stop and return to the beginning (or loop start)
- **BPM**: Adjust tempo in real time
- **Swing**: Add rhythmic swing (subtle humanization)

### Apply on Next Bar

By default, **Apply on next bar** is enabled in the transport settings. This feature:

- Defers clip updates until the next bar boundary
- Prevents audio glitches when editing during playback
- Keeps transitions smooth and click-free

**When to disable**:
- You want immediate feedback while editing (accept potential clicks)
- You're working with the transport stopped

> **Recommended**: Leave "Apply on next bar" enabled for the best editing experience.

---

## 💡 Tips & Best Practices

### Workflow Tips

1. **Start Simple**: Add one track, draw a clip, build a basic pattern, then expand
2. **Layer Progressively**: Add tracks one at a time; mute others to focus on new material
3. **Use Variations**: Create multiple clips with slight variations and arrange them for structure (verse, chorus, etc.)
4. **Loop While Editing**: Set a loop region around the section you're working on for instant feedback
5. **Solo for Mixing**: Solo individual tracks to check their contribution to the mix

### Performance Tips

- **Keep Clips Aligned**: Start clips on bar boundaries for easier mental mapping
- **Limit Track Count**: 8–12 tracks is plenty for most chiptune arrangements
- **Use Mute, Not Delete**: Mute tracks temporarily instead of deleting to preserve your work
- **Export Often**: Save project JSON files frequently to avoid losing progress

### Creative Techniques

- **Polyrhythms**: Create clips of different lengths (e.g., 3 bars vs. 4 bars) to generate evolving patterns
- **Call & Response**: Alternate melodic clips between tracks for a conversational effect
- **Percussion Layers**: Stack multiple Noise tracks with different patterns for complex rhythms
- **Transpose Experimentation**: Use the piano roll's transpose feature to explore harmonic variations quickly

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Space** | Play/Pause |
| **Ctrl/Cmd + Z** | Undo (coming soon) |
| **Ctrl/Cmd + C** | Copy selected clip (coming soon) |
| **Ctrl/Cmd + V** | Paste clip (coming soon) |
| **Delete** | Delete selected clip |
| **Arrow Keys** | Navigate timeline |
| **+/-** | Zoom in/out |

> **Note**: Some shortcuts are planned for future releases. Check the [roadmap](https://github.com/polsala/BitAndPlay/issues) for updates.

---

## 🎓 Tutorial: Building Your First Arrangement

### Step 1: Add a Bass Track

1. Click **Add Track** → Select **Sine**
2. Draw a **4-bar clip** in the timeline
3. Open the piano roll and add low notes (C2–C3) on beats 1 and 3
4. Play to hear your bass line

### Step 2: Add a Lead Melody

1. Add another track → Select **Pulse**
2. Draw a **4-bar clip** starting at bar 1
3. Open the piano roll and create a simple melody (C4–C6 range)
4. Use shorter notes for rhythmic interest

### Step 3: Add Drums

1. Add a **Noise** track
2. Draw a **4-bar clip**
3. Open the step sequencer:
   - Place kicks on beats 1 and 3
   - Place snares on beats 2 and 4
   - Add hi-hats on every 1/8th note
4. Play to hear your full arrangement

### Step 4: Structure & Loop

1. **Duplicate** clips (copy-paste, coming soon) to extend the song
2. Vary patterns slightly for verses and choruses
3. Set a loop region to rehearse specific sections
4. Adjust BPM and swing to taste

### Step 5: Export

1. Go to the **Export** tab (right panel)
2. Choose **HQ WAV** for best quality
3. Click **Export** and wait for rendering
4. Download and share your creation!

---

## 🐛 Troubleshooting

### Clips Won't Move

**Cause**: Another clip is blocking the target position.  
**Solution**: Move or delete the blocking clip first, or use a different lane.

### Piano Roll Notes Don't Play

**Cause**: Clip may be muted, or track is muted/soloed incorrectly.  
**Solution**: Check mute/solo buttons; ensure the track is audible.

### Playhead Jumps Around

**Cause**: Loop region is enabled with start/end points close together.  
**Solution**: Disable loop or adjust loop start/end to a wider range.

### Changes Don't Apply Immediately

**Cause**: "Apply on next bar" is enabled.  
**Solution**: This is intentional for click-free updates. Wait for the next bar, or disable the setting if you need instant feedback.

### Clicks or Pops

**Cause**: Editing clips while playback is running without "Apply on next bar."  
**Solution**: Re-enable "Apply on next bar" in transport settings.

---

## 🔗 Related Documentation

- [Visualizer Guide](visualizer.md) – Explore the 3D scenes
- [Architecture Deep Dive](ARCHITECTURE.md) – Understand the codebase
- [Troubleshooting](TROUBLESHOOTING.md) – Common issues and solutions
- [Main README](../README.md) – Project overview

---

<div align="center">

**Ready to create complex arrangements?**

[🏠 Back to Main Docs](../README.md) | [🎨 Visualizer Guide →](visualizer.md)

</div>
