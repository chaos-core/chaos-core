import React, { useState } from "react";
import AuthService from "../auth/auth-service.js";

export const UserContext = React.createContext({
  currentUser: null,
  setCurrentUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(AuthService.getUser());
  const contextState = { currentUser, setCurrentUser };
  return <UserContext.Provider value={contextState} children={children}/>;
};
