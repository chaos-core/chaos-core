import React, { useEffect, useState } from "react";
import ChaosApiService from "../chaos-api-service.js";

const initialState = {
  guilds: {},
  setGuilds: () => {},
  fetching: false,
};

const GuildsContext = React.createContext(initialState);
export default GuildsContext;

async function fetchGuilds() {
  const response = await ChaosApiService.guilds.get();
  return response.guilds;
}

export const GuildsProvider = ({ children }) => {
  const [guilds, setGuilds] = useState(initialState.guilds);
  const [fetching, setFetching] = useState(false);

  const state = {
    guilds,
    setGuilds,
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

