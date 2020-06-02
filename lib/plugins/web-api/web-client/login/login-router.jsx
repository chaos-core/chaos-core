import React from 'react';
import { Route, Switch, useRouteMatch } from "react-router-dom";

const LoginRouter = () => {
  let match = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route path={`${match.path}/callback`}>
          <div>Welcome back. Let me check your ID.</div>
        </Route>
        <Route path={match.path}>
          <div>Redirecting to Discord...</div>
        </Route>
      </Switch>
    </div>
  );
};

export default LoginRouter;
