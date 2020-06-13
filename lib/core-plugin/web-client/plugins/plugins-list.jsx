import React, {useContext, useEffect, useState} from 'react';
import classNames from 'classnames';

import ChaosApiService from '../chaos-api-service.js';
import {GuildContext} from '../guilds';
import {Card, LoadingSpinner, Toggle} from '../layout/components';

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
    <Card className={'pluginsList'}>
      <LoadingSpinner/>
    </Card>
  );

  return (
    <Card className={'pluginsList'}>
      {plugins.map((plugin) => <PluginCard key={plugin.name} plugin={plugin}/>)}
    </Card>
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

  return (
    <Card className={classes} onClick={() => setCurrent(!current)}>
      <div className={'name'}>{plugin.name}</div>
      <Toggle active={enabled} onClick={() => setEnabled(!enabled)} disabled={plugin.name === 'core'}/>
    </Card>
  );
};
