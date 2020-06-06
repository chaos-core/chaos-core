import { Switch, Route, Redirect } from "react-router-dom";
import React from "react";

import GuildsPage from "./guilds-page.jsx";

const HomePage = () => {
  return (
    <Switch>
      <Route path={'/guilds'} component={GuildsPage}/>
      <Route path={'/plugins'}>
        Plugin list!
      </Route>
      <Route path={'/'}>
        <Redirect to={"/guilds"}/>
      </Route>
    </Switch>
  );
};

export default HomePage;
