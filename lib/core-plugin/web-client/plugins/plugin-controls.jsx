import React from 'react';

import {Card, LoadingSpinner} from '../layout/components';

const PluginControls = () => {
  return (
    <Card className={'pluginControls'}>
      Options for plugin!
      <LoadingSpinner/>
    </Card>
  );
};

export default PluginControls;
