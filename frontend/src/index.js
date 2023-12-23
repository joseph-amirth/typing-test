import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import { currentUser, getResults, getTest } from "./util/backend";
import RandomTypingTestView from "./view/RandomTypingTestView";
import Results from "./view/Results";
import SignIn from "./view/SignIn";
import SignUp from "./view/SignUp";
import SpecificTypingTestView from "./view/SpecificTypingTestView";

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
