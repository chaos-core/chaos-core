import React, { useState } from "react";
import UserService from "./user-service.js";

export const UserContext = React.createContext({
  currentUser: null,
  setCurrentUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(UserService.getUser());
  const contextState = { currentUser, setCurrentUser };
  return <UserContext.Provider value={contextState} children={children}/>;
};
