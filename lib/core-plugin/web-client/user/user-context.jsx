import React, { useState } from "react";
import UserService from "./user-service.js";

export const UserContext = React.createContext({
  currentUser: null,
  login: async () => {},
  logout: async () => {},
});

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(UserService.getUser());

  const login = async (code) => {
    await UserService.login(code);
    setCurrentUser(UserService.getUser());
  };

  const logout = async () => {
    await UserService.logout();
    setCurrentUser(UserService.getUser());
  };

  const contextState = { currentUser, login, logout };
  return <UserContext.Provider value={contextState} children={children}/>;
};
