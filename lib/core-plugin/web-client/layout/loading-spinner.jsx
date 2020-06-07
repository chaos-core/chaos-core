import React from 'react';

import './loading-spinner.scss';

const LoadingSpinner = () => {
  return (
    <div className={'loadingSpinner'}>
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
