import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {ThemeProvider} from '@material-ui/core/styles';

import { CoreApiClient } from './chaos-api-client.js';
import appTheme from './app-theme.js';
import AppRouter from './app-router.jsx';
import {UserProvider} from './user';
import {GuildProvider} from './guilds';

import './index.scss';

const App = () => {
  useEffect(() => {
    CoreApiClient.getBotName().then((name) => document.title = name);
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
