import { useState } from "react";
import { updatePreferences } from "../../util/backend";
import { getOrInitItem, setItem } from "../../util/local-storage";
import { Language } from "../staticcontent";
import { createService } from "..";

export const defaultPreferences: Preferences = {
  currentMode: "words",
  wordsModeLength: 25,
  timeModeDuration: 30,
  language: "english",
  quoteModeLength: "medium",
  showAllLines: false,
  allowSkippingWords: true,
  allowBackspacingWords: true,
};

export const PreferencesService = createService<{
  preferences: Preferences;
  receivePreferences: (newPreferences: Preferences) => void;
  addPreferences: (newPreferences: Partial<Preferences>) => void;
}>({
  preferences: defaultPreferences,
  receivePreferences: () => {},
  addPreferences: () => {},
});

// Hook to initialize the preferences context and return it.
export const usePreferencesService = () => {
  const initialPreferences = getOrInitItem("preferences", defaultPreferences);
  const [preferences, setPreferences] = useState(initialPreferences);

  return {
    preferences,
    // To be used when preferences are received from the backend.
    receivePreferences: (newPreferences: Preferences) => {
      setPreferences(newPreferences);
      setItem("preferences", newPreferences);
    },
    // To be used when preferences are updated in the frontend.
    addPreferences: (newPreferences: Partial<Preferences>) => {
      setPreferences((preferences) => {
        const updatedPreferences = {
          ...preferences,
          ...newPreferences,
        };
        setItem("preferences", updatedPreferences);
        updatePreferences(updatedPreferences);
        return updatedPreferences;
      });
    },
  };
};

export interface Preferences {
  currentMode: TypingTestMode;
  wordsModeLength: number;
  timeModeDuration: number;
  language: Language;
  quoteModeLength: QuoteModeLength;
  showAllLines: boolean;
  allowSkippingWords: boolean;
  allowBackspacingWords: boolean;
}

export type TypingTestMode = "words" | "time" | "quote";
export type QuoteModeLength = (typeof quoteLengths)[number];

export type TypingTestParams =
  | WordsTypingTestParams
  | TimeTypingTestParams
  | QuoteTypingTestParams;

export interface WordsTypingTestParams {
  mode: "words";
  params: {
    language: Language;
    length: number;
  };
}

export const wordsLengths = [10, 25, 50, 100] as const;

export interface TimeTypingTestParams {
  mode: "time";
  params: {
    language: Language;
    duration: number;
  };
}

export const timeDurations = [15, 30, 60, 120] as const;

export interface QuoteTypingTestParams {
  mode: "quote";
  params: {
    length: QuoteModeLength;
  };
}

export const quoteLengths = [
  "all",
  "short",
  "medium",
  "long",
  "veryLong",
] as const;
