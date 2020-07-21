import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import React, {useContext, useEffect, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import {GuildContext} from 'chaos-core';

import CoreApiClient from '../core-api-client.js';
import LoadingSpinner from 'chaos-core/layout/components/loading-spinner.jsx';

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
    <div className={'settings-card'}>
      <Accordion>
        <AccordionSummary>
          Command Prefix
        </AccordionSummary>
        <AccordionDetails>
          {fetching ? <LoadingSpinner/> : (
            <div>
              <FormControl error={error !== null}>
                <TextField
                  value={prefix}
                  onChange={prefixChange}
                  onKeyDown={prefixKeyDown}
                />
                {error ? (
                  <FormHelperText>{error}</FormHelperText>
                ) : null}
              </FormControl>
              <div>
                <Button size="small" onClick={updatePrefix}>{saved ? 'Saved' : 'Save Prefix'}</Button>
              </div>
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default PrefixSettings;
