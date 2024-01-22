import { PrngFn, mulberry32 } from "../util/prng";
import english from "../static/words/english.json";
import english1k from "../static/words/english1k.json";
import { Language } from "../context/preferences";

const languages: { [key in Language]: string[] } = { english, english1k };

export function randomWords(
  seed: number,
  language: Language,
  count: number,
): string[] {
  const rand = mulberry32(seed);
  const words = languages[language];
  return range(count).map(() => randomWord(rand, words));
}

function range(size: number): number[] {
  let result = [];
  for (let i = 0; i < size; i++) {
    result.push(i);
  }
  return result;
}

function randomWord(rand: PrngFn, words: string[]): string {
  return words[rand() % words.length];
}
