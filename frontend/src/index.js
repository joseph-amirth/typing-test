import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import { currentUser, getResults } from "./util/backend";
import RandomTypingTestView from "./view/RandomTypingTestView";
import Results from "./view/Results";
import SignIn from "./view/SignIn";
import SignUp from "./view/SignUp";
import SpecificWordsTypingTest from "./typingtests/words/SpecificTypingTest";
import SpecificTimeTypingTest from "./typingtests/time/SpecificTypingTest";
import SpecificQuoteTypingTest from "./typingtests/quote/SpecificTypingTest";

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
        path: "words/:language/:length/:seed",
        element: <SpecificWordsTypingTest />,
      },
      {
        path: "time/:language/:duration/:seed",
        element: <SpecificTimeTypingTest />,
      },
      {
        path: "quote/:id",
        element: <SpecificQuoteTypingTest />,
      },
      {
        path: "results",
        element: <Results />,
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
