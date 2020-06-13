import React from 'react';

import './loading-spinner.scss';

const LoadingSpinner = () => {
  return (
    <div className={'chaos-loading-spinner'}>
      <div className={'bar'}/>
      <div className={'bar'}/>
      <div className={'bar'}/>
      <div className={'bar'}/>
      <div className={'bar'}/>
      <div className={'bar'}/>
    </div>
  );
};

export default LoadingSpinner;
