import { useState } from "react";
import { getOrInitItem, setItem } from "../../util/local-storage";
import { Preferences, PreferencesService, defaultPreferences } from ".";
import { useService } from "..";
import { ServerService } from "../server";

function PreferencesServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { post } = useService(ServerService);

  const initialPreferences = getOrInitItem("preferences", defaultPreferences);
  const [preferences, setPreferences] = useState(initialPreferences);

  const updatePreferences = (preferences: Preferences) => {
    return post<null>("/prefs", preferences, { credentials: "include" });
  };

  const preferencesService = {
    preferences,
    // To be used when preferences are received from the backend.
    receivePreferences: (newPreferences: Preferences) => {
      setPreferences(newPreferences);
      setItem("preferences", newPreferences);
    },
    // To be used when preferences are updated in the frontend.
    addPreferences: (newPreferences: Partial<Preferences>) => {
      setPreferences((preferences: Preferences) => {
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

  return (
    <PreferencesService.Provider value={preferencesService}>
      {children}
    </PreferencesService.Provider>
  );
}

export default PreferencesServiceProvider;
