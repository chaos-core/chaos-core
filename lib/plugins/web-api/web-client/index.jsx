/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import chaosPlugins from './chaos-plugins';

import "./index.scss";
import tifaImg from "./tifa.jpg";

const App = () => (
  <div className={"CoreApp"}>
    <img src={tifaImg} alt={"Logo"}/>
    Hello from React!
    {Object.entries(chaosPlugins).map(([pluginName, App]) => (
      <App key={pluginName}/>
    ))}

    <Router>
      <Switch>
        <Route path="/about">
          <div>Route: /about</div>
        </Route>
        <Route path="/users">
          <div>Route: /users</div>
        </Route>
        <Route path="/">
          <div>Route: /</div>
        </Route>
      </Switch>
    </Router>
  </div>
);

ReactDOM.render(<App/>, document.getElementById("app"));
