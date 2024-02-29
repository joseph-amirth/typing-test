import { useEffect } from "react";
import { Language, Quotes, StaticContentService } from ".";
import { useService } from "..";

export function useLanguage(language: Language): string[] | undefined {
  const { languages, requestLanguage } = useService(StaticContentService);

  useEffect(() => {
    requestLanguage(language);
  }, [language, requestLanguage]);

  return languages[language];
}

export function useQuotes(): Quotes | undefined {
  const { quotes, requestQuotes } = useService(StaticContentService);

  useEffect(() => {
    requestQuotes();
  }, [requestQuotes]);

  return quotes;
}
