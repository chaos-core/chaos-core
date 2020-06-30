import React, {useEffect, useState} from 'react';
// noinspection JSFileReferences
import ChaosApiService from 'chaos-core/chaos-api-service.js';
import LoadingSpinner from 'chaos-core/layout/components/loading-spinner.jsx';

const App = () => {
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
