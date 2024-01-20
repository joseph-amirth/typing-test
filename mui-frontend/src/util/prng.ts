export function generate128bitSeed(): Int32Array {
  return window.crypto.getRandomValues(new Int32Array(4));
}

export function generate32bitSeed(): number {
  return window.crypto.getRandomValues(new Int32Array(1))[0];
}

/**
 * Takes in a 128-bit seed and produces 32-bit signed integers.
 */
export function sfc32(seed: [number, number, number, number]): PrngFn {
  let [a, b, c, d] = seed;
  return function () {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return t >>> 0;
  };
}

/**
 * Takes in a 32-bit seed and produces 32-bit signed integers.
 */
export function mulberry32(seed: number): PrngFn {
  let a = seed;
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
}

type PrngFn = () => number;
