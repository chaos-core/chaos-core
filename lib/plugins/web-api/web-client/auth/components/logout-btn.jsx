import React, { useContext } from "react";
import { UserContext } from "../../contexts.js";
import AuthService from "../auth-service.js";

import styles from "./logout-btn.module.scss";

const LogoutBtn = () => {
  const userContext = useContext(UserContext);

  function onClick() {
    AuthService.logout();
    userContext.setCurrentUser(null);
  }

  return (
    <div className={styles.logoutBtn} onClick={onClick}>Logout</div>
  );
};

export default LogoutBtn;
