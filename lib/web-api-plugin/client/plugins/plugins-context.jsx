import React, {useState} from 'react';

export const PluginContext = React.createContext({
  plugin: null,
  setCurrent: () => {},
});

export const PluginProvider = ({children}) => {
  const [plugin, setCurrent] = useState(null);
  const contextState = {plugin, setCurrent};
  return <PluginContext.Provider value={contextState}>{children}</PluginContext.Provider>;
};
