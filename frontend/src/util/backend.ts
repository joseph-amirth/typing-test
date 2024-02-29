import { Preferences, TypingTestParams } from "../service/preferences";

const backendUrl = "http://localhost:8080";

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
