import { createContext, useContext, useState } from "react";
import { updatePreferences } from "../util/backend";
import { setItem } from "../util/localStorage";

export interface Preferences {
  currentMode: "words" | "time" | "quote";
  wordsModeLength: number;
  timeModeDuration: number;
  language: "english" | "english1k";
  quoteModeLength: "short" | "medium" | "long" | "verylong" | "all";
  maxCharsInLine: number;
  showAllLines: boolean;
}

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
// TODO: Don't use any.
export const usePreference = (preferenceName: keyof Preferences): any => {
  const { preferences, addPreferences } = useContext(PreferencesContext);
  return [
    preferences[preferenceName],
    (value: any) => {
      const preference = { [preferenceName]: value };
      addPreferences(preference);
    },
  ];
};

export const useTypingTestParams = () => {
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
    default:
  }
};
