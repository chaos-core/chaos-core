/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from "react-dom";

import chaosPlugins from './chaos-plugins';

import "./index.scss";
import tifaImg from "./tifa.jpg";

const App = () => (
  <div className={"CoreApp"}>
    <img src={tifaImg}/>
    Hello from React!
    {Object.entries(chaosPlugins).map(([pluginName, App]) => (
      <App key={pluginName}/>
    ))}
  </div>
);

ReactDOM.render(<App/>, document.getElementById("app"));
