import React from 'react';
import classNames from 'classnames';

import "./user-avatar.scss";

const UserAvatar = ({ user, size = null }) => {
  const imgUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  const imgClass = classNames(["userAvatar", size]);
  return <img className={imgClass} src={imgUrl} alt={user.tag}/>;
};

export default UserAvatar;
