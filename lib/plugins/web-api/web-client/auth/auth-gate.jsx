import React, { useContext } from "react";
import { UserContext } from "../user";

const AuthGate = ({ loggedIn = "", loggedOut = "" }) => {
  const userContext = useContext(UserContext);
  return userContext.currentUser ? loggedIn : loggedOut;
};

export default AuthGate;
