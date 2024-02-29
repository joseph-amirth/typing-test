import { Preferences, PreferencesService, TypingTestParams } from ".";
import { useService } from "..";

// Hook to use and update a preference with the given name.
export function usePreference<T extends keyof Preferences>(
  preferenceName: T,
): [Preferences[T], (value: Preferences[T]) => void] {
  const { preferences, addPreferences } = useService(PreferencesService);
  return [
    preferences[preferenceName],
    (value: Preferences[T]) => {
      const preference = { [preferenceName]: value };
      addPreferences(preference);
    },
  ];
}

export const useTypingTestParams = (): TypingTestParams => {
  const { preferences } = useService(PreferencesService);
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
