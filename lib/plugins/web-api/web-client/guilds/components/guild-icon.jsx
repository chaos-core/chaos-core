import React from 'react';

import "./guild-icon.scss";

const GuildIcon = ({ guild }) => {
  const imgUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
  return <img className={"guildIcon"} src={imgUrl} alt={guild.name}/>;
};

export default GuildIcon;
