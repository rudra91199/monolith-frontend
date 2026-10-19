import { createBrowserRouter } from "react-router";
import Main from "../Layout/Main";
import Login from "../Pages/Login";
import Dashboard from "../Pages/Dashboard";
import Clan from "../Pages/ClanContainer";
import Cwl from "../Pages/Cwl";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

const Capital = () => <div className="text-white p-8 font-serif text-2xl">Capital Module (Under Construction)</div>;
const ClanGames = () => <div className="text-white p-8 font-serif text-2xl">Clan Games Module (Under Construction)</div>;

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/verify-email/:token", element: <Login /> },
      { path: "/reset-password/:token", element: <Login /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Main />,
        children: [
          { path: "", element: <Dashboard /> },
          { path: "clan", element: <Clan /> },
          { path: "cwl", element: <Cwl /> },
          { path: "games", element: <ClanGames /> },
          { path: "capital", element: <Capital /> },
        ],
      },
    ],
  },
]);