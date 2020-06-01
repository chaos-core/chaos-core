/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from "react-dom";

import chaosPlugins from './chaos-plugins';

const App = () => (
  <div>
    Hello from React!
    {Object.entries(chaosPlugins).map(([pluginName, App]) => (
      <App key={pluginName}/>
    ))}
  </div>
);

ReactDOM.render(<App/>, document.getElementById("app"));
