import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isauthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersettings, setUserSettings] = useState(null);
  const [subscriptiontype, setSubscriptionType] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await axios.get("/api/user-info/", {
          withCredentials: true,
        });

        setUser(userRes.data);
        setUserSettings(userRes.data.settings);
        setIsAuthenticated(true);

      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
        setUserSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return null; // or spinner

  return (
    <AuthContext.Provider value={{ isauthenticated, user, usersettings, setUserSettings }}>
      {children}
    </AuthContext.Provider>
  );
};