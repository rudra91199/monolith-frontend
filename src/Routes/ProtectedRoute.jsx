import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const token = localStorage.getItem("coc_token");

  // If no token exists at all, kick them to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    // Basic JWT Decoding to check expiration
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const decoded = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;

    // If the token's exp (expiration time) has passed, kick them to login
    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("coc_token"); // Clean up the dead token
      return <Navigate to="/" replace />;
    }

    // If the token is valid and not expired, let them pass
    return <Outlet />;
  } catch (error) {
    // If the token is corrupted or manually messed with, kick them to login
    localStorage.removeItem("coc_token");
    return <Navigate to="/" replace />;
  }
}
