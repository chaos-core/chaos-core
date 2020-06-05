import React, { useContext } from 'react';

import GuildsContext from "./guilds-context.jsx";
import GuildIcon from "./guild-icon.jsx";

const GuildsList = () => {
  const { guilds, fetching } = useContext(GuildsContext);
  if (fetching) return (<div>Loading...</div>);

  return (
    <div>
      {Object.values(guilds).map((guild) => (
        <div key={guild.id}>
          <GuildIcon guild={guild}/>
          {guild.name}
        </div>
      ))}
    </div>
  );
};

export default GuildsList;
