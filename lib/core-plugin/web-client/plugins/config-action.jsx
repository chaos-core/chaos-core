import React from 'react';

import './config-action.scss';
import {Card} from '../layout/components';

const ConfigAction = ({action}) => {
  return (
    <Card className={'chaos-config-action'}>
      <div className={'name'}>{action.name}</div>
      <div className={'description'}>{action.description}</div>
    </Card>
  );
};

export default ConfigAction;
