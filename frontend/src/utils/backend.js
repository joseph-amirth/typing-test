import { getOrInitItem, setItem } from "./localStorage";

const backendUrl = "http://localhost:8080";

// Returned promise resolves to id of the test.
export const postTest = (mode, params) => {
  return postJson("/test", { mode, params }).then((response) =>
    response.text(),
  );
};

// Returned promise resolves to parameters of the test with given id.
export const getTest = (id) => {
  return getJson(`/test/${id}`);
};

// Returned promise resolves to user details and settings on success.
export const signUp = (username, email, password, preferences) => {
  return postJson(
    "/signup",
    { username, email, password, preferences },
    { credentials: "include" },
  ).then((response) => {
    if (response.status !== 200) {
      return response.text().then((text) => {
        return { error: text };
      });
    } else {
      return response.json();
    }
  });
};

export const signUpWithoutEmail = (username, password, preferences) => {
  return signUp(username, null, password, preferences);
};

export const signInWithEmail = (email, password) => {
  return signIn({ email }, password);
};

export const signInWithUsername = (username, password) => {
  return signIn({ username }, password);
};

// Returned promise resolves to user details and settings on success.
const signIn = (id, password, preferences = []) => {
  return postJson(
    "/signin",
    { id, password, preferences },
    { credentials: "include" },
  ).then((response) => {
    if (response.status !== 200) {
      return response.text().then((text) => {
        return { error: text };
      });
    } else {
      return response.json();
    }
  });
};

// Returned promise resolves to user details and preferences on success.
export const currentUser = () => {
  return get("/current", { credentials: "include" }).then((response) => {
    if (response.status !== 200) {
      return {
        userDetails: {},
        preferences: getOrInitItem("preferences", {}),
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
  testCompletedAt,
  wpm,
  rawWpm,
  accuracy,
) => {
  return postJson(
    "/result",
    { testParams, testCompletedAt, wpm, rawWpm, accuracy },
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
  return get("/result", { credentials: "include" }).then((response) => {
    if (response.status !== 200) {
      return response.text().then((text) => {
        return { error: text };
      });
    }
    return response.json();
  });
};

export const updatePreferences = (preferences) => {
  setItem("preferences", preferences);
  return postJson("/prefs", preferences, { credentials: "include" });
};

const get = (path, options = {}) => {
  return fetch(`${backendUrl}${path}`, options);
};

const getJson = (path, options = {}) => {
  return get(path, options).then((response) => response.json());
};

const postJson = (path, obj, options = {}) => {
  return fetch(`${backendUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
    ...options,
  });
};
