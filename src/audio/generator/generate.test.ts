import { describe, expect, it } from "vitest";
import { generateSong } from "./generate";

describe("generateSong", () => {
  it("is deterministic for same seed", () => {
    const songA = generateSong({ seed: 99, preset: "Test" });
    const songB = generateSong({ seed: 99, preset: "Test" });
    expect(songA).toEqual(songB);
  });

  it("creates at least 4 tracks with patterns", () => {
    const song = generateSong({ seed: 1 });
    expect(song.tracks.length).toBeGreaterThanOrEqual(4);
    song.tracks.forEach((track) => {
      expect(track.pattern.length).toBeGreaterThan(0);
    });
  });
});
