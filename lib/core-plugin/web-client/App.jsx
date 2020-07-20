import React from 'react';

import PrefixSettings from './settings/PrefixSettings.jsx';
import CommandSettings from './settings/CommandSettings.jsx';

import './App.scss';

const App = () => {
  return (
    <div className={'plugin core-plugin'}>
      <PrefixSettings/>
      <CommandSettings/>
    </div>
  );
};

export default App;
