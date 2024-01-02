import { createContext, useContext, useState } from "react";
import { updatePreferences } from "../util/backend";
import { setItem } from "../util/localStorage";

export const defaultPreferences = {
  currentMode: "words",
  wordsModeLength: 20,
  timeModeDuration: 30,
  language: "english",
  quoteModeMinLength: 0,
  quoteModeMaxLength: undefined,
  maxCharsInLine: 60,
  showAllLines: false,
};

export const PreferencesContext = createContext();

// Hook to initialize the preferences context and return it.
export const usePreferencesContext = (initialPreferences) => {
  const [preferences, setPreferences] = useState(initialPreferences);

  return {
    preferences,
    // To be used when preferences are received from the backend.
    receivePreferences: (newPreferences) => {
      setPreferences(newPreferences);
      setItem("preferences", newPreferences);
    },
    // To be used when preferences are updated in the frontend.
    addPreferences: (newPreferences) => {
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
export const usePreference = (preferenceName) => {
  const { preferences, addPreferences } = useContext(PreferencesContext);
  return [
    preferences[preferenceName],
    (value) => {
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
      };
    default:
  }
};
