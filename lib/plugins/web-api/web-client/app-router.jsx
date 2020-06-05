import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { GuildsProvider, GuildsList } from "./guilds";

const AppRouter = () => {
  return (
    <div>
      <GuildsProvider>
        <Switch>
          <Route path={`/login/callback`}>
            <Redirect to={"/"}/>
          </Route>
          <Route exact path={'/'}>
            <h1>Guilds</h1>
            <GuildsList/>
          </Route>
          <Route path={'/'}>
            <div>404: Page not found</div>
          </Route>
        </Switch>
      </GuildsProvider>
    </div>
  );
};

export default AppRouter;
