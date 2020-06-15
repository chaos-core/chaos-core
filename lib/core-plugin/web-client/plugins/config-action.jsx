import React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

import './config-action.scss';

const ConfigAction = ({action}) => {
  return (
    <Paper className={'chaos-config-action'}>
      <div className={'name'}>{action.name}</div>
      <div className={'description'}>{action.description}</div>
      {action.args.map((arg) => <ArgInput key={arg.name} arg={arg}/>)}
    </Paper>
  );
};

export default ConfigAction;

const ArgInput = ({arg}) => {
  return (
    <div className={'arg'}>
      <TextField id="standard-basic" label={arg.name} helperText={arg.description}/>
    </div>
  );
};
