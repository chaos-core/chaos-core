import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {ThemeProvider} from '@material-ui/core/styles';

import {ChaosApiClient, UserProvider, GuildProvider} from './index.js';
import appTheme from './app-theme.js';
import AppRouter from './app-router.jsx';

import './App.scss';

const App = () => {
  useEffect(() => {
    ChaosApiClient.getStatus().then((status) => document.title = status.botName);
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <div className={'app'}>
        <UserProvider>
          <GuildProvider>
            <Router>
              <AppRouter/>
            </Router>
          </GuildProvider>
        </UserProvider>
      </div>
    </ThemeProvider>
  );
};

ReactDOM.render(<App/>, document.getElementById('app'));
