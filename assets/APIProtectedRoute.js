import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const APIProtectedRoute = ({ children }) => {
    const { isauthenticated, user } = useAuth();

    if (!isauthenticated) {
        return <Navigate to="/login/" replace />;
    }

    if (user?.subscription_type !== "API") {
        return <Navigate to="/dashboard/api-no-access" replace />;
    }

    return children;
};

export default APIProtectedRoute;