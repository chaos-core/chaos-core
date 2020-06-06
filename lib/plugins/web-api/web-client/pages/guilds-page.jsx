import React, { useState, useEffect, useContext } from "react";
import classNames from 'classnames';

import ChaosApiService from "../chaos-api-service.js";
import GuildIcon from "../guilds/guild-icon.jsx";

import "./guilds-page.scss";
import { GuildContext } from "../guilds";

const GuildsPage = () => {
  const { guild: currentGuild, setGuild } = useContext(GuildContext);
  const [guilds, setGuilds] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    (async () => {
      setFetching(true);
      const guilds = await ChaosApiService.guilds.get();
      setGuilds(Object.values(guilds));
      setFetching(false);
    })();
  }, []);

  if (fetching) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className={"guildsPage"}>
        Select Guild:
        <div className={"guildsList"}>
          {guilds.map((guild) => (
            <GuildCard
              key={guild.id}
              guild={guild}
              onClick={() => setGuild(guild)}
              current={guild.id === currentGuild.id}
            />
          ))}
        </div>
      </div>
    );
  }
};

const GuildCard = ({ guild, current = false, onClick }) => {
  const divClass = classNames({
    "guildCard": true,
    "current": current,
  });

  return (
    <div className={divClass} onClick={onClick}>
      <div className={"icon"}>
        <GuildIcon guild={guild} size={"large"}/>
      </div>
      <div className={"name"}>
        {guild.name}
      </div>
    </div>
  );
};

export default GuildsPage;
