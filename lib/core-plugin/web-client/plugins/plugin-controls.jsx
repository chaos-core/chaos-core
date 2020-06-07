import React from 'react';

import {Card, LoadingSpinner} from '../layout/components.jsx';

const PluginControls = () => {
  return (
    <Card className={'pluginControls'}>
      Options for plugin!
      <LoadingSpinner/>
    </Card>
  );
};

export default PluginControls;
