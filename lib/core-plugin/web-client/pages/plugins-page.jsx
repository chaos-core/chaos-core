import React, {useContext} from 'react';
import {Redirect} from 'react-router-dom';

import {PluginControls, PluginsList} from '../plugins';
import {GuildContext} from '../guilds';

import './plugins-page.scss';

const PluginsPage = () => {
  const {guild} = useContext(GuildContext);

  if (!guild) return <Redirect to={'/guilds'}/>;

  return (
    <div className={'pluginsPage'}>
      <PluginsList/>
      <PluginControls/>
    </div>
  );
};

export default PluginsPage;
