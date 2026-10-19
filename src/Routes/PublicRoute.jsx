import { Navigate, Outlet } from "react-router";

export default function PublicRoute() {
  const token = localStorage.getItem("coc_token");

  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64));
      const currentTime = Date.now() / 1000;

      if (decoded.exp && decoded.exp > currentTime) {
        return <Navigate to="/dashboard" replace />;
      } else {
        localStorage.removeItem("coc_token");
      }
    } catch {
      localStorage.removeItem("coc_token");
    }
  }

  return <Outlet />;
}