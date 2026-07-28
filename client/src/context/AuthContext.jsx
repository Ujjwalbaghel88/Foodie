import React, { useState } from "react";
import AuthContext from "./authContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("cravingUser")) || null,
  );
  const isLogin = !!user;
  const role = user?.userType || null;

  const value = { user, isLogin, role, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
