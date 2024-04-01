import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import RandomTypingTestView from "./view/RandomTypingTestView";
import SignInView from "./view/SignInView";
import SignUpView from "./view/SignUpView";
import TypingRaceView from "./view/race";
import SpecificTypingTestView from "./view/SpecificTypingTestView";
import { base64urlToSeed } from "./util/prng";
import SettingsView from "./view/SettingsView";
import ProfileView from "./view/profile";
import LeaderboardView from "./view/LeaderboardView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <RandomTypingTestView />,
      },
      {
        path: "race",
        element: <TypingRaceView />,
      },
      {
        path: "words/:language/:length/:base64urlSeed",
        element: <SpecificTypingTestView />,
        loader: ({ params }) => {
          return {
            mode: "words",
            params: {
              language: params.language!,
              length: params.length!,
              seed: base64urlToSeed(params.base64urlSeed!),
            },
          };
        },
      },
      {
        path: "time/:language/:duration/:base64urlSeed",
        element: <SpecificTypingTestView />,
        loader: ({ params }) => {
          return {
            mode: "time",
            params: {
              language: params.language!,
              duration: parseInt(params.duration!),
              seed: base64urlToSeed(params.base64urlSeed!),
            },
          };
        },
      },
      {
        path: "quote/:id",
        element: <SpecificTypingTestView />,
        loader: ({ params }) => {
          return {
            mode: "quote",
            params: {
              length: "all",
              id: parseInt(params.id!),
            },
          };
        },
      },
      {
        path: "signup",
        element: <SignUpView />,
      },
      {
        path: "signin",
        element: <SignInView />,
      },
      {
        path: "leaderboard",
        element: <LeaderboardView />,
      },
      {
        path: "settings",
        element: <SettingsView />,
      },
      {
        path: "profile",
        element: <ProfileView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as Element).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
