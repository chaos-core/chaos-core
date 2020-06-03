import React from 'react';
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { CallbackPage, IndexPage } from "./index.js";

const LoginRouter = () => {
  let match = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route path={`${match.path}/callback`}>
          <CallbackPage/>
        </Route>
        <Route path={match.path}>
          <IndexPage/>
        </Route>
      </Switch>
    </div>
  );
};

export default LoginRouter;
