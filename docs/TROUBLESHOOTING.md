# 🐛 Troubleshooting Guide

This guide helps you diagnose and resolve common issues with BitAndPlay. If your problem isn't listed here, please [open an issue](https://github.com/polsala/BitAndPlay/issues) on GitHub.

---

## 📋 Table of Contents

- [Audio Issues](#audio-issues)
- [Visualizer Issues](#visualizer-issues)
- [Studio Mode Issues](#studio-mode-issues)
- [Export Issues](#export-issues)
- [Performance Issues](#performance-issues)
- [Browser Compatibility](#browser-compatibility)
- [Development Issues](#development-issues)

---

## 🔊 Audio Issues

### No Sound / Audio Not Playing

**Symptoms**: You press play, but hear nothing.

**Possible Causes & Solutions**:

1. **Audio context not initialized**
   - **Cause**: Browsers require a user gesture to start audio
   - **Solution**: Click the "Enable Audio" overlay button that appears on first load
   - **Test**: Refresh the page and ensure you click the button before playing

2. **Volume is muted**
   - **Cause**: System volume, browser tab, or BitAndPlay mixer is muted
   - **Solution**: 
     - Check system volume and browser tab audio icon
     - In Studio mode, ensure tracks aren't muted
     - Check the Mix tab for master volume

3. **Browser blocks Web Audio API**
   - **Cause**: Browser security settings or extensions
   - **Solution**:
     - Disable ad blockers or privacy extensions temporarily
     - Check browser console (F12) for errors
     - Try a different browser (Chrome/Firefox recommended)

4. **Audio context suspended**
   - **Cause**: Browser paused audio context due to inactivity
   - **Solution**: Click anywhere on the page to resume, then press play again

---

### Clicks, Pops, or Audio Glitches

**Symptoms**: You hear clicking or popping sounds during playback or when regenerating songs.

**Possible Causes & Solutions**:

1. **Updates mid-bar**
   - **Cause**: Changing patterns while audio is playing without "Apply on next bar"
   - **Solution**: 
     - Enable "Apply on next bar" in transport settings (it's on by default)
     - Avoid editing clips during playback without this setting
   
2. **CPU overload**
   - **Cause**: Too many tracks or visualizer quality too high
   - **Solution**:
     - Lower visualizer quality to Medium or Low
     - Reduce number of active tracks (mute some)
     - Close other browser tabs or applications

3. **Sample rate mismatch**
   - **Cause**: Audio interface has different sample rate than browser default
   - **Solution**: 
     - Set your audio interface to 44.1 kHz or 48 kHz
     - Restart browser after changing sample rate

4. **Buffer underruns**
   - **Cause**: System under heavy load
   - **Solution**: Close resource-intensive apps; restart browser

---

### Timing Issues / Song Sounds Off-Beat

**Symptoms**: Drums or melody sound out of sync; timing feels wrong.

**Possible Causes & Solutions**:

1. **Swing set too high**
   - **Cause**: Swing above 20% can make drums feel loose
   - **Solution**: Reduce swing to 0–15% for tight timing

2. **BPM too fast or slow**
   - **Cause**: Song generated at extreme BPM
   - **Solution**: Adjust BPM slider to 80–160 range

3. **Browser throttling**
   - **Cause**: Tab is in background; browser reduces timer precision
   - **Solution**: Keep BitAndPlay in an active, visible tab while playing

---

## 🌌 Visualizer Issues

### Visualizer Shows "WebGL Not Supported"

**Symptoms**: Visualizer displays an error message instead of the 3D scene.

**Possible Causes & Solutions**:

1. **WebGL disabled or unsupported**
   - **Cause**: Browser or GPU doesn't support WebGL
   - **Solution**:
     - Update browser to the latest version
     - Enable hardware acceleration:
       - **Chrome**: Settings → System → "Use hardware acceleration when available"
       - **Firefox**: Preferences → Performance → Uncheck "Use recommended performance settings" → Enable hardware acceleration
     - Try a different browser (Chrome, Firefox, Edge recommended)

2. **GPU driver issues**
   - **Cause**: Outdated or corrupted GPU drivers
   - **Solution**: Update GPU drivers from manufacturer's website (NVIDIA, AMD, Intel)

3. **WebGL blacklisted**
   - **Cause**: Browser blacklisted your GPU due to known issues
   - **Solution**: 
     - Check chrome://gpu (Chrome) or about:support (Firefox) for WebGL status
     - Override blacklist (not recommended unless you understand risks):
       - Chrome: `chrome://flags/#ignore-gpu-blacklist`
       - Firefox: `about:config` → `webgl.force-enabled` → true

---

### Low Frame Rate / Choppy Visuals

**Symptoms**: Visualizer animation is laggy or stuttery.

**Possible Causes & Solutions**:

1. **Quality set too high**
   - **Cause**: GPU can't handle High quality settings
   - **Solution**: 
     - Open Visualizer tab → Change quality to Medium or Low
     - Start with Low and increase if performance is smooth

2. **Heavy scene selected**
   - **Cause**: Some scenes are more GPU-intensive
   - **Solution**: Switch to a lighter scene:
     - **Lightest**: Neon Grid, Orbit Bars
     - **Medium**: Tunnel Spectrum
     - **Heaviest**: Black Hole, Interactive Bubbles

3. **Integrated GPU**
   - **Cause**: Integrated GPUs (Intel UHD) have limited performance
   - **Solution**: 
     - Use Low quality permanently
     - Stick to Neon Grid or Orbit Bars scenes
     - Close other GPU-intensive apps (video players, games)

4. **High screen resolution**
   - **Cause**: 4K displays require more GPU power
   - **Solution**: 
     - Lower quality (DPR is reduced automatically)
     - Use a smaller browser window
     - Switch to 1080p display if available

---

### Visualizer Doesn't React to Audio

**Symptoms**: Visualizer displays, but doesn't move or respond to music.

**Possible Causes & Solutions**:

1. **Audio not playing**
   - **Cause**: Visualizer requires active audio to react
   - **Solution**: 
     - Press play to start audio
     - Ensure audio is enabled (see [Audio Issues](#audio-issues))

2. **Analyzer not connected**
   - **Cause**: Audio context issue or engine initialization failure
   - **Solution**: 
     - Refresh the page
     - Check browser console (F12) for errors
     - Report issue on GitHub if persists

3. **Volume too low**
   - **Cause**: Audio level below analyzer threshold
   - **Solution**: Increase system or browser volume

---

### Colors Look Washed Out or Incorrect

**Symptoms**: Visualizer colors appear dull, oversaturated, or incorrect.

**Possible Causes & Solutions**:

1. **Monitor calibration**
   - **Cause**: Display not calibrated for sRGB
   - **Solution**: Adjust monitor brightness, contrast, and gamma settings

2. **HDR mode**
   - **Cause**: Monitor in HDR mode without proper browser support
   - **Solution**: Disable HDR in display settings (Windows: Settings → Display → HDR)

3. **Browser color management**
   - **Cause**: Browser applies color profiles inconsistently
   - **Solution**: Test in a different browser; adjust monitor settings

---

## 🎚️ Studio Mode Issues

### Clips Won't Move or Resize

**Symptoms**: You try to drag or resize a clip, but it doesn't respond or snaps back.

**Possible Causes & Solutions**:

1. **Another clip blocking**
   - **Cause**: Clips can't overlap on the same track
   - **Solution**: 
     - Move or delete the blocking clip first
     - Use a different track lane

2. **Snap setting too coarse**
   - **Cause**: Clip snaps to grid larger than desired
   - **Solution**: Change snap setting (top bar) to finer grid (e.g., 1/16 instead of 1/4)

3. **Clip selected in editor**
   - **Cause**: Clip is open in editor drawer; some operations disabled
   - **Solution**: Close the editor drawer first, then move/resize

---

### Piano Roll Notes Don't Play

**Symptoms**: You add notes in piano roll, but they don't sound during playback.

**Possible Causes & Solutions**:

1. **Track muted or soloed incorrectly**
   - **Cause**: Track is muted, or another track is soloed
   - **Solution**: 
     - Check track's mute/solo buttons
     - Unsolo other tracks if you want to hear this one

2. **Clip outside loop region**
   - **Cause**: Clip is placed outside the loop start/end boundaries
   - **Solution**: 
     - Disable loop mode, or
     - Move clip inside loop region, or
     - Adjust loop start/end to include the clip

3. **Notes outside clip length**
   - **Cause**: Notes placed beyond clip's end are trimmed
   - **Solution**: Resize clip to accommodate all notes

---

### Playhead Doesn't Move

**Symptoms**: You press play, but the playhead line stays still.

**Possible Causes & Solutions**:

1. **Transport stopped**
   - **Cause**: Transport is in stop state
   - **Solution**: Press play button (spacebar)

2. **Zoom level too low**
   - **Cause**: Timeline is zoomed out so much that playhead movement isn't visible
   - **Solution**: Increase zoom slider to see playhead movement

3. **Browser tab in background**
   - **Cause**: Browser throttles animations in background tabs
   - **Solution**: Keep BitAndPlay in active, visible tab

---

## 💾 Export Issues

### Fast Export Not Available

**Symptoms**: "Fast Export" button is disabled or missing.

**Possible Causes & Solutions**:

1. **MediaRecorder not supported**
   - **Cause**: Browser doesn't support `MediaRecorder` API for Web Audio
   - **Solution**: 
     - Use "HQ WAV" export instead (always available)
     - Update browser to latest version
     - Try Chrome or Firefox (best support)

2. **MIME type unsupported**
   - **Cause**: Browser doesn't support `audio/webm` or `audio/ogg`
   - **Solution**: Same as above; use HQ WAV export

---

### HQ WAV Export Sounds Different from Live

**Symptoms**: Exported WAV doesn't match what you heard during playback.

**Possible Causes & Solutions**:

1. **Simplified oscillators**
   - **Cause**: HQ export uses simplified oscillators (not Tone.js graph) for determinism
   - **Solution**: This is expected; envelopes and waveforms are slightly different
   - **Workaround**: Use Fast Export for exact live sound (if available)

2. **Swing not applied**
   - **Cause**: Offline render may handle swing differently
   - **Solution**: Re-export with swing adjusted; report issue if persistent

---

### Export Takes Too Long

**Symptoms**: HQ WAV export stalls or takes several minutes.

**Possible Causes & Solutions**:

1. **Song too long**
   - **Cause**: Offline rendering is CPU-intensive for long songs
   - **Solution**: 
     - Shorten song to 8–16 bars
     - Use Fast Export instead (real-time)
     - Wait patiently; export will complete

2. **Browser frozen**
   - **Cause**: Browser may appear frozen during offline render
   - **Solution**: 
     - Check browser's task manager (Shift+Esc in Chrome)
     - If not responding, kill tab and try again with shorter song

---

### Export File Won't Play

**Symptoms**: Downloaded file doesn't play in media player.

**Possible Causes & Solutions**:

1. **File extension mismatch**
   - **Cause**: Browser auto-added wrong extension
   - **Solution**: Rename file to ensure correct extension:
     - Fast Export: `.webm` or `.ogg`
     - HQ Export: `.wav`

2. **Incomplete download**
   - **Cause**: Export interrupted before completion
   - **Solution**: Re-export and wait for "Download complete" confirmation

3. **Unsupported codec**
   - **Cause**: Media player doesn't support WebM/Ogg
   - **Solution**: Use VLC Media Player or convert to MP3 with FFmpeg

---

## ⚡ Performance Issues

### App Feels Slow or Unresponsive

**Symptoms**: UI lags; clicks don't register immediately.

**Possible Causes & Solutions**:

1. **Too many tracks/clips**
   - **Cause**: Studio mode with 20+ tracks taxes React rendering
   - **Solution**: Limit to 8–12 tracks; mute or delete unused tracks

2. **Visualizer + Studio both active**
   - **Cause**: GPU rendering visualizer while CPU handles timeline
   - **Solution**: 
     - Disable visualizer or use Low quality
     - Focus on one mode at a time

3. **Browser extensions**
   - **Cause**: Extensions (ad blockers, trackers) interfere with performance
   - **Solution**: Disable extensions temporarily; test in incognito mode

4. **Low RAM**
   - **Cause**: System has less than 4 GB RAM
   - **Solution**: Close other apps; restart browser

---

### Audio Crackles Under Heavy Load

**Symptoms**: Audio breaks up when CPU/GPU is busy.

**Possible Causes & Solutions**:

1. **Visualizer stealing CPU**
   - **Cause**: WebGL rendering competes with audio thread
   - **Solution**: Lower visualizer quality or disable it

2. **Background processes**
   - **Cause**: Antivirus, updates, or other apps consuming CPU
   - **Solution**: Close unnecessary apps; pause background tasks

3. **Audio buffer size**
   - **Cause**: Browser uses small audio buffer (can't adjust in-app)
   - **Solution**: Restart browser; check OS audio settings for buffer size

---

## 🌐 Browser Compatibility

### Recommended Browsers

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| **Chrome** | 90+ | ✅ Full | Best performance and WebGL support |
| **Firefox** | 88+ | ✅ Full | Excellent Web Audio API support |
| **Edge** | 90+ | ✅ Full | Chromium-based; same as Chrome |
| **Safari** | 14+ | ⚠️ Partial | WebGL OK; some MediaRecorder issues |
| **Opera** | 76+ | ✅ Full | Chromium-based |
| **Mobile Chrome** | 90+ | ⚠️ Partial | Limited performance; touch controls basic |
| **Mobile Safari** | 14+ | ⚠️ Partial | Best mobile WebGL; touch UX limited |

### Known Browser Issues

**Safari**:
- MediaRecorder may not support Web Audio streams (use HQ WAV export)
- Audio context auto-suspends aggressively (click page to resume)
- WebGL performance lower than Chrome/Firefox on same hardware

**Firefox**:
- WebGL may use more RAM than Chrome
- Some WebM codecs unsupported (falls back to Ogg)

**Mobile Browsers**:
- Touch controls not optimized for Studio mode
- Integrated GPUs limit visualizer quality to Low
- Audio latency higher than desktop

---

## 🛠️ Development Issues

### npm ci Fails

**Symptoms**: Dependency installation errors.

**Possible Causes & Solutions**:

1. **Node version mismatch**
   - **Cause**: Node.js version below 18
   - **Solution**: 
     - Install Node 18 or higher (20 recommended)
     - Use `nvm` to manage Node versions

2. **Corrupted package-lock.json**
   - **Cause**: Lock file out of sync
   - **Solution**: 
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```

3. **Network issues**
   - **Cause**: npm registry unreachable
   - **Solution**: Check internet connection; try `npm ci --registry=https://registry.npmjs.org/`

---

### Build Errors

**Symptoms**: `npm run build` fails with TypeScript errors.

**Possible Causes & Solutions**:

1. **TypeScript errors**
   - **Cause**: Type mismatches in code
   - **Solution**: 
     - Run `npm run build` to see full error list
     - Fix type errors one by one
     - Ensure `tsconfig.json` strict mode is respected

2. **Out of memory**
   - **Cause**: Vite build uses too much RAM
   - **Solution**: Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

---

### Tests Fail

**Symptoms**: `npm run test` shows failures.

**Possible Causes & Solutions**:

1. **Test snapshots outdated**
   - **Cause**: Code changed but snapshots not updated
   - **Solution**: Run `npm run test -- -u` to update snapshots

2. **Environment mismatch**
   - **Cause**: Tests expect browser APIs not available in Node
   - **Solution**: Mock browser APIs in test setup (see existing tests)

---

## ❓ Still Having Issues?

If your problem isn't solved here:

1. **Check browser console** (F12 → Console) for error messages
2. **Search existing issues** on [GitHub Issues](https://github.com/polsala/BitAndPlay/issues)
3. **Open a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Browser, OS, and version info
   - Screenshots or console logs
   - What you've already tried

We'll do our best to help! 🎉

---

## 🔗 Related Documentation

- [Main README](../README.md) – Project overview
- [Studio Guide](studio.md) – Studio mode usage
- [Visualizer Guide](visualizer.md) – Visualizer scenes
- [Architecture](ARCHITECTURE.md) – Technical details

---

<div align="center">

**Need more help?**

[🏠 Back to Main Docs](../README.md) | [💬 GitHub Discussions](https://github.com/polsala/BitAndPlay/discussions)

</div>
