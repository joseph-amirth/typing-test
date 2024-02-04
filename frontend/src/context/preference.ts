import { createContext, useContext, useState } from "react";
import { updatePreferences } from "../util/backend";
import { setItem } from "../util/local-storage";
import { Language } from "../service/static-content";

export const defaultPreferences: Preferences = {
  currentMode: "words",
  wordsModeLength: 20,
  timeModeDuration: 30,
  language: "english",
  quoteModeLength: "medium",
  maxCharsInLine: 60,
  showAllLines: false,
};

export const PreferencesContext = createContext<{
  preferences: Preferences;
  receivePreferences: (newPreferences: Preferences) => void;
  addPreferences: (newPreferences: Partial<Preferences>) => void;
}>({
  preferences: defaultPreferences,
  receivePreferences: () => {},
  addPreferences: () => {},
});

// Hook to initialize the preferences context and return it.
export const usePreferencesContext = (initialPreferences: Preferences) => {
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

// Hook to use and update a preference with the given name.
export function usePreference<T extends keyof Preferences>(
  preferenceName: T,
): [Preferences[T], (value: Preferences[T]) => void] {
  const { preferences, addPreferences } = useContext(PreferencesContext);
  return [
    preferences[preferenceName],
    (value: Preferences[T]) => {
      const preference = { [preferenceName]: value };
      addPreferences(preference);
    },
  ];
}

export const useTypingTestParams = (): TypingTestParams => {
  const { preferences } = useContext(PreferencesContext);
  const { currentMode } = preferences;

  switch (currentMode) {
    case "words":
      return {
        mode: currentMode,
        params: {
          language: preferences.language,
          length: preferences.wordsModeLength,
        },
      };
    case "time":
      return {
        mode: currentMode,
        params: {
          language: preferences.language,
          duration: preferences.timeModeDuration,
        },
      };
    case "quote":
      return {
        mode: currentMode,
        params: {
          length: preferences.quoteModeLength,
        },
      };
  }
};

export interface Preferences {
  currentMode: TypingTestMode;
  wordsModeLength: number;
  timeModeDuration: number;
  language: Language;
  quoteModeLength: QuoteModeLength;
  maxCharsInLine: number;
  showAllLines: boolean;
}

export type TypingTestMode = "words" | "time" | "quote";
export type QuoteModeLength = "short" | "medium" | "long" | "veryLong" | "all";

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

export interface TimeTypingTestParams {
  mode: "time";
  params: {
    language: Language;
    duration: number;
  };
}

export interface QuoteTypingTestParams {
  mode: "quote";
  params: {
    length: QuoteModeLength;
  };
}
