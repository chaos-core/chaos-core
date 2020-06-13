import React, {useEffect, useState} from 'react';

import {LoadingSpinner} from '../layout/components';
import ConfigAction from './config-action.jsx';
import ChaosApiService from '../chaos-api-service.js';

const PluginControls = () => {
  const [actions, setActions] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    ChaosApiService.plugin('core')
      .getActions().then(setActions)
      .then(() => setFetching(false))
    ;
  }, []);

  return (
    <div className={'pluginControls'}>
      {fetching ? <LoadingSpinner/> : <ActionList actions={actions}/>}
    </div>
  );
};

export default PluginControls;

const ActionList = ({actions}) => {
  return (
    <div>
      {actions.map((action) => <ConfigAction key={action.name} action={action}/>)}
    </div>
  );
};
