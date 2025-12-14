import { describe, expect, it } from "vitest";
import { mulberry32, randomInt, shuffle } from "./rng";

describe("rng", () => {
  it("produces deterministic sequences", () => {
    const rngA = mulberry32(42);
    const rngB = mulberry32(42);
    const seqA = Array.from({ length: 5 }, () => rngA());
    const seqB = Array.from({ length: 5 }, () => rngB());
    expect(seqA).toEqual(seqB);
  });

  it("creates deterministic integers and shuffles", () => {
    const rng = mulberry32(123);
    const values = Array.from({ length: 5 }, () => randomInt(rng, 1, 10));
    expect(values).toEqual([8, 2, 5, 3, 4]);
    const shuffled = shuffle(mulberry32(123), [1, 2, 3, 4]);
    expect(shuffled).toEqual([2, 3, 1, 4]);
  });
});
