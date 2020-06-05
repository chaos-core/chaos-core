import React, { useState } from "react";

export const GuildContext = React.createContext({
  guild: null,
  setGuild: async () => {},
});

export const GuildProvider = ({ children }) => {
  const [guild, setGuild] = useState({ name: "Test Guild" });
  const contextState = { guild, setGuild };
  return <GuildContext.Provider value={contextState} children={children}/>;
};
