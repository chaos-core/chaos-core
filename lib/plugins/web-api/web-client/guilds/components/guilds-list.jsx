import React, { useContext } from 'react';

import GuildsContext from "../guilds-context.jsx";

const GuildsList = () => {
  const { guilds, fetching } = useContext(GuildsContext);
  if (fetching) return (<div>Loading...</div>);

  return (
    <div>
      {Object.values(guilds).map((guild) => (
        <div key={guild.id}>
          {guild.name} ({guild.id})
        </div>
      ))}
    </div>
  );
};

export default GuildsList;
