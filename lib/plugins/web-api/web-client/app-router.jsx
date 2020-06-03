import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { LoginRouter } from "./auth";

const AppRouter = () => (
  <Router>
    <Switch>
      <Route path={`/login`}>
        <LoginRouter/>
      </Route>
      <Route path="/">
        <div>Index!</div>
      </Route>
    </Switch>
  </Router>
);

export default AppRouter;
