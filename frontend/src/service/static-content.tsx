/**
 * Exports hooks to lazy-load static content.
 */

import { createContext, useContext, useEffect, useState } from "react";

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

export const StaticContentService = createContext<{
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

export function useLanguage(language: Language): string[] | undefined {
  const { languages, requestLanguage } = useContext(StaticContentService);

  useEffect(() => {
    requestLanguage(language);
  }, [language, requestLanguage]);

  return languages[language];
}

export function useQuotes(): Quotes | undefined {
  const { quotes, requestQuotes } = useContext(StaticContentService);

  useEffect(() => {
    requestQuotes();
  }, [requestQuotes]);

  return quotes;
}

export function StaticContentServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languages, setLanguages] = useState<Languages>({} as Languages);
  const [quotes, setQuotes] = useState<Quotes | undefined>(undefined);

  const requestLanguage = (language: Language) => {
    if (languages[language] !== undefined) {
      return;
    }
    import(`../static/words/${language}.json`)
      .then((module) => module.default)
      .then((lexicon) => {
        setLanguages((languages) => {
          return {
            ...languages,
            [language]: lexicon,
          };
        });
      });
  };

  const requestQuotes = () => {
    if (quotes !== undefined) {
      return;
    }
    import("../static/quotes.json")
      .then((module) => module.default)
      .then((quotes) => {
        setQuotes(quotes as unknown as Quotes);
      });
  };

  const staticContentService = {
    languages,
    quotes,
    requestLanguage,
    requestQuotes,
  };

  return (
    <StaticContentService.Provider value={staticContentService}>
      {children}
    </StaticContentService.Provider>
  );
}
