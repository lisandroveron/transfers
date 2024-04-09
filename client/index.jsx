import React, {useState} from "react";
import { createRoot } from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import Account from "./src/routes/Account/Account.jsx";
import Error from "./src/routes/Error/Error.jsx";
import Home from "./src/routes/Home/Home.jsx";
import Login from "./src/routes/Login/Login.jsx";
import Signup from "./src/routes/Signup/Signup.jsx";
import GetStatus from "./src/components/GetStatus/GetStatus.jsx";

import {UserProvider} from "./src/context/UserContext.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />
  },
  {
    path: "account",
    element: <Account />,
    children: [
      {
        path: "login",
        element: <Login />
      },
      {
        path: "signup",
        element: <Signup />
      }
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <UserProvider>
        <GetStatus setIsLoading={setIsLoading} />
        {isLoading ? <p>Cargando...</p> : <RouterProvider router={router} />}
      </UserProvider>
    </>
  );
};