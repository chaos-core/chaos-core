import React, {useContext} from 'react';
import Paper from '@material-ui/core/Paper';

import {UserContext} from '../user';
import AppHeader from './app-header.jsx';

import './app-layout.scss';

const AppLayout = ({children}) => {
  const {currentUser} = useContext(UserContext);

  return (
    <Paper className={'appLayout'}>
      {currentUser ? <AppHeader/> : null}
      <main>
        {children}
      </main>
    </Paper>
  );
};

export default AppLayout;
