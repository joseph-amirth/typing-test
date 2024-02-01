import { PrngFn, Seed, sfc32 } from "../util/prng";

export const languages = [
  "english",
  "english1k",
  "english5k",
  "english10k",
  "english25k",
  "english450k",
] as const;

export type Language = (typeof languages)[number];

export async function importLanguage(language: Language): Promise<string[]> {
  const dynamicModule = await import(`../static/words/${language}.json`);
  return dynamicModule.default;
}

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
