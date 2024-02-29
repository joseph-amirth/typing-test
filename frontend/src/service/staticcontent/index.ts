/**
 * Exports hooks to lazy-load static content.
 */

import { createService } from "..";

export const languageList = [
  "english",
  "english1k",
  "english5k",
  "english10k",
  "english25k",
  "english450k",
] as const;

export type Language = (typeof languageList)[number];

export type Languages = {
  [key in Language]: string[] | undefined;
};

export type Quotes = {
  short: [number, number];
  medium: [number, number];
  long: [number, number];
  veryLong: [number, number];
  all: [number, number];
  quotes: [
    {
      text: string;
      source: string;
    },
  ];
};

export const StaticContentService = createService<{
  languages: Languages;
  quotes: Quotes | undefined;
  requestLanguage: (language: Language) => void;
  requestQuotes: () => void;
}>({
  languages: {} as Languages,
  quotes: undefined,
  requestLanguage: () => {},
  requestQuotes: () => {},
});
