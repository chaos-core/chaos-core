import React, {useEffect, useState} from 'react';
import {LoadingSpinner} from 'chaos-core/index.js';

import ConfigAction from './config-action.jsx';
import DefaultApiClient from './default-api-client.js';

const DefaultApp = ({plugin}) => {
  return (
    <ActionList pluginName={plugin.name}/>
  );
};

const ActionList = ({pluginName}) => {
  const [actions, setActions] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    DefaultApiClient.getPluginActions({pluginName})
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

export default DefaultApp;
