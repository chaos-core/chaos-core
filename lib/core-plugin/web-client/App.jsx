import React from 'react';

import PrefixSettings from './settings/PrefixSettings.jsx';

import './App.scss';

const App = () => {
  return (
    <div className={'plugin core-plugin'}>
      <PrefixSettings/>
    </div>
  );
};

export default App;
