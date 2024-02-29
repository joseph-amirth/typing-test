import { useState } from "react";
import { Language, Languages, Quotes, StaticContentService } from ".";

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
    import(`../../static/words/${language}.json`)
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
    import("../../static/quotes.json")
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
