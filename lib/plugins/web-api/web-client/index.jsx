/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { LoginRouter } from "./login";
import { pluginApps } from "./chaos-client";

import "./index.scss";
import styles from "./index.module.scss";

const App = () => (
  <div className={styles.app}>
    <Router>
      <Switch>
        <Route path="/login">
          <LoginRouter/>
        </Route>
        <Route path="/apps">
          <div>
            {Object.entries(pluginApps).map(([pluginName, App]) => (
              <div key={pluginName}>
                <h1>{pluginName}</h1>
                <App/>
              </div>
            ))}
          </div>
        </Route>
        <Route path="/">
          <div>Route: /</div>
        </Route>
      </Switch>
    </Router>
  </div>
);

ReactDOM.render(<App/>, document.getElementById("app"));
