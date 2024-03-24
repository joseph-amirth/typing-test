import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import RandomTypingTestView from "./view/RandomTypingTestView";
import ResultsView from "./view/ResultsView";
import SignInView from "./view/SignInView";
import SignUpView from "./view/SignUpView";
import TypingRaceView from "./view/TypingRaceView";
import SpecificTypingTestView from "./view/SpecificTypingTestView";
import { base64urlToSeed } from "./util/prng";
import SettingsView from "./view/SettingsView";

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
        path: "results",
        element: <ResultsView />,
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
        path: "settings",
        element: <SettingsView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as Element).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
