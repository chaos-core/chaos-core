import React, { useContext } from "react";

import { UserContext, UserAvatar } from "../user";

import "./app-header.scss";
import UserService from "../user/user-service.js";

const AppHeader = () => {
  return (
    <div className={"appHeader"}>
      <UserArea/>
    </div>
  );
};

export default AppHeader;

const UserArea = () => {
  const { currentUser } = useContext(UserContext);
  if (!currentUser) return null;

  return (
    <div className={"userArea"}>
      <UserAvatar user={currentUser}/>
      <div className={'userTag'}>{currentUser.tag}</div>
      <LogoutBtn/>
    </div>
  );
};

const LogoutBtn = () => {
  const userContext = useContext(UserContext);

  function onClick() {
    UserService.logout();
    userContext.setCurrentUser(null);
  }

  return (
    <span className={"logoutBtn"} onClick={onClick}>Logout</span>
  );
};
