import { createContext, useContext, useEffect, useState } from "react";
import { updatePreferences } from "./utils/backend";

const defaultPreferences = {
  mode: "words",
  wordsModeLanguage: "english",
  wordsModeLength: 20,
  timeModeLanguage: "english",
  timeModeDuration: 30,
  quoteModeLength: {
    minLength: 0,
    maxLength: 1000,
  },
  maxCharsInLine: 60,
  showAllLines: false,
};

export const PreferencesContext = createContext();

// Hook to initialize the preferences context and return it.
export const usePreferencesContext = (initialChangedPreferences) => {
  const [preferences, setPreferences] = useState({
    ...defaultPreferences,
    ...initialChangedPreferences,
  });

  const [changedPreferences, setChangedPreferences] = useState(
    initialChangedPreferences,
  );

  useEffect(() => {
    updatePreferences(changedPreferences);
  }, [changedPreferences]);

  return {
    preferences,
    addPreference: (preference) => {
      setPreferences((preferences) => {
        return {
          ...preferences,
          ...preference,
        };
      });
      setChangedPreferences((changedPreferences) => {
        const newChangedPreferences = { ...changedPreferences, ...preference };
        return newChangedPreferences;
      });
    },
  };
};

// Hook to use and update a preference with the given name.
export const usePreference = (preferenceName) => {
  const { preferences, addPreference } = useContext(PreferencesContext);
  return [
    preferences[preferenceName],
    (value) => {
      const preference = { [preferenceName]: value };
      addPreference(preference);
    },
  ];
};

export const useTypingTestParams = () => {
  const { preferences } = useContext(PreferencesContext);
  const { mode } = preferences;

  switch (mode) {
    case "words":
      return {
        mode,
        params: {
          language: preferences.wordsModeLanguage,
          length: preferences.wordsModeLength,
        },
      };
    case "time":
      return {
        mode,
        params: {
          language: preferences.timeModeLanguage,
          duration: preferences.timeModeDuration,
        },
      };
    default:
  }
};
