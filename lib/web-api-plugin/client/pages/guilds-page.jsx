import React, {useContext, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import classNames from 'classnames';

import {ChaosApiClient} from 'chaos-core/chaos-api-client.js';
import {GuildContext, GuildIcon} from '../guilds';

import './guilds-page.scss';

const GuildsPage = () => {
  const {guild: currentGuild, setGuild} = useContext(GuildContext);
  const history = useHistory();
  const [guilds, setGuilds] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    (async () => {
      setFetching(true);
      const guilds = await ChaosApiClient.getGuilds();
      setGuilds(Object.values(guilds));
      setFetching(false);
    })();
  }, []);

  if (fetching) {
    return <div>Loading...</div>;
  } else {
    const cardClicked = (guild) => {
      setGuild(guild);
      history.push("/plugins");
    };

    return (
      <div className={"guildsPage"}>
        {guilds.map((guild) => (
          <GuildCard
            key={guild.id}
            guild={guild}
            onClick={() => cardClicked(guild)}
            current={currentGuild && guild.id === currentGuild.id}
          />
        ))}
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
