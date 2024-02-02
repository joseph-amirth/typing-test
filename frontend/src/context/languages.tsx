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

// To support lazy loading of language files.
export const LanguagesContext = createContext<{
  languages: Languages;
  requestLanguage: (language: Language) => void;
}>({ languages: {} as Languages, requestLanguage: () => {} });

export function LanguagesContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languages, setLanguages] = useState<Languages>({} as Languages);

  const requestLanguage = (language: Language) => {
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
  };

  const languagesContext = {
    languages,
    requestLanguage,
  };

  return (
    <LanguagesContext.Provider value={languagesContext}>
      {children}
    </LanguagesContext.Provider>
  );
}

export function useLanguage(language: Language): string[] | undefined {
  const { languages, requestLanguage } = useContext(LanguagesContext);

  useEffect(() => {
    requestLanguage(language);
  }, [language]);

  return languages[language];
}

async function importLanguage(language: Language): Promise<string[]> {
  const dynamicModule = await import(`../static/words/${language}.json`);
  return dynamicModule.default;
}
