import React, {useState} from 'react';

export const GuildContext = React.createContext({
  guild: null,
  setGuild: () => {},
});

export const GuildProvider = ({children}) => {
  const [guild, setGuild] = useState(null);
  const contextState = {guild, setGuild};
  return <GuildContext.Provider value={contextState}>{children}</GuildContext.Provider>;
};
