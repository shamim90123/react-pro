// src/App.jsx
import { Navigate, useRoutes } from "react-router-dom";
import { appRoutes } from "@/routes/AppRoutes";

export default function App() {
  const routes = useRoutes([
    { path: "/", element: <Navigate to="/login" replace /> },
    ...appRoutes,
  ]);

  return routes;
}
