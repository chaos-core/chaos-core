import React, { useContext } from "react";

import { UserContext, UserAvatar } from "../user";

import GuildIcon from "../guilds/guild-icon.jsx";
import { GuildContext } from "../guilds";

import "./app-header.scss";

const AppHeader = () => {
  return (
    <div className={"appHeader"}>
      <GuildArea/>
      <UserArea/>
    </div>
  );
};
export default AppHeader;

const GuildArea = () => {
  const { guild } = useContext(GuildContext);
  if (!guild) return null;

  return (
    <div className={"guildArea"}>
      <GuildIcon guild={guild}/>
      <div className={'guildName'}>{guild.name}</div>
      <SelectGuildBtn/>
    </div>
  );
};

const SelectGuildBtn = () => {
  return (
    <span className={"selectGuildBtn"}>Select Guild</span>
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

const LogoutBtn = () => {
  const { logout } = useContext(UserContext);

  return (
    <span className={"logoutBtn"} onClick={logout}>Logout</span>
  );
};
