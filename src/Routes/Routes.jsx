import { createBrowserRouter } from "react-router";
import Main from "../Layout/Main";
import Login from "../Pages/Login";
import Dashboard from "../Pages/Dashboard";
import Clan from "../Pages/ClanContainer";
import Cwl from "../Pages/Cwl";

// Placeholders for future modules
const Capital = () => <div className="text-white p-8 font-serif text-2xl">Capital Module (Under Construction)</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Main />,
    children: [
      {
        path: "", // Player Overview
        element: <Dashboard />,
      },
      {
        path: "clan", // Clan Hub & Registry
        element: <Clan />,
      },
      {
        path: "cwl",
        element: <Cwl />,
      },
      {
        path: "capital",
        element: <Capital />,
      }
    ]
  }
]);