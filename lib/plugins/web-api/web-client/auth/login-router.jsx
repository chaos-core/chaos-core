import React from 'react';
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { CallbackPage, LoginPage } from "./pages";

const LoginRouter = () => {
  let match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/callback`}>
        <CallbackPage/>
      </Route>
      <Route path={match.path}>
        <LoginPage/>
      </Route>
    </Switch>
  );
};

export default LoginRouter;
