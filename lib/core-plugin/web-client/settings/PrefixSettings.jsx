import React, {useContext, useEffect, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import LoadingSpinner from 'chaos-core/layout/components/loading-spinner.jsx';
import {CoreApiClient} from 'chaos-core/chaos-api-client.js';
import {GuildContext} from 'chaos-core/guilds';
import Card from '@material-ui/core/Card';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

const PrefixSettings = () => {
  const {guild} = useContext(GuildContext);

  const [prefix, setPrefix] = useState('');
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFetching(true);
    CoreApiClient.getPrefix({guildId: guild.id})
      .then((serverPrefix) => setPrefix(serverPrefix))
      .then(() => setFetching(false));
  }, [guild]);

  if (fetching) {
    return (<LoadingSpinner/>);
  }

  const prefixChange = (event) => {
    setPrefix(event.target.value);
  };

  const prefixKeyDown = (event) => {
    setError(null);
    setSaved(false);
    if (event.key === 'Enter') updatePrefix();
  };

  const updatePrefix = async () => {
    try {
      setError(null);
      const newPrefix = await CoreApiClient.setPrefix({guildId: guild.id, prefix});
      setPrefix(newPrefix);
      setSaved(true);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error);
      } else {
        throw error;
      }
    }
  };

  return (
    <Card className={'settings-card'}>
      <div>
        Command Prefix
      </div>
      <div>
        <FormControl error={error !== null}>
          <TextField
            value={prefix}
            onChange={prefixChange}
            onKeyDown={prefixKeyDown}
          />
          {error
            ? <FormHelperText>{error}</FormHelperText>
            : null
          }
        </FormControl>
        <div>
          <Button size="small" onClick={updatePrefix}>{saved ? "Saved" : "Save Prefix"}</Button>
        </div>
      </div>
    </Card>
  );
};

export default PrefixSettings;
