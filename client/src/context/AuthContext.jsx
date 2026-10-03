import React, { useState } from "react";
import AuthContext from "./authContext.js";

const readStoredUser = () => {
  try {
    const rememberedUser = localStorage.getItem("cravingUser");
    if (rememberedUser) return JSON.parse(rememberedUser);
  } catch (error) {
    console.error("Could not restore remembered user:", error);
  }

  try {
    const sessionUser = sessionStorage.getItem("cravingUser");
    return sessionUser ? JSON.parse(sessionUser) : null;
  } catch (error) {
    console.error("Could not restore session user:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const isLogin = !!user;
  const role = user?.userType || null;

  const value = { user, isLogin, role, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
