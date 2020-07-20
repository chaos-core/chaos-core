import React, {useEffect, useState} from 'react';

import {ChaosApiClient, LoadingSpinner} from 'chaos-core';

const App = () => {
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
    return (
      <div>
        <LoadingSpinner/>
      </div>
    );
  } else {
    return (
      <div>
        Guilds from Dummy:
        {guilds.map((guild) => <div key={guild.id}>{guild.name}</div>)}
      </div>
    );
  }
};

export default App;
