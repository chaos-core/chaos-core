import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import LoadingSpinner from 'chaos-core/layout/components/loading-spinner.jsx';
import React, {useContext, useEffect, useState} from 'react';
import {GuildContext} from 'chaos-core/guilds';

import CoreApiClient from '../core-api-client.js';

const PermissionSettings = () => {
  const {guild} = useContext(GuildContext);

  const [permissions, setPermissions] = useState({});
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    CoreApiClient.getPermissions({guildId: guild.id})
      .then(setPermissions)
      .then(() => setFetching(false));
  }, [guild]);

  return (
    <div className={'settings-card command-settings'}>
      <Accordion>
        <AccordionSummary>
          Permissions
        </AccordionSummary>
        <AccordionDetails>
          {fetching ? <LoadingSpinner/> : (<div>{JSON.stringify(permissions)}</div>)}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default PermissionSettings;
