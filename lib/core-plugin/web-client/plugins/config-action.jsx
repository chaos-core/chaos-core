import React from 'react';
import {Card, TextInput} from '../layout/components';

import './config-action.scss';

const ConfigAction = ({action}) => {
  return (
    <Card className={'chaos-config-action'}>
      <div className={'name'}>{action.name}</div>
      <div className={'description'}>{action.description}</div>
      {action.args.map((arg) => <ArgInput key={arg.name} arg={arg}/>)}
    </Card>
  );
};

export default ConfigAction;

const ArgInput = ({arg}) => {
  return (
    <div className={'arg'}>
      <TextInput placeholder={arg.name}/>
      <div className={'description'}>{arg.description}</div>
    </div>
  );
};
