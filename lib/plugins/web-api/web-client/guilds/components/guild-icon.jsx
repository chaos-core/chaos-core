import React from 'react';

import styles from "./guild-icon.module.scss";

const GuildIcon = ({ guild }) => {
  const imgUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
  return <img className={styles.guildIcon} src={imgUrl} alt={guild.name}/>;
};

export default GuildIcon;
