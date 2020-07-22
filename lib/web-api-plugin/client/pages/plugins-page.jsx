import React from 'react';
import {Redirect} from 'react-router-dom';

import {PluginControls, PluginsList} from '../plugins';
import {useGuild} from '../guilds';

import './plugins-page.scss';
import {PluginProvider} from '../plugins/plugins-context.jsx';

const PluginsPage = () => {
  const guild = useGuild();

  if (!guild) return <Redirect to={'/guilds'}/>;

  return (
    <div className={'pluginsPage'}>
      <PluginProvider>
        <PluginsList/>
        <PluginControls/>
      </PluginProvider>
    </div>
  );
};

export default PluginsPage;
