import React, {useContext, useEffect, useState} from 'react';

import {LoadingSpinner} from '../layout/components';
import ConfigAction from './config-action.jsx';
import ChaosApiService from '../chaos-api-service.js';
import {PluginContext} from './plugins-context.jsx';
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
        <ActionList pluginName={plugin.name}/>
      </div>
    );
  }
};

export default PluginControls;

const ActionList = ({pluginName}) => {
  const [actions, setActions] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    ChaosApiService.plugin(pluginName)
      .getActions()
      .then(setActions)
      .then(() => setFetching(false))
    ;
  }, [pluginName]);

  if (fetching) {
    return (<LoadingSpinner/>);
  } else {
    return (
      <div>
        {actions.map((action) => <ConfigAction key={action.name} action={action}/>)}
      </div>
    );
  }
};
