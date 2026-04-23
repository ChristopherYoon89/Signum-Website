import React from "react";
import { useAuth } from "./AuthProvider.js";

const RouterProtectedRoute = ({ children }) => {
  const { isauthenticated } = useAuth();

  if (!isauthenticated) {
    window.location.replace("/login/");
    return null;
  }

  return children;
};

export default RouterProtectedRoute;