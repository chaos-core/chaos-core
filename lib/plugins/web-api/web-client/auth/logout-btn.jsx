import React, { useContext } from "react";
import { UserContext } from "../user";
import AuthService from "./auth-service.js";

import "./logout-btn.scss";

const LogoutBtn = () => {
  const userContext = useContext(UserContext);

  function onClick() {
    AuthService.logout();
    userContext.setCurrentUser(null);
  }

  return (
    <span className={"logoutBtn"} onClick={onClick}>Logout</span>
  );
};

export default LogoutBtn;
