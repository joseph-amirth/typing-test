import {
  Preferences,
  TypingTestParams,
  defaultPreferences,
} from "../context/preference";
import { getOrInitItem } from "./local-storage";

const backendUrl = "http://localhost:8080";

// Returned promise resolves to user details and settings on success.
export const signUp = async (params: {
  username: string;
  email: string;
  password: string;
  preferences: Preferences;
}) => {
  return postJson("/signup", params, { credentials: "include" }).then(
    extractJson,
  );
};

export const signInWithEmail = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return signIn({ usernameOrEmail: { email }, password });
};

export const signInWithUsername = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  return signIn({ usernameOrEmail: { username }, password });
};

// Returned promise resolves to user details and settings on success.
const signIn = async (params: {
  usernameOrEmail: { username: string } | { email: string };
  password: string;
}) => {
  return postJson("/signin", params, { credentials: "include" }).then(
    extractJson,
  );
};

// Returned promise resolves to user details and preferences on success.
export const currentUser = async () => {
  return get("/current", { credentials: "include" }).then((response) => {
    if (response.status !== 200) {
      return {
        preferences: getOrInitItem("preferences", defaultPreferences),
      };
    }
    return response.json();
  });
};

export const logout = async () => {
  return get("/logout", { credentials: "include" });
};

export const postResult = async (params: {
  testParams: TypingTestParams;
  testCompletedTimestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}) => {
  return postJson("/result", params, { credentials: "include" }).then(
    (response) => {
      if (response.status !== 200) {
        return response.text().then((text) => {
          console.error(text);
        });
      }
    },
  );
};

export const getResults = async () => {
  return get("/result", { credentials: "include" }).then(extractJson);
};

export const updatePreferences = async (preferences: Preferences) => {
  return postJson("/prefs", preferences, { credentials: "include" });
};

const get = async (path: string, options = {}) => {
  return fetchNonThrowing(`${backendUrl}${path}`, options);
};

const extractJson = async (response: Response) => {
  if (!response.ok) {
    return response.text().then((text) => {
      return { error: text };
    });
  }
  return response.json();
};

const postJson = async (path: string, obj: object, options = {}) => {
  return fetchNonThrowing(`${backendUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
    ...options,
  });
};

const fetchNonThrowing = async (path: string, options = {}) => {
  return fetch(path, options).catch(() => {
    return new Response(null, {
      status: 503,
      statusText: "Service unavailable",
    });
  });
};
