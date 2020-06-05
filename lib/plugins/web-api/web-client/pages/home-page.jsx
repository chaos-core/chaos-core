import { Switch, Route } from "react-router-dom";
import React from "react";

const HomePage = () => {
  return (
    <Switch>
      <Route exact path={'/'}>
        Index
      </Route>
      <Route path={'/'}>
        <div>404: Page not found</div>
      </Route>
    </Switch>
  );
};

export default HomePage;
