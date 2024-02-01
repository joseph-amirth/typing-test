import { PrngFn, Seed, sfc32 } from "../util/prng";
import english from "../static/words/english.json";
import english1k from "../static/words/english1k.json";
import english5k from "../static/words/english5k.json";
import english10k from "../static/words/english10k.json";
import english25k from "../static/words/english25k.json";
import english450k from "../static/words/english450k.json";

export const languages = [
  "english",
  "english1k",
  "english5k",
  "english10k",
  "english25k",
  "english450k",
] as const;

export type Language = (typeof languages)[number];

const words: { [key in Language]: string[] } = {
  english,
  english1k,
  english5k,
  english10k,
  english25k,
  english450k,
};

export function randomWords(
  seed: Seed,
  language: Language,
  count: number,
): string[] {
  const rand = sfc32(seed);
  return range(count).map(() => randomWord(rand, words[language]));
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
