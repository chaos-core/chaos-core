import React from "react";
import { Route, Switch } from "react-router-dom";

const AppRouter = () => {
  return (
    <div>
      <Switch>
        <Route exact path={'/'}>
          Index
        </Route>
        <Route path={'/'}>
          <div>404: Page not found</div>
        </Route>
      </Switch>
    </div>
  );
};

export default AppRouter;
