import React, {useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import './config-action.scss';

const ConfigAction = ({action}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={'chaos-config-action'}>
      <ExpansionPanel expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <ExpansionPanelSummary>
          <div className={'name'}>{action.name}</div>
          <div className={'description'}>{action.description}</div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className={'args'}>
            {action.args.map((arg) => <ArgInput key={arg.name} arg={arg}/>)}
          </div>
          <div className={'actions'}>
            <Button variant="outlined" color="default">Send</Button>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

export default ConfigAction;

const ArgInput = ({arg}) => {
  return (
    <div className={'arg'}>
      <TextField id="standard-basic" fullWidth label={arg.name} helperText={arg.description}/>
    </div>
  );
};
