/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "./index.scss";

const App = () => (
  <div className={"CoreApp"}>
    <Router>
      <Switch>
        <Route path="/">
          <div>Route: /</div>
        </Route>
      </Switch>
    </Router>
  </div>
);

ReactDOM.render(<App/>, document.getElementById("app"));
