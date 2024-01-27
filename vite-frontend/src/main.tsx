import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import { currentUser, getResults } from "./util/backend";
import RandomTypingTestView from "./view/RandomTypingTestView";
import ResultsView from "./view/ResultsView";
import SignIn from "./view/SignIn";
import SignUp from "./view/SignUp";
import SpecificWordsTypingTest from "./typingtests/words/SpecificTypingTest";
import SpecificTimeTypingTest from "./typingtests/time/SpecificTypingTest";
import SpecificQuoteTypingTest from "./typingtests/quote/SpecificTypingTest";
import TypingRaceView from "./view/TypingRaceView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: async () => {
      return await currentUser();
    },
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
        element: <SpecificWordsTypingTest />,
      },
      {
        path: "time/:language/:duration/:base64urlSeed",
        element: <SpecificTimeTypingTest />,
      },
      {
        path: "quote/:id",
        element: <SpecificQuoteTypingTest />,
      },
      {
        path: "results",
        element: <ResultsView />,
        loader: async () => {
          return await getResults();
        },
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "signin",
        element: <SignIn />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as Element).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
