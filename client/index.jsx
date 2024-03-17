import React from "react";
import { createRoot } from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import Home from "./src/routes/Home/Home.jsx";
import Login from "./src/routes/Login/Login.jsx";
import Error from "./src/routes/Error/Error.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />
  },
  {
    path: "login",
    element: <Login />
  }
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);