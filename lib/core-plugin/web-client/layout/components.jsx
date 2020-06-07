import React from 'react';
import classNames from 'classnames';

import './components.scss';

export LoadingSpinner from './loading-spinner.jsx';

export const Card = ({className = null, onClick = null, children}) => {
  const divClass = classNames(['card', className]);
  return <div className={divClass} onClick={onClick} children={children}/>;
};

export const Toggle = ({active, disabled, onClick}) => {
  const divClass = classNames({
    toggle: true,
    active: active,
    disabled: disabled,
  });

  const onSwitchClick = (e) => {
    e.stopPropagation();
    if (!disabled) onClick();
  };

  return (
    <div className={divClass} onClick={onSwitchClick}>
      <div className={'switch'}/>
    </div>
  );
};
