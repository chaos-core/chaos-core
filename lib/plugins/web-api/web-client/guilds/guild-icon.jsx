import React from 'react';
import classNames from "classnames";

import "./guild-icon.scss";

const GuildIcon = ({ guild, size = null }) => {
  const imgUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
  const imgClass = classNames(["guildIcon", size]);
  return <img className={imgClass} src={imgUrl} alt={guild.name}/>;
};

export default GuildIcon;
