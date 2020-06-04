import React, { useEffect, useState } from "react";
import ChaosApiService from "../chaos-api-service.js";

const GuildsContext = React.createContext({
  guilds: {},
  fetching: false,
});
export default GuildsContext;

async function fetchGuilds() {
  const response = await ChaosApiService.guilds.get();
  return response.guilds;
}

export const GuildsProvider = ({ children }) => {
  const [guilds, setGuilds] = useState({});
  const [fetching, setFetching] = useState(false);

  const state = {
    guilds,
    fetching,
  };

  useEffect(() => {
    setFetching(true);
    fetchGuilds().then((guilds) => {
      setGuilds(guilds);
      setFetching(false);
    });
  }, []);

  return (
    <GuildsContext.Provider value={state}>
      {children}
    </GuildsContext.Provider>
  );
};

