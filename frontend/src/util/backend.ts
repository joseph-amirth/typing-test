import {
  Preferences,
  TypingTestParams,
  defaultPreferences,
} from "../context/preference";
import { getOrInitItem } from "./local-storage";

const backendUrl = "http://localhost:8080";

// Returned promise resolves to user details and settings on success.
export async function signUp(params: {
  username: string;
  email: string;
  password: string;
  preferences: Preferences;
}) {
  return postJson("/signup", params, { credentials: "include" }).then(
    extractJson,
  );
}

export async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return signIn({ usernameOrEmail: { email }, password });
}

export async function signInWithUsername({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  return signIn({ usernameOrEmail: { username }, password });
}

// Returned promise resolves to user details and settings on success.
async function signIn(params: {
  usernameOrEmail: { username: string } | { email: string };
  password: string;
}) {
  return postJson("/signin", params, { credentials: "include" }).then(
    extractJson,
  );
}

// Returned promise resolves to user details and preferences on success.
export async function currentUser() {
  return get("/current", { credentials: "include" }).then((response) => {
    if (!response.ok) {
      return {
        preferences: getOrInitItem("preferences", defaultPreferences),
      };
    }
    return response.json();
  });
}

export async function logout() {
  return get("/logout", { credentials: "include" });
}

export async function postResult(params: {
  testParams: TypingTestParams;
  testCompletedTimestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}) {
  return postJson("/result", params, { credentials: "include" }).then(
    (response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          console.error(text);
        });
      }
    },
  );
}

export async function getResults() {
  return get("/result", { credentials: "include" }).then(extractJson);
}

export async function updatePreferences(preferences: Preferences) {
  return postJson("/prefs", preferences, { credentials: "include" });
}

async function get(path: string, options = {}) {
  return fetchNonThrowing(`${backendUrl}${path}`, options);
}

async function extractJson(response: Response) {
  if (!response.ok) {
    return response.text().then((text) => {
      return { error: text };
    });
  }
  return response.json();
}

async function postJson(path: string, obj: object, options = {}) {
  return fetchNonThrowing(`${backendUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
    ...options,
  });
}

async function fetchNonThrowing(path: string, options = {}) {
  return fetch(path, options).catch(() => {
    return new Response(null, {
      status: 503,
      statusText: "Service unavailable",
    });
  });
}
