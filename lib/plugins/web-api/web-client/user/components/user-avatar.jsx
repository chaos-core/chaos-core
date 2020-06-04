import React, { useContext } from 'react';
import { UserContext } from "./../index.js";

import styles from "./user-avatar.module.scss";

const UserAvatar = () => {
  const { currentUser } = useContext(UserContext);
  const imgUrl = `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`;
  return <img className={styles.userAvatar} src={imgUrl} alt={currentUser.tag}/>;
};

export default UserAvatar;
