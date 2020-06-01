/* eslint-disable no-undef */
import React from 'react';
import ReactDOM from "react-dom";

import chaosPlugins from './chaos-plugins';

const App = () => (
  <div>
    Hello from React!
    {Object.entries(chaosPlugins).map(([pluginName, comps]) => (
      <div key={pluginName}>
        <h1>{pluginName}</h1>
        {comps.map((Comp, index) => (<Comp key={index}/>))}
      </div>
    ))}
  </div>
);

ReactDOM.render(<App/>, document.getElementById("app"));
