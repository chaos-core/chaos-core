import React, {useContext, useEffect, useState} from 'react';
import Card from '@material-ui/core/Card';
import {GuildContext} from 'chaos-core/guilds';
import CoreApiClient from '../core-api-client.js';
import LoadingSpinner from 'chaos-core/layout/components/loading-spinner.jsx';

import './CommandSettings.scss';
import Switch from '@material-ui/core/Switch';

const CommandSettings = () => {
  const {guild} = useContext(GuildContext);

  const [commands, setCommands] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    CoreApiClient.getCommands({guildId: guild.id})
      .then(setCommands)
      .then(() => setFetching(false));
  }, [guild]);

  if (fetching) return <LoadingSpinner/>;

  const plugins = commands.reduce((plugins, command) => {
    if (command.pluginName === 'core') return plugins;

    let plugin = plugins[command.pluginName];
    if (!plugin) {
      plugin = {
        name: command.pluginName,
        enabled: command.pluginEnabled,
        commands: [command],
      };
      plugins[command.pluginName] = plugin;
    } else {
      plugin.commands.push(command);
    }

    return plugins;
  }, {});

  return (
    <Card className={'settings-card command-settings'}>
      <div>
        Enabled Commands
      </div>
      {Object.values(plugins).map((plugin) => (
        <Plugin key={plugin.name} plugin={plugin}/>
      ))}
    </Card>
  );
};

const Plugin = ({plugin}) => {
  return (
    <div className={'plugin'} key={plugin.name}>
      <strong>{plugin.name}</strong>
      {!plugin.enabled ? (<div><small>Plugin Disabled</small></div>) : null}

      <div className={'commands'}>
        {plugin.commands.map((command) => (
          <PluginCommand key={command.name} plugin={plugin} command={command}/>
        ))}
      </div>
    </div>
  );
};

const PluginCommand = ({plugin, command}) => {
  const {guild} = useContext(GuildContext);
  const [enabled, setEnabled] = useState(command.enabled);

  const onChange = async () => {
    setEnabled(!enabled);
    setEnabled(await CoreApiClient.setCommandEnabled({
      guildId: guild.id,
      commandName: command.name,
      enabled: !enabled,
    }));
  };

  return (
    <div className={'command'} key={command.name}>
      <Switch checked={enabled} disabled={!plugin.enabled} onClick={onChange}/>
      {command.name}
    </div>
  );
};

export default CommandSettings;
