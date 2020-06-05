import React, { useContext } from "react";

import { UserContext, UserAvatar } from "../user";

import "./app-header.scss";

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
  const { logout } = useContext(UserContext);

  return (
    <span className={"logoutBtn"} onClick={logout}>Logout</span>
  );
};
