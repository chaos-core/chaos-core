import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import React, {useContext, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import {GuildContext, LoadingSpinner, PluginContext} from 'chaos-core';

import DefaultApiClient from './default-api-client.js';

import './config-action.scss';

const ConfigAction = ({action}) => {
  const {guild} = useContext(GuildContext);
  const {plugin} = useContext(PluginContext);

  const [expanded, setExpanded] = useState(false);
  const [argInputs, setInputs] = useState({});
  const [fetching, setFetching] = useState(false);
  const [response, setResponse] = useState(null);

  const onSend = async () => {
    setFetching(true);
    const response = await DefaultApiClient.runConfigAction({
      guildId: guild.id,
      pluginName: plugin.name,
      actionName: action.name,
      args: argInputs,
    });
    setResponse(response);
    setFetching(false);
  };

  return (
    <div className={'chaos-config-action'}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary>
          <div className={'name'}>{action.name}</div>
          <div className={'description'}>{action.description}</div>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <div className={'args'}>
              {action.args.map((arg) => (
                <ArgInput
                  key={arg.name}
                  arg={arg}
                  value={argInputs[arg.name] || ''}
                  onChange={(event) => setInputs({
                    ...argInputs,
                    [arg.name]: event.target.value,
                  })}
                />
              ))}
            </div>
            <div className={'actions'}>
              <Button variant="outlined" color="default" onClick={onSend}>Send</Button>
            </div>
            <div className={'response'}>
              {fetching && (<LoadingSpinner/>)}
              {response && (<ActionResponse response={response}/>)}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ConfigAction;

const ArgInput = ({arg, value, onChange}) => {
  let label = arg.name;
  let helperText = arg.description;

  if (arg.required) {
    label += '*';
    helperText = '(Required) ' + helperText;
  }

  return (
    <div className={'arg'}>
      <TextField id="standard-basic" fullWidth label={label} helperText={helperText} value={value} onChange={onChange}/>
    </div>
  );
};

const ActionResponse = ({response}) => {
  return (
    <div className={'action-response'}>
      {response.content && (<div className={'content'}>{response.content}</div>)}
      {response.embed && (<ResponseEmbed embed={response.embed}/>)}
    </div>
  );
};

const ResponseEmbed = ({embed}) => {
  return (
    <Card variant="outlined" className={'embed'}>
      {embed.fields.map((field) => (
        <div key={field.name} className={'field'}>
          <div className={'name'}>{field.name}</div>
          <pre className={'value'}>{field.value}</pre>
        </div>
      ))}
    </Card>
  );
};
