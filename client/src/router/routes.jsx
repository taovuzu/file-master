import { lazy } from "react";

import { Navigate } from "react-router-dom";

const Logout = lazy(() => import("@/pages/Logout.jsx"));
const NotFound = lazy(() => import("@/pages/NotFound.jsx"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Settings/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const About = lazy(() => import("@/pages/About"));

let routes = {
  default: [
    {
      path: "/login",
      element: <Navigate to="/" />,
    },
    {
      path: "/logout",
      element: <Logout />,
    },
    {
      path: "/about",
      element: <About />,
    },
    {
      path: "/setting",
      element: <Settings/>
    },
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
};

export default routes;
