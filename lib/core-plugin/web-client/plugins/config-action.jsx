import React, {useContext, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import ChaosApiService from '../chaos-api-service.js';
import {PluginContext} from './plugins-context.jsx';
import {GuildContext} from '../guilds';

import './config-action.scss';
import LoadingSpinner from 'chaos-core/layout/components/loading-spinner.jsx';

const ConfigAction = ({action}) => {
  const {guild} = useContext(GuildContext);
  const {plugin} = useContext(PluginContext);

  const [expanded, setExpanded] = useState(false);
  const [argInputs, setInputs] = useState({});
  const [fetching, setFetching] = useState(false);
  const [response, setResponse] = useState(null);

  const onSend = async () => {
    setFetching(true);
    const response = await ChaosApiService.plugin(plugin.name)
      .runAction(action.name, guild.id, argInputs);
    setResponse(response);
    setFetching(false);
  };

  return (
    <div className={'chaos-config-action'}>
      <ExpansionPanel expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <ExpansionPanelSummary>
          <div className={'name'}>{action.name}</div>
          <div className={'description'}>{action.description}</div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
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
              {response && (<div>{response.content}</div>)}
            </div>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
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
