import React, { useContext } from "react";

import { UserContext, UserAvatar } from "../user";
import { LogoutBtn } from "../auth";

import "./app-header.scss";

const AppHeader = () => {
  return (
    <div className={"appHeader"}>
      <UserArea/>
    </div>
  );
};

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

export default AppHeader;
