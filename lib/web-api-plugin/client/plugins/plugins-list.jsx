import React, {useContext, useEffect, useState} from 'react';
import classNames from 'classnames';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';

import {CoreApiClient} from '../chaos-api-client.js';
import {GuildContext} from '../guilds';
import {PluginContext} from './plugins-context.jsx';
import {LoadingSpinner} from '../layout/components';

import './plugins-list.scss';

const PluginsList = () => {
  const {guild} = useContext(GuildContext);
  const [plugins, setPlugins] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    (async () => {
      if (!guild) return;
      setFetching(true);
      const plugins = await CoreApiClient.getGuildPlugins({
        guildId: guild.id,
      });
      setPlugins(Object.values(plugins));
      setFetching(false);
    })();
  }, [guild]);

  if (fetching) return (
    <div className={'pluginsList'}>
      <LoadingSpinner/>
    </div>
  );

  return (
    <div className={'pluginsList'}>
      {plugins.map((plugin) => <PluginCard key={plugin.name} plugin={plugin}/>)}
    </div>
  );
};

export default PluginsList;

const PluginCard = ({plugin}) => {
  const [enabled, setEnabled] = useState(plugin.enabled);
  const {guild} = useContext(GuildContext);
  const pluginContext = useContext(PluginContext);

  const classes = classNames({
    pluginCard: true,
    current: pluginContext.plugin && plugin.name === pluginContext.plugin.name,
  });

  const onSwitchClick = async (e) => {
    e.stopPropagation();
    const newState = !enabled;
    setEnabled(newState); // Optimistically set the new state
    setEnabled(await CoreApiClient.setPluginEnabled({
      guildId: guild.id,
      pluginName: plugin.name,
      enabled: newState,
    }));
  };

  const disabled = (plugin.name === 'core' || plugin.name === 'web-api');

  return (
    <Paper className={classes} onClick={() => pluginContext.setCurrent(plugin)}>
      <div className={'name'}>{plugin.name}</div>
      <Switch checked={enabled} onClick={onSwitchClick} disabled={disabled}/>
    </Paper>
  );
};
