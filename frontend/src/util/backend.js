import { defaultPreferences } from "../context/preferences";
import { getOrInitItem } from "./localStorage";

const backendUrl = "http://localhost:8080";

// Returned promise resolves to id of the test.
export const postTest = (mode, params) => {
  return postJson("/test", { mode, params }).then((response) =>
    response.text(),
  );
};

// Returned promise resolves to parameters of the test with given id.
export const getTest = (id) => {
  return get(`/test/${id}`).then(extractJson);
};

export const getRandomQuote = (oldQuoteId) => {
  let queryString = "";
  if (oldQuoteId !== undefined) {
    queryString += `oldQuoteId=${oldQuoteId}`;
  }
  return get(`/quote?${queryString}`).then(extractJson);
};

export const getQuote = (quoteId) => {
  return get(`/quote/${quoteId}`).then(extractJson);
};

// Returned promise resolves to user details and settings on success.
export const signUp = (username, email, password, preferences) => {
  return postJson(
    "/signup",
    { username, email, password, preferences },
    { credentials: "include" },
  ).then(extractJson);
};

export const signInWithEmail = (email, password) => {
  return signIn({ email }, password);
};

export const signInWithUsername = (username, password) => {
  return signIn({ username }, password);
};

// Returned promise resolves to user details and settings on success.
const signIn = (usernameOrEmail, password) => {
  return postJson(
    "/signin",
    { usernameOrEmail, password },
    { credentials: "include" },
  ).then(extractJson);
};

// Returned promise resolves to user details and preferences on success.
export const currentUser = () => {
  return get("/current", { credentials: "include" }).then((response) => {
    if (response.status !== 200) {
      return {
        preferences: getOrInitItem("preferences", defaultPreferences),
      };
    }
    return response.json();
  });
};

export const logout = () => {
  return get("/logout", { credentials: "include" });
};

export const postResult = (
  testParams,
  testCompletedTimestamp,
  wpm,
  rawWpm,
  accuracy,
) => {
  return postJson(
    "/result",
    { testParams, testCompletedTimestamp, wpm, rawWpm, accuracy },
    { credentials: "include" },
  ).then((response) => {
    if (response.status !== 200) {
      return response.text().then((text) => {
        console.error(text);
      });
    }
  });
};

export const getResults = () => {
  return get("/result", { credentials: "include" }).then(extractJson);
};

export const updatePreferences = (preferences) => {
  return postJson("/prefs", preferences, { credentials: "include" });
};

const get = (path, options = {}) => {
  return fetchNonThrowing(`${backendUrl}${path}`, options);
};

const extractJson = (response) => {
  if (response.status !== 200) {
    return response.text().then((text) => {
      return { error: text };
    });
  }
  return response.json();
};

const postJson = (path, obj, options = {}) => {
  return fetchNonThrowing(`${backendUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
    ...options,
  });
};

const fetchNonThrowing = (path, options = {}) => {
  return fetch(path, options).catch(() => {
    return new Response(null, {
      status: 503,
      statusText: "Service unavailable",
    });
  });
};
