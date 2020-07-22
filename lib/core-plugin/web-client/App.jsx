import React from 'react';

import CommandSettings from './settings/CommandSettings.jsx';
import PermissionSettings from './settings/PermissionSettings.jsx';
import PrefixSettings from './settings/PrefixSettings.jsx';

import './App.scss';

const App = () => {
  return (
    <div className={'plugin core-plugin'}>
      <PrefixSettings/>
      <CommandSettings/>
      <PermissionSettings/>
    </div>
  );
};

export default App;
