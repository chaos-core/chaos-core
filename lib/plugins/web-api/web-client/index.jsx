/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { LoginRouter } from "./login";

import "./index.scss";

const App = () => (
  <div className={"CoreApp"}>
    <Router>
      <Switch>
        <Route path="/login">
          <LoginRouter/>
        </Route>
        <Route path="/">
          <div>Route: /</div>
        </Route>
      </Switch>
    </Router>
  </div>
);

ReactDOM.render(<App/>, document.getElementById("app"));