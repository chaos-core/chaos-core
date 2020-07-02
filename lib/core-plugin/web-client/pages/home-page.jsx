import {Redirect, Route, Switch} from 'react-router-dom';
import React from 'react';

import GuildsPage from './guilds-page.jsx';
import PluginsPage from './plugins-page.jsx';

const HomePage = () => {
  return (
    <Switch>
      <Route path={'/guilds'} component={GuildsPage}/>
      <Route path={'/plugins'}>
        <PluginsPage/>
      </Route>
      <Route path={'/'}>
        <Redirect to={'/guilds'}/>
      </Route>
    </Switch>
  );
};

export default HomePage;
