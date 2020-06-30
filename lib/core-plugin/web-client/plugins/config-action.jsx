import React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import './config-action.scss';

const ConfigAction = ({action}) => {
  return (
    <Paper className={'chaos-config-action'}>
      <div className={'name'}>{action.name}</div>
      <div className={'description'}>{action.description}</div>
      <div className={'args'}>
        {action.args.map((arg) => <ArgInput key={arg.name} arg={arg}/>)}
      </div>
      <div className={'actions'}>
        <Button variant="outlined" color="default">Send</Button>
      </div>
    </Paper>
  );
};

export default ConfigAction;

const ArgInput = ({arg}) => {
  return (
    <span className={'arg'}>
      <TextField id="standard-basic" label={arg.name} helperText={arg.description}/>
    </span>
  );
};
