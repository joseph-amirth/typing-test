import { createContext, useEffect, useState } from "react";
import { usePreference } from "./preference";

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

// To support lazy loading of language files.
export const LanguagesContext = createContext<Languages>({} as Languages);

export function LanguagesContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languages, setLanguages] = useState<Languages>({} as Languages);
  const [language] = usePreference("language");

  useEffect(() => {
    if (languages[language] !== undefined) {
      return;
    }
    importLanguage(language).then((lexicon) => {
      setLanguages((languages) => {
        return {
          ...languages,
          [language]: lexicon,
        };
      });
    });
  }, [language]);

  return (
    <LanguagesContext.Provider value={languages}>
      {children}
    </LanguagesContext.Provider>
  );
}

async function importLanguage(language: Language): Promise<string[]> {
  const dynamicModule = await import(`../static/words/${language}.json`);
  return dynamicModule.default;
}
