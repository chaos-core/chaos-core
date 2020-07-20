import React, {useContext} from 'react';
import {PluginContext} from 'chaos-core';
import DefaultApp from 'chaos-core/default-plugin-client/App.jsx';

import {pluginApps} from '../chaos-client.js';

export const getPluginApp = (pluginName) => {
  const jsSafeName = pluginName.replace(/[^\w]/, '_');
  return pluginApps[jsSafeName];
};

const PluginControls = () => {
  const {plugin} = useContext(PluginContext);
  if (!plugin) return null;

  const PluginApp = getPluginApp(plugin.name);
  if (PluginApp) {
    return (
      <div className={'pluginControls'}>
        <PluginApp/>
      </div>
    );
  } else {
    return (
      <div className={'pluginControls'}>
        <DefaultApp plugin={plugin}/>
      </div>
    );
  }
};

export default PluginControls;


