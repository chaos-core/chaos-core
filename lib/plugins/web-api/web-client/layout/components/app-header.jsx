import React, { useContext } from "react";

import { UserContext } from "../../user";
import { UserAvatar } from "../../user/components";
import { AuthGate, LogoutBtn } from "../../auth/components";

import "./app-header.scss";

const AppHeader = () => {
  return (
    <div className={"appHeader"}>
      <AuthGate loggedIn={<UserArea/>}/>
    </div>
  );
};

const UserArea = () => {
  const { currentUser } = useContext(UserContext);

  return (
    <div className={"userArea"}>
      <UserAvatar user={currentUser}/>
      <div className={'userTag'}>{currentUser.tag}</div>
      <LogoutBtn/>
    </div>
  );
};

export default AppHeader;
