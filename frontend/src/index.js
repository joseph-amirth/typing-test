import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import { currentUser, getResults, getTest } from "./utils/backend";
import App from "./App";
import Results from "./views/Results";
import SpecificTypingTestView from "./views/SpecificTypingTestView";
import RandomTypingTestView from "./views/RandomTypingTestView";

const router = createBrowserRouter([
  {
    route: "/",
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
        path: ":id",
        element: <SpecificTypingTestView />,
        loader: async ({ params }) => {
          return await getTest(params.id);
        },
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
