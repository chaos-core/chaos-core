import React, {useContext, useEffect, useState} from 'react';
import classNames from 'classnames';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';

import ChaosApiService from '../chaos-api-service.js';
import {GuildContext} from '../guilds';
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
      const plugins = await ChaosApiService.guild(guild.id).getPlugins();
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
  const [current, setCurrent] = useState(false);

  const classes = classNames({
    pluginCard: true,
    current: current,
  });

  const onSwitchClick = (e) => {
    e.stopPropagation();
    setEnabled(!enabled);
  };

  return (
    <Paper className={classes} onClick={() => setCurrent(!current)}>
      <div className={'name'}>{plugin.name}</div>
      <Switch checked={enabled} onClick={onSwitchClick} disabled={plugin.name === 'core'}/>
    </Paper>
  );
};
