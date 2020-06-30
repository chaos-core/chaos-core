import React, {useContext} from 'react';
import {Redirect} from 'react-router-dom';

import {PluginControls, PluginsList} from '../plugins';
import {GuildContext} from '../guilds';

import './plugins-page.scss';
import {PluginProvider} from '../plugins/plugins-context.jsx';

const PluginsPage = () => {
  const {guild} = useContext(GuildContext);

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
