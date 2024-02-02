import { PrngFn, Seed, sfc32 } from "../util/prng";

export function randomWords(
  seed: Seed,
  words: string[],
  count: number,
): string[] {
  const rand = sfc32(seed);
  return range(count).map(() => randomWord(rand, words));
}

function range(size: number): number[] {
  const result = [];
  for (let i = 0; i < size; i++) {
    result.push(i);
  }
  return result;
}

function randomWord(rand: PrngFn, words: string[]): string {
  return words[rand() % words.length];
}
