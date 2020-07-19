import React from 'react';

import './loading-spinner.scss';

const LoadingSpinner = () => {
  return (
    <div className={'chaos-loading-spinner'}>
      <div className={'bounce1'}/>
      <div className={'bounce2'}/>
      <div className={'bounce3'}/>
    </div>
  );
};

export default LoadingSpinner;
