import React, {useContext} from 'react';
import {useHistory} from 'react-router-dom';
import Paper from '@material-ui/core/Paper';

import {UserAvatar, UserContext} from '../user';
import {GuildContext, GuildIcon} from '../guilds';

import './app-header.scss';

const AppHeader = () => {
  return (
    <Paper className={'appHeader'}>
      <GuildArea/>
      <UserArea/>
    </Paper>
  );
};
export default AppHeader;

const GuildArea = () => {
  const { guild } = useContext(GuildContext);
  if (!guild) {
    return (
      <div className={"guildArea"}>
        <div className={"guildIcon"}/>
        <div className={'guildName'}>&nbsp;</div>
        <SelectGuildBtn/>
      </div>
    );
  } else {
    return (
      <div className={"guildArea"}>
        <GuildIcon guild={guild}/>
        <div className={'guildName'}>{guild.name}</div>
        <SelectGuildBtn/>
      </div>
    );
  }
};

const SelectGuildBtn = () => {
  const history = useHistory();

  return (
    <span className={"selectGuildBtn"} onClick={() => history.push("/guilds")}>
      Select Guild
    </span>
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
