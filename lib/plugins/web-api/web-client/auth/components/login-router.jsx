import React from 'react';
import { Redirect, Route, Switch } from "react-router-dom";

import { CallbackPage, LoginPage } from "../pages";

const LoginRouter = () => {
  return (
    <Switch>
      <Route path={`/login/callback`}>
        <CallbackPage/>
      </Route>
      <Route path={'/login'}>
        <LoginPage/>
      </Route>
      <Route path={'/'}>
        <Redirect to={'/login'}/>
      </Route>
    </Switch>
  );
};

export default LoginRouter;
