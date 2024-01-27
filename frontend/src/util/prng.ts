export function generateSeed(): Seed {
  const randomValues = window.crypto.getRandomValues(new Int32Array(4));
  return [randomValues[0], randomValues[1], randomValues[2], randomValues[3]];
}

/**
 * Takes in a 128-bit seed and produces 32-bit signed integers.
 */
export function sfc32(seed: Seed): PrngFn {
  let [a, b, c, d] = seed;
  return function () {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return t >>> 0;
  };
}

export function seedToBase64url(seed: Seed): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      bytes[4 * i + j] = (seed[i] >>> (8 * j)) % (1 << 8);
    }
  }

  const base64 = bytesToBase64(new Uint8Array(bytes));
  return toBase64url(base64);
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = String.fromCodePoint(...bytes.values());
  return btoa(binString);
}

function toBase64url(base64: string) {
  return base64.replaceAll(/\+/g, "-").replaceAll(/\//g, "_");
}

export function base64urlToSeed(base64url: string): Seed {
  const base64 = toBase64(base64url);
  const bytes = base64ToBytes(base64);

  const seed = [];
  for (let i = 0; i < 4; i++) {
    let value = 0;
    for (let j = 0; j < 4; j++) {
      value |= bytes[4 * i + j] << (8 * j);
    }
    seed.push(value);
  }

  return seed as Seed;
}

function toBase64(base64url: string) {
  return base64url.replaceAll(/-/g, "+").replaceAll(/_/g, "/");
}

function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

export type Seed = [number, number, number, number];
export type PrngFn = () => number;
